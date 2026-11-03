import "server-only";

import { revalidatePath, updateTag } from "next/cache";
import { ZodError } from "zod";

import { exigirSessao, type Sessao } from "@/lib/auth";
import { carregarConteudo } from "@/lib/conteudo-servidor";
import { AREAS, pode, type Area } from "@/lib/permissoes";

export type Resultado<T = undefined> = { ok: true; dados?: T } | { ok: false; erro: string };

/**
 * Envolve toda Server Action do painel: confere a sessão (a checagem do
 * proxy é só otimista) e a permissão da área, captura erros e devolve uma
 * mensagem legível. Consultas usam `nivel: "ver"`; o resto exige "editar".
 * `area: null` vale para qualquer pessoa logada (ex.: a própria conta).
 */
export async function protegida<T>(
  area: Area | null,
  fn: (sessao: Sessao) => Promise<T>,
  { tags = [] as string[], revalidar = true, nivel = "editar" as "ver" | "editar" } = {},
): Promise<Resultado<T>> {
  const sessao = await exigirSessao();
  if (area && !pode(sessao.permissoes, area, nivel)) {
    const nome = AREAS.find((a) => a.id === area)?.rotulo ?? area;
    return {
      ok: false,
      erro: sessao.permissoes[area] === "ver" ? `Seu acesso a ${nome} é só para consultar.` : `Você não tem acesso a ${nome}.`,
    };
  }
  try {
    // Horários e contato do painel valem também nas ações (turnos de reserva, avisos).
    await carregarConteudo();
    const dados = await fn(sessao);
    for (const tag of tags) updateTag(tag);
    if (revalidar) revalidatePath("/admin", "layout");
    return { ok: true, dados };
  } catch (erro) {
    if (erro instanceof ErroAmigavel) return { ok: false, erro: erro.message };
    if (erro instanceof ZodError) return { ok: false, erro: erro.issues[0]?.message ?? "Dados inválidos." };
    console.error("[painel]", erro);
    return { ok: false, erro: "Não foi possível salvar. Tente novamente." };
  }
}

export class ErroAmigavel extends Error {}

export function slugify(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export function idCurto() {
  return Math.random().toString(36).slice(2, 7);
}
