"use client";

import { CalendarRange } from "lucide-react";
import { useState } from "react";
import type { DateRange } from "react-day-picker";
import { useDesktop } from "@/hooks/use-media-query";
import {
  type AtalhoPeriodo,
  type Intervalo,
  descreverIntervalo,
  hojeSaoPaulo,
  intervaloDoAtalho,
} from "@/lib/periodos";
import { cn } from "@/lib/utils";
import { Calendario } from "./calendario";
import { GatilhoCampo } from "./gatilho-campo";
import { PainelAdaptavel } from "./painel-adaptavel";

const ATALHOS: { atalho: AtalhoPeriodo; rotulo: string }[] = [
  { atalho: "hoje", rotulo: "Hoje" },
  { atalho: "7d", rotulo: "7 dias" },
  { atalho: "30d", rotulo: "30 dias" },
  { atalho: "este-mes", rotulo: "Este mês" },
  { atalho: "mes-passado", rotulo: "Mês passado" },
];

type Props = {
  valor: Intervalo | undefined;
  aoMudar: (intervalo: Intervalo) => void;
  placeholder?: string;
  maximo?: Date;
  id?: string;
  className?: string;
};

/** Intervalo de datas com atalhos (hoje, 7 dias, 30 dias, este mês, mês passado) e calendário. */
export function SeletorIntervalo({
  valor,
  aoMudar,
  placeholder = "Escolha o período",
  maximo,
  id,
  className,
}: Props) {
  const [aberto, setAberto] = useState(false);

  return (
    <PainelAdaptavel
      aberto={aberto}
      aoMudar={setAberto}
      titulo="Escolha o período"
      gatilho={
        <GatilhoCampo
          id={id}
          icone={CalendarRange}
          valor={valor ? descreverIntervalo(valor) : null}
          placeholder={placeholder}
          className={className}
        />
      }
    >
      <ConteudoIntervalo
        valor={valor}
        maximo={maximo}
        aoEscolher={(intervalo) => {
          aoMudar(intervalo);
          setAberto(false);
        }}
      />
    </PainelAdaptavel>
  );
}

/** Atalho da janela: um do período (o intervalo sai de `intervaloDoAtalho`) ou outro com o intervalo já pronto */
export type AtalhoDoIntervalo = { atalho: string; rotulo: string; intervalo?: Intervalo };

type ConteudoProps = {
  valor: Intervalo | undefined;
  maximo?: Date;
  /** Atalho clicado (null quando o intervalo foi escolhido no calendário) */
  aoEscolher: (intervalo: Intervalo, atalho: string | null) => void;
  atalhos?: AtalhoDoIntervalo[];
  atalhoAtivo?: string | null;
  /** Texto do botão que confirma o calendário */
  rotuloAplicar?: string;
};

/** Atalhos + calendário de intervalo. Reaproveitado pelo seletor de período do topo. */
export function ConteudoIntervalo({ valor, maximo, aoEscolher, atalhos = ATALHOS, atalhoAtivo, rotuloAplicar = "Aplicar" }: ConteudoProps) {
  const desktop = useDesktop();
  const [rascunho, setRascunho] = useState<DateRange | undefined>(
    valor ? { from: valor.de, to: valor.ate } : undefined,
  );

  return (
    <div className="flex flex-col gap-3 md:flex-row">
      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1 md:mx-0 md:w-40 md:flex-col md:overflow-visible md:border-r md:px-0 md:pr-2 md:pb-0">
        {atalhos.map(({ atalho, rotulo, intervalo }) => (
          <button
            key={atalho}
            type="button"
            aria-pressed={atalhoAtivo === atalho}
            onClick={() => aoEscolher(intervalo ?? intervaloDoAtalho(atalho as AtalhoPeriodo, hojeSaoPaulo()), atalho)}
            className={cn(
              "shrink-0 rounded-full bg-muted px-3.5 py-2 text-sm font-medium transition-colors hover:bg-accent",
              "md:rounded-lg md:bg-transparent md:px-3 md:text-left md:hover:bg-muted",
              "aria-pressed:bg-primary-suave aria-pressed:text-primary-texto",
            )}
          >
            {rotulo}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <Calendario
          mode="range"
          numberOfMonths={desktop ? 2 : 1}
          selected={rascunho}
          onSelect={setRascunho}
          defaultMonth={rascunho?.from}
          disabled={maximo ? { after: maximo } : undefined}
          className="mx-auto"
        />
        <div className="flex items-center justify-between gap-3 border-t pt-3">
          <span className="numeros text-sm text-muted-foreground">
            {rascunho?.from
              ? descreverIntervalo({ de: rascunho.from, ate: rascunho.to ?? rascunho.from })
              : "Escolha o início e o fim"}
          </span>
          <button
            type="button"
            disabled={!rascunho?.from}
            onClick={() =>
              rascunho?.from && aoEscolher({ de: rascunho.from, ate: rascunho.to ?? rascunho.from }, null)
            }
            className="h-10 shrink-0 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-[opacity,transform] duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
          >
            {rotuloAplicar}
          </button>
        </div>
      </div>
    </div>
  );
}
