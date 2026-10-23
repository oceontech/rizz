"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type KeyboardEvent } from "react";

import { cn } from "@/lib/utils";

const SEMANA = ["D", "S", "T", "Q", "Q", "S", "S"];
const SEMANA_EXTENSO = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];

const iso = (a: number, m: number, d: number) =>
  `${a}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

function partes(dia: string) {
  const [a, m, d] = dia.split("-").map(Number);
  return { a, m: m - 1, d };
}

function rotuloMes(a: number, m: number) {
  const t = new Date(a, m, 1).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/**
 * Calendário de um mês, com dias grandes para o dedo. Dias fora do intervalo
 * ou sem reserva ficam apagados; hoje ganha um ponto; o escolhido, o vinho.
 * Setas do teclado andam entre os dias.
 */
export default function CalendarioReserva({
  hoje,
  ate,
  fechados,
  valor,
  aoEscolher,
}: {
  hoje: string;
  ate: string;
  fechados: Set<string>;
  valor: string | null;
  aoEscolher: (dia: string) => void;
}) {
  const inicial = partes(valor ?? hoje);
  const [mes, setMes] = useState({ a: inicial.a, m: inicial.m });
  const [sentido, setSentido] = useState<1 | -1>(1);
  const reduzir = useReducedMotion();

  const min = partes(hoje);
  const max = partes(ate);
  const podeVoltar = mes.a > min.a || (mes.a === min.a && mes.m > min.m);
  const podeAvancar = mes.a < max.a || (mes.a === max.a && mes.m < max.m);

  function andar(passo: 1 | -1) {
    setSentido(passo);
    setMes(({ a, m }) => {
      const n = m + passo;
      return { a: a + Math.floor(n / 12), m: ((n % 12) + 12) % 12 };
    });
  }

  const primeiroDia = new Date(mes.a, mes.m, 1).getDay();
  const diasNoMes = new Date(mes.a, mes.m + 1, 0).getDate();
  const celulas: (string | null)[] = [
    ...Array.from({ length: primeiroDia }, () => null),
    ...Array.from({ length: diasNoMes }, (_, i) => iso(mes.a, mes.m, i + 1)),
  ];

  const disponivel = (d: string) => d >= hoje && d <= ate && !fechados.has(d);

  function aoTeclar(e: KeyboardEvent<HTMLButtonElement>, dia: string) {
    const passos: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    const passo = passos[e.key];
    if (!passo) return;
    e.preventDefault();
    const { a, m, d } = partes(dia);
    const alvo = new Date(a, m, d + passo);
    const chave = iso(alvo.getFullYear(), alvo.getMonth(), alvo.getDate());
    if (alvo.getMonth() !== mes.m) andar(passo > 0 ? 1 : -1);
    requestAnimationFrame(() =>
      document.querySelector<HTMLButtonElement>(`[data-dia="${chave}"]`)?.focus(),
    );
  }

  return (
    <div className="w-full select-none">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[17px] font-semibold tracking-tight" aria-live="polite">
          {rotuloMes(mes.a, mes.m)}
        </p>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() => andar(-1)}
            disabled={!podeVoltar}
            aria-label="Mês anterior"
            className="grid size-10 place-items-center rounded-full text-primary-texto transition-colors outline-none hover:bg-superficie focus-visible:ring-3 focus-visible:ring-primary-suave disabled:text-texto-terciario disabled:hover:bg-transparent"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => andar(1)}
            disabled={!podeAvancar}
            aria-label="Próximo mês"
            className="grid size-10 place-items-center rounded-full text-primary-texto transition-colors outline-none hover:bg-superficie focus-visible:ring-3 focus-visible:ring-primary-suave disabled:text-texto-terciario disabled:hover:bg-transparent"
          >
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center" aria-hidden>
        {SEMANA.map((s, i) => (
          <span key={i} className="pb-2 text-[11px] font-semibold text-texto-terciario">
            {s}
          </span>
        ))}
      </div>

      <div className="relative overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={sentido}>
          <motion.div
            key={`${mes.a}-${mes.m}`}
            custom={sentido}
            initial={{ opacity: 0, x: reduzir ? 0 : sentido * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: reduzir ? 0 : sentido * -40 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            role="grid"
            aria-label={rotuloMes(mes.a, mes.m)}
            className="grid grid-cols-7 gap-y-1"
          >
            {celulas.map((dia, i) => {
              if (!dia) return <span key={`v${i}`} />;
              const livre = disponivel(dia);
              const escolhido = dia === valor;
              const { d } = partes(dia);
              const data = new Date(mes.a, mes.m, d);
              return (
                <div key={dia} className="flex justify-center" role="gridcell">
                  <button
                    type="button"
                    data-dia={dia}
                    disabled={!livre}
                    aria-pressed={escolhido}
                    aria-label={`${SEMANA_EXTENSO[data.getDay()]}, ${d} de ${data.toLocaleDateString("pt-BR", { month: "long" })}${
                      dia === hoje ? ", hoje" : ""
                    }${!livre && dia >= hoje && dia <= ate ? ", sem reservas" : ""}`}
                    tabIndex={escolhido || (!valor && dia === hoje) ? 0 : -1}
                    onClick={() => aoEscolher(dia)}
                    onKeyDown={(e) => aoTeclar(e, dia)}
                    className={cn(
                      "relative grid aspect-square w-full max-w-12 place-items-center rounded-full text-[17px] transition-[background-color,color,transform] duration-150 outline-none focus-visible:ring-3 focus-visible:ring-primary/30 active:scale-95",
                      escolhido
                        ? "bg-primary font-semibold text-white"
                        : livre
                          ? "font-medium hover:bg-superficie"
                          : "text-texto-terciario/70 line-through decoration-transparent",
                      dia === hoje && !escolhido && livre && "text-primary-texto",
                    )}
                  >
                    <span className="numeros">{d}</span>
                    {dia === hoje && (
                      <span
                        aria-hidden
                        className={cn(
                          "absolute bottom-1.5 size-1 rounded-full",
                          escolhido ? "bg-white" : "bg-primary",
                        )}
                      />
                    )}
                  </button>
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
