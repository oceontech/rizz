"use client";

import type { ComponentProps, ReactNode } from "react";
import { useCampo } from "@/components/sistema/formulario/contexto-campo";
import { cn } from "@/lib/utils";

/** Props comuns dos smart inputs (o resto vai para o <input>). */
export type PropsBase = Omit<ComponentProps<"input">, "value" | "defaultValue" | "onChange" | "prefix" | "type"> & {
  /** Texto ou ícone fixo à esquerda (ex.: "R$", "+55", "@") */
  prefixo?: ReactNode;
  /** Texto fixo à direita (ex.: "%", "km") */
  sufixo?: ReactNode;
  /** Botão dentro do campo, à direita (ex.: calendário, limpar) */
  acao?: ReactNode;
  /** Classe da caixa externa */
  classeCaixa?: string;
};

/** Liga o campo ao <Campo> em volta: id, aria-invalid e aria-describedby. */
export function useLigacaoCampo(props: Pick<ComponentProps<"input">, "id" | "aria-invalid" | "aria-describedby">) {
  const campo = useCampo();
  const invalido = props["aria-invalid"] === true || props["aria-invalid"] === "true" || Boolean(campo?.invalido);
  return {
    id: props.id ?? campo?.id,
    "aria-invalid": invalido || undefined,
    "aria-describedby": [props["aria-describedby"], campo?.descricaoId].filter(Boolean).join(" ") || undefined,
    invalido,
  };
}

type CaixaProps = {
  prefixo?: ReactNode;
  sufixo?: ReactNode;
  acao?: ReactNode;
  invalido?: boolean;
  desabilitado?: boolean;
  className?: string;
  children: ReactNode;
};

/**
 * Moldura de campo com prefixo, sufixo e ação internos. O foco do <input>
 * acende a moldura inteira (borda azul + halo); erro, em vermelho.
 */
export function Caixa({ prefixo, sufixo, acao, invalido, desabilitado, className, children }: CaixaProps) {
  return (
    <div
      data-slot="caixa-campo"
      data-invalido={invalido || undefined}
      data-desabilitado={desabilitado || undefined}
      className={cn(
        "flex h-11 w-full min-w-0 items-center rounded-lg border border-input bg-card text-base transition-[border-color,box-shadow] duration-150 md:h-10 md:text-sm",
        "hover:border-input-hover focus-within:border-ring focus-within:ring-3 focus-within:ring-primary-suave",
        "data-invalido:border-destructive data-invalido:ring-3 data-invalido:ring-destructive/15",
        "data-desabilitado:pointer-events-none data-desabilitado:opacity-50",
        className,
      )}
    >
      {prefixo && <span className="flex shrink-0 items-center pl-3 text-muted-foreground select-none [&_svg]:size-4">{prefixo}</span>}
      {children}
      {sufixo && <span className="flex shrink-0 items-center pr-3 text-muted-foreground select-none">{sufixo}</span>}
      {acao && <span className="flex shrink-0 items-center pr-1">{acao}</span>}
    </div>
  );
}

/** Classe do <input> sem moldura que fica dentro da Caixa */
export function classeInputInterno(temPrefixo: boolean, className?: string) {
  return cn(
    "h-full w-full min-w-0 flex-1 bg-transparent px-3 outline-none placeholder:text-texto-terciario disabled:cursor-not-allowed",
    temPrefixo && "pl-2",
    className,
  );
}

/** Botão pequeno dentro da caixa (ícone) */
export function BotaoInterno({ className, ...props }: ComponentProps<"button">) {
  return (
    <button
      type="button"
      className={cn(
        "grid size-9 place-items-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground md:size-8 [&_svg]:size-4",
        className,
      )}
      {...props}
    />
  );
}
