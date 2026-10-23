// Núcleo dos smart inputs: aplica uma máscara ao texto digitado sem perder a
// posição do cursor. A ideia: conta quantos caracteres significativos (ex.:
// dígitos) estavam antes do cursor, formata e devolve o cursor para depois do
// mesmo número de caracteres significativos no texto formatado.

export type Mascara = {
  /** Caractere que conta para o valor (o resto é separador ou é recusado) */
  significativo: (caractere: string) => boolean;
  /** Recebe só os caracteres significativos e devolve o texto exibido */
  formatar: (limpo: string) => string;
  /** Ajusta o texto antes de filtrar (ex.: minúsculas, tirar acentos) */
  preparar?: (texto: string) => string;
  /** Máximo de caracteres significativos */
  maximo?: number;
};

export type Resultado = { limpo: string; exibicao: string; cursor: number };

export function limparTexto(mascara: Mascara, texto: string): string {
  const preparado = mascara.preparar ? mascara.preparar(texto) : texto;
  const limpo = Array.from(preparado).filter(mascara.significativo).join("");
  return mascara.maximo === undefined ? limpo : limpo.slice(0, mascara.maximo);
}

/** Posição logo depois do n-ésimo caractere significativo da exibição. */
export function posicaoApos(mascara: Mascara, exibicao: string, n: number): number {
  let i = 0;
  let contados = 0;
  while (i < exibicao.length && contados < n) {
    if (mascara.significativo(exibicao[i])) contados++;
    i++;
  }
  return i;
}

/** Aplica a máscara ao texto do campo, com o cursor na posição informada. */
export function aplicarMascara(mascara: Mascara, texto: string, cursor = texto.length): Resultado {
  const limpo = limparTexto(mascara, texto);
  const antes = Math.min(limparTexto(mascara, texto.slice(0, cursor)).length, limpo.length);
  const exibicao = mascara.formatar(limpo);
  return { limpo, exibicao, cursor: posicaoApos(mascara, exibicao, antes) };
}

/**
 * Apagar sobre um separador ("." "/" "-" "(") apaga o caractere significativo
 * vizinho, para o usuário não ficar preso. Devolve null quando o navegador
 * pode apagar sozinho (cursor ao lado de caractere significativo ou seleção).
 */
export function apagarSobreSeparador(
  mascara: Mascara,
  exibicao: string,
  inicio: number,
  fim: number,
  direcao: "tras" | "frente",
): Resultado | null {
  if (inicio !== fim) return null;
  if (direcao === "tras") {
    if (inicio === 0 || mascara.significativo(exibicao[inicio - 1])) return null;
    let j = inicio - 1;
    while (j >= 0 && !mascara.significativo(exibicao[j])) j--;
    if (j < 0) return null;
    return aplicarMascara(mascara, exibicao.slice(0, j) + exibicao.slice(inicio), j);
  }
  if (inicio >= exibicao.length || mascara.significativo(exibicao[inicio])) return null;
  let j = inicio;
  while (j < exibicao.length && !mascara.significativo(exibicao[j])) j++;
  if (j >= exibicao.length) return null;
  return aplicarMascara(mascara, exibicao.slice(0, inicio) + exibicao.slice(j + 1), inicio);
}

export const digito = (c: string) => c >= "0" && c <= "9";

/** Máscara de dígitos com formatação fixa (CPF, CEP, data…). */
export function mascaraDeDigitos(maximo: number, formatar: (digitos: string) => string): Mascara {
  return { significativo: digito, maximo, formatar };
}
