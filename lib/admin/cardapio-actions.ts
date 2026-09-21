"use server";

import { put } from "@vercel/blob";
import { z } from "zod";

import { TAGS } from "@/lib/dados";
import { sql } from "@/lib/db";

import { ErroAmigavel, idCurto, protegida, slugify } from "./comum";

const BADGES = ["vegetariano", "rizz", "tartufato"] as const;

const esquemaItem = z.object({
  id: z.string().optional(),
  categoriaId: z.string().min(1, "Escolha a categoria."),
  nome: z.string().trim().min(2, "Informe o nome do prato."),
  descricao: z.string().trim().max(400).nullable(),
  preco: z.number().min(0).max(100000).nullable(),
  badges: z.array(z.enum(BADGES)),
  vpj: z.boolean(),
  grupo: z.string().trim().max(60).nullable(),
  disponivel: z.boolean(),
  visivel: z.boolean(),
  fotoUrl: z.string().url().nullable(),
});

export type ItemEntrada = z.infer<typeof esquemaItem>;

export async function salvarItem(entrada: ItemEntrada) {
  return protegida(
    async () => {
      const d = esquemaItem.parse(entrada);
      if (d.id) {
        await sql`
          update itens set
            categoria_id = ${d.categoriaId}, nome = ${d.nome}, descricao = ${d.descricao || null},
            preco = ${d.preco}, badges = ${d.badges}, vpj = ${d.vpj}, grupo = ${d.grupo || null},
            disponivel = ${d.disponivel}, visivel = ${d.visivel}, foto_url = ${d.fotoUrl},
            atualizado_em = now()
          where id = ${d.id}`;
        return d.id;
      }
      const id = `${slugify(d.nome)}-${idCurto()}`;
      const [{ proxima }] = await sql`
        select coalesce(max(ordem), -1) + 1 as proxima from itens where categoria_id = ${d.categoriaId}`;
      await sql`
        insert into itens (id, categoria_id, nome, descricao, preco, badges, vpj, grupo, disponivel, visivel, foto_url, ordem)
        values (${id}, ${d.categoriaId}, ${d.nome}, ${d.descricao || null}, ${d.preco}, ${d.badges},
                ${d.vpj}, ${d.grupo || null}, ${d.disponivel}, ${d.visivel}, ${d.fotoUrl}, ${proxima})`;
      return id;
    },
    { tags: [TAGS.cardapio] },
  );
}

export async function alternarDisponivel(id: string, disponivel: boolean) {
  return protegida(
    async () => {
      await sql`update itens set disponivel = ${disponivel}, atualizado_em = now() where id = ${id}`;
    },
    { tags: [TAGS.cardapio] },
  );
}

export async function excluirItem(id: string) {
  return protegida(
    async () => {
      await sql`delete from itens where id = ${id}`;
    },
    { tags: [TAGS.cardapio] },
  );
}

/** Troca a posição de um item com o vizinho (acima ou abaixo). */
export async function moverItem(id: string, direcao: "cima" | "baixo") {
  return protegida(
    async () => {
      const [item] = await sql`select categoria_id from itens where id = ${id}`;
      if (!item) throw new ErroAmigavel("Item não encontrado.");
      const lista = await sql`select id from itens where categoria_id = ${item.categoria_id} order by ordem, nome`;
      const ids = lista.map((l) => String(l.id));
      const i = ids.indexOf(id);
      const j = direcao === "cima" ? i - 1 : i + 1;
      if (j < 0 || j >= ids.length) return;
      [ids[i], ids[j]] = [ids[j]!, ids[i]!];
      await sql`update itens set ordem = x.ordem - 1 from unnest(${ids}::text[]) with ordinality as x(id, ordem) where itens.id = x.id`;
    },
    { tags: [TAGS.cardapio] },
  );
}

