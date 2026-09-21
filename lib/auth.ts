import "server-only";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";

export const COOKIE_SESSAO = "rizz_sessao";
const DURACAO_SEG = 60 * 60 * 24 * 7; // 7 dias

export type Sessao = { id: number; email: string; nome: string };

function chave() {
  const segredo = process.env.AUTH_SECRET;
  if (!segredo) throw new Error("AUTH_SECRET não configurado");
  return new TextEncoder().encode(segredo);
}

export async function criarToken(sessao: Sessao) {
  return new SignJWT({ ...sessao })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DURACAO_SEG}s`)
    .sign(chave());
}

export async function lerToken(token: string | undefined): Promise<Sessao | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, chave(), { algorithms: ["HS256"] });
    return { id: Number(payload.id), email: String(payload.email), nome: String(payload.nome) };
  } catch {
    return null;
  }
}

export async function iniciarSessao(sessao: Sessao) {
  const token = await criarToken(sessao);
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

/** Sessão da requisição atual — memorizada durante o render. */
export const sessaoAtual = cache(async () => {
  const token = (await cookies()).get(COOKIE_SESSAO)?.value;
  return lerToken(token);
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
