"use server";

import { z } from "zod";

import { TAGS } from "@/lib/dados";
import { sql } from "@/lib/db";

import { ErroAmigavel, idCurto, protegida, slugify } from "./comum";

const TIPOS = ["tinto", "branco", "rose", "espumante", "doce"] as const;

const esquemaVinho = z.object({
  id: z.string().optional(),
  secaoId: z.string().min(1, "Escolha a seção da carta."),
  nome: z.string().trim().min(2, "Informe o nome do vinho.").max(160),
  tipo: z.enum(TIPOS, { message: "Escolha o tipo do vinho." }),
  uvas: z.array(z.string().trim().min(1).max(60)).max(12),
  preco: z.number({ message: "Informe o preço." }).min(0).max(100000),
  notas: z.array(z.string().trim().min(1).max(3000)).max(8),
  disponivel: z.boolean(),
  visivel: z.boolean(),
});

export type VinhoEntrada = z.infer<typeof esquemaVinho>;

const opcoes = { tags: [TAGS.vinhos] };

export async function salvarVinho(entrada: VinhoEntrada) {
  return protegida(async () => {
    const d = esquemaVinho.parse(entrada);
    if (d.id) {
      await sql`
        update vinhos set
          secao_id = ${d.secaoId}, nome = ${d.nome}, tipo = ${d.tipo}, uvas = ${d.uvas}, preco = ${d.preco},
          notas = ${d.notas}, disponivel = ${d.disponivel}, visivel = ${d.visivel}, atualizado_em = now()
        where id = ${d.id}`;
      return d.id;
    }
    const id = `${slugify(d.nome)}-${idCurto()}`;
    const [{ proxima }] = await sql`select coalesce(max(ordem), -1) + 1 as proxima from vinhos where secao_id = ${d.secaoId}`;
    await sql`
      insert into vinhos (id, secao_id, nome, tipo, uvas, preco, notas, disponivel, visivel, ordem)
      values (${id}, ${d.secaoId}, ${d.nome}, ${d.tipo}, ${d.uvas}, ${d.preco}, ${d.notas}, ${d.disponivel}, ${d.visivel}, ${proxima})`;
    return id;
  }, opcoes);
}

export async function alternarDisponivelVinho(id: string, disponivel: boolean) {
  return protegida(async () => {
    await sql`update vinhos set disponivel = ${disponivel}, atualizado_em = now() where id = ${id}`;
  }, opcoes);
}

export async function alternarVisivelVinho(id: string, visivel: boolean) {
  return protegida(async () => {
    await sql`update vinhos set visivel = ${visivel}, atualizado_em = now() where id = ${id}`;
  }, opcoes);
}

export async function excluirVinho(id: string) {
  return protegida(async () => {
    await sql`delete from vinhos where id = ${id}`;
  }, opcoes);
}

/** Troca a posição de um vinho com o vizinho, dentro da seção. */
export async function moverVinho(id: string, direcao: "cima" | "baixo") {
  return protegida(async () => {
    const [vinho] = await sql`select secao_id from vinhos where id = ${id}`;
    if (!vinho) throw new ErroAmigavel("Vinho não encontrado.");
    const lista = await sql`select id from vinhos where secao_id = ${vinho.secao_id} order by ordem, nome`;
    const ids = lista.map((l) => String(l.id));
    const i = ids.indexOf(id);
    const j = direcao === "cima" ? i - 1 : i + 1;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    await sql`update vinhos set ordem = x.ordem - 1 from unnest(${ids}::text[]) with ordinality as x(id, ordem) where vinhos.id = x.id`;
  }, opcoes);
}

// Seções -------------------------------------------------------

const esquemaSecao = z.object({
  id: z.string().optional(),
  titulo: z.string().trim().min(2, "Informe o nome da seção.").max(60),
  nota: z.string().trim().max(160).nullable(),
  visivel: z.boolean(),
});

export async function salvarSecaoVinho(entrada: z.infer<typeof esquemaSecao>) {
  return protegida(async () => {
    const d = esquemaSecao.parse(entrada);
    if (d.id) {
      // O slug não muda: o site e os links antigos dependem dele.
      await sql`update vinho_secoes set titulo = ${d.titulo}, nota = ${d.nota || null}, visivel = ${d.visivel} where id = ${d.id}`;
      return d.id;
    }
    const base = slugify(d.titulo) || `secao-${idCurto()}`;
    const [existe] = await sql`select 1 from vinho_secoes where slug = ${base} or id = ${base}`;
    const slug = existe ? `${base}-${idCurto()}` : base;
    const [{ proxima }] = await sql`select coalesce(max(ordem), -1) + 1 as proxima from vinho_secoes`;
    await sql`insert into vinho_secoes (id, titulo, slug, nota, visivel, ordem)
              values (${slug}, ${d.titulo}, ${slug}, ${d.nota || null}, ${d.visivel}, ${proxima})`;
    return slug;
  }, opcoes);
}

export async function excluirSecaoVinho(id: string) {
  return protegida(async () => {
    const [{ n }] = await sql`select count(*)::int as n from vinhos where secao_id = ${id}`;
    if (Number(n) > 0) throw new ErroAmigavel("Mova ou exclua os vinhos desta seção antes de removê-la.");
    await sql`delete from vinho_secoes where id = ${id}`;
  }, opcoes);
}

export async function moverSecaoVinho(id: string, direcao: "cima" | "baixo") {
  return protegida(async () => {
    const lista = await sql`select id from vinho_secoes order by ordem, titulo`;
    const ids = lista.map((l) => String(l.id));
    const i = ids.indexOf(id);
    const j = direcao === "cima" ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
    await sql`update vinho_secoes set ordem = x.ordem - 1 from unnest(${ids}::text[]) with ordinality as x(id, ordem) where vinho_secoes.id = x.id`;
  }, opcoes);
}
