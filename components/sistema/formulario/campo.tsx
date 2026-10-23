"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/sistema/ui/label";
import { cn } from "@/lib/utils";
import { CampoContexto } from "./contexto-campo";

export { useCampo } from "./contexto-campo";

type CampoProps = {
  id: string;
  rotulo: string;
  erro?: string;
  ajuda?: string;
  /** Conteúdo à direita do rótulo (ex.: link "Esqueci minha senha") */
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Rótulo + controle + mensagem de erro ou ajuda, ligados por aria-describedby. */
export function Campo({ id, rotulo, erro, ajuda, extra, children, className }: CampoProps) {
  const descricaoId = erro ? `${id}-erro` : ajuda ? `${id}-ajuda` : undefined;
  return (
    <CampoContexto.Provider value={{ id, descricaoId, invalido: Boolean(erro) }}>
      <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
        <div className="flex min-h-5 items-center justify-between gap-2">
          <span className="flex min-w-0 items-center">
            <Label htmlFor={id} className="text-sm font-medium">
              {rotulo}
            </Label>
            
          </span>
          {extra}
        </div>
        {children}
        {erro ? (
          <p id={`${id}-erro`} role="alert" className="text-[0.8rem] leading-snug text-negativo-texto">
            {erro}
          </p>
        ) : (
          ajuda && (
            <p id={`${id}-ajuda`} className="text-[0.8rem] leading-snug text-muted-foreground">
              {ajuda}
            </p>
          )
        )}
      </div>
    </CampoContexto.Provider>
  );
}
