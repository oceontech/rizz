"use server";

import { z } from "zod";

import { TAGS } from "@/lib/dados";
import { sql } from "@/lib/db";

import { ErroAmigavel, idCurto, protegida, slugify } from "./comum";

const esquemaConfig = z.object({
  ativo: z.boolean(),
  precoCompleto: z.number().min(0).max(10000),
  condicoesConfirmadas: z.boolean(),
  dias: z.string().trim().min(2, "Informe os dias."),
  horario: z.string().trim().min(2, "Informe o horário."),
  chamada: z.string().trim().max(300),
});

export async function salvarConfigExecutivo(entrada: z.infer<typeof esquemaConfig>) {
  return protegida(
    async () => {
      const d = esquemaConfig.parse(entrada);
      await sql`
        insert into executivo_config (id, ativo, preco_completo, condicoes_confirmadas, dias, horario, chamada)
        values (1, ${d.ativo}, ${d.precoCompleto}, ${d.condicoesConfirmadas}, ${d.dias}, ${d.horario}, ${d.chamada})
        on conflict (id) do update set
          ativo = excluded.ativo, preco_completo = excluded.preco_completo,
          condicoes_confirmadas = excluded.condicoes_confirmadas, dias = excluded.dias,
          horario = excluded.horario, chamada = excluded.chamada`;
    },
    { tags: [TAGS.executivo] },
  );
}

const esquemaItem = z.object({
  id: z.string().optional(),
  secao: z.enum(["entradas", "pratos", "sobremesas"]),
  nome: z.string().trim().min(2, "Informe o nome."),
  preco: z.number().min(0).max(10000),
  selo: z.enum(["vpj", "duroc"]).nullable(),
  disponivel: z.boolean(),
});

export async function salvarItemExecutivo(entrada: z.infer<typeof esquemaItem>) {
  return protegida(
    async () => {
      const d = esquemaItem.parse(entrada);
      if (d.id) {
        await sql`update executivo_itens set secao = ${d.secao}, nome = ${d.nome}, preco = ${d.preco},
                  selo = ${d.selo}, disponivel = ${d.disponivel} where id = ${d.id}`;
        return;
      }
      const [{ proxima }] = await sql`
        select coalesce(max(ordem), -1) + 1 as proxima from executivo_itens where secao = ${d.secao}`;
      await sql`insert into executivo_itens (id, secao, nome, preco, selo, disponivel, ordem)
                values (${`ex-${slugify(d.nome)}-${idCurto()}`}, ${d.secao}, ${d.nome}, ${d.preco},
                        ${d.selo}, ${d.disponivel}, ${proxima})`;
    },
    { tags: [TAGS.executivo] },
  );
}

export async function alternarItemExecutivo(id: string, disponivel: boolean) {
  return protegida(
    async () => {
      await sql`update executivo_itens set disponivel = ${disponivel} where id = ${id}`;
    },
    { tags: [TAGS.executivo] },
  );
}

export async function excluirItemExecutivo(id: string) {
  return protegida(
    async () => {
      await sql`delete from executivo_itens where id = ${id}`;
    },
    { tags: [TAGS.executivo] },
  );
}

export async function moverItemExecutivo(id: string, direcao: "cima" | "baixo") {
  return protegida(
    async () => {
      const [item] = await sql`select secao from executivo_itens where id = ${id}`;
      if (!item) throw new ErroAmigavel("Item não encontrado.");
      const lista = await sql`select id from executivo_itens where secao = ${item.secao} order by ordem, nome`;
      const ids = lista.map((l) => String(l.id));
      const i = ids.indexOf(id);
      const j = direcao === "cima" ? i - 1 : i + 1;
      if (j < 0 || j >= ids.length) return;
      [ids[i], ids[j]] = [ids[j]!, ids[i]!];
      await sql`update executivo_itens set ordem = x.ordem - 1 from unnest(${ids}::text[]) with ordinality as x(id, ordem) where executivo_itens.id = x.id`;
    },
    { tags: [TAGS.executivo] },
  );
}
