"use server";

import { z } from "zod";

import { TAGS } from "@/lib/dados";
import { sql } from "@/lib/db";
import { FORMAS, SIMBOLOS } from "@/lib/selos";

import { ErroAmigavel, idCurto, protegida, slugify } from "./comum";

// Selos aparecem no cardápio, no executivo e na home: salvar invalida os três.
const TAGS_SELOS = [TAGS.selos, TAGS.cardapio, TAGS.executivo, TAGS.home];

const esquemaSelo = z
  .object({
    id: z.string().optional(),
    nome: z.string().trim().min(2, "Informe o nome do selo.").max(40, "Nome muito longo (até 40 letras)."),
    descricao: z.string().trim().max(120).nullable(),
    forma: z.enum(Object.keys(FORMAS) as [keyof typeof FORMAS]),
    simbolo: z.enum(Object.keys(SIMBOLOS) as [keyof typeof SIMBOLOS]),
    letra: z.string().trim().max(3, "Use até 3 letras.").nullable(),
    cor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Escolha uma cor válida."),
    ativo: z.boolean(),
  })
  .refine((d) => d.simbolo !== "letra" || (d.letra ?? "").length > 0, {
    message: "Escreva as letras do selo (até 3).",
  });

export async function salvarSelo(entrada: z.input<typeof esquemaSelo>) {
  return protegida(
    async () => {
      const d = esquemaSelo.parse(entrada);
      const letra = d.simbolo === "letra" ? d.letra!.toUpperCase() : null;
      if (d.id) {
        await sql`
          update selos set nome = ${d.nome}, descricao = ${d.descricao || null}, forma = ${d.forma},
            simbolo = ${d.simbolo}, letra = ${letra}, cor = ${d.cor.toLowerCase()}, ativo = ${d.ativo}
          where id = ${d.id}`;
        return d.id;
      }
      const base = slugify(d.nome) || `selo-${idCurto()}`;
      const [existe] = await sql`select 1 from selos where id = ${base}`;
      const id = existe ? `${base}-${idCurto()}` : base;
      const [{ proxima }] = await sql`select coalesce(max(ordem), -1) + 1 as proxima from selos`;
      await sql`
        insert into selos (id, nome, descricao, forma, simbolo, letra, cor, ativo, ordem)
        values (${id}, ${d.nome}, ${d.descricao || null}, ${d.forma}, ${d.simbolo}, ${letra},
                ${d.cor.toLowerCase()}, ${d.ativo}, ${proxima})`;
      return id;
    },
    { tags: TAGS_SELOS },
  );
}

export async function alternarSelo(id: string, ativo: boolean) {
  return protegida(
    async () => {
      await sql`update selos set ativo = ${ativo} where id = ${id}`;
    },
    { tags: TAGS_SELOS },
  );
}

/** Exclui o selo e o tira de todos os pratos (cardápio e executivo). */
export async function excluirSelo(id: string) {
  return protegida(
    async () => {
      const [selo] = await sql`select 1 from selos where id = ${id}`;
      if (!selo) throw new ErroAmigavel("Selo não encontrado.");
      await sql.transaction([
        sql`update itens set badges = array_remove(badges, ${id}), atualizado_em = now() where ${id} = any(badges)`,
        ...(id === "vpj" ? [sql`update itens set vpj = false where vpj`] : []),
        sql`update executivo_itens set selo = null where selo = ${id}`,
        sql`delete from selos where id = ${id}`,
      ]);
    },
    { tags: TAGS_SELOS },
  );
}

/** Troca a posição de um selo com o vizinho (a ordem vale na legenda e nos filtros). */
export async function moverSelo(id: string, direcao: "cima" | "baixo") {
  return protegida(
    async () => {
      const lista = await sql`select id from selos order by ordem, nome`;
      const ids = lista.map((l) => String(l.id));
      const i = ids.indexOf(id);
      const j = direcao === "cima" ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= ids.length) return;
      [ids[i], ids[j]] = [ids[j]!, ids[i]!];
      await sql`update selos set ordem = x.ordem - 1 from unnest(${ids}::text[]) with ordinality as x(id, ordem) where selos.id = x.id`;
    },
    { tags: TAGS_SELOS },
  );
}
