/**
 * Cria as tabelas e popula o banco com o cardápio transcrito das peças.
 *
 *   node --env-file=.env.local scripts/db-setup.ts [email-do-admin]
 *
 * Idempotente: tabelas usam `if not exists` e o seed só roda em tabela vazia.
 * O usuário administrador só é criado se ainda não houver nenhum; a senha
 * gerada aparece uma única vez no terminal.
 */
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";

import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

import { executivo } from "../data/executivo.ts";
import { cardapio } from "../data/menu.ts";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL ausente. Rode `vercel env pull`.");

const sql = neon(url);

const schema = readFileSync(new URL("./schema.sql", import.meta.url), "utf8")
  .replace(/--.*$/gm, "")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean);

for (const comando of schema) await sql.query(comando);
console.log(`✓ schema aplicado (${schema.length} comandos)`);

// Cardápio -----------------------------------------------------
const [{ n: totalCategorias }] = (await sql`select count(*)::int as n from categorias`) as { n: number }[];

if (totalCategorias === 0) {
  for (const [ci, cat] of cardapio.entries()) {
    await sql`
      insert into categorias (id, nome, slug, descricao, ordem)
      values (${cat.id}, ${cat.nome}, ${cat.slug}, ${cat.descricao ?? null}, ${ci})`;

    for (const [ii, item] of cat.itens.entries()) {
      await sql`
        insert into itens (id, categoria_id, nome, descricao, preco, badges, vpj, img, grupo, disponivel, ordem)
        values (${item.id}, ${cat.id}, ${item.nome}, ${item.descricao ?? null}, ${item.preco},
                ${item.badges ?? []}, ${item.vpj ?? false}, ${item.img ?? null},
                ${item.grupo ?? null}, ${item.disponivel ?? true}, ${ii})`;
    }
  }
  console.log(`✓ cardápio: ${cardapio.length} categorias`);
} else {
  console.log("· cardápio já populado — mantido");
}

// Executivo ----------------------------------------------------
await sql`
  insert into executivo_config (id, ativo, preco_completo, condicoes_confirmadas, dias, horario, chamada)
  values (1, ${executivo.ativo}, ${executivo.precoCompleto}, ${executivo.condicoesConfirmadas},
          ${executivo.dias}, ${executivo.horario}, ${executivo.chamada})
  on conflict (id) do nothing`;

const [{ n: totalExec }] = (await sql`select count(*)::int as n from executivo_itens`) as { n: number }[];
if (totalExec === 0) {
  const secoes = [
    ["entradas", executivo.entradas],
    ["pratos", executivo.pratos],
    ["sobremesas", executivo.sobremesas],
  ] as const;
  for (const [secao, itens] of secoes) {
    for (const [i, item] of itens.entries()) {
      await sql`
        insert into executivo_itens (id, secao, nome, preco, selo, img, ordem)
        values (${item.id}, ${secao}, ${item.nome}, ${item.preco}, ${item.selo ?? null}, ${item.img ?? null}, ${i})`;
    }
  }
  console.log("✓ menu executivo");
}

// Configurações padrão -----------------------------------------
const padroes: Record<string, unknown> = {
  aviso: {
    ativo: false,
    texto: "Domingo tem almoço especial. Reserve sua mesa.",
    link: "/reservas",
    linkTexto: "Reservar",
  },
  fidelidade: {
    ativo: true,
    meta: 10,
    recompensa: "Uma sobremesa da casa",
    regras: "Um selo por visita com consumo a partir de R$ 60. Válido para o titular do cadastro.",
  },
};
for (const [chave, valor] of Object.entries(padroes)) {
  await sql`insert into configuracoes (chave, valor) values (${chave}, ${JSON.stringify(valor)}::jsonb)
            on conflict (chave) do nothing`;
}
console.log("✓ configurações padrão");

// Administrador ------------------------------------------------
const [{ n: totalAdmins }] = (await sql`select count(*)::int as n from admin_usuarios`) as { n: number }[];
if (totalAdmins === 0) {
  const email = (process.argv[2] ?? "admin@rizzrestaurante.com.br").toLowerCase();
  const senha = randomBytes(9).toString("base64url");
  const hash = await bcrypt.hash(senha, 12);
  await sql`insert into admin_usuarios (nome, email, senha_hash) values ('Administrador', ${email}, ${hash})`;
  console.log("\n  Acesso ao painel criado:");
  console.log(`    e-mail: ${email}`);
  console.log(`    senha:  ${senha}`);
  console.log("  Guarde a senha — ela não é exibida de novo. Troque em Configurações.\n");
} else {
  console.log("· administrador já existe — mantido");
}
