"use client";

import { Card, buttonVariants } from "@heroui/react";
import NextLink from "next/link";

/** Cabeçalho padrão das páginas do painel. */
export function Cabecalho({
  titulo,
  descricao,
  acoes,
}: {
  titulo: string;
  descricao?: string;
  acoes?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
      <div className="min-w-0">
        <h1 className="titulo-display text-[2rem] leading-tight text-accent sm:text-[2.5rem]">
          {titulo}
        </h1>
        {descricao && <p className="mt-1 max-w-2xl text-sm text-muted">{descricao}</p>}
      </div>
      {acoes && <div className="flex shrink-0 flex-wrap gap-2">{acoes}</div>}
    </div>
  );
}

/** Indicador numérico do painel. */
export function Kpi({
  rotulo,
  valor,
  detalhe,
  icone,
  tom = "default",
}: {
  rotulo: string;
  valor: React.ReactNode;
  detalhe?: React.ReactNode;
  icone?: React.ReactNode;
  tom?: "default" | "accent" | "warning" | "success";
}) {
  const tons = {
    default: "bg-default text-foreground",
    accent: "bg-accent/10 text-accent",
    warning: "bg-warning/15 text-[oklch(0.5_0.14_60)]",
    success: "bg-success/12 text-success",
  } as const;

  return (
    <Card className="gap-3 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">{rotulo}</p>
        {icone && (
          <span className={`grid size-9 place-items-center rounded-xl ${tons[tom]}`}>{icone}</span>
        )}
      </div>
      <p className="text-3xl font-medium tabular-nums tracking-tight">{valor}</p>
      {detalhe && <p className="text-xs text-muted">{detalhe}</p>}
    </Card>
  );
}

/** Link do Next com a aparência do Button do HeroUI (sem aninhar interativos). */
export function BotaoLink({
  href,
  variant = "primary",
  size = "md",
  className = "",
  children,
}: {
  href: string;
  variant?: "primary" | "secondary" | "tertiary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <NextLink href={href} className={`${buttonVariants({ variant, size })} ${className}`}>
      {children}
    </NextLink>
  );
}
