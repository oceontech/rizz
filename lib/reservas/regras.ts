/**
 * Regras de lotação das reservas — funções puras, usadas no servidor (para
 * validar) e no painel (para mostrar a ocupação).
 *
 * Não há mapa de mesas: cada turno tem um limite de pessoas no salão ao
 * mesmo tempo, e cada reserva ocupa lugares pela permanência média. A mesa
 * fica a cargo da equipe (campo livre, que aceita junções como "12+13").
 */
import { diaDe, type Servico } from "@/lib/hours";

export type Turno = "almoco" | "jantar";

export type ReservasConfig = {
  /** Desligado, o site volta a mandar o pedido para o WhatsApp. */
  ativo: boolean;
  /** Dentro da lotação, a reserva já nasce confirmada. */
  confirmacaoAutomatica: boolean;
  lotacaoAlmoco: number;
  lotacaoJantar: number;
  /** Intervalo entre os horários oferecidos, em minutos. */
  intervalo: number;
  /** Quanto tempo uma reserva ocupa os lugares, em minutos. */
  permanencia: number;
  /** Último horário oferecido = fim do turno menos isto, em minutos. */
  ultimoAntesDoFim: number;
  /** Acima disto, a reserva do site chega pendente para a equipe confirmar. */
  maxPessoasOnline: number;
  /** Antecedência mínima para reservar pelo site, em minutos. */
  antecedenciaMinima: number;
  /** Até quantos dias à frente o site aceita reservas. */
  diasAFrente: number;
};

export const RESERVAS_PADRAO: ReservasConfig = {
  ativo: true,
  confirmacaoAutomatica: true,
  lotacaoAlmoco: 60,
  lotacaoJantar: 60,
  intervalo: 30,
  permanencia: 105,
  ultimoAntesDoFim: 60,
  maxPessoasOnline: 8,
  antecedenciaMinima: 60,
  diasAFrente: 60,
};

export type Bloqueio = {
  id: number;
  data: string;
  /** null = o dia inteiro. */
  turno: Turno | null;
  /** null = fechado para reservas; número = lotação reduzida. */
  lotacao: number | null;
  motivo: string | null;
};

/** O mínimo de uma reserva que a conta de lotação precisa. */
export type Ocupante = { id: number; hora: string; pessoas: number };

export type Horario = {
  hora: string;
  turno: Turno;
  /** Lugares livres no pior momento da permanência. */
  livres: number;
  lotacao: number;
};

export const NOME_TURNO: Record<Turno, string> = { almoco: "Almoço", jantar: "Jantar" };

/** Status que ocupam lugar no salão. */
export const STATUS_ATIVOS = ["pendente", "confirmada", "concluida"] as const;

export function paraMinutos(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function deMinutos(min: number) {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;
}

/** Dia da semana de "AAAA-MM-DD" (0 = domingo), sem depender do fuso. */
export function diaDaSemana(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
}

export function somarDias(iso: string, n: number) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}

export function turnosDoDia(iso: string): { turno: Turno; faixa: Servico }[] {
  const dia = diaDe(diaDaSemana(iso));
  if (dia.fechado) return [];
  return (
    [
      { turno: "almoco" as const, faixa: dia.almoco },
      { turno: "jantar" as const, faixa: dia.jantar },
    ].filter((t) => t.faixa) as { turno: Turno; faixa: Servico }[]
  );
}

export function turnoDaHora(iso: string, hora: string): Turno | null {
  const min = paraMinutos(hora);
  const turnos = turnosDoDia(iso);
  const dentro = turnos.find((t) => min >= paraMinutos(t.faixa.inicio) && min < paraMinutos(t.faixa.fim));
  if (dentro) return dentro.turno;
  // Fora do expediente (só o painel permite): conta no turno mais próximo.
  if (!turnos.length) return null;
  return min < paraMinutos(turnos[turnos.length - 1].faixa.inicio) ? turnos[0].turno : turnos[turnos.length - 1].turno;
}

