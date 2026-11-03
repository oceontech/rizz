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
    select id, senha_hash, ativo, sessao_versao from admin_usuarios where email = ${dados.data.email}`;

  const confere = await bcrypt.compare(
    dados.data.senha,
    usuario ? String(usuario.senha_hash) : HASH_FALSO(),
  );

  if (!usuario || !confere) {
    return { erro: "E-mail ou senha incorretos.", email };
  }
  if (!usuario.ativo) {
    return { erro: "Este acesso está desativado. Fale com quem administra o painel.", email };
  }

  await sql`update admin_usuarios set ultimo_login = now() where id = ${usuario.id}`;
  await iniciarSessao({ id: Number(usuario.id), versao: Number(usuario.sessao_versao) });

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

/** Troca a senha e derruba as outras sessões abertas (este aparelho continua logado). */
export async function trocarSenha(_: EstadoSenha, form: FormData): Promise<EstadoSenha> {
  const sessao = await exigirSessao();
  const dados = esquemaSenha.safeParse(Object.fromEntries(form));
  if (!dados.success) return { erro: dados.error.issues[0].message };

  const [usuario] = await sql`select senha_hash from admin_usuarios where id = ${sessao.id}`;
  if (!usuario || !(await bcrypt.compare(dados.data.atual, String(usuario.senha_hash)))) {
    return { erro: "A senha atual está incorreta." };
  }

  const hash = await bcrypt.hash(dados.data.nova, 12);
  const [l] = await sql`update admin_usuarios set senha_hash = ${hash}, sessao_versao = sessao_versao + 1
                        where id = ${sessao.id} returning sessao_versao`;
  await iniciarSessao({ id: sessao.id, versao: Number(l.sessao_versao) });
  return { ok: true };
}

export async function atualizarPerfil(_: EstadoSenha, form: FormData): Promise<EstadoSenha> {
  const sessao = await exigirSessao();
  const dados = z
    .object({
      nome: z.string().trim().min(2, "Informe seu nome.").max(60),
      email: z.string().trim().toLowerCase().email("E-mail inválido."),
      cargo: z.string().trim().max(40).optional().default(""),
    })
    .safeParse(Object.fromEntries(form));
  if (!dados.success) return { erro: dados.error.issues[0].message };

  try {
    await sql`update admin_usuarios set nome = ${dados.data.nome}, email = ${dados.data.email},
              cargo = ${dados.data.cargo || null} where id = ${sessao.id}`;
  } catch {
    return { erro: "Esse e-mail já está em uso." };
  }
  revalidatePath("/admin", "layout");
  return { ok: true };
}

/** Encerra o acesso em todos os aparelhos, inclusive este. */
export async function sairDeTodos() {
  const sessao = await exigirSessao();
  await sql`update admin_usuarios set sessao_versao = sessao_versao + 1 where id = ${sessao.id}`;
  await encerrarSessao();
  redirect("/admin/login");
}
