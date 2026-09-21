import "server-only";

import { unstable_cache } from "next/cache";

import { executivo as executivoEstatico } from "@/data/executivo";
import { cardapio as cardapioEstatico, type Badge, type Categoria } from "@/data/menu";
import { bancoConfigurado, sql } from "@/lib/db";
import type { ImgKey } from "@/lib/images";

/** Tags de cache: o painel invalida estas quando salva. */
export const TAGS = {
  cardapio: "cardapio",
  executivo: "executivo",
  promocoes: "promocoes",
  config: "config",
} as const;

// ─── Tipos ────────────────────────────────────────────────────

export type ItemCardapio = {
  id: string;
  categoriaId: string;
  nome: string;
  descricao: string | null;
  preco: number | null;
  badges: Badge[];
  vpj: boolean;
  img: ImgKey | null;
  fotoUrl: string | null;
  grupo: string | null;
  disponivel: boolean;
  visivel: boolean;
  ordem: number;
};

export type CategoriaCardapio = {
  id: string;
  nome: string;
  slug: string;
  descricao: string | null;
  ordem: number;
  visivel: boolean;
  itens: ItemCardapio[];
};

export type SecaoExecutivo = "entradas" | "pratos" | "sobremesas";

export type ItemExecutivoDB = {
  id: string;
  secao: SecaoExecutivo;
  nome: string;
  preco: number;
  selo: "vpj" | "duroc" | null;
  img: ImgKey | null;
  disponivel: boolean;
  ordem: number;
};

export type ExecutivoConfig = {
  ativo: boolean;
  precoCompleto: number;
  condicoesConfirmadas: boolean;
  dias: string;
  horario: string;
  chamada: string;
};

export type ExecutivoDados = ExecutivoConfig & {
  entradas: ItemExecutivoDB[];
  pratos: ItemExecutivoDB[];
  sobremesas: ItemExecutivoDB[];
  precoAvulsoMin: number;
};

export type Promocao = {
  id: number;
  titulo: string;
  subtitulo: string | null;
  texto: string | null;
  imagemUrl: string | null;
  cupom: string | null;
  ctaTexto: string | null;
  ctaUrl: string | null;
  inicio: string | null;
  fim: string | null;
  ativo: boolean;
  paginas: "todas" | "home" | "cardapio" | "reservas";
  frequencia: "sempre" | "sessao" | "dia";
  atrasoSeg: number;
  estilo: "vinho" | "creme" | "noite";
  visualizacoes: number;
  cliques: number;
  criadoEm: string;
};

export type AvisoConfig = {
  ativo: boolean;
  texto: string;
  link: string;
  linkTexto: string;
};

export type FidelidadeConfig = {
  ativo: boolean;
  meta: number;
  recompensa: string;
  regras: string;
};

export const AVISO_PADRAO: AvisoConfig = { ativo: false, texto: "", link: "", linkTexto: "" };
export const FIDELIDADE_PADRAO: FidelidadeConfig = {
  ativo: true,
  meta: 10,
  recompensa: "Uma sobremesa da casa",
  regras: "Um selo por visita.",
};

// ─── Mapeadores (linhas do Postgres → objetos da aplicação) ──────

type Linha = Record<string, unknown>;

const num = (v: unknown) => (v === null || v === undefined ? null : Number(v));
const txt = (v: unknown) => (v === null || v === undefined ? null : String(v));
/**
 * Colunas `date` chegam como Date à meia-noite LOCAL (é assim que o driver
 * interpreta "AAAA-MM-DD"). Ler os campos locais evita o dia "voltar um"
 * que o toISOString() causaria em fusos positivos.
 */
const data = (v: unknown) => {
  if (v === null || v === undefined) return null;
  if (v instanceof Date) {
    const p = (n: number) => String(n).padStart(2, "0");
    return `${v.getFullYear()}-${p(v.getMonth() + 1)}-${p(v.getDate())}`;
  }
  return String(v).slice(0, 10);
};

export function mapItem(l: Linha): ItemCardapio {
  return {
    id: String(l.id),
    categoriaId: String(l.categoria_id),
    nome: String(l.nome),
    descricao: txt(l.descricao),
    preco: num(l.preco),
    badges: (l.badges as Badge[]) ?? [],
    vpj: Boolean(l.vpj),
    img: txt(l.img) as ImgKey | null,
    fotoUrl: txt(l.foto_url),
    grupo: txt(l.grupo),
    disponivel: Boolean(l.disponivel),
    visivel: Boolean(l.visivel),
    ordem: Number(l.ordem),
  };
}

