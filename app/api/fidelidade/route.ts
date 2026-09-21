import { z } from "zod";

import { normalizarTelefone } from "@/lib/admin/formato";
import { FIDELIDADE_PADRAO, lerConfig } from "@/lib/dados";
import { sql } from "@/lib/db";

const telefone = z
  .string()
  .transform(normalizarTelefone)
  .refine((t) => t.length === 10 || t.length === 11, "Informe o celular com DDD.");

const esquema = z.discriminatedUnion("acao", [
  z.object({ acao: z.literal("consultar"), telefone }),
  z.object({
    acao: z.literal("cadastrar"),
    telefone,
    nome: z.string().trim().min(2, "Informe seu nome.").max(120),
    aniversario: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .or(z.literal("")),
    aceitaContato: z.boolean().default(true),
    site: z.string().max(0).optional(),
  }),
]);

/**
 * Cartão fidelidade público: cadastro e consulta de selos pelo celular.
 * Devolve só o primeiro nome — o telefone não pode virar consulta de dados.
 */
export async function POST(req: Request) {
  const config = await lerConfig("fidelidade", FIDELIDADE_PADRAO);
  if (!config.ativo) return Response.json({ ok: false, erro: "Programa indisponível no momento." }, { status: 403 });

  const corpo = esquema.safeParse(await req.json().catch(() => null));
  if (!corpo.success) {
    return Response.json({ ok: false, erro: corpo.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  }
  const d = corpo.data;

  if (d.acao === "cadastrar") {
    const [existe] = await sql`select id from clientes where telefone = ${d.telefone}`;
    if (!existe) {
      await sql`insert into clientes (nome, telefone, aniversario, aceita_contato, origem)
                values (${d.nome}, ${d.telefone}, ${d.aniversario || null}, ${d.aceitaContato}, 'site')`;
    }
  }

  const [c] = await sql`select nome, selos, resgates from clientes where telefone = ${d.telefone}`;
  if (!c) return Response.json({ ok: false, erro: "Não encontramos esse celular. Faça seu cadastro." }, { status: 404 });

  return Response.json({
    ok: true,
    cliente: {
      primeiroNome: String(c.nome).split(" ")[0],
      selos: Number(c.selos),
      resgates: Number(c.resgates),
    },
    meta: config.meta,
    recompensa: config.recompensa,
  });
}
