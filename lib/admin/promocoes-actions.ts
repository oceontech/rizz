"use server";

import { z } from "zod";

import { TAGS } from "@/lib/dados";
import { sql } from "@/lib/db";

import { ErroAmigavel, protegida } from "./comum";

const dataISO = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable();

const esquema = z.object({
  id: z.number().optional(),
  titulo: z.string().trim().min(2, "Informe o título.").max(80),
  subtitulo: z.string().trim().max(80).nullable(),
  texto: z.string().trim().max(400).nullable(),
  imagemUrl: z.string().url().nullable(),
  cupom: z.string().trim().max(30).nullable(),
  ctaTexto: z.string().trim().max(40).nullable(),
  ctaUrl: z.string().trim().max(300).nullable(),
  inicio: dataISO,
  fim: dataISO,
  ativo: z.boolean(),
  paginas: z.enum(["todas", "home", "cardapio", "reservas"]),
  frequencia: z.enum(["sempre", "sessao", "dia"]),
  atrasoSeg: z.number().int().min(0).max(60),
  estilo: z.enum(["vinho", "creme", "noite"]),
});

export type PromocaoEntrada = z.infer<typeof esquema>;

export async function salvarPromocao(entrada: PromocaoEntrada) {
  return protegida(
    async () => {
      const d = esquema.parse(entrada);
      if (d.inicio && d.fim && d.fim < d.inicio) {
        throw new ErroAmigavel("A data final precisa ser depois da inicial.");
      }
      if (d.ctaUrl && !/^(https?:\/\/|\/)/.test(d.ctaUrl)) {
        throw new ErroAmigavel("O link do botão deve começar com / ou https://");
      }
      const v = { ...d, subtitulo: d.subtitulo || null, texto: d.texto || null, cupom: d.cupom?.toUpperCase() || null, ctaTexto: d.ctaTexto || null, ctaUrl: d.ctaUrl || null };
      if (d.id) {
        await sql`update promocoes set titulo = ${v.titulo}, subtitulo = ${v.subtitulo}, texto = ${v.texto},
                  imagem_url = ${v.imagemUrl}, cupom = ${v.cupom}, cta_texto = ${v.ctaTexto}, cta_url = ${v.ctaUrl},
                  inicio = ${v.inicio}, fim = ${v.fim}, ativo = ${v.ativo}, paginas = ${v.paginas},
                  frequencia = ${v.frequencia}, atraso_seg = ${v.atrasoSeg}, estilo = ${v.estilo}
                  where id = ${d.id}`;
        return;
      }
      await sql`insert into promocoes (titulo, subtitulo, texto, imagem_url, cupom, cta_texto, cta_url, inicio, fim,
                                       ativo, paginas, frequencia, atraso_seg, estilo)
                values (${v.titulo}, ${v.subtitulo}, ${v.texto}, ${v.imagemUrl}, ${v.cupom}, ${v.ctaTexto},
                        ${v.ctaUrl}, ${v.inicio}, ${v.fim}, ${v.ativo}, ${v.paginas}, ${v.frequencia},
                        ${v.atrasoSeg}, ${v.estilo})`;
    },
    { tags: [TAGS.promocoes] },
  );
}

export async function alternarPromocao(id: number, ativo: boolean) {
  return protegida(
    async () => {
      await sql`update promocoes set ativo = ${ativo} where id = ${id}`;
    },
    { tags: [TAGS.promocoes] },
  );
}

export async function duplicarPromocao(id: number) {
  return protegida(
    async () => {
      await sql`insert into promocoes (titulo, subtitulo, texto, imagem_url, cupom, cta_texto, cta_url, inicio, fim,
                                       ativo, paginas, frequencia, atraso_seg, estilo)
                select titulo || ' (cópia)', subtitulo, texto, imagem_url, cupom, cta_texto, cta_url, inicio, fim,
                       false, paginas, frequencia, atraso_seg, estilo
                from promocoes where id = ${id}`;
    },
    { tags: [TAGS.promocoes] },
  );
}

export async function excluirPromocao(id: number) {
  return protegida(
    async () => {
      await sql`delete from promocoes where id = ${id}`;
    },
    { tags: [TAGS.promocoes] },
  );
}
