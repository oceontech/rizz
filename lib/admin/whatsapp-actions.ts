"use server";

import { z } from "zod";

import { sql } from "@/lib/db";
import { enviarTeste } from "@/lib/whatsapp/avisos";
import {
  desconectar,
  ErroEvolution,
  evolutionConfigurada,
  gerarQrCode,
  infoInstancia,
  INSTANCIA,
  type InfoInstancia,
} from "@/lib/whatsapp/evolution";
import { TIPOS, type TipoMensagem, type WhatsappConfig } from "@/lib/whatsapp/mensagens";

import { ErroAmigavel, protegida } from "./comum";
import { normalizarTelefone } from "./formato";

/** Erros da Evolution já vêm com texto para a tela. */
async function comEvolution<T>(fn: () => Promise<T>) {
  if (!evolutionConfigurada) throw new ErroAmigavel("Faltam as variáveis da Evolution API na Vercel.");
  try {
    return await fn();
  } catch (erro) {
    if (erro instanceof ErroEvolution) throw new ErroAmigavel(erro.message);
    throw erro;
  }
}

export type EstadoWhatsapp = { configurada: boolean; instancia: string; info: InfoInstancia | null; erro: string | null };

/** Situação da conexão. Erro de rede vira texto, não falha: a tela mostra. */
export async function estadoWhatsapp() {
  return protegida<EstadoWhatsapp>(
    async () => {
      if (!evolutionConfigurada) return { configurada: false, instancia: INSTANCIA, info: null, erro: null };
      try {
        return { configurada: true, instancia: INSTANCIA, info: await infoInstancia(), erro: null };
      } catch (erro) {
        const texto = erro instanceof ErroEvolution ? erro.message : "Não foi possível consultar a Evolution API.";
        if (!(erro instanceof ErroEvolution)) console.error("[whatsapp]", erro);
        return { configurada: true, instancia: INSTANCIA, info: null, erro: texto };
      }
    },
    { revalidar: false },
  );
}

const numeroOpcional = z
  .string()
  .transform((t) => t.replace(/\D/g, ""))
  .refine((t) => t === "" || /^\d{12,13}$/.test(t), "Informe o número com DDD.")
  .optional();

export async function conectarWhatsapp(numero?: string) {
  return protegida(
    async () => {
      const n = numeroOpcional.parse(numero);
      return comEvolution(() => gerarQrCode(n || undefined));
    },
    { revalidar: false },
  );
}

export async function desconectarWhatsapp() {
  return protegida(async () => comEvolution(desconectar), { revalidar: false });
}

export async function testarWhatsapp(telefone: string) {
  return protegida(
    async () => {
      const t = normalizarTelefone(telefone);
      if (!/^\d{10,11}$/.test(t)) throw new ErroAmigavel("Informe um WhatsApp com DDD.");
      await comEvolution(async () => {
        const r = await enviarTeste(t);
        if (!r.ok) throw new ErroAmigavel(r.erro);
      });
    },
    { revalidar: false },
  );
}

const modelo = z.string().trim().min(5, "Uma das mensagens está vazia.").max(1500, "Mensagem longa demais.");

const esquemaConfig = z.object({
  ativo: z.boolean(),
  confirmacao: z.boolean(),
  confirmacaoPainel: z.boolean(),
  alteracao: z.boolean(),
  cancelamento: z.boolean(),
  lembrete: z.boolean(),
  lembreteHoras: z.number().int().min(1).max(48),
  avisoEquipe: z.boolean(),
  telefonesEquipe: z
    .array(z.string().transform(normalizarTelefone))
    .max(5, "No máximo 5 números da equipe.")
    .refine((l) => l.every((t) => /^\d{10,11}$/.test(t)), "Um dos números da equipe está incompleto."),
  modelos: z.object(Object.fromEntries(TIPOS.map((t) => [t.id, modelo])) as Record<TipoMensagem, typeof modelo>),
}) satisfies z.ZodType<WhatsappConfig, unknown>;

export async function salvarConfigWhatsapp(entrada: WhatsappConfig) {
  return protegida(async () => {
    const d = esquemaConfig.parse(entrada);
    if (d.avisoEquipe && d.telefonesEquipe.length === 0) {
      throw new ErroAmigavel("Informe pelo menos um número da equipe para o aviso de reserva nova.");
    }
    await sql`insert into configuracoes (chave, valor, atualizado_em) values ('whatsapp', ${JSON.stringify(d)}::jsonb, now())
              on conflict (chave) do update set valor = excluded.valor, atualizado_em = now()`;
  });
}