/** Reajuste em lote: percentual sobre os preços de uma categoria (ou de todas). */
export async function reajustarPrecos(categoriaId: string | "todas", percentual: number) {
  return protegida(
    async () => {
      if (!Number.isFinite(percentual) || percentual === 0 || Math.abs(percentual) > 50) {
        throw new ErroAmigavel("Informe um percentual entre -50% e 50%.");
      }
      const fator = 1 + percentual / 100;
      const linhas =
        categoriaId === "todas"
          ? await sql`update itens set preco = round(preco * ${fator}), atualizado_em = now() where preco is not null returning id`
          : await sql`update itens set preco = round(preco * ${fator}), atualizado_em = now() where preco is not null and categoria_id = ${categoriaId} returning id`;
      return linhas.length;
    },
    { tags: [TAGS.cardapio] },
  );
}

// Categorias ---------------------------------------------------

const esquemaCategoria = z.object({
  id: z.string().optional(),
  nome: z.string().trim().min(2, "Informe o nome da categoria."),
  descricao: z.string().trim().max(200).nullable(),
  visivel: z.boolean(),
});

export async function salvarCategoria(entrada: z.infer<typeof esquemaCategoria>) {
  return protegida(
    async () => {
      const d = esquemaCategoria.parse(entrada);
      if (d.id) {
        await sql`update categorias set nome = ${d.nome}, descricao = ${d.descricao || null}, visivel = ${d.visivel}
                  where id = ${d.id}`;
        return d.id;
      }
      const base = slugify(d.nome) || `categoria-${idCurto()}`;
      const [existe] = await sql`select 1 from categorias where slug = ${base} or id = ${base}`;
      const slug = existe ? `${base}-${idCurto()}` : base;
      const [{ proxima }] = await sql`select coalesce(max(ordem), -1) + 1 as proxima from categorias`;
      await sql`insert into categorias (id, nome, slug, descricao, visivel, ordem)
                values (${slug}, ${d.nome}, ${slug}, ${d.descricao || null}, ${d.visivel}, ${proxima})`;
      return slug;
    },
    { tags: [TAGS.cardapio] },
  );
}

export async function excluirCategoria(id: string) {
  return protegida(
    async () => {
      const [{ n }] = await sql`select count(*)::int as n from itens where categoria_id = ${id}`;
      if (Number(n) > 0) {
        throw new ErroAmigavel("Mova ou exclua os pratos desta categoria antes de removê-la.");
      }
      await sql`delete from categorias where id = ${id}`;
    },
    { tags: [TAGS.cardapio] },
  );
}

export async function moverCategoria(id: string, direcao: "cima" | "baixo") {
  return protegida(
    async () => {
      const lista = await sql`select id from categorias order by ordem, nome`;
      const ids = lista.map((l) => String(l.id));
      const i = ids.indexOf(id);
      const j = direcao === "cima" ? i - 1 : i + 1;
      if (i < 0 || j < 0 || j >= ids.length) return;
      [ids[i], ids[j]] = [ids[j]!, ids[i]!];
      await sql`update categorias set ordem = x.ordem - 1 from unnest(${ids}::text[]) with ordinality as x(id, ordem) where categorias.id = x.id`;
    },
    { tags: [TAGS.cardapio] },
  );
}

// Upload de imagem (pratos e promoções) ------------------------

const TIPOS = ["image/jpeg", "image/png", "image/webp", "image/avif"];

export async function enviarImagem(form: FormData) {
  return protegida(async () => {
    const arquivo = form.get("arquivo");
    const pasta = form.get("pasta") === "promocoes" ? "promocoes" : "pratos";
    if (!(arquivo instanceof File) || arquivo.size === 0) throw new ErroAmigavel("Selecione uma imagem.");
    if (!TIPOS.includes(arquivo.type)) throw new ErroAmigavel("Use JPG, PNG, WebP ou AVIF.");
    if (arquivo.size > 4.5 * 1024 * 1024) throw new ErroAmigavel("A imagem precisa ter até 4,5 MB.");

    const extensao = arquivo.type.split("/")[1];
    const nome = `${pasta}/${slugify(arquivo.name.replace(/\.[^.]+$/, "")) || "imagem"}.${extensao}`;
    const blob = await put(nome, arquivo, {
      access: "public",
      addRandomSuffix: true,
      contentType: arquivo.type,
    });
    return blob.url;
  });
}
