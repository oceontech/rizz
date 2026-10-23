import {
  addDays,
  endOfMonth,
  format,
  isValid,
  parse,
  startOfMonth,
  subDays,
  subMonths,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { FUSO } from "@/lib/formatos";

// Datas de calendário (sem horário) representadas como Date à meia-noite local.

export type Intervalo = { de: Date; ate: Date };

export const ATALHOS_PERIODO = {
  hoje: "Hoje",
  ontem: "Ontem",
  "3d": "Últimos 3 dias",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
  "este-mes": "Este mês",
  "mes-passado": "Mês passado",
} as const;

export type AtalhoPeriodo = keyof typeof ATALHOS_PERIODO;

/** Período padrão do painel */
export const PERIODO_PADRAO: AtalhoPeriodo = "este-mes";

/** Dia de hoje no fuso de São Paulo. */
export function hojeSaoPaulo(agora: Date = new Date()): Date {
  const partes = new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSO,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(agora);
  return parse(partes, "yyyy-MM-dd", new Date(2000, 0, 1));
}

/** A hora cheia de agora em São Paulo (0 a 23), para as rotinas que rodam numa hora escolhida */
export function horaSaoPaulo(agora: Date = new Date()): number {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: FUSO, hour: "2-digit", hourCycle: "h23" }).format(agora));
}

/**
 * Intervalo de um atalho. "Últimos N dias" são N dias completos até ontem,
 * como no Gerenciador de Anúncios da Meta.
 */
export function intervaloDoAtalho(atalho: AtalhoPeriodo, hoje: Date = hojeSaoPaulo()): Intervalo {
  switch (atalho) {
    case "hoje":
      return { de: hoje, ate: hoje };
    case "ontem": {
      const ontem = subDays(hoje, 1);
      return { de: ontem, ate: ontem };
    }
    case "3d":
    case "7d":
    case "30d":
    case "90d": {
      const dias = Number.parseInt(atalho, 10);
      const ontem = subDays(hoje, 1);
      return { de: subDays(ontem, dias - 1), ate: ontem };
    }
    case "este-mes":
      return { de: startOfMonth(hoje), ate: hoje };
    case "mes-passado": {
      const anterior = subMonths(hoje, 1);
      return { de: startOfMonth(anterior), ate: endOfMonth(anterior) };
    }
  }
}

const FORMATO_URL = "yyyy-MM-dd";

function lerData(texto: string): Date | null {
  const data = parse(texto, FORMATO_URL, new Date(2000, 0, 1));
  return isValid(data) && format(data, FORMATO_URL) === texto ? data : null;
}

/** Período como fica na URL: um atalho ("este-mes") ou "2026-10-01_2026-10-08". */
export type Periodo = { atalho: AtalhoPeriodo } | { personalizado: Intervalo };

export function periodoParaUrl(periodo: Periodo): string {
  if ("atalho" in periodo) return periodo.atalho;
  const { de, ate } = periodo.personalizado;
  return `${format(de, FORMATO_URL)}_${format(ate, FORMATO_URL)}`;
}

/** Lê o período da URL; valor ausente ou inválido vira o padrão. */
export function periodoDaUrl(valor: string | null | undefined): Periodo {
  if (valor && valor in ATALHOS_PERIODO) return { atalho: valor as AtalhoPeriodo };
  const [deTexto, ateTexto, ...resto] = (valor ?? "").split("_");
  if (deTexto && ateTexto && resto.length === 0) {
    const de = lerData(deTexto);
    const ate = lerData(ateTexto);
    if (de && ate && de <= ate) return { personalizado: { de, ate } };
  }
  return { atalho: PERIODO_PADRAO };
}

export function intervaloDoPeriodo(periodo: Periodo, hoje: Date = hojeSaoPaulo()): Intervalo {
  return "atalho" in periodo ? intervaloDoAtalho(periodo.atalho, hoje) : periodo.personalizado;
}

/** "01/10/2026 – 08/10/2026" ou "08/10/2026" quando é um dia só. */
export function descreverIntervalo({ de, ate }: Intervalo): string {
  const inicio = format(de, "dd/MM/yyyy");
  const fim = format(ate, "dd/MM/yyyy");
  return inicio === fim ? inicio : `${inicio} – ${fim}`;
}

/** Texto curto do período para botões: o nome do atalho ou as datas. */
export function rotuloDoPeriodo(periodo: Periodo): string {
  if ("atalho" in periodo) return ATALHOS_PERIODO[periodo.atalho];
  const { de, ate } = periodo.personalizado;
  const mesmoAno = de.getFullYear() === ate.getFullYear();
  const inicio = format(de, mesmoAno ? "d MMM" : "d MMM yyyy", { locale: ptBR });
  const fim = format(ate, "d MMM yyyy", { locale: ptBR });
  return de.getTime() === ate.getTime() ? fim : `${inicio} – ${fim}`;
}

/** Dias do intervalo, contando os dois extremos. */
export function diasNoIntervalo({ de, ate }: Intervalo): number {
  let dias = 0;
  for (let dia = de; dia <= ate; dia = addDays(dia, 1)) dias++;
  return dias;
}

/** Período anterior de mesma duração, logo antes (base das variações dos cards). */
export function intervaloAnterior({ de, ate }: Intervalo): Intervalo {
  const dias = diasNoIntervalo({ de, ate });
  return { de: subDays(de, dias), ate: subDays(de, 1) };
}

/** Intervalo como texto "yyyy-MM-dd" (consultas ao banco e chaves do alcance). */
export function intervaloEmTexto({ de, ate }: Intervalo): { desde: string; ate: string } {
  return { desde: format(de, FORMATO_URL), ate: format(ate, FORMATO_URL) };
}
