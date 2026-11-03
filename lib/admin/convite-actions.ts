"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { z } from "zod";

import { iniciarSessao } from "@/lib/auth";
import { sql } from "@/lib/db";

import { lerLink } from "./equipe";

export type EstadoConvite = { erro?: string };

const esquema = z
  .object({
    token: z.string(),
    nome: z.string().trim().min(2, "Informe seu nome.").max(60),
    senha: z.string().min(8, "A senha precisa ter ao menos 8 caracteres."),
    confirmacao: z.string(),
  })
  .refine((d) => d.senha === d.confirmacao, { message: "A confirmação não confere." });

/**
 * Aceita um convite (cria o acesso) ou um link de nova senha. Pública: quem
 * prova o acesso é o token do link, que vale uma vez só.
 */
export async function aceitarConvite(_: EstadoConvite, form: FormData): Promise<EstadoConvite> {
  const dados = esquema.safeParse(Object.fromEntries(form));
  if (!dados.success) return { erro: dados.error.issues[0].message };
  const d = dados.data;

  const link = await lerLink(d.token);
  if (!link) return { erro: "Este link venceu ou já foi usado. Peça um novo a quem te convidou." };

  // Marca o link como usado antes de tudo: dois envios ao mesmo tempo não criam dois acessos.
  const [marcado] = await sql`update admin_convites set usado_em = now() where id = ${link.id} and usado_em is null returning id`;
  if (!marcado) return { erro: "Este link já foi usado." };

  const hash = await bcrypt.hash(d.senha, 12);
  let id: number;
  let versao: number;

  if (link.tipo === "senha") {
    const [u] = await sql`update admin_usuarios set senha_hash = ${hash}, nome = ${d.nome}, sessao_versao = sessao_versao + 1
                          where id = ${link.usuarioId} and ativo returning id, sessao_versao`;
    if (!u) return { erro: "Este acesso está desativado." };
    id = Number(u.id);
    versao = Number(u.sessao_versao);
  } else {
    const [c] = await sql`select papel, permissoes, criado_por from admin_convites where id = ${link.id}`;
    try {
      const [u] = await sql`
        insert into admin_usuarios (nome, email, senha_hash, papel, permissoes, cargo, convidado_por)
        values (${d.nome}, ${link.email.toLowerCase()}, ${hash}, ${c.papel}, ${c.permissoes ? JSON.stringify(c.permissoes) : null}::jsonb,
                ${link.cargo || null}, ${c.criado_por})
        returning id, sessao_versao`;
      id = Number(u.id);
      versao = Number(u.sessao_versao);
    } catch {
      return { erro: "Já existe um acesso com este e-mail. Entre pela tela de login." };
    }
  }

  await sql`update admin_usuarios set ultimo_login = now() where id = ${id}`;
  await iniciarSessao({ id, versao });
  redirect("/admin");
}
