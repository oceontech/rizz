"use server";

import { z } from "zod";

import { TAGS } from "@/lib/dados";
import { sql } from "@/lib/db";

import { ErroAmigavel, protegida } from "./comum";

const esquemaAviso = z.object({
  ativo: z.boolean(),
  texto: z.string().trim().max(140),
  link: z.string().trim().max(300),
  linkTexto: z.string().trim().max(30),
});

export async function salvarAviso(entrada: z.infer<typeof esquemaAviso>) {
  return protegida(
    async () => {
      const d = esquemaAviso.parse(entrada);
      if (d.ativo && d.texto.length < 3) throw new ErroAmigavel("Escreva o texto do aviso.");
      if (d.link && !/^(https?:\/\/|\/)/.test(d.link)) {
        throw new ErroAmigavel("O link deve começar com / ou https://");
      }
      await sql`insert into configuracoes (chave, valor, atualizado_em) values ('aviso', ${JSON.stringify(d)}::jsonb, now())
                on conflict (chave) do update set valor = excluded.valor, atualizado_em = now()`;
    },
    { tags: [TAGS.config] },
  );
}
