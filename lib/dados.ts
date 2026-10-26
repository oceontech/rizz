import "server-only";

import { unstable_cache } from "next/cache";

import { executivo as executivoEstatico } from "@/data/executivo";
import {
  cardapio as cardapioEstatico,
  comSeloVpj,
  HOME_PADRAO,
  type Badge,
  type Categoria,
  type MenuItem,
} from "@/data/menu";
import { bancoConfigurado, sql } from "@/lib/db";
import type { ImgKey } from "@/lib/images";
import { SELOS_PADRAO, type FormaSelo, type SeloDef, type SimboloSelo } from "@/lib/selos";

/** Tags de cache: o painel invalida estas quando salva. */
export const TAGS = {
  cardapio: "cardapio",
  executivo: "executivo",
  promocoes: "promocoes",
  config: "config",
  selos: "selos",
  home: "home",
} as const;

// ─── Tipos ────────────────────────────────────────────────────

export type ItemCardapio = {
  id: string;
  categoriaId: string;
  nome: string;
  descricao: string | null;
  preco: number | null;
  /** Ids dos selos (inclui "vpj" quando a coluna legada vpj está ligada). */
  badges: Badge[];
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
  /** Id de um selo cadastrado. */
  selo: string | null;
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

/** Página inicial do site: o mais pedido e a seleção do cardápio (painel → Página inicial). */
export type HomeConfig = {
  maisPedido: { itemId: string; chamada: string; titulo: string; texto: string };
  destaques: string[];
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
  const badges = (l.badges as Badge[]) ?? [];
  return {
    id: String(l.id),
    categoriaId: String(l.categoria_id),
    nome: String(l.nome),
    descricao: txt(l.descricao),
    preco: num(l.preco),
    badges: l.vpj && !badges.includes("vpj") ? [...badges, "vpj"] : badges,
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
    selo: txt(l.selo),
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

export function mapSelo(l: Linha): SeloDef {
  return {
    id: String(l.id),
    nome: String(l.nome),
    descricao: txt(l.descricao),
    forma: l.forma as FormaSelo,
    simbolo: l.simbolo as SimboloSelo,
    letra: txt(l.letra),
    cor: String(l.cor),
    ordem: Number(l.ordem),
    ativo: Boolean(l.ativo),
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

export async function lerSelos(): Promise<SeloDef[]> {
  try {
    const linhas = await sql`select * from selos order by ordem, nome`;
    return linhas.map(mapSelo);
  } catch (erro) {
    // Tabela ainda não criada (db:setup pendente): vale o conjunto padrão.
    if ((erro as { code?: string }).code === "42P01") return SELOS_PADRAO;
    throw erro;
  }
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

const cardapioDoArquivo = (): Categoria[] =>
  cardapioEstatico.map((c) => ({ ...c, itens: c.itens.map(comSeloVpj) }));

/** Cardápio no formato que o site já consumia (`data/menu.ts`). */
export const cardapioDoSite = unstable_cache(
  async (): Promise<Categoria[]> => {
    if (!bancoConfigurado) return cardapioDoArquivo();
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
              img: i.img ?? undefined,
              grupo: i.grupo ?? undefined,
              disponivel: i.disponivel,
              foto: i.fotoUrl ?? undefined,
            })),
        }))
        .filter((c) => c.itens.length > 0);
    } catch (erro) {
      console.error("[cardapio] usando dados estáticos:", erro);
      return cardapioDoArquivo();
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

/** Selos cadastrados (inclusive os desativados: o site esconde pelo `ativo`). */
export const selosDoSite = unstable_cache(
  async (): Promise<SeloDef[]> => {
    if (!bancoConfigurado) return SELOS_PADRAO;
    try {
      const selos = await lerSelos();
      return selos.length ? selos : SELOS_PADRAO;
    } catch (erro) {
      console.error("[selos] usando os padrões:", erro);
      return SELOS_PADRAO;
    }
  },
  ["selos-site"],
  { tags: [TAGS.selos], revalidate: 3600 },
);

export type PratoDaHome = MenuItem & { categoriaSlug: string; categoriaNome: string };

export type HomeDoSite = {
  maisPedido: (PratoDaHome & Omit<HomeConfig["maisPedido"], "itemId">) | null;
  destaques: PratoDaHome[];
};

/**
 * Pratos da página inicial, já resolvidos no cardápio publicado. Prato que
 * saiu do site (oculto ou excluído) some da home sem quebrar a página.
 */
export async function homeDoSite(): Promise<HomeDoSite> {
  const [cardapio, config] = await Promise.all([cardapioDoSite(), configHomeDoSite()]);
  const porId = new Map<string, PratoDaHome>();
  for (const c of cardapio) {
    for (const i of c.itens) {
      // Na peça, os risotos não repetem "Risoto de" (a categoria já diz); fora dela, precisa.
      const nome = c.id === "risotos" && !/^risoto/i.test(i.nome) ? `Risoto de ${i.nome}` : i.nome;
      porId.set(i.id, { ...i, nome, categoriaSlug: c.slug, categoriaNome: c.nome });
    }
  }
  const { itemId, ...textos } = config.maisPedido;
  const prato = porId.get(itemId);
  return {
    maisPedido: prato ? { ...prato, ...textos } : null,
    destaques: config.destaques.map((id) => porId.get(id)).filter((p): p is PratoDaHome => Boolean(p)),
  };
}

export const configHomeDoSite = unstable_cache(
  async (): Promise<HomeConfig> => {
    if (!bancoConfigurado) return HOME_PADRAO;
    try {
      return await lerConfig("home", HOME_PADRAO);
    } catch {
      return HOME_PADRAO;
    }
  },
  ["home-site"],
  { tags: [TAGS.home], revalidate: 3600 },
);
