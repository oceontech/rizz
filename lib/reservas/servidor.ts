import "server-only";

import { randomBytes } from "node:crypto";

import { lerConfig, paraDataISO } from "@/lib/dados";
import { sql } from "@/lib/db";
import { agoraNoRestaurante } from "@/lib/hours";

import {
  horariosDoDia,
  livresEm,
  lotacaoDoTurno,
  RESERVAS_PADRAO,
  somarDias,
  STATUS_ATIVOS,
  turnoDaHora,
  type Bloqueio,
  type ReservasConfig,
  type Turno,
} from "./regras";

export function lerConfigReservas() {
  return lerConfig<ReservasConfig>("reservas", RESERVAS_PADRAO);
}

/** Data de hoje e minutos desde a meia-noite, no fuso do restaurante. */
export function agoraSP() {
  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  return { hoje, minutos: agoraNoRestaurante().minutos };
}

export function mapBloqueio(l: Record<string, unknown>): Bloqueio {
  return {
    id: Number(l.id),
    data: paraDataISO(l.data)!,
    turno: (l.turno as Turno | null) ?? null,
    lotacao: l.lotacao === null || l.lotacao === undefined ? null : Number(l.lotacao),
    motivo: l.motivo ? String(l.motivo) : null,
  };
}

export async function lerBloqueios(de: string, ate: string) {
  const linhas = await sql`select * from reserva_bloqueios where data between ${de} and ${ate} order by data, turno nulls first`;
  return linhas.map(mapBloqueio);
}

/** Reservas que ocupam lugar no dia, já com o turno de cada uma. */
export async function ocupantesDoDia(iso: string, ignorarId?: number) {
  const linhas = await sql`
    select id, hora, pessoas from reservas
    where data = ${iso} and hora is not null and status = any(${[...STATUS_ATIVOS]}::text[])
      and id <> ${ignorarId ?? 0}`;
  return linhas.map((l) => ({
    id: Number(l.id),
    hora: String(l.hora),
    pessoas: Number(l.pessoas),
    turno: turnoDaHora(iso, String(l.hora)),
  }));
}

/** Horários do dia para o site, já sem os que passaram da antecedência. */
export async function horariosDisponiveis(iso: string, ignorarId?: number) {
  const [cfg, bloqueios, ocupantes] = await Promise.all([
    lerConfigReservas(),
    lerBloqueios(iso, iso),
    ocupantesDoDia(iso, ignorarId),
  ]);
  const agora = agoraSP();
  if (iso < agora.hoje || iso > somarDias(agora.hoje, cfg.diasAFrente)) return { cfg, horarios: [] };
  return { cfg, horarios: horariosDoDia(cfg, bloqueios, iso, ocupantes, iso === agora.hoje ? agora.minutos : null) };
}

/** Lugares livres para `pessoas` às `hora` — usado antes e depois de gravar. */
export async function livresNoHorario(cfg: ReservasConfig, iso: string, hora: string, ignorarId?: number) {
  const turno = turnoDaHora(iso, hora);
  if (!turno) return { turno: null, livres: 0, lotacao: 0 };
  const [bloqueios, ocupantes] = await Promise.all([lerBloqueios(iso, iso), ocupantesDoDia(iso, ignorarId)]);
  const lotacao = lotacaoDoTurno(cfg, bloqueios, iso, turno);
  const livres = livresEm(cfg, lotacao, hora, ocupantes.filter((o) => o.turno === turno));
  return { turno, livres, lotacao };
}

/** Código do link pessoal da reserva: curto, mas impossível de adivinhar. */
export function novoCodigo() {
  return randomBytes(6).toString("base64url");
}

export type ReservaPublica = {
  id: number;
  codigo: string;
  nome: string;
  telefone: string | null;
  pessoas: number;
  data: string;
  hora: string;
  obs: string | null;
  ocasiao: string | null;
  status: "pendente" | "confirmada" | "concluida" | "cancelada" | "nao_compareceu";
};

export async function reservaPorCodigo(codigo: string): Promise<ReservaPublica | null> {
  if (!/^[\w-]{6,20}$/.test(codigo)) return null;
  const [l] = await sql`select * from reservas where codigo = ${codigo}`;
  if (!l || !l.data || !l.hora) return null;
  return {
    id: Number(l.id),
    codigo: String(l.codigo),
    nome: String(l.nome),
    telefone: l.telefone ? String(l.telefone) : null,
    pessoas: Number(l.pessoas),
    data: paraDataISO(l.data)!,
    hora: String(l.hora),
    obs: l.obs ? String(l.obs) : null,
    ocasiao: l.ocasiao ? String(l.ocasiao) : null,
    status: l.status as ReservaPublica["status"],
  };
}

/** O cliente só altera ou cancela antes do horário e enquanto ela vale. */
export function podeMexer(r: ReservaPublica) {
  if (r.status !== "pendente" && r.status !== "confirmada") return false;
  const agora = agoraSP();
  if (r.data !== agora.hoje) return r.data > agora.hoje;
  const [h, m] = r.hora.split(":").map(Number);
  return h * 60 + m > agora.minutos;
}
