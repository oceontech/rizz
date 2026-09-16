import type { ImgKey } from "@/lib/images";

export type ItemExecutivo = {
  id: string;
  nome: string;
  preco: number;
  img?: ImgKey;
  /** Selo de origem certificada impresso ao lado do item na peça. */
  selo?: "vpj" | "duroc";
};

/**
 * Menu executivo — transcrito da peça impressa.
 *
 * ⚠️ Divergência de preço nas fontes: o cardápio impresso traz
 * **R$ 75,90**; um post de dezembro/2025 anunciava R$ 72,90. Adotamos 75,90
 * por ser a peça mais recente e a oficial. Confirmar antes de publicar.
 */
export const executivo = {
  ativo: true,
  precoCompleto: 75.9,
  precoAvulsoMin: 39.9,
  dias: "Segunda a sexta",
  horario: "11h às 14h30",
  chamada: "Escolha qualquer entrada + prato + sobremesa",
  totalOpcoes: 20,

  entradas: [
    { id: "ex-polenta", nome: "Polenta com Cogumelos", preco: 16 },
    { id: "ex-carpaccio", nome: "Carpaccio com Salada", preco: 19, selo: "vpj" },
    { id: "ex-salada", nome: "Salada", preco: 11 },
    { id: "ex-arancini", nome: "Arancini de Parmesão", preco: 19 },
    { id: "ex-mini-fritas", nome: "Mini Fritas", preco: 11 },
  ] as ItemExecutivo[],

  pratos: [
    { id: "ex-steak-milanesa", nome: "Steak Red Angus à Milanesa com Risoto de Brie", preco: 49, selo: "vpj" },
    { id: "ex-steak-parmegiana", nome: "Steak Red Angus à Parmegiana com Arroz e Fritas", preco: 49, selo: "vpj" },
    { id: "ex-frango-parmegiana", nome: "Filé de Frango à Parmegiana com Arroz e Fritas", preco: 46, selo: "vpj", img: "parmegiana-fritas" },
    { id: "ex-strogonoff", nome: "Strogonoff de Filé Mignon com Arroz e Fritas", preco: 48 },
    { id: "ex-talharim-alfredo", nome: "Talharim ao Molho Alfredo com Filé de Frango Empanado", preco: 46, img: "frango-talharim-alfredo" },
    { id: "ex-copa-milanesa", nome: "Copa Lombo Suíno à Milanesa com Risoto de Limão Siciliano", preco: 45, selo: "duroc", img: "copa-lombo-limao" },
    { id: "ex-copa-mostarda", nome: "Copa Lombo Suíno ao Molho Mostarda com Risoto de Alho-poró", preco: 46 },
    { id: "ex-carbonara", nome: "Espaguete à Carbonara", preco: 44 },
    { id: "ex-4-queijos", nome: "Talharim aos 4 Queijos", preco: 39 },
    { id: "ex-risoto-camarao", nome: "Risoto de Camarão", preco: 48 },
    { id: "ex-risoto-pera", nome: "Risoto de Pêra com Gorgonzola", preco: 44 },
    { id: "ex-tilapia-milanesa", nome: "Tilápia à Milanesa com Risoto de Funghi", preco: 48 },
    { id: "ex-tilapia-legumes", nome: "Tilápia com Arroz e Legumes", preco: 43, img: "peixe-arroz-negro" },
  ] as ItemExecutivo[],

  sobremesas: [
    { id: "ex-abacaxi", nome: "Fatia de Abacaxi com Sorvete e Raspas de Limão", preco: 14 },
    { id: "ex-pudim", nome: "Pudim da Casa", preco: 14 },
    { id: "ex-cookie", nome: "Cookie Artesanal com Sorvete de Creme", preco: 16 },
    { id: "ex-brigadeiro", nome: "Brigadeiro Artesanal de Colher", preco: 14 },
  ] as ItemExecutivo[],
};
