"use server";

import { z } from "zod";

import { FIDELIDADE_PADRAO, TAGS, lerConfig } from "@/lib/dados";
import { sql } from "@/lib/db";

import { ErroAmigavel, protegida } from "./comum";
import { normalizarTelefone } from "./formato";

const esquemaCliente = z.object({
  id: z.number().optional(),
  nome: z.string().trim().min(2, "Informe o nome."),
  telefone: z.string().trim().min(10, "Informe o telefone com DDD."),
  email: z.string().trim().email("E-mail inválido.").nullable().or(z.literal("").transform(() => null)),
  aniversario: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  aceitaContato: z.boolean(),
  obs: z.string().trim().max(400).nullable(),
});

export type ClienteEntrada = z.infer<typeof esquemaCliente>;

export async function salvarCliente(entrada: ClienteEntrada) {
  return protegida(async () => {
    const d = esquemaCliente.parse(entrada);
    const telefone = normalizarTelefone(d.telefone);
    if (telefone.length < 10 || telefone.length > 11) throw new ErroAmigavel("Telefone inválido.");
    const [dup] = await sql`select id from clientes where telefone = ${telefone} and id <> ${d.id ?? 0}`;
    if (dup) throw new ErroAmigavel("Já existe um cliente com esse telefone.");

    if (d.id) {
      await sql`update clientes set nome = ${d.nome}, telefone = ${telefone}, email = ${d.email},
                aniversario = ${d.aniversario}, aceita_contato = ${d.aceitaContato}, obs = ${d.obs || null}
                where id = ${d.id}`;
      return d.id;
    }
    const [novo] = await sql`
      insert into clientes (nome, telefone, email, aniversario, aceita_contato, obs, origem)
      values (${d.nome}, ${telefone}, ${d.email}, ${d.aniversario}, ${d.aceitaContato}, ${d.obs || null}, 'painel')
      returning id`;
    return Number(novo!.id);
  });
}

export async function excluirCliente(id: number) {
  return protegida(async () => {
    await sql`delete from clientes where id = ${id}`;
  });
}

/** Carimba uma (ou mais) visitas. Devolve os selos atuais e se a meta foi batida. */
export async function registrarVisita(clienteId: number, quantidade = 1, nota?: string) {
  return protegida(async () => {
    if (!Number.isInteger(quantidade) || quantidade < 1 || quantidade > 10) {
      throw new ErroAmigavel("Quantidade inválida.");
    }
    const [c] = await sql`
      update clientes set selos = selos + ${quantidade}, total_visitas = total_visitas + ${quantidade},
             ultima_visita = now()
      where id = ${clienteId} returning selos`;
    if (!c) throw new ErroAmigavel("Cliente não encontrado.");
    await sql`insert into fidelidade_eventos (cliente_id, tipo, quantidade, nota)
              values (${clienteId}, 'visita', ${quantidade}, ${nota || null})`;
    const config = await lerConfig("fidelidade", FIDELIDADE_PADRAO);
    return { selos: Number(c.selos), meta: config.meta, completou: Number(c.selos) >= config.meta };
  });
}

/** Resgata a recompensa: consome `meta` selos. */
export async function resgatarRecompensa(clienteId: number) {
  return protegida(async () => {
    const config = await lerConfig("fidelidade", FIDELIDADE_PADRAO);
    const [c] = await sql`
      update clientes set selos = selos - ${config.meta}, resgates = resgates + 1
      where id = ${clienteId} and selos >= ${config.meta} returning selos`;
    if (!c) throw new ErroAmigavel(`O cliente ainda não tem ${config.meta} selos.`);
    await sql`insert into fidelidade_eventos (cliente_id, tipo, quantidade, nota)
              values (${clienteId}, 'resgate', ${config.meta}, ${config.recompensa})`;
  });
}

export async function ajustarSelos(clienteId: number, selos: number, nota: string) {
  return protegida(async () => {
    if (!Number.isInteger(selos) || selos < 0 || selos > 999) throw new ErroAmigavel("Valor inválido.");
    const [antes] = await sql`select selos from clientes where id = ${clienteId}`;
    if (!antes) throw new ErroAmigavel("Cliente não encontrado.");
    await sql`update clientes set selos = ${selos} where id = ${clienteId}`;
    await sql`insert into fidelidade_eventos (cliente_id, tipo, quantidade, nota)
              values (${clienteId}, 'ajuste', ${selos - Number(antes.selos)}, ${nota || "Ajuste manual"})`;
  });
}

export async function historicoCliente(clienteId: number) {
  return protegida(async () => {
    const linhas = await sql`
      select id, tipo, quantidade, nota, criado_em from fidelidade_eventos
      where cliente_id = ${clienteId} order by criado_em desc limit 30`;
    return linhas.map((l) => ({
      id: Number(l.id),
      tipo: String(l.tipo) as "visita" | "resgate" | "ajuste",
      quantidade: Number(l.quantidade),
      nota: l.nota ? String(l.nota) : null,
      criadoEm: new Date(l.criado_em as string).toISOString(),
    }));
  }, { revalidar: false });
}

// Configuração do programa ------------------------------------

const esquemaConfig = z.object({
  ativo: z.boolean(),
  meta: z.number().int().min(2, "A meta mínima é 2 visitas.").max(50),
  recompensa: z.string().trim().min(3, "Descreva a recompensa.").max(120),
  regras: z.string().trim().max(500),
});

export async function salvarConfigFidelidade(entrada: z.infer<typeof esquemaConfig>) {
  return protegida(
    async () => {
      const d = esquemaConfig.parse(entrada);
      await sql`insert into configuracoes (chave, valor, atualizado_em) values ('fidelidade', ${JSON.stringify(d)}::jsonb, now())
                on conflict (chave) do update set valor = excluded.valor, atualizado_em = now()`;
    },
    { tags: [TAGS.config] },
  );
}
