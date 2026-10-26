"use client";

import {
  ArrowDown,
  ArrowUp,
  BookOpen,
  Eye,
  EyeOff,
  FolderPlus,
  ImageIcon,
  Pencil,
  Percent,
  Plus,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";

import { avisar, Confirmar } from "@/components/admin/campos";
import { SeloEtiqueta } from "@/components/admin/selos/compartilhado";
import { Cabecalho, MenuAcoes, Selo, useUltimo } from "@/components/admin/ui";
import { EstadoVazio } from "@/components/sistema/estados/estado-vazio";
import { InputBusca } from "@/components/sistema/inputs/input-texto";
import { ItemEscalonado, ListaEscalonada } from "@/components/sistema/movimento";
import { ControleSegmentado } from "@/components/sistema/pickers/controle-segmentado";
import { Button } from "@/components/sistema/ui/button";
import { Card } from "@/components/sistema/ui/card";
import {
  alternarDisponivel,
  excluirCategoria,
  excluirItem,
  moverCategoria,
  moverItem,
  salvarItem,
} from "@/lib/admin/cardapio-actions";
import { brl } from "@/lib/admin/formato";
import type { CategoriaCardapio, ItemCardapio } from "@/lib/dados";
import { images } from "@/lib/images";
import type { SeloDef } from "@/lib/selos";
import { cn } from "@/lib/utils";

import EditorCategoria from "./EditorCategoria";
import EditorItem from "./EditorItem";
import ReajustePrecos from "./ReajustePrecos";

type Filtro = "todos" | "esgotados" | "ocultos";

export function fotoDoItem(item: Pick<ItemCardapio, "fotoUrl" | "img">) {
  if (item.fotoUrl) return item.fotoUrl;
  if (item.img && item.img in images) return images[item.img];
  return null;
}

const ancora = (id: string) => `categoria-${id}`;

/**
 * Situação do prato hoje, num toque: verde "Disponível" ou vermelho
 * "Esgotado". Mais claro que um switch sem rótulo no meio da linha.
 */
function BotaoSituacao({ disponivel, nome, aoMudar }: { disponivel: boolean; nome: string; aoMudar: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => aoMudar(!disponivel)}
      aria-pressed={disponivel}
      aria-label={`${nome}: ${disponivel ? "disponível. Tocar para marcar como esgotado" : "esgotado. Tocar para voltar ao cardápio"}`}
      className={cn(
        "flex h-8 w-[7.25rem] shrink-0 items-center justify-center gap-1.5 rounded-full text-xs font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
        disponivel
          ? "bg-positivo/12 text-positivo-texto hover:bg-positivo/20"
          : "bg-negativo/10 text-negativo-texto hover:bg-negativo/16",
      )}
    >
      <span className={cn("size-1.5 rounded-full", disponivel ? "bg-positivo" : "bg-negativo")} aria-hidden />
      {disponivel ? "Disponível" : "Esgotado"}
    </button>
  );
}

