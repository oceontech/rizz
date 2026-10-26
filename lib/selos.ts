/**
 * Selos do cardápio (Vegetariano, Criação Rizz, Tartufato, VPJ…): definição
 * comum ao site e ao painel. Ficam na tabela `selos`; os pratos guardam só o
 * id (`itens.badges`, `executivo_itens.selo`). Sem banco, valem os padrões.
 */

export const FORMAS = {
  circulo: "Círculo",
  carimbo: "Carimbo",
  escudo: "Escudo",
  hexagono: "Hexágono",
  losango: "Losango",
  roseta: "Roseta",
  gota: "Gota",
  folha: "Folha",
} as const;

export type FormaSelo = keyof typeof FORMAS;

export const SIMBOLOS = {
  letra: "Letras",
  folha: "Folha",
  broto: "Broto",
  trufa: "Trufa",
  estrela: "Estrela",
  coroa: "Coroa",
  chama: "Chama",
  pimenta: "Pimenta",
  trigo: "Trigo",
  semGluten: "Sem glúten",
  leite: "Leite",
  peixe: "Peixe",
  boi: "Carne",
  coracao: "Coração",
  taca: "Taça",
  brilho: "Novidade",
} as const;

export type SimboloSelo = keyof typeof SIMBOLOS;

/** Paleta sugerida no editor: tons que conversam com o vinho, o creme e o ouro do site. */
export const CORES_SELO = [
  { cor: "#3f6b3a", nome: "Verde-oliva" },
  { cor: "#2f7d5b", nome: "Verde" },
  { cor: "#b8892f", nome: "Ouro" },
  { cor: "#c46a1f", nome: "Âmbar" },
  { cor: "#b3401f", nome: "Terracota" },
  { cor: "#70012a", nome: "Vinho" },
  { cor: "#9d2f5e", nome: "Ameixa" },
  { cor: "#5b3a8c", nome: "Violeta" },
  { cor: "#2d5d8a", nome: "Azul" },
  { cor: "#1f6f78", nome: "Petróleo" },
  { cor: "#6b4a34", nome: "Café" },
  { cor: "#2b2320", nome: "Trufa" },
] as const;

export type SeloDef = {
  id: string;
  nome: string;
  /** Texto da legenda do cardápio (ex.: "Opção vegetariana"). */
  descricao: string | null;
  forma: FormaSelo;
  simbolo: SimboloSelo;
  /** Até 3 caracteres, quando o símbolo é "letra". */
  letra: string | null;
  cor: string;
  ordem: number;
  ativo: boolean;
};

export const SELOS_PADRAO: SeloDef[] = [
  {
    id: "vegetariano",
    nome: "Vegetariano",
    descricao: "Opção vegetariana",
    forma: "circulo",
    simbolo: "folha",
    letra: null,
    cor: "#3f6b3a",
    ordem: 0,
    ativo: true,
  },
  {
    id: "rizz",
    nome: "Criação Rizz",
    descricao: "Receita autoral da casa",
    forma: "carimbo",
    simbolo: "letra",
    letra: "R",
    cor: "#b8892f",
    ordem: 1,
    ativo: true,
  },
  {
    id: "tartufato",
    nome: "Tartufato",
    descricao: "Finalizado com trufas",
    forma: "circulo",
    simbolo: "trufa",
    letra: null,
    cor: "#2b2320",
    ordem: 2,
    ativo: true,
  },
  {
    id: "vpj",
    nome: "VPJ",
    descricao: "Carne com origem certificada VPJ",
    forma: "escudo",
    simbolo: "letra",
    letra: "VPJ",
    cor: "#70012a",
    ordem: 3,
    ativo: true,
  },
  {
    id: "duroc",
    nome: "Duroc Pork",
    descricao: "Suíno Duroc de origem certificada",
    forma: "hexagono",
    simbolo: "letra",
    letra: "D",
    cor: "#6b4a34",
    ordem: 4,
    ativo: true,
  },
];

/** Mapa id → selo, ignorando os desativados (somem do site sem sair dos pratos). */
export function mapaDeSelos(selos: SeloDef[]) {
  return new Map(selos.filter((s) => s.ativo).map((s) => [s.id, s]));
}

/** Texto claro ou escuro sobre a cor do selo, pelo contraste (luminância relativa). */
export function corDoTexto(hex: string) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return "#ffffff";
  const n = parseInt(m[1]!, 16);
  const canal = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const l = 0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255);
  return l > 0.4 ? "#1f1a17" : "#fffaf3";
}