/** Lotação do turno naquele dia, considerando os bloqueios. 0 = fechado. */
export function lotacaoDoTurno(cfg: ReservasConfig, bloqueios: Bloqueio[], iso: string, turno: Turno) {
  const doDia = bloqueios.filter((b) => b.data === iso && (b.turno === null || b.turno === turno));
  const base = turno === "almoco" ? cfg.lotacaoAlmoco : cfg.lotacaoJantar;
  return doDia.reduce((l, b) => Math.min(l, b.lotacao ?? 0), base);
}

/** Pessoas no salão no minuto `min`, contando quem chegou na última permanência. */
function ocupacaoEm(min: number, ocupantes: Ocupante[], permanencia: number) {
  let total = 0;
  for (const o of ocupantes) {
    const inicio = paraMinutos(o.hora);
    if (min >= inicio && min < inicio + permanencia) total += o.pessoas;
  }
  return total;
}

/**
 * Lugares livres para quem chega em `hora`: o menor folga entre a chegada e
 * o fim da permanência (conferido a cada 15 min), só contando o mesmo turno.
 */
export function livresEm(
  cfg: ReservasConfig,
  lotacao: number,
  hora: string,
  ocupantesDoTurno: Ocupante[],
) {
  const inicio = paraMinutos(hora);
  let pior = 0;
  for (let m = inicio; m < inicio + cfg.permanencia; m += 15) {
    pior = Math.max(pior, ocupacaoEm(m, ocupantesDoTurno, cfg.permanencia));
  }
  return Math.max(0, lotacao - pior);
}

/** Pico de pessoas no turno — o painel usa para a barra de ocupação. */
export function picoDoTurno(cfg: ReservasConfig, ocupantesDoTurno: Ocupante[]) {
  let pico = 0;
  for (const o of ocupantesDoTurno) {
    pico = Math.max(pico, ocupacaoEm(paraMinutos(o.hora), ocupantesDoTurno, cfg.permanencia));
  }
  return pico;
}

/**
 * Horários oferecidos num dia, com os lugares livres de cada um.
 * `agoraMin` (minutos desde a meia-noite) só vale quando `iso` é hoje.
 */
export function horariosDoDia(
  cfg: ReservasConfig,
  bloqueios: Bloqueio[],
  iso: string,
  ocupantes: (Ocupante & { turno: Turno | null })[],
  agoraMin: number | null,
): Horario[] {
  const lista: Horario[] = [];
  for (const { turno, faixa } of turnosDoDia(iso)) {
    const lotacao = lotacaoDoTurno(cfg, bloqueios, iso, turno);
    if (lotacao <= 0) continue;
    const doTurno = ocupantes.filter((o) => o.turno === turno);
    const ultimo = paraMinutos(faixa.fim) - cfg.ultimoAntesDoFim;
    for (let m = paraMinutos(faixa.inicio); m <= ultimo; m += cfg.intervalo) {
      if (agoraMin !== null && m < agoraMin + cfg.antecedenciaMinima) continue;
      const hora = deMinutos(m);
      lista.push({ hora, turno, lotacao, livres: livresEm(cfg, lotacao, hora, doTurno) });
    }
  }
  return lista;
}

/** "2026-10-19" → "segunda-feira, 19 de outubro". */
export function dataPorExtenso(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
}

/** Dias da semana sem expediente (para o calendário do cliente). */
export function diaFechadoNaSemana(iso: string) {
  return turnosDoDia(iso).length === 0;
}

/** Dia sem nenhum turno aberto para reservas, por expediente ou bloqueio. */
export function diaSemReservas(cfg: ReservasConfig, bloqueios: Bloqueio[], iso: string) {
  return turnosDoDia(iso).every(({ turno }) => lotacaoDoTurno(cfg, bloqueios, iso, turno) <= 0);
}

export const OCASIOES = [
  { id: "aniversario", rotulo: "Aniversário" },
  { id: "romantico", rotulo: "Encontro a dois" },
  { id: "negocios", rotulo: "Negócios" },
  { id: "comemoracao", rotulo: "Comemoração" },
  { id: "familia", rotulo: "Família" },
] as const;

export type Ocasiao = (typeof OCASIOES)[number]["id"];

export function rotuloOcasiao(id: string | null) {
  return OCASIOES.find((o) => o.id === id)?.rotulo ?? null;
}
