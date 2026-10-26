import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  icone: LucideIcon;
  titulo: string;
  descricao?: string;
  /** Botão ou link com a ação que resolve o vazio */
  acao?: ReactNode;
  className?: string;
};

/** Lista ou tela sem conteúdo: ilustração leve, orientação e a ação seguinte. */
export function EstadoVazio({ icone: Icone, titulo, descricao, acao, className }: Props) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <div aria-hidden className="relative mb-6 grid size-24 place-items-center">
        <div className="absolute inset-0 rotate-6 rounded-[28px] bg-secao/10" />
        <div className="absolute inset-2 -rotate-3 rounded-[22px] bg-secao/6" />
        <div className="relative grid size-14 place-items-center rounded-2xl bg-card shadow-suave">
          <Icone className="size-6 text-secao-texto" strokeWidth={1.75} />
        </div>
      </div>
      <h3 className="text-base font-semibold text-balance">{titulo}</h3>
      {descricao && <p className="mt-1.5 max-w-sm text-sm text-pretty text-muted-foreground">{descricao}</p>}
      {acao && <div className="mt-6">{acao}</div>}
    </div>
  );
}