export function mapItemExecutivo(l: Linha): ItemExecutivoDB {
  return {
    id: String(l.id),
    secao: l.secao as SecaoExecutivo,
    nome: String(l.nome),
    preco: Number(l.preco),
    selo: (l.selo as "vpj" | "duroc" | null) ?? null,
    img: txt(l.img) as ImgKey | null,
    disponivel: Boolean(l.disponivel),
    ordem: Number(l.ordem),
  };
}

export function mapPromocao(l: Linha): Promocao {
  return {
    id: Number(l.id),
    titulo: String(l.titulo),
    subtitulo: txt(l.subtitulo),
    texto: txt(l.texto),
    imagemUrl: txt(l.imagem_url),
    cupom: txt(l.cupom),
    ctaTexto: txt(l.cta_texto),
    ctaUrl: txt(l.cta_url),
    inicio: data(l.inicio),
    fim: data(l.fim),
    ativo: Boolean(l.ativo),
    paginas: l.paginas as Promocao["paginas"],
    frequencia: l.frequencia as Promocao["frequencia"],
    atrasoSeg: Number(l.atraso_seg),
    estilo: l.estilo as Promocao["estilo"],
    visualizacoes: Number(l.visualizacoes),
    cliques: Number(l.cliques),
    criadoEm: new Date(l.criado_em as string).toISOString(),
  };
}

export { data as paraDataISO };

// ─── Leituras brutas (sem cache) — usadas pelo painel ──────────

export async function lerCardapio(): Promise<CategoriaCardapio[]> {
  const [cats, itens] = await Promise.all([
    sql`select * from categorias order by ordem, nome`,
    sql`select * from itens order by ordem, nome`,
  ]);
  const porCategoria = new Map<string, ItemCardapio[]>();
  for (const l of itens) {
    const item = mapItem(l);
    const lista = porCategoria.get(item.categoriaId) ?? [];
    lista.push(item);
    porCategoria.set(item.categoriaId, lista);
  }
  return cats.map((c) => ({
    id: String(c.id),
    nome: String(c.nome),
    slug: String(c.slug),
    descricao: txt(c.descricao),
    ordem: Number(c.ordem),
    visivel: Boolean(c.visivel),
    itens: porCategoria.get(String(c.id)) ?? [],
  }));
}

export async function lerExecutivo(): Promise<ExecutivoDados> {
  const [config, itens] = await Promise.all([
    sql`select * from executivo_config where id = 1`,
    sql`select * from executivo_itens order by ordem, nome`,
  ]);
  const c = config[0];
  const todos = itens.map(mapItemExecutivo);
  const pratos = todos.filter((i) => i.secao === "pratos");
  const precos = pratos.filter((p) => p.disponivel).map((p) => p.preco);
  return {
    ativo: c ? Boolean(c.ativo) : executivoEstatico.ativo,
    precoCompleto: c ? Number(c.preco_completo) : executivoEstatico.precoCompleto,
    condicoesConfirmadas: c ? Boolean(c.condicoes_confirmadas) : false,
    dias: c ? String(c.dias) : executivoEstatico.dias,
    horario: c ? String(c.horario) : executivoEstatico.horario,
    chamada: c ? String(c.chamada) : executivoEstatico.chamada,
    entradas: todos.filter((i) => i.secao === "entradas"),
    pratos,
    sobremesas: todos.filter((i) => i.secao === "sobremesas"),
    precoAvulsoMin: precos.length ? Math.min(...precos) : 0,
  };
}

export async function lerConfig<T>(chave: string, padrao: T): Promise<T> {
  const linhas = await sql`select valor from configuracoes where chave = ${chave}`;
  return linhas[0] ? { ...padrao, ...(linhas[0].valor as T) } : padrao;
}

// ─── Leituras do site (com cache + fallback estático) ──────────

