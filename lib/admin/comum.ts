import "server-only";

import { revalidatePath, updateTag } from "next/cache";
import { ZodError } from "zod";

import { exigirSessao } from "@/lib/auth";

export type Resultado<T = undefined> = { ok: true; dados?: T } | { ok: false; erro: string };

/**
 * Envolve toda Server Action do painel: confere a sessão (a checagem do
 * proxy é só otimista), captura erros e devolve uma mensagem legível.
 */
export async function protegida<T>(
  fn: () => Promise<T>,
  { tags = [] as string[], revalidar = true } = {},
): Promise<Resultado<T>> {
  await exigirSessao();
  try {
    const dados = await fn();
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
