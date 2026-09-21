/**
 * Configurações do site.
 *
 * Dados conferidos no perfil do Google Meu Negócio do restaurante e em
 * fontes públicas (set/2026). O WhatsApp usa o mesmo número do fixo — foi
 * confirmado pelo link `wa.me` publicado pelo próprio restaurante.
 *
 * Na Fase 2 (CMS) este objeto vira a tabela SiteSettings.
 */
export const site = {
  nome: "Rizz Cucina & Vino",
  nomeCurto: "Rizz",
  descricao:
    "Cozinha contemporânea, especialidade em risotos e vinhos em Espírito Santo do Pinhal. Conheça o cardápio e consulte horários e reservas.",
  tagline: "Especialidade em risotos",

  // Domínio informado no perfil oficial do restaurante.
  url: "https://rizzrestaurante.com.br",

  telefone: "(19) 3661-5503",
  telefoneLink: "+551936615503",
  whatsapp: "551936615503",

  endereco: {
    rua: "Rua Coronel Joaquim Vergueiro, 87",
    bairro: "Centro",
    cidade: "Espírito Santo do Pinhal",
    uf: "SP",
    cep: "13990-000",
  },

  /** Coordenadas do estabelecimento — o mapa não depende de busca por nome. */
  coordenadas: { lat: -22.191997, lng: -46.747634 },

  mapaEmbed:
    "https://www.google.com/maps?q=-22.191997,-46.747634&hl=pt-BR&z=17&output=embed",
  mapaLink: "https://maps.google.com/?q=-22.191997,-46.747634",

  /** Listagem no Google — de onde saem as avaliações e onde se avalia. */
  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=Rizz%20Cucina%20%26%20Vino%20Esp%C3%ADrito%20Santo%20do%20Pinhal",
  googleReviewsUrl:
    "https://www.google.com/maps/search/?api=1&query=Rizz%20Cucina%20%26%20Vino%20Esp%C3%ADrito%20Santo%20do%20Pinhal",

  /** Faixa informada no perfil do Google (por pessoa). */
  faixaPreco: "R$ 60 a R$ 160",

  redes: {
    instagram: "https://www.instagram.com/rizzcucinaevino/",
    facebook: "https://www.facebook.com/rizzrestaurante",
  },

  /** Carta de vinhos: PDF ou link externo. Editável no CMS (Fase 2). */
  cartaVinhosUrl: null as string | null,

  /** Selo de origem certificada exibido no rodapé e na seção "a casa". */
  selo: {
    nome: "Selo VPJ",
    descricao:
      "Identificações VPJ e Duroc nos itens indicados no cardápio.",
  },
} as const;

export function whatsappLink(mensagem: string) {
  return `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(mensagem)}`;
}

export const enderecoLinha = `${site.endereco.rua} · ${site.endereco.bairro} · ${site.endereco.cidade}/${site.endereco.uf}`;
