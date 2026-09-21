"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { encerrarSessao, exigirSessao, iniciarSessao } from "@/lib/auth";
import { sql } from "@/lib/db";

export type EstadoLogin = { erro?: string; email?: string };

const esquema = z.object({
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe a senha."),
});

/** Hash descartável para gastar o mesmo tempo quando o e-mail não existe. */
let hashFalso: string | null = null;
const HASH_FALSO = () => (hashFalso ??= bcrypt.hashSync("rizz-sem-usuario", 12));

export async function entrar(_: EstadoLogin, form: FormData): Promise<EstadoLogin> {
  const dados = esquema.safeParse({ email: form.get("email"), senha: form.get("senha") });
  const email = String(form.get("email") ?? "");
  if (!dados.success) return { erro: dados.error.issues[0].message, email };

  const [usuario] = await sql`
    select id, nome, email, senha_hash from admin_usuarios where email = ${dados.data.email}`;

  const confere = await bcrypt.compare(
    dados.data.senha,
    usuario ? String(usuario.senha_hash) : HASH_FALSO(),
  );

  if (!usuario || !confere) {
    return { erro: "E-mail ou senha incorretos.", email };
  }

  await sql`update admin_usuarios set ultimo_login = now() where id = ${usuario.id}`;
  await iniciarSessao({
    id: Number(usuario.id),
    email: String(usuario.email),
    nome: String(usuario.nome),
  });

  const destino = String(form.get("de") ?? "");
  redirect(destino.startsWith("/admin") ? destino : "/admin");
}

export async function sair() {
  await encerrarSessao();
  redirect("/admin/login");
}

export type EstadoSenha = { ok?: boolean; erro?: string };

const esquemaSenha = z
  .object({
    atual: z.string().min(1, "Informe a senha atual."),
    nova: z.string().min(8, "A nova senha precisa ter ao menos 8 caracteres."),
    confirmacao: z.string(),
  })
  .refine((d) => d.nova === d.confirmacao, { message: "A confirmação não confere." });

export async function trocarSenha(_: EstadoSenha, form: FormData): Promise<EstadoSenha> {
  const sessao = await exigirSessao();
  const dados = esquemaSenha.safeParse(Object.fromEntries(form));
  if (!dados.success) return { erro: dados.error.issues[0].message };

  const [usuario] = await sql`select senha_hash from admin_usuarios where id = ${sessao.id}`;
  if (!usuario || !(await bcrypt.compare(dados.data.atual, String(usuario.senha_hash)))) {
    return { erro: "A senha atual está incorreta." };
  }

  const hash = await bcrypt.hash(dados.data.nova, 12);
  await sql`update admin_usuarios set senha_hash = ${hash} where id = ${sessao.id}`;
  return { ok: true };
}

export async function atualizarPerfil(_: EstadoSenha, form: FormData): Promise<EstadoSenha> {
  const sessao = await exigirSessao();
  const dados = z
    .object({
      nome: z.string().trim().min(2, "Informe seu nome."),
      email: z.string().trim().toLowerCase().email("E-mail inválido."),
    })
    .safeParse(Object.fromEntries(form));
  if (!dados.success) return { erro: dados.error.issues[0].message };

  try {
    await sql`update admin_usuarios set nome = ${dados.data.nome}, email = ${dados.data.email}
              where id = ${sessao.id}`;
  } catch {
    return { erro: "Esse e-mail já está em uso." };
  }
  await iniciarSessao({ id: sessao.id, ...dados.data });
  revalidatePath("/admin", "layout");
  return { ok: true };
}
