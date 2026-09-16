import { site } from "@/lib/site";

export type AvaliacaoGoogle = {
  id: string;
  autor: string;
  nota: number;
  texto: string;
  /** ISO — vem de `publishTime`. */
  data: string;
  /** "há 2 meses", já traduzido pelo Google. */
  quando?: string;
  fotoAutor?: string;
  url?: string;
};

export type ResultadoAvaliacoes = {
  avaliacoes: AvaliacaoGoogle[];
  media: number | null;
  total: number | null;
  origem: "google" | "sem-chave" | "erro";
  aviso?: string;
};

/**
 * Avaliações reais do perfil do Google.
 *
 * ⚠️ LIMITE DA API, não do código: a Places API (New) devolve **no máximo 5
 * avaliações** por local, escolhidas por relevância, e não aceita filtro por
 * nota nem paginação. Está na referência oficial: "A maximum of 5 reviews can
 * be returned". Não existe caminho público para as "últimas 20 de 5 estrelas".
 *
 * Para passar de 5 só há dois caminhos legítimos:
 *   1. Google Business Profile API — lista todas as avaliações com paginação,
 *      mas exige OAuth do DONO do perfil e liberação de acesso pelo Google;
 *   2. serviços terceiros que raspam o Google — violam os termos e quebram
 *      sem aviso. Não recomendo.
 *
 * O `rating` e o `userRatingCount` retornados são do perfil inteiro, então a
 * nota média e o total exibidos são sempre reais e completos — o limite de 5
 * vale só para os textos.
 */
const CAMPOS = "rating,userRatingCount,reviews,googleMapsUri";

export async function buscarAvaliacoesGoogle(): Promise<ResultadoAvaliacoes> {
  const chave = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!chave || !placeId) {
    return {
      avaliacoes: [],
      media: null,
      total: null,
      origem: "sem-chave",
      aviso:
        "Defina GOOGLE_PLACES_API_KEY e GOOGLE_PLACE_ID para puxar as avaliações do Google.",
    };
  }

  try {
    const resposta = await fetch(
      `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
      {
        headers: {
          "X-Goog-Api-Key": chave,
          "X-Goog-FieldMask": CAMPOS,
          "Accept-Language": "pt-BR",
        },
        // Uma hora de cache: avaliação não muda a cada visita, e assim o
        // site continua estático entre revalidações.
        next: { revalidate: 3600 },
      },
    );

    if (!resposta.ok) {
      return {
        avaliacoes: [],
        media: null,
        total: null,
        origem: "erro",
        aviso: `Google respondeu ${resposta.status}.`,
      };
    }

    const dados = (await resposta.json()) as {
      rating?: number;
      userRatingCount?: number;
      googleMapsUri?: string;
      reviews?: {
        name?: string;
        rating?: number;
        text?: { text?: string };
        originalText?: { text?: string };
        publishTime?: string;
        relativePublishTimeDescription?: string;
        googleMapsUri?: string;
        authorAttribution?: { displayName?: string; photoUri?: string };
      }[];
    };

    const avaliacoes: AvaliacaoGoogle[] = (dados.reviews ?? [])
      .filter((r) => (r.rating ?? 0) >= 5)
      .map((r, i) => ({
        id: r.name ?? `google-${i}`,
        autor: r.authorAttribution?.displayName ?? "Cliente do Google",
        nota: r.rating ?? 5,
        texto: (r.text?.text ?? r.originalText?.text ?? "").trim(),
        data: r.publishTime ?? new Date().toISOString(),
        quando: r.relativePublishTimeDescription,
        fotoAutor: r.authorAttribution?.photoUri,
        url: r.googleMapsUri ?? dados.googleMapsUri,
      }))
      .filter((r) => r.texto.length > 0);

    return {
      avaliacoes,
      media: dados.rating ?? null,
      total: dados.userRatingCount ?? null,
      origem: "google",
      aviso:
        avaliacoes.length < 20
          ? "A Places API devolve no máximo 5 avaliações por local."
          : undefined,
    };
  } catch (erro) {
    return {
      avaliacoes: [],
      media: null,
      total: null,
      origem: "erro",
      aviso: erro instanceof Error ? erro.message : "Falha ao consultar o Google.",
    };
  }
}

/** Link para ler/escrever avaliações na listagem do restaurante. */
export const linkAvaliacoesGoogle = site.googleReviewsUrl;
