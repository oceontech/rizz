"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { encerrarSessao, exigirSessao, iniciarSessao } from "@/lib/auth";
import { sql } from "@/lib/db";

import { avisarSenhaAlterada, enviarAcesso, type Envio } from "./envio-acesso";
import { novoToken, origemAtual } from "./equipe";
import { normalizarTelefone } from "./formato";

export type EstadoLogin = { erro?: string; email?: string };

const esquema = z.object({
  email: z.string().trim().toLowerCase().email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe a senha."),
});

/**
 * Mensagens distintas para "e-mail sem acesso" e "senha errada": o painel é
 * de uma equipe pequena e saber qual dos dois errou vale mais que esconder
 * quem tem acesso (decisão do dono do projeto, 13/11/2026).
 */
export async function entrar(_: EstadoLogin, form: FormData): Promise<EstadoLogin> {
  const dados = esquema.safeParse({ email: form.get("email"), senha: form.get("senha") });
  const email = String(form.get("email") ?? "");
  if (!dados.success) return { erro: dados.error.issues[0].message, email };

  const [usuario] = await sql`
    select id, senha_hash, ativo, sessao_versao from admin_usuarios where email = ${dados.data.email}`;

  if (!usuario) {
    return { erro: "Não há acesso ao painel com esse e-mail. Confira o endereço ou peça um convite a quem administra o painel.", email };
  }
  if (!(await bcrypt.compare(dados.data.senha, String(usuario.senha_hash)))) {
    return { erro: "Senha incorreta. Se não lembrar, use \"Esqueci minha senha\".", email };
  }
  if (!usuario.ativo) {
    return { erro: "Este acesso está desativado. Fale com quem administra o painel.", email };
  }

  await sql`update admin_usuarios set ultimo_login = now() where id = ${usuario.id}`;
  await iniciarSessao({ id: Number(usuario.id), versao: Number(usuario.sessao_versao) });

  const destino = String(form.get("de") ?? "");
  redirect(destino.startsWith("/admin") ? destino : "/admin");
}

/**
 * Marca que a pessoa está usando o painel agora. Chamada pelo navegador em
 * interações (no máximo uma vez por minuto); o próprio banco descarta
 * gravações mais próximas que 30 s. Nunca falha para a tela: sem a coluna
 * (antes do `db:setup`) ou sem rede, só não registra.
 */
export async function registrarAtividade() {
  const sessao = await exigirSessao();
  try {
    await sql`update admin_usuarios set ultima_atividade = now()
              where id = ${sessao.id}
                and (ultima_atividade is null or ultima_atividade < now() - interval '30 seconds')`;
  } catch {
    // coluna ainda não criada
  }
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
  await avisarSenhaAlterada({ nome: sessao.nome, email: sessao.email, telefone: sessao.telefone || null });
  return { ok: true };
}

export async function atualizarPerfil(_: EstadoSenha, form: FormData): Promise<EstadoSenha> {
  const sessao = await exigirSessao();
  const dados = z
    .object({
      nome: z.string().trim().min(2, "Informe seu nome.").max(60),
      email: z.string().trim().toLowerCase().email("E-mail inválido."),
      cargo: z.string().trim().max(40).optional().default(""),
      telefone: z
        .string()
        .optional()
        .default("")
        .transform(normalizarTelefone)
        .refine((t) => t === "" || /^\d{10,11}$/.test(t), "WhatsApp com DDD, ex.: (19) 99999-9999."),
    })
    .safeParse(Object.fromEntries(form));
  if (!dados.success) return { erro: dados.error.issues[0].message };

  try {
    await sql`update admin_usuarios set nome = ${dados.data.nome}, email = ${dados.data.email},
              cargo = ${dados.data.cargo || null}, telefone = ${dados.data.telefone || null} where id = ${sessao.id}`;
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

export type EstadoEsqueci = { enviado?: boolean; recente?: boolean; envios?: Envio[]; erro?: string };

/**
 * "Esqueci minha senha": manda o link de nova senha por e-mail e WhatsApp e
 * diz na tela por onde saiu. Cada pessoa recebe no máximo um link a cada
 * 5 minutos.
 */
export async function pedirNovaSenha(_: EstadoEsqueci, form: FormData): Promise<EstadoEsqueci> {
  const email = z.string().trim().toLowerCase().email().safeParse(form.get("email"));
  if (!email.success) return { erro: "Informe um e-mail válido." };

  const [u] = await sql`select id, nome, email, telefone, ativo from admin_usuarios where email = ${email.data}`;
  if (!u) {
    return { erro: "Não há acesso ao painel com esse e-mail. Confira o endereço ou peça a quem administra o painel." };
  }
  if (!u.ativo) return { erro: "Este acesso está desativado. Fale com quem administra o painel." };

  const [recente] = await sql`select 1 from admin_convites where tipo = 'senha' and usuario_id = ${u.id}
                              and revogado_em is null and criado_em > now() - interval '5 minutes'`;
  if (recente) return { enviado: true, recente: true };

  await sql`update admin_convites set revogado_em = now() where tipo = 'senha' and usuario_id = ${u.id} and usado_em is null and revogado_em is null`;
  const { token, hash } = novoToken();
  await sql`insert into admin_convites (token_hash, tipo, usuario_id, expira_em)
            values (${hash}, 'senha', ${u.id}, ${new Date(Date.now() + 864e5).toISOString()})`;
  const envios = await enviarAcesso("recuperacao", {
    nome: String(u.nome),
    email: String(u.email),
    telefone: u.telefone ? String(u.telefone) : null,
    link: `${await origemAtual()}/admin/convite/${token}`,
    validade: "24 horas",
  });
  if (!envios.some((e) => e.ok)) {
    // Nada saiu: o link fica sem uso, então não pode travar um novo pedido por 5 minutos.
    await sql`update admin_convites set revogado_em = now() where token_hash = ${hash}`;
    const motivo = envios.map((e) => e.motivo).filter(Boolean).join("; ");
    return { erro: `Não conseguimos enviar o link${motivo ? ` (${motivo})` : ""}. Peça a quem administra o painel para gerar um em Configurações → Equipe.` };
  }
  return { enviado: true, envios };
}
