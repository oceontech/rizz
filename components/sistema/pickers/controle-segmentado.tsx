"use client";

import { motion } from "motion/react";
import { useId, useRef, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";

type Opcao<T extends string> = { valor: T; rotulo: string; contagem?: number };

type Props<T extends string> = {
  opcoes: Opcao<T>[];
  valor: T;
  aoMudar: (valor: T) => void;
  rotulo: string;
  tamanho?: "padrao" | "pequeno";
  /** O controle fica direto sobre o fundo da página (não dentro de um card): no tema claro, usa o cinza que aparece ali */
  sobrePagina?: boolean;
  className?: string;
};

/** Abas em pílula; o fundo do item ativo desliza entre as opções. */
export function ControleSegmentado<T extends string>({
  opcoes,
  valor,
  aoMudar,
  rotulo,
  tamanho = "padrao",
  sobrePagina = false,
  className,
}: Props<T>) {
  const id = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const aoTeclar = (evento: KeyboardEvent, indice: number) => {
    const passo = evento.key === "ArrowRight" ? 1 : evento.key === "ArrowLeft" ? -1 : 0;
    if (!passo) return;
    evento.preventDefault();
    const proximo = (indice + passo + opcoes.length) % opcoes.length;
    aoMudar(opcoes[proximo].valor);
    refs.current[proximo]?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={rotulo}
      className={cn("inline-flex items-center gap-1 rounded-full p-1", sobrePagina ? "sobre-a-pagina" : "bg-muted", className)}
    >
      {opcoes.map((opcao, indice) => {
        const ativo = opcao.valor === valor;
        return (
          <button
            key={opcao.valor}
            ref={(el) => {
              refs.current[indice] = el;
            }}
            type="button"
            role="radio"
            aria-checked={ativo}
            tabIndex={ativo ? 0 : -1}
            onClick={() => aoMudar(opcao.valor)}
            onKeyDown={(evento) => aoTeclar(evento, indice)}
            className={cn(
              "relative rounded-full font-medium whitespace-nowrap transition-colors duration-200 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              tamanho === "padrao" ? "h-9 px-4 text-sm" : "h-7 px-3 text-xs",
              ativo ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {ativo && (
              <motion.span
                layoutId={`segmento-${id}`}
                className="absolute inset-0 rounded-full bg-primary shadow-sm"
                transition={{ type: "spring", stiffness: 500, damping: 38 }}
              />
            )}
            <span className="relative flex items-center gap-1.5">
              {opcao.rotulo}
              {opcao.contagem !== undefined && (
                <span className={cn("numeros", ativo ? "opacity-80" : "opacity-60")}>{opcao.contagem}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