function LinhaItem({
  item,
  selos,
  primeiro,
  ultimo,
  onEditar,
  onExcluir,
}: {
  item: ItemCardapio;
  selos: Map<string, SeloDef>;
  primeiro: boolean;
  ultimo: boolean;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const [disponivel, setDisponivel] = useState(item.disponivel);
  const [, iniciar] = useTransition();
  const foto = fotoDoItem(item);
  const seusSelos = item.badges.map((b) => selos.get(b)).filter((s): s is SeloDef => Boolean(s));

  function alternar(v: boolean) {
    setDisponivel(v);
    iniciar(async () => {
      const r = await alternarDisponivel(item.id, v);
      if (!avisar(r, v ? `${item.nome} voltou ao cardápio` : `${item.nome} marcado como esgotado`)) {
        setDisponivel(!v);
      }
    });
  }

  function acao(chave: string) {
    if (chave === "editar") return onEditar();
    if (chave === "excluir") return onExcluir();
    iniciar(async () => {
      if (chave === "cima" || chave === "baixo") {
        const r = await moverItem(item.id, chave);
        if (!r.ok) avisar(r, "");
        return;
      }
      if (chave === "visivel") {
        const r = await salvarItem({ ...item, visivel: !item.visivel });
        avisar(r, item.visivel ? "Prato oculto no site" : "Prato visível no site");
      }
    });
  }

  return (
    <li
      className={cn(
        "group/linha flex gap-3.5 px-3 py-3 transition-colors hover:bg-muted/40 sm:items-center sm:px-5",
        !item.visivel && "bg-muted/50",
      )}
    >
      <button
        type="button"
        onClick={onEditar}
        className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/40 sm:size-16"
        aria-label={`Editar ${item.nome}`}
      >
        {foto ? (
          <Image src={foto} alt="" fill sizes="64px" className={cn("object-cover", !disponivel && "grayscale")} />
        ) : (
          <ImageIcon className="absolute inset-0 m-auto size-5 text-texto-terciario" strokeWidth={1.5} />
        )}
      </button>

      <div className="min-w-0 grow">
        <button type="button" onClick={onEditar} className="block max-w-full min-w-0 text-left outline-none">
          <p
            className={cn(
              "text-[15px] leading-snug font-medium group-hover/linha:underline group-hover/linha:decoration-border group-hover/linha:underline-offset-4",
              !disponivel && "text-muted-foreground",
            )}
          >
            {item.nome}
          </p>
          {item.descricao && <p className="mt-0.5 line-clamp-1 text-[13px] text-muted-foreground">{item.descricao}</p>}
        </button>

        {(item.grupo || seusSelos.length > 0 || !item.visivel) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {!item.visivel && (
              <Selo>
                <EyeOff /> Oculto no site
              </Selo>
            )}
            {item.grupo && <Selo tom="info">{item.grupo}</Selo>}
            {seusSelos.map((s) => (
              <SeloEtiqueta key={s.id} selo={s} />
            ))}
          </div>
        )}

        <div className="mt-2.5 flex items-center justify-between gap-3 sm:hidden">
          <p className="numeros text-sm font-semibold">{item.preco === null ? "Consulta" : brl.format(item.preco)}</p>
          <BotaoSituacao disponivel={disponivel} nome={item.nome} aoMudar={alternar} />
        </div>
      </div>

      <p className="numeros hidden w-24 shrink-0 text-right text-[15px] font-semibold sm:block">
        {item.preco === null ? <span className="text-sm font-normal text-muted-foreground">Consulta</span> : brl.format(item.preco)}
      </p>

      <div className="hidden sm:block">
        <BotaoSituacao disponivel={disponivel} nome={item.nome} aoMudar={alternar} />
      </div>

      <div className="shrink-0 self-start sm:self-center">
        <MenuAcoes
          rotulo={`Ações de ${item.nome}`}
          aoEscolher={acao}
          acoes={[
            { id: "editar", rotulo: "Editar", icone: Pencil },
            { id: "visivel", rotulo: item.visivel ? "Ocultar do site" : "Mostrar no site", icone: item.visivel ? EyeOff : Eye },
            { id: "cima", rotulo: "Mover para cima", icone: ArrowUp, desabilitada: primeiro, separar: true },
            { id: "baixo", rotulo: "Mover para baixo", icone: ArrowDown, desabilitada: ultimo },
            { id: "excluir", rotulo: "Excluir", icone: Trash2, perigo: true, separar: true },
          ]}
        />
      </div>
    </li>
  );
}

