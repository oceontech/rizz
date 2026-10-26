"use server";

import { z } from "zod";

import { TAGS } from "@/lib/dados";
import { sql } from "@/lib/db";

import { ErroAmigavel, protegida } from "./comum";

const esquemaHome = z.object({
  maisPedido: z.object({
    itemId: z.string().min(1, "Escolha o prato mais pedido."),
    chamada: z.string().trim().min(2, "Escreva a chamada (ex.: O mais pedido da casa).").max(60),
    titulo: z.string().trim().min(2, "Escreva o título do prato.").max(80),
    texto: z.string().trim().min(10, "Escreva uma frase sobre o prato.").max(300),
  }),
  destaques: z
    .array(z.string().min(1))
    .min(3, "Escolha pelo menos 3 pratos para a seleção.")
    .max(12, "A seleção aceita até 12 pratos."),
});

export async function salvarHome(entrada: z.infer<typeof esquemaHome>) {
  return protegida(
    async () => {
      const d = esquemaHome.parse(entrada);
      const ids = [d.maisPedido.itemId, ...d.destaques];
      const existentes = await sql`select id from itens where id = any(${ids}::text[])`;
      if (existentes.length < new Set(ids).size) {
        throw new ErroAmigavel("Algum prato escolhido não existe mais no cardápio. Recarregue a página.");
      }
      await sql`insert into configuracoes (chave, valor, atualizado_em) values ('home', ${JSON.stringify(d)}::jsonb, now())
                on conflict (chave) do update set valor = excluded.valor, atualizado_em = now()`;
    },
    { tags: [TAGS.home] },
  );
}