function executivoDoArquivo(): ExecutivoDados {
  const conv = (secao: SecaoExecutivo, lista: typeof executivoEstatico.entradas) =>
    lista.map((i, ordem) => ({
      id: i.id,
      secao,
      nome: i.nome,
      preco: i.preco,
      selo: i.selo ?? null,
      img: i.img ?? null,
      disponivel: true,
      ordem,
    }));
  return {
    ativo: executivoEstatico.ativo,
    precoCompleto: executivoEstatico.precoCompleto,
    condicoesConfirmadas: executivoEstatico.condicoesConfirmadas,
    dias: executivoEstatico.dias,
    horario: executivoEstatico.horario,
    chamada: executivoEstatico.chamada,
    entradas: conv("entradas", executivoEstatico.entradas),
    pratos: conv("pratos", executivoEstatico.pratos),
    sobremesas: conv("sobremesas", executivoEstatico.sobremesas),
    precoAvulsoMin: executivoEstatico.precoAvulsoMin,
  };
}

/** Cardápio no formato que o site já consumia (`data/menu.ts`). */
export const cardapioDoSite = unstable_cache(
  async (): Promise<Categoria[]> => {
    if (!bancoConfigurado) return cardapioEstatico;
    try {
      const cats = await lerCardapio();
      return cats
        .filter((c) => c.visivel)
        .map((c) => ({
          id: c.id,
          nome: c.nome,
          slug: c.slug,
          descricao: c.descricao ?? undefined,
          itens: c.itens
            .filter((i) => i.visivel)
            .map((i) => ({
              id: i.id,
              nome: i.nome,
              descricao: i.descricao ?? undefined,
              preco: i.preco,
              badges: i.badges.length ? i.badges : undefined,
              vpj: i.vpj || undefined,
              img: i.img ?? undefined,
              grupo: i.grupo ?? undefined,
              disponivel: i.disponivel,
              foto: i.fotoUrl ?? undefined,
            })),
        }))
        .filter((c) => c.itens.length > 0);
    } catch (erro) {
      console.error("[cardapio] usando dados estáticos:", erro);
      return cardapioEstatico;
    }
  },
  ["cardapio-site"],
  { tags: [TAGS.cardapio], revalidate: 3600 },
);

export const executivoDoSite = unstable_cache(
  async (): Promise<ExecutivoDados> => {
    if (!bancoConfigurado) return executivoDoArquivo();
    try {
      const dados = await lerExecutivo();
      const soDisponiveis = (l: ItemExecutivoDB[]) => l.filter((i) => i.disponivel);
      return {
        ...dados,
        entradas: soDisponiveis(dados.entradas),
        pratos: soDisponiveis(dados.pratos),
        sobremesas: soDisponiveis(dados.sobremesas),
      };
    } catch (erro) {
      console.error("[executivo] usando dados estáticos:", erro);
      return executivoDoArquivo();
    }
  },
  ["executivo-site"],
  { tags: [TAGS.executivo], revalidate: 3600 },
);

/**
 * Promoções vigentes. O filtro de datas roda aqui (e não no SQL) porque o
 * resultado fica em cache: a janela é conferida de novo no cliente.
 */
export const promocoesDoSite = unstable_cache(
  async (): Promise<Promocao[]> => {
    if (!bancoConfigurado) return [];
    try {
      const linhas = await sql`
        select * from promocoes
        where ativo = true and (fim is null or fim >= (now() at time zone 'America/Sao_Paulo')::date - 1)
        order by criado_em desc`;
      return linhas.map(mapPromocao);
    } catch (erro) {
      console.error("[promocoes]", erro);
      return [];
    }
  },
  ["promocoes-site"],
  { tags: [TAGS.promocoes], revalidate: 600 },
);

export const avisoDoSite = unstable_cache(
  async (): Promise<AvisoConfig> => {
    if (!bancoConfigurado) return AVISO_PADRAO;
    try {
      return await lerConfig("aviso", AVISO_PADRAO);
    } catch {
      return AVISO_PADRAO;
    }
  },
  ["aviso-site"],
  { tags: [TAGS.config], revalidate: 3600 },
);

export const fidelidadeDoSite = unstable_cache(
  async (): Promise<FidelidadeConfig> => {
    if (!bancoConfigurado) return FIDELIDADE_PADRAO;
    try {
      return await lerConfig("fidelidade", FIDELIDADE_PADRAO);
    } catch {
      return FIDELIDADE_PADRAO;
    }
  },
  ["fidelidade-site"],
  { tags: [TAGS.config], revalidate: 3600 },
);