/** Índice das categorias (desktop): leva até a categoria e marca a que está na tela. */
function IndiceCategorias({ categorias }: { categorias: CategoriaCardapio[] }) {
  const [atual, setAtual] = useState(categorias[0]?.id ?? "");

  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        const visivel = entradas.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visivel) setAtual(visivel.target.id.replace("categoria-", ""));
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    for (const c of categorias) {
      const el = document.getElementById(ancora(c.id));
      if (el) observador.observe(el);
    }
    return () => observador.disconnect();
  }, [categorias]);

  return (
    <nav aria-label="Categorias" className="sticky top-6 hidden max-h-[calc(100dvh-3rem)] w-56 shrink-0 overflow-y-auto pb-6 lg:block">
      <p className="mb-2 px-3 text-[0.68rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase">Categorias</p>
      <ul className="flex flex-col gap-0.5">
        {categorias.map((c) => {
          const esgotados = c.itens.filter((i) => !i.disponivel).length;
          return (
            <li key={c.id}>
              <a
                href={`#${ancora(c.id)}`}
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById(ancora(c.id))?.scrollIntoView({ behavior: "smooth", block: "start" });
                  setAtual(c.id);
                }}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-full px-3 text-sm transition-colors",
                  atual === c.id ? "bg-card font-medium text-foreground shadow-suave" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <span className={cn("min-w-0 grow truncate", !c.visivel && "line-through decoration-muted-foreground/50")}>{c.nome}</span>
                {esgotados > 0 && (
                  <span className="size-1.5 shrink-0 rounded-full bg-negativo" title={`${esgotados} esgotado(s)`} aria-hidden />
                )}
                <span className="numeros text-xs text-texto-terciario">{c.itens.length}</span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default function GestorCardapio({
  categorias,
  selos,
  abrirNovo = false,
}: {
  categorias: CategoriaCardapio[];
  selos: SeloDef[];
  abrirNovo?: boolean;
}) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [editando, setEditando] = useState<ItemCardapio | "novo" | null>(abrirNovo ? "novo" : null);
  const [sessao, setSessao] = useState(0);
  const [novoNaCategoria, setNovoNaCategoria] = useState<string | null>(null);
  const [categoriaEditada, setCategoriaEditada] = useState<CategoriaCardapio | "nova" | null>(null);
  const [reajuste, setReajuste] = useState(false);
  const [excluindo, setExcluindo] = useState<
    { tipo: "item"; item: ItemCardapio } | { tipo: "categoria"; cat: CategoriaCardapio } | null
  >(null);
  const excluido = useUltimo(excluindo);
  const [, iniciar] = useTransition();
  const mapaSelos = useMemo(() => new Map(selos.map((s) => [s.id, s])), [selos]);

  const todos = categorias.flatMap((c) => c.itens);
  const contagem = {
    todos: todos.length,
    esgotados: todos.filter((i) => !i.disponivel).length,
    ocultos: todos.filter((i) => !i.visivel).length,
  };

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return categorias.map((c) => ({
      ...c,
      itens: c.itens.filter((i) => {
        if (filtro === "esgotados" && i.disponivel) return false;
        if (filtro === "ocultos" && i.visivel) return false;
        if (termo && !`${i.nome} ${i.descricao ?? ""}`.toLowerCase().includes(termo)) return false;
        return true;
      }),
    }));
  }, [categorias, busca, filtro]);

  const filtrando = busca.trim() !== "" || filtro !== "todos";
  const exibidas = filtrando ? visiveis.filter((c) => c.itens.length > 0) : visiveis;

  function novoPrato(categoriaId: string | null) {
    setNovoNaCategoria(categoriaId);
    setSessao((n) => n + 1);
    setEditando("novo");
  }

  function acaoCategoria(cat: CategoriaCardapio, chave: string) {
    if (chave === "editar") return setCategoriaEditada(cat);
    if (chave === "novo") return novoPrato(cat.id);
    if (chave === "excluir") return setExcluindo({ tipo: "categoria", cat });
    if (chave === "cima" || chave === "baixo") {
      iniciar(async () => {
        const r = await moverCategoria(cat.id, chave);
        if (!r.ok) avisar(r, "");
      });
    }
  }

  return (
    <>
      <Cabecalho
        titulo="Cardápio"
        descricao="Preços, pratos esgotados, selos e o que aparece no site. As alterações publicam na hora."
        acoes={
          <>
            <Button variant="secondary" className="rounded-full bg-card shadow-suave hover:bg-accent" onClick={() => setReajuste(true)}>
              <Percent /> Reajustar preços
            </Button>
            <Button
              variant="secondary"
              className="rounded-full bg-card shadow-suave hover:bg-accent"
              onClick={() => setCategoriaEditada("nova")}
            >
              <FolderPlus /> Categoria
            </Button>
            <Button className="rounded-full" onClick={() => novoPrato(null)}>
              <Plus /> Novo prato
            </Button>
          </>
        }
      />

      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <InputBusca
          valor={busca}
          aoMudar={setBusca}
          placeholder="Buscar prato…"
          aria-label="Buscar prato"
          classeCaixa="rounded-full border-0 bg-card shadow-suave md:max-w-xs"
        />
        <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
          <ControleSegmentado
            rotulo="Filtrar pratos"
            sobrePagina
            valor={filtro}
            aoMudar={setFiltro}
            opcoes={[
              { valor: "todos", rotulo: "Todos", contagem: contagem.todos },
              { valor: "esgotados", rotulo: "Esgotados", contagem: contagem.esgotados },
              { valor: "ocultos", rotulo: "Ocultos", contagem: contagem.ocultos },
            ]}
          />
        </div>
      </div>

      <div className="flex items-start gap-6">
        {!filtrando && <IndiceCategorias categorias={categorias} />}

        <div className="min-w-0 grow">
          {exibidas.length === 0 ? (
            <Card>
              <EstadoVazio icone={BookOpen} titulo="Nenhum prato encontrado" descricao="Ajuste a busca ou o filtro." />
            </Card>
          ) : (
            <ListaEscalonada className="flex flex-col gap-4">
              {exibidas.map((cat, ci) => (
                <ItemEscalonado key={cat.id}>
                  <Card id={ancora(cat.id)} className="scroll-mt-6 gap-0 py-0">
                    <div className="flex items-center gap-3 px-4 py-4 sm:px-5">
                      <div className="min-w-0 grow">
                        <h2 className="flex items-center gap-2 text-base font-semibold">
                          {cat.nome}
                          <span className="numeros grid h-5 min-w-5 place-items-center rounded-full bg-muted px-1.5 text-xs font-medium text-muted-foreground">
                            {cat.itens.length}
                          </span>
                          {!cat.visivel && (
                            <Selo>
                              <EyeOff /> Oculta no site
                            </Selo>
                          )}
                        </h2>
                        {cat.descricao && <p className="truncate text-[13px] text-muted-foreground">{cat.descricao}</p>}
                      </div>
                      <Button size="sm" variant="ghost" className="hidden rounded-full sm:inline-flex" onClick={() => novoPrato(cat.id)}>
                        <Plus /> Prato
                      </Button>
                      <MenuAcoes
                        rotulo={`Ações da categoria ${cat.nome}`}
                        aoEscolher={(k) => acaoCategoria(cat, k)}
                        acoes={[
                          { id: "novo", rotulo: "Adicionar prato", icone: Plus },
                          { id: "editar", rotulo: "Editar categoria", icone: Pencil },
                          { id: "cima", rotulo: "Subir categoria", icone: ArrowUp, desabilitada: ci === 0 || filtrando, separar: true },
                          {
                            id: "baixo",
                            rotulo: "Descer categoria",
                            icone: ArrowDown,
                            desabilitada: ci === exibidas.length - 1 || filtrando,
                          },
                          { id: "excluir", rotulo: "Excluir categoria", icone: Trash2, perigo: true, separar: true },
                        ]}
                      />
                    </div>
                    {cat.itens.length === 0 ? (
                      <button
                        type="button"
                        onClick={() => novoPrato(cat.id)}
                        className="flex w-full items-center gap-2 border-t px-5 py-5 text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
                      >
                        <Plus className="size-4" /> Nenhum prato ainda. Adicionar o primeiro
                      </button>
                    ) : (
                      <ul className="divide-y border-t">
                        {cat.itens.map((item, i) => (
                          <LinhaItem
                            key={`${item.id}-${item.disponivel}-${item.visivel}`}
                            item={item}
                            selos={mapaSelos}
                            primeiro={i === 0 || filtrando}
                            ultimo={i === cat.itens.length - 1 || filtrando}
                            onEditar={() => {
                              setSessao((n) => n + 1);
                              setEditando(item);
                            }}
                            onExcluir={() => setExcluindo({ tipo: "item", item })}
                          />
                        ))}
                      </ul>
                    )}
                  </Card>
                </ItemEscalonado>
              ))}
            </ListaEscalonada>
          )}
        </div>
      </div>

      <EditorItem
        editando={editando}
        sessao={sessao}
        categoriaInicial={novoNaCategoria}
        categorias={categorias}
        selos={selos}
        onFechar={() => setEditando(null)}
      />

      <EditorCategoria editando={categoriaEditada} onFechar={() => setCategoriaEditada(null)} />

      <ReajustePrecos aberto={reajuste} categorias={categorias} onFechar={() => setReajuste(false)} />

      <Confirmar
        aberto={excluindo !== null}
        onFechar={() => setExcluindo(null)}
        titulo={excluido?.tipo === "categoria" ? "Excluir categoria?" : "Excluir prato?"}
        texto={
          excluido?.tipo === "categoria" ? (
            <>
              A categoria <strong className="text-foreground">{excluido.cat.nome}</strong> será removida. Ela precisa
              estar vazia.
            </>
          ) : excluido ? (
            <>
              <strong className="text-foreground">{excluido.item.nome}</strong> será removido do cardápio de vez. Se
              for temporário, prefira marcar como esgotado ou ocultar.
            </>
          ) : null
        }
        onConfirmar={async () => {
          if (!excluindo) return;
          const r =
            excluindo.tipo === "categoria"
              ? await excluirCategoria(excluindo.cat.id)
              : await excluirItem(excluindo.item.id);
          avisar(r, "Excluído");
        }}
      />
    </>
  );
}
