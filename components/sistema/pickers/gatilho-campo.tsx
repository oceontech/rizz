"use client";

import { ChevronDown, type LucideIcon } from "lucide-react";
import { forwardRef, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { CLASSE_VARIANTE, type VarianteSeletor } from "./variantes";

type Props = ComponentProps<"button"> & {
  icone?: LucideIcon;
  valor?: string | null;
  placeholder: string;
  /** "campo" em formulário (padrão); "pilula" para controle solto num card; "pilula-clara" sobre o fundo da página */
  variante?: VarianteSeletor;
};

/** Botão que abre os pickers: com aparência de campo (formulários) ou de pílula (controles soltos na tela). */
export const GatilhoCampo = forwardRef<HTMLButtonElement, Props>(function GatilhoCampo(
  { icone: Icone, valor, placeholder, variante = "campo", className, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "flex h-11 w-full min-w-0 items-center gap-2.5 rounded-lg border border-input bg-card px-3 text-left text-base transition-[border-color,box-shadow] duration-150 outline-none hover:border-input-hover focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-primary-suave disabled:pointer-events-none disabled:opacity-50 aria-expanded:border-ring aria-expanded:ring-3 aria-expanded:ring-primary-suave aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15 md:h-10 md:text-sm",
        CLASSE_VARIANTE[variante],
        className,
      )}
      {...props}
    >
      {Icone && <Icone className="size-4 shrink-0 text-muted-foreground" aria-hidden />}
      <span className={cn("min-w-0 flex-1 truncate", !valor && "text-texto-terciario")}>
        {valor || placeholder}
      </span>
      <ChevronDown className={cn("size-4 shrink-0", variante === "campo" ? "text-muted-foreground" : "text-primary-texto")} aria-hidden />
    </button>
  );
});
