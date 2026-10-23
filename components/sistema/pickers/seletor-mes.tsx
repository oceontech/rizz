"use client";

import { format, isSameMonth, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/sistema/ui/button";
import { cn } from "@/lib/utils";
import { GatilhoCampo } from "./gatilho-campo";
import { PainelAdaptavel } from "./painel-adaptavel";

const MESES = Array.from({ length: 12 }, (_, i) =>
  format(new Date(2026, i, 1), "MMM", { locale: ptBR }).replace(".", ""),
);

/** "Outubro de 2026" */
export function rotuloMes(mes: Date) {
  const texto = format(mes, "MMMM 'de' yyyy", { locale: ptBR });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

type Props = {
  /** Primeiro dia do mês escolhido */
  valor: Date | undefined;
  aoMudar: (mes: Date) => void;
  placeholder?: string;
  minimo?: Date;
  maximo?: Date;
  id?: string;
  className?: string;
};

/** Grade de 12 meses com navegação por ano. */
export function SeletorMes({ valor, aoMudar, placeholder = "Escolha o mês", minimo, maximo, id, className }: Props) {
  const [aberto, setAberto] = useState(false);

  return (
    <PainelAdaptavel
      aberto={aberto}
      aoMudar={setAberto}
      titulo="Escolha o mês"
      gatilho={
        <GatilhoCampo
          id={id}
          icone={CalendarDays}
          valor={valor ? rotuloMes(valor) : null}
          placeholder={placeholder}
          className={className}
        />
      }
    >
      <GradeMeses
        valor={valor}
        minimo={minimo}
        maximo={maximo}
        aoEscolher={(mes) => {
          aoMudar(mes);
          setAberto(false);
        }}
      />
    </PainelAdaptavel>
  );
}

type GradeProps = {
  valor: Date | undefined;
  minimo?: Date;
  maximo?: Date;
  aoEscolher: (mes: Date) => void;
};

export function GradeMeses({ valor, minimo, maximo, aoEscolher }: GradeProps) {
  const [ano, setAno] = useState(() => (valor ?? new Date()).getFullYear());
  const atual = new Date();
  const fora = (mes: Date) =>
    (minimo !== undefined && mes < startOfMonth(minimo)) || (maximo !== undefined && mes > startOfMonth(maximo));

  return (
    <div className="mx-auto w-full max-w-xs p-1 md:w-72">
      <div className="mb-3 flex items-center justify-between">
        <Button variant="ghost" size="icon-sm" onClick={() => setAno(ano - 1)} aria-label="Ano anterior">
          <ChevronLeft />
        </Button>
        <span className="numeros text-sm font-semibold">{ano}</span>
        <Button variant="ghost" size="icon-sm" onClick={() => setAno(ano + 1)} aria-label="Próximo ano">
          <ChevronRight />
        </Button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {MESES.map((nome, indice) => {
          const mes = new Date(ano, indice, 1);
          const selecionado = valor !== undefined && isSameMonth(mes, valor);
          const corrente = isSameMonth(mes, atual);
          return (
            <button
              key={nome}
              type="button"
              disabled={fora(mes)}
              aria-pressed={selecionado}
              aria-label={rotuloMes(mes)}
              onClick={() => aoEscolher(mes)}
              className={cn(
                "h-11 rounded-lg text-sm capitalize transition-[background-color,color,transform] duration-150 active:scale-[0.96]",
                "hover:bg-muted disabled:pointer-events-none disabled:opacity-40",
                corrente && !selecionado && "font-semibold text-primary-texto",
                selecionado && "bg-primary font-semibold text-primary-foreground hover:bg-primary/90",
              )}
            >
              {nome}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Atalhos do mês, contados a partir do mês de hoje */
export const ATALHOS_MES = [
  { atalho: "este-mes", rotulo: "Este mês", meses: 0 },
  { atalho: "mes-passado", rotulo: "Mês passado", meses: 1 },
  { atalho: "ha-2-meses", rotulo: "Há 2 meses", meses: 2 },
  { atalho: "ha-1-ano", rotulo: "Há 1 ano", meses: 12 },
] as const;

type ConteudoMesProps = GradeProps & { hoje: Date };

/**
 * A janela do mês no mesmo formato da do período (Tráfego): atalhos ao lado (no celular, em pílulas por cima) e a
 * grade de meses. O topo de Resultados usa esta janela.
 */
export function ConteudoMes({ valor, minimo, maximo, aoEscolher, hoje }: ConteudoMesProps) {
  const base = startOfMonth(hoje);
  return (
    <div className="flex flex-col gap-3 md:flex-row">
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 md:mx-0 md:w-40 md:flex-col md:overflow-visible md:border-r md:px-0 md:pr-2 md:pb-0">
        {ATALHOS_MES.map(({ atalho, rotulo, meses }) => {
          const mes = new Date(base.getFullYear(), base.getMonth() - meses, 1);
          return (
            <button
              key={atalho}
              type="button"
              aria-pressed={valor !== undefined && isSameMonth(mes, valor)}
              onClick={() => aoEscolher(mes)}
              className={cn(
                "shrink-0 rounded-full bg-muted px-3.5 py-2 text-sm font-medium transition-colors hover:bg-accent",
                "md:rounded-lg md:bg-transparent md:px-3 md:text-left md:hover:bg-muted",
                "aria-pressed:bg-primary-suave aria-pressed:text-primary-texto",
              )}
            >
              {rotulo}
            </button>
          );
        })}
      </div>
      <GradeMeses valor={valor} minimo={minimo} maximo={maximo} aoEscolher={aoEscolher} />
    </div>
  );
}
