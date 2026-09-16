import type { ImgKey } from "@/lib/images";

export type Badge = "vegetariano" | "rizz" | "tartufato";

export type MenuItem = {
  id: string;
  nome: string;
  descricao?: string;
  /** null = sem preço na peça impressa (é o caso do brownie). */
  preco: number | null;
  badges?: Badge[];
  vpj?: boolean;
  img?: ImgKey;
  /** Subdivisão dentro da categoria (usado em Bebidas). */
  grupo?: string;
  disponivel?: boolean;
};

export type Categoria = {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
  itens: MenuItem[];
};

export const BADGES: Record<
  Badge,
  { sigla: string; rotulo: string; descricao: string }
> = {
  vegetariano: { sigla: "V", rotulo: "Vegetariano", descricao: "Opção Vegetariana" },
  rizz: { sigla: "R", rotulo: "Criação Rizz", descricao: "Criação Rizz" },
  tartufato: { sigla: "T", rotulo: "Tartufato", descricao: "Tartufato" },
};

/**
 * Cardápio transcrito das peças impressas do restaurante.
 *
 * Fidelidade à peça: nos risotos o nome não repete "Risoto de" (a categoria já
 * diz), e as observações entre parênteses ficam na descrição, como no impresso.
 */
export const cardapio: Categoria[] = [
  {
    id: "entradas",
    nome: "Entradas",
    slug: "entradas",
    descricao: "Para começar devagar, de preferência dividindo.",
    itens: [
      { id: "arancini-parmesao", nome: "Arancini de Parmesão com Fonduta Cremosa", descricao: "8 unidades", preco: 55, badges: ["vegetariano"] },
      { id: "arancini-salmao", nome: "Arancini de Salmão Trufado com Fonduta Cremosa", descricao: "Finalizado com trufas · 8 unidades", preco: 95, badges: ["tartufato"] },
      { id: "bolinho-bacalhau", nome: "Bolinho de Bacalhau", descricao: "10 unidades", preco: 71 },
      { id: "burrata-pesto", nome: "Burrata ao Pesto com Presunto Cru e Salada", descricao: "Acompanha pão italiano", preco: 92, badges: ["rizz"] },
      { id: "burrata-cogumelos", nome: "Burrata com Confit de Cogumelos Trufados", descricao: "Finalizada com trufas · acompanha pão italiano", preco: 98, badges: ["tartufato", "vegetariano", "rizz"] },
      { id: "carpaccio", nome: "Carpaccio Bovino com Salada", descricao: "Acompanha pão italiano", preco: 62 },
      { id: "creme-batata-trufado", nome: "Creme de Batata Trufado", descricao: "Crispy de parma, toast de queijo coalho e rúcula · acompanha pão italiano", preco: 80, badges: ["tartufato", "rizz"] },
      { id: "enroladinho", nome: "Enroladinho", descricao: "Presunto cru com rúcula, queijo brie e pêra · 4 unidades", preco: 69, badges: ["rizz"] },
      { id: "frigideira-file", nome: "Frigideira de Filé Mignon ao Formaggio", descricao: "Com fritas", preco: 72 },
      { id: "fritas", nome: "Fritas", preco: 32, badges: ["vegetariano"] },
      { id: "fritas-casa", nome: "Fritas da Casa", descricao: "Presunto cru, raspas de limão siciliano, parmesão e pimenta do reino", preco: 49 },
    ],
  },
  {
    id: "saladas",
    nome: "Saladas",
    slug: "saladas",
    itens: [
      { id: "caprese", nome: "Caprese", descricao: "Folhas verdes, tomate cereja, mussarela de búfala e manjericão", preco: 46, badges: ["vegetariano"] },
      { id: "salada-rizz", nome: "Salada Rizz", descricao: "Folhas verdes, gorgonzola, mel, lâminas de amêndoas e pêra", preco: 50, badges: ["vegetariano"] },
    ],
  },
  {
    id: "risotos",
    nome: "Risotos",
    slug: "risotos",
    descricao: "O coração da casa. Arroz acertado no ponto, na hora.",
    itens: [
      { id: "risoto-carbonara", nome: "À Carbonara", descricao: "Finalizado com trufas", preco: 90, badges: ["tartufato"] },
      { id: "risoto-acafrao-costela", nome: "Açafrão Espanhol com Ragu de Costela Bovina", preco: 81 },
      { id: "risoto-alho-negro-brie", nome: "Alho Negro Trufado com Funghi e Brie", descricao: "Finalizado com trufas", preco: 90, badges: ["tartufato", "vegetariano"], img: "risoto-trufado-brie" },
      { id: "risoto-alho-negro-parma", nome: "Alho Negro Trufado, Gorgonzola e Presunto Parma", descricao: "Finalizado com trufas", preco: 92, badges: ["tartufato"] },
      { id: "risoto-bacalhau", nome: "Bacalhau", preco: 82 },
      { id: "risoto-camarao-aspargos", nome: "Camarão com Aspargos e Toast de Queijo Coalho", preco: 87 },
      { id: "risoto-caprese", nome: "Caprese com Tomates Confit e Burrata", descricao: "Servido frio", preco: 90, badges: ["vegetariano"] },
      { id: "risoto-cogumelos", nome: "Cogumelos com Gorgonzola e Alho Poró", preco: 73, badges: ["vegetariano"] },
      { id: "risoto-costela", nome: "Costela Bovina com Rúcula e Redução de Balsâmico", preco: 81 },
      { id: "risoto-file-funghi", nome: "Filé Mignon com Funghi", preco: 77 },
      { id: "risoto-file-gorgonzola", nome: "Filé Mignon com Gorgonzola", preco: 77 },
      { id: "risoto-limao-bufala", nome: "Limão Siciliano, Mussarela de Búfala e Crispy de Presunto Parma", preco: 81 },
      { id: "risoto-pera", nome: "Pêra com Gorgonzola e Nozes", preco: 71, badges: ["vegetariano"] },
      { id: "risoto-presunto-brie", nome: "Presunto Cru, Rúcula e Brie", preco: 79 },
      { id: "risoto-salmao-brie", nome: "Salmão com Brie e Manjericão", preco: 78 },
      { id: "risoto-salmao-trufado", nome: "Salmão Trufado com Limão Siciliano", descricao: "Finalizado com trufas", preco: 90, badges: ["tartufato"] },
    ],
  },
  {
    id: "carnes",
    nome: "Carne Bovina",
    slug: "carne-bovina",
    descricao:
      "Pratos com acompanhamentos e massas, entre nossas criações e releituras.",
    itens: [
      { id: "ancho-alho-negro", nome: "Ancho Red Angus com Risoto de Alho Negro Trufado e Gorgonzola", descricao: "Finalizado com trufas", preco: 105, badges: ["tartufato", "rizz"], vpj: true },
      { id: "ancho-acafrao", nome: "Ancho Red Angus com Risoto de Açafrão Trufado", descricao: "Finalizado com trufas", preco: 110, badges: ["tartufato", "rizz"], vpj: true, img: "ancho-acafrao-trufado" },
      { id: "ancho-talharim", nome: "Ancho Red Angus com Talharim na Fonduta de Parmesão e Presunto Parma", preco: 98, badges: ["rizz"], vpj: true, img: "ancho-talharim-parma" },
      { id: "file-parmegiana", nome: "Filé Mignon à Parmegiana com Arroz e Fritas", preco: 89 },
      { id: "file-funghi-brie", nome: "Filé Mignon ao Creme de Funghi com Risoto de Brie Trufado", descricao: "Finalizado com trufas", preco: 108, badges: ["tartufato", "rizz"] },
      { id: "file-gorgonzola", nome: "Filé Mignon ao Molho de Gorgonzola com Arroz e Fritas", preco: 89 },
      { id: "file-dijon", nome: "Filé Mignon ao Molho Mostarda Dijon com Risoto de Aspargos", preco: 103 },
      { id: "file-poivre", nome: "Filé Mignon ao Poivre com Risoto de Brie", preco: 98 },
      { id: "file-milanesa", nome: "Filé Mignon à Milanesa ao Pomodoro com Risoto de Brie", preco: 89, badges: ["rizz"], img: "parmegiana-brie" },
      { id: "file-syrah", nome: "Filé Mignon na Redução de Syrah da Mantiqueira com Cogumelos e Risoto de Parmesão", preco: 105, img: "file-parmesao-vinho" },
      { id: "massa-formaggio-file", nome: "Massa ao Formaggio com Crispy de Parma e Filé Mignon", preco: 95, badges: ["rizz"] },
      { id: "massa-alfredo-file", nome: "Massa ao Molho Alfredo com Filé Mignon", preco: 90 },
      { id: "massa-ragu-costela", nome: "Massa com Ragu de Costela Bovina", descricao: "Finalizado com fonduta de parmesão", preco: 85 },
    ],
  },
  {
    id: "cordeiro",
    nome: "Carne de Cordeiro",
    slug: "cordeiro",
    itens: [
      { id: "cordeiro-hortela", nome: "Lombo de Cordeiro com Creme de Batatas e Molho de Hortelã", preco: 110, badges: ["rizz"], img: "cordeiro-hortela" },
      { id: "cordeiro-syrah", nome: "Lombo de Cordeiro com Redução de Syrah e Risoto de Funghi", preco: 115, badges: ["rizz"] },
    ],
  },
  {
    id: "peixes",
    nome: "Peixes e Frutos do Mar",
    slug: "peixes-e-frutos-do-mar",
    itens: [
      { id: "camarao-alfredo-trufado", nome: "Camarão Rosa com Massa ao Molho Alfredo Trufado", descricao: "Finalizado com trufas", preco: 105, badges: ["tartufato"] },
      { id: "camarao-pesto", nome: "Camarão Rosa com Massa ao Pesto e Farofa de Pistache", preco: 96, img: "camarao-pesto-pistache" },
      { id: "camarao-empanado", nome: "Camarão Rosa Empanado com Risoto de Alho-Poró e Creme de Catupiry", preco: 97, img: "camarao-rizz" },
      { id: "salmao-funghi", nome: "Salmão ao Creme de Funghi com Risoto de Brie Trufado", descricao: "Finalizado com trufas", preco: 105, badges: ["tartufato", "rizz"] },
      { id: "salmao-cogumelos", nome: "Salmão ao Molho de Cogumelos com Risoto de Parmesão", preco: 92 },
      { id: "salmao-pesto", nome: "Salmão ao Pesto com Legumes", preco: 83 },
      { id: "salmao-pistache", nome: "Salmão na Farofa de Pistache com Risoto de Limão Siciliano", preco: 91 },
    ],
  },
  {
    id: "sobremesas",
    nome: "Sobremesas",
    slug: "sobremesas",
    itens: [
      { id: "petit-gateau", nome: "Petit Gateau com Sorvete de Creme", preco: 35, badges: ["vegetariano"] },
      { id: "brownie", nome: "Brownie Artesanal com Farofa de Pistache", preco: null, badges: ["vegetariano"] },
      { id: "frutas-vermelhas", nome: "Calda de Frutas Vermelhas e Sorvete de Creme", preco: 40, badges: ["vegetariano"] },
      { id: "palha-italiana", nome: "Palha Italiana Artesanal com Chantilly e Crocante de Cacau", preco: 40, badges: ["vegetariano"] },
      { id: "doce-abobora", nome: "Doce de Abóbora Artesanal com Sorvete de Coco", preco: 35, badges: ["vegetariano"] },
    ],
  },
  {
    id: "bebidas",
    nome: "Bebidas",
    slug: "bebidas",
    descricao: "A carta de vinhos completa está no QR Code das mesas.",
    itens: [
      { id: "agua-gas", nome: "Água com gás", preco: 8, grupo: "Não alcoólicas" },
      { id: "refrigerante", nome: "Refrigerante", descricao: "350 ml", preco: 10, grupo: "Não alcoólicas" },
      { id: "h2o", nome: "H2O Sabores", preco: 13, grupo: "Não alcoólicas" },
      { id: "suco-1", nome: "Suco com uma fruta", preco: 14, grupo: "Não alcoólicas" },
      { id: "suco-2", nome: "Suco com duas frutas", preco: 17, grupo: "Não alcoólicas" },

      { id: "chopp-350", nome: "Brahma", descricao: "350 ml", preco: 14, grupo: "Chopp" },
      { id: "chopp-210", nome: "Brahma", descricao: "210 ml", preco: 11, grupo: "Chopp" },

      { id: "ln-corona", nome: "Corona", preco: 15, grupo: "Longneck" },
      { id: "ln-hoegaarden", nome: "Hoegaarden", preco: 18, grupo: "Longneck" },
      { id: "ln-goose", nome: "Goose", preco: 20, grupo: "Longneck" },
      { id: "ln-stella", nome: "Stella Pure Gold", preco: 16, grupo: "Longneck" },
      { id: "ln-corona-zero", nome: "Corona Zero", preco: 15, grupo: "Longneck" },
      { id: "ln-heineken-zero", nome: "Heineken Zero", preco: 15, grupo: "Longneck" },

      { id: "600-original", nome: "Original", preco: 20, grupo: "Cerveja 600 ml" },
      { id: "600-corona", nome: "Corona", preco: 20, grupo: "Cerveja 600 ml" },
      { id: "600-spaten", nome: "Spaten", preco: 20, grupo: "Cerveja 600 ml" },
      { id: "600-heineken", nome: "Heineken", preco: 22, grupo: "Cerveja 600 ml" },

      { id: "aperol", nome: "Aperol Spritz", preco: 42, grupo: "Drinks" },
      { id: "limoncello", nome: "Limoncello Spritz", preco: 42, grupo: "Drinks" },
      { id: "gin-tonica", nome: "Gin & Tônica", preco: 28, grupo: "Drinks" },
      { id: "campari", nome: "Campari & Citrus", preco: 28, grupo: "Drinks" },
      { id: "negroni", nome: "Negroni", preco: 32, grupo: "Drinks" },
      { id: "caipiroska", nome: "Caipiroska", preco: 32, grupo: "Drinks" },
      { id: "caipirinha", nome: "Caipirinha", preco: 26, grupo: "Drinks" },
    ],
  },
];

/** Prato-assinatura: o mais pedido da casa, com dobra própria na home. */
export const pratoAssinatura = {
  ...cardapio
    .find((c) => c.id === "peixes")!
    .itens.find((i) => i.id === "camarao-empanado")!,
  categoria: "Peixes e Frutos do Mar",
  chamada: "O mais pedido da casa",
  texto:
    "Camarão rosa empanado na hora, crocante por fora e suculento por dentro, sobre risoto de alho-poró e um creme de catupiry que amarra tudo. É o prato que mais sai — e o que mais volta.",
};

/** Seleção da home: só itens com foto própria. */
export const destaquesHome: MenuItem[] = [
  "ancho-acafrao",
  "cordeiro-hortela",
  "risoto-alho-negro-brie",
  "camarao-pesto",
  "ancho-talharim",
  "file-syrah",
  "file-milanesa",
].map((id) => cardapio.flatMap((c) => c.itens).find((i) => i.id === id)!);

export const todosOsItens = cardapio.flatMap((c) => c.itens);

export function itensPorBadge(badge: Badge) {
  return todosOsItens.filter((i) => i.badges?.includes(badge));
}
