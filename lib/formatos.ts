// Formatação de valores para a interface (pt-BR, fuso America/Sao_Paulo).
// Valor ausente ou inválido (ex.: divisão por zero) aparece como "—".

export const FUSO = "America/Sao_Paulo";
export const VAZIO = "—";

type Valor = number | null | undefined;

function valido(valor: Valor): valor is number {
  return typeof valor === "number" && Number.isFinite(valor);
}

const moedaFmt = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** R$ 1.234,56 */
export function moeda(valor: Valor): string {
  return valido(valor) ? moedaFmt.format(valor) : VAZIO;
}

/** 1.234 (inteiro) ou com as casas pedidas: decimal(46.691, 2) = 46,69 */
export function numero(valor: Valor, casas = 0): string {
  if (!valido(valor)) return VAZIO;
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(valor);
}

/** Recebe fração (0.279) e devolve 27,9% */
export function percentual(fracao: Valor, casas = 1): string {
  if (!valido(fracao)) return VAZIO;
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(fracao);
}

const DATA_SIMPLES = /^(\d{4})-(\d{2})-(\d{2})$/;

const dataFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const dataHoraFmt = new Intl.DateTimeFormat("pt-BR", {
  timeZone: FUSO,
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

function paraData(valor: Date | string): Date | null {
  const data = valor instanceof Date ? valor : new Date(valor);
  return Number.isNaN(data.getTime()) ? null : data;
}

/**
 * 08/10/2026. Datas sem horário ("2026-10-08", colunas `date` do banco)
 * são exibidas como estão, sem conversão de fuso.
 */
export function data(valor: Date | string | null | undefined): string {
  if (!valor) return VAZIO;
  if (typeof valor === "string") {
    const simples = DATA_SIMPLES.exec(valor);
    if (simples) return `${simples[3]}/${simples[2]}/${simples[1]}`;
  }
  const convertida = paraData(valor);
  return convertida ? dataFmt.format(convertida) : VAZIO;
}

/** 08/10/2026 às 14:30 no fuso de São Paulo */
export function dataHora(valor: Date | string | null | undefined): string {
  if (!valor) return VAZIO;
  const convertida = paraData(valor);
  return convertida ? dataHoraFmt.format(convertida).replace(", ", " às ") : VAZIO;
}
