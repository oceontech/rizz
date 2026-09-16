const brl = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 55 → "55,00" · null → "sob consulta" (preço ainda não confirmado). */
export function preco(valor: number | null): string {
  if (valor === null) return "sob consulta";
  return brl.format(valor);
}

/** Usado onde o "R$" aparece separado, em tamanho menor. */
export function precoNumero(valor: number | null): string | null {
  if (valor === null) return null;
  return brl.format(valor);
}
