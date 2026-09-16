export type Review = {
  id: string;
  autor: string;
  nota: number;
  texto: string;
  data: string;
  fonte: "google" | "manual";
};

/**
 * Números REAIS do perfil do Google Meu Negócio, conferidos em set/2026.
 *
 * Quando `GOOGLE_PLACES_API_KEY` e `GOOGLE_PLACE_ID` estiverem definidos,
 * `lib/google-reviews.ts` sobrescreve estes valores com o que a API devolver
 * em tempo real. Isto aqui é o retrato usado enquanto a chave não existe —
 * e é verdadeiro, não inventado.
 */
export const resumoAvaliacoes = {
  media: 4.6,
  total: 763,
  conferidoEm: "2026-09-16",
};

/**
 * Depoimentos exibidos quando a API do Google não está configurada.
 *
 * Está vazio DE PROPÓSITO. A versão anterior trazia textos fictícios criados
 * só para montar o layout — publicar avaliação inventada de um restaurante
 * real é propaganda enganosa. Enquanto não houver chave da API, o site mostra
 * a nota real (que é verdadeira) e manda o visitante ler no Google.
 *
 * Para preencher à mão, use `fonte: "manual"` e só com texto que o cliente
 * realmente escreveu.
 */
export const reviews: Review[] = [];
