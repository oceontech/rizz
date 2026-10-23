"use client";

import { animate, AnimatePresence, motion, useInView, useReducedMotion, type Variants } from "motion/react";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { moeda, numero, percentual } from "@/lib/formatos";

// Presets de movimento do Ge System (seção 4.6): 150–350ms, mola em overlays,
// e só fades curtos com prefers-reduced-motion.

export const MOLA = { type: "spring", stiffness: 420, damping: 36, mass: 0.9 } as const;
const SUAVE = [0.22, 1, 0.36, 1] as const;

/** Entrada de página: fade + leve deslocamento. */
export function TransicaoPagina({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: SUAVE }}
    >
      {children}
    </motion.div>
  );
}

/**
 * Troca de etapa de um passo a passo: a tela nova entra do lado para onde se anda e a antiga sai pelo outro.
 * Com "reduzir movimento", só um fade curto.
 */
export function TrocaDeEtapa({ chave, sentido, children, className }: { chave: string; sentido: 1 | -1; children: ReactNode; className?: string }) {
  const reduzir = useReducedMotion();
  const desvio = reduzir ? 0 : 28;
  return (
    <AnimatePresence mode="wait" initial={false} custom={sentido}>
      <motion.div
        key={chave}
        className={className}
        custom={sentido}
        variants={{
          entra: (s: number) => ({ opacity: 0, x: s * desvio }),
          centro: { opacity: 1, x: 0 },
          sai: (s: number) => ({ opacity: 0, x: s * -desvio }),
        }}
        initial="entra"
        animate="centro"
        exit="sai"
        transition={{ duration: reduzir ? 0.12 : 0.24, ease: SUAVE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

const lista: Variants = {
  oculto: {},
  visivel: { transition: { staggerChildren: 0.045, delayChildren: 0.04 } },
};

const item: Variants = {
  oculto: { opacity: 0, y: 10 },
  visivel: { opacity: 1, y: 0, transition: { duration: 0.28, ease: SUAVE } },
};

/** Cards e listas que entram em sequência curta. Use com ItemEscalonado. */
export function ListaEscalonada({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={lista} initial="oculto" animate="visivel">
      {children}
    </motion.div>
  );
}

export function ItemEscalonado({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={item}>
      {children}
    </motion.div>
  );
}

const FORMATOS = {
  numero: (valor: number) => numero(valor),
  moeda,
  percentual: (valor: number) => percentual(valor),
  /** Fatias grandes (parte do total): sem casas */
  percentual0: (valor: number) => percentual(valor, 0),
  /** Taxas pequenas (CTR, conversão): duas casas */
  percentual2: (valor: number) => percentual(valor, 2),
  decimal: (valor: number) => numero(valor, 2),
};

/**
 * Dentro dele, os números aparecem já no valor final, sem contar a partir do zero. É para a página de
 * impressão: no PDF os slides de baixo nunca "aparecem na tela", e a contagem ficaria parada no zero.
 */
export const NumerosSemContagem = createContext(false);

/** Número que conta até o valor final quando aparece na tela. */
export function NumeroAnimado({
  valor,
  formato = "numero",
  className,
}: {
  valor: number;
  formato?: keyof typeof FORMATOS;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const visivel = useInView(ref, { once: true });
  const reduzir = useReducedMotion();
  const semContagem = useContext(NumerosSemContagem);
  const [exibido, setExibido] = useState(0);

  useEffect(() => {
    if (!visivel || reduzir) return;
    const controle = animate(0, valor, { duration: 0.9, ease: SUAVE, onUpdate: setExibido });
    return () => controle.stop();
  }, [visivel, reduzir, valor]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{FORMATOS[formato](valor)}</span>
      <span aria-hidden className="numeros">
        {/* Antes de aparecer, 0 (igual no servidor e no navegador) */}
        {FORMATOS[formato](semContagem ? valor : visivel ? (reduzir ? valor : exibido) : 0)}
      </span>
    </span>
  );
}
