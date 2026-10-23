"use client";

import { Clock } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import { GatilhoCampo } from "./gatilho-campo";
import { PainelAdaptavel } from "./painel-adaptavel";

const ALTURA_ITEM = 40;
const ITENS_VISIVEIS = 5;

const doisDigitos = (n: number) => String(n).padStart(2, "0");

type Props = {
  /** "HH:mm" */
  valor: string | undefined;
  aoMudar: (hora: string) => void;
  placeholder?: string;
  /** Intervalo entre os minutos oferecidos */
  passoMinutos?: number;
  id?: string;
  className?: string;
};

/** Hora e minuto em colunas roláveis com snap, no estilo iOS. */
export function SeletorHora({ valor, aoMudar, placeholder = "Escolha a hora", passoMinutos = 5, id, className }: Props) {
  const [aberto, setAberto] = useState(false);

  return (
    <PainelAdaptavel
      aberto={aberto}
      aoMudar={setAberto}
      titulo="Escolha a hora"
      gatilho={
        <GatilhoCampo id={id} icone={Clock} valor={valor} placeholder={placeholder} className={cn("numeros", className)} />
      }
    >
      <ConteudoHora
        valor={valor}
        passoMinutos={passoMinutos}
        aoConfirmar={(hora) => {
          aoMudar(hora);
          setAberto(false);
        }}
      />
    </PainelAdaptavel>
  );
}

export function ConteudoHora({
  valor,
  passoMinutos,
  aoConfirmar,
}: {
  valor: string | undefined;
  passoMinutos: number;
  aoConfirmar: (hora: string) => void;
}) {
  const horas = Array.from({ length: 24 }, (_, i) => doisDigitos(i));
  const minutos = Array.from({ length: Math.ceil(60 / passoMinutos) }, (_, i) => doisDigitos(i * passoMinutos));
  const [horaInicial, minutoInicial] = (valor ?? "09:00").split(":");
  const [hora, setHora] = useState(horas.includes(horaInicial) ? horaInicial : "09");
  const [minuto, setMinuto] = useState(minutos.includes(minutoInicial) ? minutoInicial : "00");

  return (
    <div className="mx-auto flex w-full max-w-xs flex-col gap-3 md:w-60">
      <div className="relative flex items-center justify-center gap-1">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-1/2 h-10 -translate-y-1/2 rounded-lg bg-muted"
        />
        <Roda rotulo="Hora" itens={horas} valor={hora} aoMudar={setHora} />
        <span className="relative text-lg font-semibold text-muted-foreground">:</span>
        <Roda rotulo="Minuto" itens={minutos} valor={minuto} aoMudar={setMinuto} />
      </div>
      <button
        type="button"
        onClick={() => aoConfirmar(`${hora}:${minuto}`)}
        className="h-10 rounded-full bg-primary text-sm font-semibold text-primary-foreground transition-transform duration-150 active:scale-[0.97]"
      >
        Confirmar {hora}:{minuto}
      </button>
    </div>
  );
}

type RodaProps = {
  rotulo: string;
  itens: string[];
  valor: string;
  aoMudar: (valor: string) => void;
};

function Roda({ rotulo, itens, valor, aoMudar }: RodaProps) {
  const ref = useRef<HTMLDivElement>(null);
  const espera = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [visivel, setVisivel] = useState(() => Math.max(0, itens.indexOf(valor)));

  // Posiciona a roda no valor inicial, sem animação
  useLayoutEffect(() => {
    if (ref.current) ref.current.scrollTop = Math.max(0, itens.indexOf(valor)) * ALTURA_ITEM;
    // só na montagem
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => clearTimeout(espera.current), []);

  const irPara = (indice: number) => {
    const limitado = Math.min(itens.length - 1, Math.max(0, indice));
    ref.current?.scrollTo({ top: limitado * ALTURA_ITEM, behavior: "smooth" });
  };

  const aoRolar = () => {
    const el = ref.current;
    if (!el) return;
    const indice = Math.min(itens.length - 1, Math.max(0, Math.round(el.scrollTop / ALTURA_ITEM)));
    setVisivel(indice);
    clearTimeout(espera.current);
    espera.current = setTimeout(() => {
      if (itens[indice] !== valor) aoMudar(itens[indice]);
    }, 80);
  };

  const aoTeclar = (evento: KeyboardEvent) => {
    if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
      evento.preventDefault();
      irPara(visivel + (evento.key === "ArrowDown" ? 1 : -1));
    }
  };

  return (
    <div
      ref={ref}
      role="listbox"
      aria-label={rotulo}
      aria-activedescendant={`${rotulo}-${itens[visivel]}`}
      tabIndex={0}
      onScroll={aoRolar}
      onKeyDown={aoTeclar}
      className="relative w-16 snap-y snap-mandatory overflow-y-auto overscroll-contain rounded-lg outline-none [scrollbar-width:none] focus-visible:ring-3 focus-visible:ring-ring/50 [&::-webkit-scrollbar]:hidden"
      style={{
        height: ALTURA_ITEM * ITENS_VISIVEIS,
        paddingBlock: (ALTURA_ITEM * (ITENS_VISIVEIS - 1)) / 2,
        maskImage: "linear-gradient(to bottom, transparent, black 30%, black 70%, transparent)",
      }}
    >
      {itens.map((item, indice) => {
        const distancia = Math.abs(indice - visivel);
        return (
          <div
            key={item}
            id={`${rotulo}-${item}`}
            role="option"
            aria-selected={indice === visivel}
            onClick={() => irPara(indice)}
            className={cn(
              "numeros flex snap-center items-center justify-center text-lg transition-[opacity,transform] duration-150 select-none",
              indice === visivel ? "font-semibold text-foreground" : "text-muted-foreground",
            )}
            style={{
              height: ALTURA_ITEM,
              opacity: Math.max(0.25, 1 - distancia * 0.3),
              transform: `scale(${Math.max(0.82, 1 - distancia * 0.08)})`,
            }}
          >
            {item}
          </div>
        );
      })}
    </div>
  );
}
