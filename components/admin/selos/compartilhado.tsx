"use client";

import { Check, Settings2 } from "lucide-react";
import NextLink from "next/link";

import SeloSvg from "@/components/ui/SeloSvg";
import type { SeloDef } from "@/lib/selos";
import { cn } from "@/lib/utils";

/** Selo com o nome, para listas do painel (pratos do cardápio e do executivo). */
export function SeloEtiqueta({ selo, className }: { selo: SeloDef; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full bg-muted pr-2.5 pl-[3px] text-xs font-medium whitespace-nowrap",
        !selo.ativo && "opacity-50",
        className,
      )}
      title={selo.ativo ? (selo.descricao ?? selo.nome) : `${selo.nome} (desativado: não aparece no site)`}
    >
      <SeloSvg selo={selo} tamanho={18} titulo={false} />
      {selo.nome}
    </span>
  );
}

/**
 * Escolha de selos com o desenho de cada um. Marcado, o cartão ganha a cor do
 * selo e o desenho entra de novo (a mesma animação do site). Com `unico`, vale
 * um selo só (tocar no marcado desmarca).
 */
export function EscolhaSelos({
  selos,
  marcados,
  aoMudar,
  unico = false,
}: {
  selos: SeloDef[];
  marcados: string[];
  aoMudar: (ids: string[]) => void;
  unico?: boolean;
}) {
  const ativos = selos.filter((s) => s.ativo || marcados.includes(s.id));

  function alternar(id: string) {
    if (unico) return aoMudar(marcados.includes(id) ? [] : [id]);
    aoMudar(marcados.includes(id) ? marcados.filter((x) => x !== id) : [...marcados, id]);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2 @lg:grid-cols-3">
        {ativos.map((s) => {
          const marcado = marcados.includes(s.id);
          return (
            <button
              key={s.id}
              type="button"
              aria-pressed={marcado}
              onClick={() => alternar(s.id)}
              style={marcado ? ({ "--cor-selo": s.cor } as React.CSSProperties) : undefined}
              className={cn(
                "relative flex items-center gap-2.5 rounded-2xl p-2.5 pr-3 text-left transition-[background-color,box-shadow] duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/40",
                marcado
                  ? "bg-[color-mix(in_oklab,var(--cor-selo)_10%,var(--card))] shadow-[inset_0_0_0_1.5px_var(--cor-selo)]"
                  : "bg-muted/70 hover:bg-muted-hover",
              )}
            >
              <SeloSvg selo={s} tamanho={34} animar={marcado} chave={marcado ? "on" : "off"} titulo={false} />
              <span className="min-w-0 grow">
                <span className="block truncate text-sm font-medium">{s.nome}</span>
                {s.descricao && <span className="block truncate text-xs text-muted-foreground">{s.descricao}</span>}
              </span>
              <span
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full transition-colors",
                  marcado ? "bg-[var(--cor-selo)] text-white" : "border border-input",
                )}
                aria-hidden
              >
                {marcado && <Check className="size-3" strokeWidth={3} />}
              </span>
            </button>
          );
        })}
      </div>
      <NextLink
        href="/admin/selos"
        className="flex w-fit items-center gap-1.5 rounded-full px-1 text-[13px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <Settings2 className="size-3.5" /> Criar ou editar selos
      </NextLink>
    </div>
  );
}
