import { Instrument_Serif, Pinyon_Script } from "next/font/google";

/**
 * Fontes só da versão B, no estilo do cartaz de referência ("Celebrate /
 * CORPORATE"): uma cursiva que encosta por cima de uma serifada alta e
 * estreita em caixa alta. Entram no layout do site como variáveis CSS; o
 * navegador só baixa a fonte nas páginas que a usam.
 */
export const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument",
  display: "swap",
});

export const pinyon = Pinyon_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pinyon",
  display: "swap",
});
