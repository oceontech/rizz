import type { Mascara } from "./cursor";

// Números no padrão brasileiro: milhar com ponto, decimal com vírgula.

/** Converte texto em pt-BR ("1.234,56", "R$ 63.046,66", "12,5", "12.5") para número. */
export function lerNumero(texto: string): number | null {
  let t = texto.replace(/[^\d.,-]/g, "");
  if (!t || !/\d/.test(t)) return null;
  if (t.includes(",")) t = t.replace(/\./g, "").replace(",", ".");
  else if ((t.match(/\./g) ?? []).length > 1 || /\.\d{3}$/.test(t)) t = t.replace(/\./g, "");
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

const agrupar = (inteiro: string) => inteiro.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

/**
 * Máscara de número enquanto digita: milhar automático e uma vírgula com no
 * máximo `casas` decimais. Ponto digitado é tratado como separador e some.
 */
export function mascaraNumero(casas: number, maximoInteiro = 13): Mascara {
  return {
    significativo: (c) => (c >= "0" && c <= "9") || (casas > 0 && c === ","),
    formatar: (limpo) => {
      const virgula = limpo.indexOf(",");
      const inteiroBruto = (virgula < 0 ? limpo : limpo.slice(0, virgula)).replace(/,/g, "");
      const inteiro = inteiroBruto.replace(/^0+(?=\d)/, "").slice(0, maximoInteiro);
      if (virgula < 0) return agrupar(inteiro);
      const decimais = limpo.slice(virgula + 1).replace(/,/g, "").slice(0, casas);
      return `${agrupar(inteiro)},${decimais}`;
    },
  };
}

/** Texto limpo da máscara ("1234,5") → número */
export function numeroDeLimpo(limpo: string): number | null {
  if (!/\d/.test(limpo)) return null;
  const n = Number(limpo.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

/** 1234.5 → "1.234,50" com casas fixas */
export function formatarNumero(valor: number, casas: number): string {
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }).format(valor);
}

/** 1234.5 → "1.234,5" (sem zeros à direita), para editar */
export function numeroParaEdicao(valor: number, casas: number): string {
  return new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: casas }).format(valor);
}

// Moeda: digitação da direita para a esquerda, em centavos ("1" → 0,01;
// "1234" → 12,34). Até 12 dígitos (R$ 9.999.999.999,99).
export const MAXIMO_DIGITOS_MOEDA = 12;

/** Todos os dígitos do texto, como centavos */
export function centavosDeTexto(texto: string): number {
  const d = texto.replace(/\D/g, "").replace(/^0+/, "").slice(0, MAXIMO_DIGITOS_MOEDA);
  return d ? Number(d) : 0;
}

/** Valor em reais → "1.234,56" (vazio quando null) */
export function formatarMoedaCampo(valor: number | null | undefined): string {
  return valor === null || valor === undefined ? "" : formatarNumero(valor, 2);
}

export function validarIntervalo(
  valor: number | null,
  { minimo, maximo, rotulo = (n: number) => String(n) }: { minimo?: number; maximo?: number; rotulo?: (n: number) => string },
): string | null {
  if (valor === null) return null;
  if (minimo !== undefined && valor < minimo) return `Use no mínimo ${rotulo(minimo)}.`;
  if (maximo !== undefined && valor > maximo) return `Use no máximo ${rotulo(maximo)}.`;
  return null;
}
