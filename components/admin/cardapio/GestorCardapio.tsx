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
import { useMemo, useState, useTransition } from "react";

import { avisar, Confirmar } from "@/components/admin/campos";
import { Cabecalho, MenuAcoes, Selo, useUltimo, type Tom } from "@/components/admin/ui";
import { EstadoVazio } from "@/components/sistema/estados/estado-vazio";
import { InputBusca } from "@/components/sistema/inputs/input-texto";
import { ItemEscalonado, ListaEscalonada } from "@/components/sistema/movimento";
import { ControleSegmentado } from "@/components/sistema/pickers/controle-segmentado";
import { Button } from "@/components/sistema/ui/button";
import { Card } from "@/components/sistema/ui/card";
import { Switch } from "@/components/sistema/ui/switch";
import { BADGES, type Badge } from "@/data/menu";
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
import { cn } from "@/lib/utils";

import EditorCategoria from "./EditorCategoria";
import EditorItem from "./EditorItem";
import ReajustePrecos from "./ReajustePrecos";

type Filtro = "todos" | "esgotados" | "ocultos";

const TOM_BADGE: Record<Badge, Tom> = {
  vegetariano: "positivo",
  rizz: "marca",
  tartufato: "atencao",
};

export function fotoDoItem(item: Pick<ItemCardapio, "fotoUrl" | "img">) {
  if (item.fotoUrl) return item.fotoUrl;
  if (item.img && item.img in images) return images[item.img];
  return null;
}

function LinhaItem({
  item,
  primeiro,
  ultimo,
  onEditar,
  onExcluir,
}: {
  item: ItemCardapio;
  primeiro: boolean;
  ultimo: boolean;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const [disponivel, setDisponivel] = useState(item.disponivel);
  const [, iniciar] = useTransition();
  const foto = fotoDoItem(item);

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
    <li className={cn("flex gap-3 px-3 py-3 transition-colors sm:items-center sm:px-4", !item.visivel && "bg-muted/60")}>
      <button
        type="button"
        onClick={onEditar}
        className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted outline-none focus-visible:ring-3 focus-visible:ring-primary-suave"
        aria-label={`Editar ${item.nome}`}
      >
        {foto ? (
          <Image src={foto} alt="" fill sizes="56px" className={cn("object-cover", !disponivel && "grayscale")} />
        ) : (
          <ImageIcon className="absolute inset-0 m-auto size-5 text-texto-terciario" strokeWidth={1.5} />
        )}
      </button>

      <div className="min-w-0 grow">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={onEditar} className="min-w-0 text-left">
            <p className={cn("text-[15px] leading-snug font-medium", !disponivel && "text-muted-foreground line-through")}>
              {item.nome}
            </p>
            {item.descricao && (
              <p className="mt-0.5 line-clamp-2 text-[13px] text-muted-foreground sm:line-clamp-1">{item.descricao}</p>
            )}
          </button>
          <p className="numeros shrink-0 text-sm font-semibold sm:hidden">
            {item.preco === null ? "Consulta" : brl.format(item.preco)}
          </p>
        </div>

        {(item.grupo || item.badges.length > 0 || item.vpj || !item.visivel || !disponivel) && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {!disponivel && <Selo tom="negativo">Esgotado</Selo>}
            {!item.visivel && (
              <Selo>
                <EyeOff /> Oculto
              </Selo>
            )}
            {item.grupo && <Selo>{item.grupo}</Selo>}
            {item.badges.map((b) => (
              <Selo key={b} tom={TOM_BADGE[b]}>
                {BADGES[b].rotulo}
              </Selo>
            ))}
            {item.vpj && <Selo>VPJ</Selo>}
          </div>
        )}
      </div>

      <p className="numeros hidden w-24 shrink-0 text-right text-sm font-semibold sm:block">
        {item.preco === null ? <span className="font-normal text-muted-foreground">Consulta</span> : brl.format(item.preco)}
      </p>

      <div className="flex shrink-0 flex-col items-end justify-between gap-2 sm:flex-row sm:items-center sm:gap-3">
        <Switch checked={disponivel} onCheckedChange={alternar} aria-label={`${item.nome} disponível`} />
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

export default function GestorCardapio({ categorias }: { categorias: CategoriaCardapio[] }) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [editando, setEditando] = useState<ItemCardapio | "novo" | null>(null);
  const [novoNaCategoria, setNovoNaCategoria] = useState<string | null>(null);
  const [categoriaEditada, setCategoriaEditada] = useState<CategoriaCardapio | "nova" | null>(null);
  const [reajuste, setReajuste] = useState(false);
  const [excluindo, setExcluindo] = useState<
    { tipo: "item"; item: ItemCardapio } | { tipo: "categoria"; cat: CategoriaCardapio } | null
  >(null);
  const excluido = useUltimo(excluindo);
  const [, iniciar] = useTransition();

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

  function acaoCategoria(cat: CategoriaCardapio, chave: string) {
    if (chave === "editar") return setCategoriaEditada(cat);
    if (chave === "novo") {
      setNovoNaCategoria(cat.id);
      return setEditando("novo");
    }
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
        descricao="Preços, pratos esgotados e o que aparece no site. As alterações publicam na hora."
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
            <Button
              className="rounded-full"
              onClick={() => {
                setNovoNaCategoria(null);
                setEditando("novo");
              }}
            >
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

      {exibidas.length === 0 ? (
        <Card>
          <EstadoVazio icone={BookOpen} titulo="Nenhum prato encontrado" descricao="Ajuste a busca ou o filtro." />
        </Card>
      ) : (
        <ListaEscalonada className="flex flex-col gap-4">
          {exibidas.map((cat, ci) => (
            <ItemEscalonado key={cat.id}>
              <Card className="gap-0 py-0">
                <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                  <div className="min-w-0 grow">
                    <h2 className="flex items-center gap-2 text-[15px] font-semibold">
                      {cat.nome}
                      <span className="numeros text-xs font-medium text-muted-foreground">{cat.itens.length}</span>
                      {!cat.visivel && (
                        <Selo>
                          <EyeOff /> Oculta
                        </Selo>
                      )}
                    </h2>
                    {cat.descricao && <p className="truncate text-[13px] text-muted-foreground">{cat.descricao}</p>}
                  </div>
                  <Button size="sm" variant="ghost" className="hidden rounded-full sm:inline-flex" onClick={() => acaoCategoria(cat, "novo")}>
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
                  <p className="border-t px-5 py-6 text-sm text-muted-foreground">Nenhum prato nesta categoria.</p>
                ) : (
                  <ul className="divide-y border-t">
                    {cat.itens.map((item, i) => (
                      <LinhaItem
                        key={`${item.id}-${item.disponivel}-${item.visivel}`}
                        item={item}
                        primeiro={i === 0 || filtrando}
                        ultimo={i === cat.itens.length - 1 || filtrando}
                        onEditar={() => setEditando(item)}
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

      <EditorItem
        editando={editando}
        categoriaInicial={novoNaCategoria}
        categorias={categorias}
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
