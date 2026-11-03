import "server-only";

import { createHash, randomBytes } from "node:crypto";

import { headers } from "next/headers";

import { sql } from "@/lib/db";
import { permissoesDe, type Papel, type Permissoes } from "@/lib/permissoes";

export type Membro = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  papel: Papel;
  permissoes: Permissoes;
  ativo: boolean;
  ultimoLogin: string | null;
  criadoEm: string;
  convidadoPor: string | null;
};

export type ConvitePendente = {
  id: number;
  nome: string;
  email: string;
  telefone: string;
  cargo: string;
  papel: Papel;
  permissoes: Permissoes;
  criadoEm: string;
  expiraEm: string;
  criadoPor: string | null;
};

const iso = (v: unknown) => (v ? new Date(String(v)).toISOString() : null);

export async function lerEquipe(): Promise<{ membros: Membro[]; convites: ConvitePendente[] }> {
  const [membros, convites] = await Promise.all([
    sql`select u.id, u.nome, u.email, u.telefone, u.cargo, u.papel, u.permissoes, u.ativo, u.ultimo_login, u.criado_em, c.nome as convidado_por
        from admin_usuarios u left join admin_usuarios c on c.id = u.convidado_por
        order by u.ativo desc, case u.papel when 'dono' then 0 when 'gerente' then 1 when 'colaborador' then 2 else 3 end, u.nome`,
    sql`select v.id, v.nome, v.email, v.telefone, v.cargo, v.papel, v.permissoes, v.criado_em, v.expira_em, u.nome as criado_por
        from admin_convites v left join admin_usuarios u on u.id = v.criado_por
        where v.tipo = 'convite' and v.usado_em is null and v.revogado_em is null and v.expira_em > now()
        order by v.criado_em desc`,
  ]);
  return {
    membros: membros.map((l) => ({
      id: Number(l.id),
      nome: String(l.nome),
      email: String(l.email),
      telefone: l.telefone ? String(l.telefone) : "",
      cargo: l.cargo ? String(l.cargo) : "",
      papel: String(l.papel) as Papel,
      permissoes: permissoesDe(String(l.papel), l.permissoes),
      ativo: Boolean(l.ativo),
      ultimoLogin: iso(l.ultimo_login),
      criadoEm: iso(l.criado_em)!,
      convidadoPor: l.convidado_por ? String(l.convidado_por) : null,
    })),
    convites: convites.map((l) => ({
      id: Number(l.id),
      nome: String(l.nome ?? ""),
      email: String(l.email ?? ""),
      telefone: l.telefone ? String(l.telefone) : "",
      cargo: l.cargo ? String(l.cargo) : "",
      papel: String(l.papel) as Papel,
      permissoes: permissoesDe(String(l.papel), l.permissoes),
      criadoEm: iso(l.criado_em)!,
      expiraEm: iso(l.expira_em)!,
      criadoPor: l.criado_por ? String(l.criado_por) : null,
    })),
  };
}

/** Token do link: só o hash vai para o banco, o valor fica só no link. */
export function novoToken() {
  const token = randomBytes(24).toString("base64url");
  return { token, hash: hashDoToken(token) };
}

export function hashDoToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/** Endereço do painel na requisição atual (preview ou produção). */
export async function origemAtual() {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export type LinkConvite = {
  tipo: "convite" | "senha";
  nome: string;
  email: string;
  cargo: string;
  papel: Papel;
  convidadoPor: string | null;
  expiraEm: string;
  usuarioId: number | null;
};

/** Lê um link de convite ou de nova senha ainda válido (null se usado, revogado ou vencido). */
export async function lerLink(token: string): Promise<(LinkConvite & { id: number }) | null> {
  if (!/^[\w-]{20,64}$/.test(token)) return null;
  const [l] = await sql`
    select v.id, v.tipo, v.usuario_id, v.expira_em, v.papel, v.cargo,
           coalesce(v.nome, u.nome) as nome, coalesce(v.email, u.email) as email, c.nome as criado_por
    from admin_convites v
    left join admin_usuarios u on u.id = v.usuario_id
    left join admin_usuarios c on c.id = v.criado_por
    where v.token_hash = ${hashDoToken(token)} and v.usado_em is null and v.revogado_em is null and v.expira_em > now()`;
  if (!l) return null;
  return {
    id: Number(l.id),
    tipo: l.tipo === "senha" ? "senha" : "convite",
    nome: String(l.nome ?? ""),
    email: String(l.email ?? ""),
    cargo: l.cargo ? String(l.cargo) : "",
    papel: String(l.papel ?? "colaborador") as Papel,
    convidadoPor: l.criado_por ? String(l.criado_por) : null,
    expiraEm: iso(l.expira_em)!,
    usuarioId: l.usuario_id ? Number(l.usuario_id) : null,
  };
}
