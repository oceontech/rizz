"use client";

import { RotateCw, TriangleAlert } from "lucide-react";
import { Button } from "@/components/sistema/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  titulo?: string;
  descricao?: string;
  aoTentarDeNovo?: () => void;
  className?: string;
};

/** Erro com mensagem humana e botão para tentar de novo. */
export function EstadoErro({
  titulo = "Não foi possível carregar esta parte",
  descricao = "Verifique sua conexão e tente de novo. Se continuar, avise o administrador.",
  aoTentarDeNovo,
  className,
}: Props) {
  return (
    <div role="alert" className={cn("flex flex-col items-center px-6 py-14 text-center", className)}>
      <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-negativo/10">
        <TriangleAlert className="size-6 text-negativo-texto" strokeWidth={1.75} aria-hidden />
      </div>
      <h3 className="text-base font-semibold">{titulo}</h3>
      <p className="mt-1.5 max-w-sm text-sm text-pretty text-muted-foreground">{descricao}</p>
      {aoTentarDeNovo && (
        <Button variant="secondary" className="mt-6 rounded-full" onClick={aoTentarDeNovo}>
          <RotateCw data-icon="inline-start" />
          Tentar de novo
        </Button>
      )}
    </div>
  );
}
