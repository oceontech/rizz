/**
 * Liga as fotos do acervo (data/menu.ts e data/executivo.ts, campo img) aos
 * pratos do banco que ainda não têm foto. Não mexe em prato com foto enviada
 * pelo painel nem em prato que já tem outra foto do acervo.
 *
 *   node --env-file=.env.local scripts/fotos-acervo.ts
 */
import { neon } from "@neondatabase/serverless";

import { executivo } from "../data/executivo.ts";
import { cardapio } from "../data/menu.ts";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL ausente.");
  process.exit(1);
}
const sql = neon(url);

let itens = 0;
for (const item of cardapio.flatMap((c) => c.itens)) {
  if (!item.img) continue;
  const r = await sql`
    update itens set img = ${item.img}, atualizado_em = now()
    where id = ${item.id} and img is null and foto_url is null
    returning id`;
  itens += r.length;
}

let exec = 0;
for (const item of [...executivo.entradas, ...executivo.pratos, ...executivo.sobremesas]) {
  if (!item.img) continue;
  const r = await sql`update executivo_itens set img = ${item.img} where id = ${item.id} and img is null returning id`;
  exec += r.length;
}

console.log(`✓ fotos ligadas: ${itens} pratos do cardápio, ${exec} do executivo`);
