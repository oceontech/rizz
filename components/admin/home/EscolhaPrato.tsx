"use client";

import { Check, ImageIcon } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";

import { fotoDoItem } from "@/components/admin/cardapio/GestorCardapio";
import { Janela } from "@/components/admin/ui";
import { InputBusca } from "@/components/sistema/inputs/input-texto";
import { Button } from "@/components/sistema/ui/button";
import { brl } from "@/lib/admin/formato";
import type { ItemCardapio } from "@/lib/dados";
import { cn } from "@/lib/utils";

export type Prato = ItemCardapio & { categoriaNome: string };

const sem = (t: string) => t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/**
 * Escolha de prato com foto, busca e categoria. Com `varios`, cada toque
 * marca ou desmarca e a janela fica aberta (seleção da home); sem, o toque
 * escolhe e fecha (mais pedido).
 */
export default function EscolhaPrato({
  aberta,
  aoFechar,
  titulo,
  descricao,
  pratos,
  marcados,
  aoAlternar,
  varios = false,
  limite,
}: {
  aberta: boolean;
  aoFechar: () => void;
  titulo: string;
  descricao?: string;
  pratos: Prato[];
  marcados: string[];
  aoAlternar: (id: string) => void;
  varios?: boolean;
  limite?: number;
}) {
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState<string | null>(null);
  const categorias = useMemo(() => [...new Map(pratos.map((p) => [p.categoriaId, p.categoriaNome])).entries()], [pratos]);

  const termo = sem(busca.trim());
  // Com foto primeiro: na home, é a foto que faz o prato aparecer.
  const lista = pratos
    .filter((p) => (!categoria || p.categoriaId === categoria) && (!termo || sem(`${p.nome} ${p.descricao ?? ""}`).includes(termo)))
    .sort((a, b) => Number(!fotoDoItem(a)) - Number(!fotoDoItem(b)));
  const cheio = limite !== undefined && marcados.length >= limite;

  return (
    <Janela
      aberta={aberta}
      aoFechar={aoFechar}
      titulo={titulo}
      descricao={descricao}
      largura="sm:max-w-4xl"
      rodape={
        varios ? (
          <>
            <p className="mr-auto self-center text-sm text-muted-foreground">
              {marcados.length} {marcados.length === 1 ? "prato escolhido" : "pratos escolhidos"}
              {limite !== undefined && ` de até ${limite}`}
            </p>
            <Button className="rounded-full" onClick={aoFechar}>
              Pronto
            </Button>
          </>
        ) : undefined
      }
    >
      <div className="flex flex-col gap-4">
        <InputBusca valor={busca} aoMudar={setBusca} placeholder="Buscar prato…" aria-label="Buscar prato" classeCaixa="rounded-full" />
        <div className="-mx-6 overflow-x-auto px-6 [scrollbar-width:none]">
          <div className="flex w-max gap-1.5">
            {[[null, "Todos"] as const, ...categorias].map(([id, nome]) => (
              <button
                key={id ?? "todas"}
                type="button"
                onClick={() => setCategoria(id)}
                className={cn(
                  "h-8 rounded-full px-3.5 text-[13px] font-medium whitespace-nowrap transition-colors",
                  categoria === id ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted-hover hover:text-foreground",
                )}
              >
                {nome}
              </button>
            ))}
          </div>
        </div>

        {lista.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Nenhum prato encontrado.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {lista.map((p) => {
              const foto = fotoDoItem(p);
              const marcado = marcados.includes(p.id);
              const bloqueado = varios && !marcado && cheio;
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    disabled={bloqueado}
                    aria-pressed={marcado}
                    onClick={() => {
                      aoAlternar(p.id);
                      if (!varios) aoFechar();
                    }}
                    className={cn(
                      "group flex h-full w-full flex-col overflow-hidden rounded-2xl bg-muted/60 text-left transition-[box-shadow,background-color] outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/40 disabled:opacity-40",
                      marcado && "bg-card shadow-[inset_0_0_0_2px_var(--foreground)]",
                    )}
                  >
                    <span className="relative block aspect-[4/3] bg-muted">
                      {foto ? (
                        <Image src={foto} alt="" fill sizes="(min-width: 1024px) 200px, 45vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                      ) : (
                        <span className="absolute inset-0 grid place-items-center text-texto-terciario">
                          <span className="flex flex-col items-center gap-1 text-xs">
                            <ImageIcon className="size-5" strokeWidth={1.5} /> Sem foto
                          </span>
                        </span>
                      )}
                      {marcado && (
                        <span className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-foreground text-background shadow-flutuante">
                          <Check className="size-4" strokeWidth={3} />
                        </span>
                      )}
                      {!p.visivel && (
                        <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
                          Oculto no site
                        </span>
                      )}
                    </span>
                    <span className="flex grow flex-col gap-0.5 p-3">
                      <span className="line-clamp-2 text-[13px] leading-snug font-medium">{p.nome}</span>
                      <span className="mt-auto flex items-center justify-between gap-2 pt-1 text-xs text-muted-foreground">
                        <span className="truncate">{p.categoriaNome}</span>
                        <span className="numeros shrink-0">{p.preco === null ? "Consulta" : brl.format(p.preco)}</span>
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Janela>
  );
}
