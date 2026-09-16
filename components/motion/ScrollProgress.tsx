"use client";

import { useRef } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";

/**
 * Filete dourado no topo, preenchendo conforme a página avança.
 * É o único indicador de progresso do site — dá noção de extensão sem
 * poluir o header.
 */
export default function ScrollProgress() {
  const barra = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const no = barra.current;
      if (!no) return;

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) {
          gsap.set(no, { scaleX: 0 });
          return;
        }

        gsap.fromTo(
          no,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              start: 0,
              end: "max",
              scrub: 0.25,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: barra },
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-px bg-transparent"
    >
      <div
        ref={barra}
        className="h-full origin-left bg-gradient-to-r from-ambar to-ouro-claro"
      />
    </div>
  );
}
