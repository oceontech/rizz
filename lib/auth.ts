import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

import { sql } from "@/lib/db";
import { permissoesDe, pode, type Area, type Papel, type Permissoes } from "@/lib/permissoes";

export const COOKIE_SESSAO = "rizz_sessao";
const DURACAO_SEG = 60 * 60 * 24 * 7; // 7 dias

/** O que vai no cookie: só a identidade e a versão da sessão. */
type Token = { id: number; versao: number };

export type Sessao = {
  id: number;
  email: string;
  nome: string;
  cargo: string;
  telefone: string;
  papel: Papel;
  permissoes: Permissoes;
};

function chave() {
  const segredo = process.env.AUTH_SECRET;
  if (!segredo) throw new Error("AUTH_SECRET não configurado");
  return new TextEncoder().encode(segredo);
}

async function criarToken(t: Token) {
  return new SignJWT({ id: t.id, v: t.versao })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_SEG}s`)
    .sign(chave());
}

async function lerToken(token: string | undefined): Promise<Token | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, chave(), { algorithms: ["HS256"] });
    // Cookies antigos não têm versão: valem como versão 1.
    return { id: Number(payload.id), versao: Number(payload.v ?? 1) };
  } catch {
    return null;
  }
}

export async function iniciarSessao(t: Token) {
  const token = await criarToken(t);
  (await cookies()).set(COOKIE_SESSAO, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DURACAO_SEG,
  });
}

export async function encerrarSessao() {
  (await cookies()).delete(COOKIE_SESSAO);
}

/**
 * Sessão da requisição atual — memorizada durante o render. O cookie diz só
 * quem é; nome, papel e permissões vêm do banco a cada requisição, para que
 * mudar o acesso, desativar alguém ou "sair de todos os aparelhos" valha na hora.
 */
export const sessaoAtual = cache(async (): Promise<Sessao | null> => {
  const t = await lerToken((await cookies()).get(COOKIE_SESSAO)?.value);
  if (!t) return null;
  const [u] = await sql`
    select id, nome, email, cargo, telefone, papel, permissoes, ativo, sessao_versao
    from admin_usuarios where id = ${t.id}`;
  if (!u || !u.ativo || Number(u.sessao_versao) !== t.versao) return null;
  const papel = String(u.papel) as Papel;
  return { id: Number(u.id), nome: String(u.nome), email: String(u.email), cargo: u.cargo ? String(u.cargo) : "", telefone: u.telefone ? String(u.telefone) : "", papel, permissoes: permissoesDe(papel, u.permissoes) };
});

/**
 * Checagem definitiva. O proxy só faz o redirecionamento otimista; toda
 * página e toda Server Action do painel passa por aqui.
 */
export async function exigirSessao(): Promise<Sessao> {
  const sessao = await sessaoAtual();
  if (!sessao) redirect("/admin/login");
  return sessao;
}

/** Página de uma área: sem permissão para ver, vai para o aviso de acesso. */
export async function exigirAcesso(area: Area): Promise<Sessao> {
  const sessao = await exigirSessao();
  if (!pode(sessao.permissoes, area, "ver")) redirect(`/admin/sem-acesso?area=${area}`);
  return sessao;
}
