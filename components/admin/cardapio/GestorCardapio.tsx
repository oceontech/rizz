"use client";

import {
  ArrowDown,
  ArrowUp,
  Ellipsis,
  Eye,
  EyeSlash,
  Pencil,
  Percent,
  Plus,
  TrashBin,
  Picture,
  FolderPlus,
} from "@gravity-ui/icons";
import {
  Button,
  Card,
  Chip,
  Dropdown,
  EmptyState,
  Label,
  SearchField,
  Separator,
  Switch,
  Tabs,
} from "@heroui/react";
import Image from "next/image";
import { useMemo, useState, useTransition } from "react";

import { avisar, Confirmar } from "@/components/admin/campos";
import { Cabecalho } from "@/components/admin/ui";
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

import EditorCategoria from "./EditorCategoria";
import EditorItem from "./EditorItem";
import ReajustePrecos from "./ReajustePrecos";

type Filtro = "todos" | "esgotados" | "ocultos";

const COR_BADGE: Record<Badge, "success" | "accent" | "warning"> = {
  vegetariano: "success",
  rizz: "accent",
  tartufato: "warning",
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

  function acao(chave: React.Key) {
    iniciar(async () => {
      if (chave === "editar") return onEditar();
      if (chave === "excluir") return onExcluir();
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
      className={`flex gap-3 px-4 py-3.5 transition-colors sm:items-center sm:px-5 ${
        !item.visivel ? "bg-default/50" : ""
      }`}
    >
      <button
        type="button"
        onClick={onEditar}
        className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-surface-secondary sm:size-14"
        aria-label={`Editar ${item.nome}`}
      >
        {foto ? (
          <Image src={foto} alt="" fill sizes="56px" className="object-cover" />
        ) : (
          <Picture className="absolute inset-0 m-auto size-5 text-muted/60" />
        )}
      </button>

      <div className="min-w-0 grow">
        <div className="flex items-start justify-between gap-3">
          <button type="button" onClick={onEditar} className="min-w-0 text-left">
            <p className={`text-[0.9375rem] font-medium leading-snug ${!disponivel ? "text-muted line-through" : ""}`}>
              {item.nome}
            </p>
            {item.descricao && <p className="mt-0.5 line-clamp-2 text-xs text-muted sm:line-clamp-1">{item.descricao}</p>}
          </button>
          <p className="shrink-0 text-sm font-medium tabular-nums sm:hidden">
            {item.preco === null ? "Consulta" : brl.format(item.preco)}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          {item.grupo && (
            <Chip size="sm" variant="secondary">
              {item.grupo}
            </Chip>
          )}
          {item.badges.map((b) => (
            <Chip key={b} size="sm" variant="soft" color={COR_BADGE[b]}>
              {BADGES[b].rotulo}
            </Chip>
          ))}
          {item.vpj && (
            <Chip size="sm" variant="soft">
              VPJ
            </Chip>
          )}
          {!item.visivel && (
            <Chip size="sm" variant="soft" color="danger">
              <EyeSlash className="size-3" /> Oculto
            </Chip>
          )}
          {!disponivel && (
            <Chip size="sm" variant="primary" color="danger">
              Esgotado
            </Chip>
          )}
        </div>
      </div>

      <p className="hidden w-24 shrink-0 text-right text-sm font-medium tabular-nums sm:block">
        {item.preco === null ? <span className="text-muted">Consulta</span> : brl.format(item.preco)}
      </p>

      <div className="flex shrink-0 flex-col items-end justify-between gap-2 sm:flex-row sm:items-center sm:gap-3">
        <Switch isSelected={disponivel} onChange={alternar} size="sm" aria-label={`${item.nome} disponível`}>
          <Switch.Content>
            <Switch.Control>
              <Switch.Thumb />
            </Switch.Control>
          </Switch.Content>
        </Switch>

        <Dropdown>
          <Button isIconOnly size="sm" variant="ghost" aria-label={`Ações de ${item.nome}`}>
            <Ellipsis />
          </Button>
          <Dropdown.Popover placement="bottom end">
            <Dropdown.Menu onAction={acao} disabledKeys={[...(primeiro ? ["cima"] : []), ...(ultimo ? ["baixo"] : [])]}>
              <Dropdown.Item id="editar" textValue="Editar">
                <Pencil className="size-4" />
                <Label>Editar</Label>
              </Dropdown.Item>
              <Dropdown.Item id="visivel" textValue="Visibilidade">
                {item.visivel ? <EyeSlash className="size-4" /> : <Eye className="size-4" />}
                <Label>{item.visivel ? "Ocultar do site" : "Mostrar no site"}</Label>
              </Dropdown.Item>
              <Dropdown.Item id="cima" textValue="Mover para cima">
                <ArrowUp className="size-4" />
                <Label>Mover para cima</Label>
              </Dropdown.Item>
              <Dropdown.Item id="baixo" textValue="Mover para baixo">
                <ArrowDown className="size-4" />
                <Label>Mover para baixo</Label>
              </Dropdown.Item>
              <Dropdown.Item id="excluir" textValue="Excluir" variant="danger">
                <TrashBin className="size-4" />
                <Label>Excluir</Label>
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
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

  function acaoCategoria(cat: CategoriaCardapio, chave: React.Key) {
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
            <Button variant="secondary" size="sm" onPress={() => setReajuste(true)}>
              <Percent /> Reajustar preços
            </Button>
            <Button variant="secondary" size="sm" onPress={() => setCategoriaEditada("nova")}>
              <FolderPlus /> Categoria
            </Button>
            <Button
              size="sm"
              onPress={() => {
                setNovoNaCategoria(null);
                setEditando("novo");
              }}
            >
              <Plus /> Novo prato
            </Button>
          </>
        }
      />

      {/* Filtros */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SearchField value={busca} onChange={setBusca} aria-label="Buscar prato" className="w-full md:max-w-xs">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Buscar prato…" className="w-full" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>

        <Tabs selectedKey={filtro} onSelectionChange={(k) => setFiltro(k as Filtro)} className="w-full md:w-auto">
          <Tabs.ListContainer>
            <Tabs.List aria-label="Filtrar pratos" className="w-full md:w-auto">
              <Tabs.Tab id="todos" className="whitespace-nowrap">
                Todos <span className="ml-1 text-muted tabular-nums">{contagem.todos}</span>
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="esgotados" className="whitespace-nowrap">
                Esgotados <span className="ml-1 text-muted tabular-nums">{contagem.esgotados}</span>
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="ocultos" className="whitespace-nowrap">
                Ocultos <span className="ml-1 text-muted tabular-nums">{contagem.ocultos}</span>
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </div>

      {exibidas.length === 0 ? (
        <Card className="py-14">
          <EmptyState className="flex flex-col items-center gap-2 text-center">
            <p className="font-medium">Nenhum prato encontrado</p>
            <p className="text-sm text-muted">Ajuste a busca ou o filtro.</p>
          </EmptyState>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {exibidas.map((cat, ci) => (
            <Card key={cat.id} className="gap-0 overflow-hidden p-0">
              <div className="flex items-center gap-3 px-4 py-3.5 sm:px-5">
                <div className="min-w-0 grow">
                  <h2 className="flex items-center gap-2 font-medium">
                    {cat.nome}
                    <span className="text-xs font-normal text-muted tabular-nums">{cat.itens.length}</span>
                    {!cat.visivel && (
                      <Chip size="sm" variant="soft" color="danger">
                        Oculta
                      </Chip>
                    )}
                  </h2>
                  {cat.descricao && <p className="truncate text-xs text-muted">{cat.descricao}</p>}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="hidden sm:inline-flex"
                  onPress={() => acaoCategoria(cat, "novo")}
                >
                  <Plus /> Prato
                </Button>
                <Dropdown>
                  <Button isIconOnly size="sm" variant="ghost" aria-label={`Ações da categoria ${cat.nome}`}>
                    <Ellipsis />
                  </Button>
                  <Dropdown.Popover placement="bottom end">
                    <Dropdown.Menu
                      onAction={(k) => acaoCategoria(cat, k)}
                      disabledKeys={[
                        ...(ci === 0 || filtrando ? ["cima"] : []),
                        ...(ci === exibidas.length - 1 || filtrando ? ["baixo"] : []),
                      ]}
                    >
                      <Dropdown.Item id="novo" textValue="Adicionar prato">
                        <Plus className="size-4" />
                        <Label>Adicionar prato</Label>
                      </Dropdown.Item>
                      <Dropdown.Item id="editar" textValue="Editar categoria">
                        <Pencil className="size-4" />
                        <Label>Editar categoria</Label>
                      </Dropdown.Item>
                      <Dropdown.Item id="cima" textValue="Subir">
                        <ArrowUp className="size-4" />
                        <Label>Subir categoria</Label>
                      </Dropdown.Item>
                      <Dropdown.Item id="baixo" textValue="Descer">
                        <ArrowDown className="size-4" />
                        <Label>Descer categoria</Label>
                      </Dropdown.Item>
                      <Dropdown.Item id="excluir" textValue="Excluir categoria" variant="danger">
                        <TrashBin className="size-4" />
                        <Label>Excluir categoria</Label>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>
              </div>
              <Separator />
              {cat.itens.length === 0 ? (
                <p className="px-5 py-6 text-sm text-muted">Nenhum prato nesta categoria.</p>
              ) : (
                <ul className="divide-y divide-separator">
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
          ))}
        </div>
      )}

      <EditorItem
        aberto={editando !== null}
        item={editando === "novo" ? null : editando}
        categoriaInicial={novoNaCategoria}
        categorias={categorias}
        onFechar={() => setEditando(null)}
      />

      <EditorCategoria
        aberto={categoriaEditada !== null}
        categoria={categoriaEditada === "nova" ? null : categoriaEditada}
        onFechar={() => setCategoriaEditada(null)}
      />

      <ReajustePrecos aberto={reajuste} categorias={categorias} onFechar={() => setReajuste(false)} />

      <Confirmar
        aberto={excluindo !== null}
        onFechar={() => setExcluindo(null)}
        titulo={excluindo?.tipo === "categoria" ? "Excluir categoria?" : "Excluir prato?"}
        texto={
          excluindo?.tipo === "categoria" ? (
            <>
              A categoria <strong>{excluindo.cat.nome}</strong> será removida. Ela precisa estar vazia.
            </>
          ) : excluindo ? (
            <>
              <strong>{excluindo.item.nome}</strong> será removido do cardápio de vez. Se for temporário,
              prefira marcar como esgotado ou ocultar.
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
