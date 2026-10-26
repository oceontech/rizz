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
 * Menu executivo — transcrito da peça impressa "Menu Executivo" (pasta
 * `cardápios/`), que traz o valor do menu completo, os dias, o horário e o
 * preço avulso de cada item.
 */
export const executivo = {
  ativo: true,
  precoCompleto: 78.9,
  condicoesConfirmadas: true,
  get precoAvulsoMin(): number {
    return Math.min(...this.pratos.map((prato) => prato.preco));
  },
  dias: "Segunda a sexta",
  horario: "11h às 14h30",
  chamada: "Escolha qualquer entrada, prato principal e sobremesa do menu executivo",

  entradas: [
    { id: "ex-polenta", nome: "Polenta Cremosa com Ragu de Cogumelos", preco: 17.9, img: "polenta-ragu-cogumelos" },
    { id: "ex-carpaccio", nome: "Carpaccio com Salada", preco: 19.9, selo: "vpj", img: "carpaccio-salada" },
    { id: "ex-arancini", nome: "Arancini de Parmesão", preco: 19.9, img: "arancini-parmesao" },
    { id: "ex-mini-fritas", nome: "Mini Fritas", preco: 13.9, img: "fritas" },
  ] as ItemExecutivo[],

  pratos: [
    { id: "ex-steak-milanesa", nome: "Steak Red Angus à Milanesa com Risoto de Brie", preco: 49.9, selo: "vpj", img: "steak-milanesa-risoto-brie" },
    { id: "ex-steak-parmegiana", nome: "Steak Red Angus à Parmegiana com Arroz e Fritas", preco: 49.9, selo: "vpj", img: "steak-parmegiana" },
    { id: "ex-steak-talharim", nome: "Steak Red Angus Grelhado com Talharim aos 4 Queijos", preco: 49.9, selo: "vpj" },
    { id: "ex-frango-parmegiana", nome: "Filé de Frango à Parmegiana com Arroz e Fritas", preco: 47.9, img: "parmegiana-fritas" },
    { id: "ex-strogonoff", nome: "Strogonoff de Filé Mignon com Arroz e Fritas", preco: 49.9, selo: "vpj", img: "strogonoff" },
    { id: "ex-talharim-alfredo", nome: "Talharim ao Molho Alfredo com Filé de Frango à Milanesa", preco: 47.9, img: "frango-talharim-alfredo" },
    { id: "ex-copa-milanesa", nome: "Copa Lombo Suíno à Milanesa com Molho de Vinho e Risoto de Cebola Caramelizada", preco: 47.9, selo: "duroc", img: "copa-lombo-limao" },
    { id: "ex-copa-mostarda", nome: "Copa Lombo Suíno ao Molho Mostarda Dijon com Risoto de Alho-Poró", preco: 48.9, selo: "duroc", img: "copa-lombo-dijon-risoto-alho-poro" },
    { id: "ex-carbonara", nome: "Espaguete à Carbonara", preco: 46.9, img: "espaguete-carbonara" },
    { id: "ex-risoto-camarao", nome: "Risoto de Camarão", preco: 49.9, img: "risoto-camarao" },
    { id: "ex-risoto-pera", nome: "Risoto de Pera com Gorgonzola", preco: 46.9 },
    { id: "ex-tilapia-milanesa", nome: "Tilápia à Milanesa com Risoto de Funghi", preco: 49.9, img: "tilapia-milanesa-risoto-funghi" },
    { id: "ex-tilapia-legumes", nome: "Tilápia Grelhada com Arroz e Legumes", preco: 46.9 },
  ] as ItemExecutivo[],

  sobremesas: [
    { id: "ex-abacaxi", nome: "Fatia de Abacaxi com Raspas de Limão Siciliano e Sorvete de Creme", preco: 15.9 },
    { id: "ex-cookie", nome: "Cookie Artesanal com Sorvete de Creme", preco: 19.9 },
    { id: "ex-brigadeiro", nome: "Brigadeiro Artesanal de Colher", preco: 16.9, img: "brigadeiro-colher" },
    { id: "ex-pudim", nome: "Pudim da Casa", preco: 15.9, img: "pudim" },
  ] as ItemExecutivo[],
};
