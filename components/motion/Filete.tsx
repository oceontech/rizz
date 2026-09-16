"use client";

import { useRef } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";

type Props = {
  className?: string;
  /** Lado a partir do qual o filete cresce. */
  origem?: "left" | "center";
};

/**
 * Filete dourado que se desenha conforme a seção entra.
 * Repete o traço sob cada título de categoria do cardápio impresso.
 */
export default function Filete({ className = "", origem = "left" }: Props) {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const no = raiz.current;
      if (!no) return;

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) {
          gsap.set(no, { scaleX: 1 });
          return;
        }

        gsap.fromTo(
          no,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: no,
              start: "top 92%",
              end: "top 55%",
              scrub: 0.6,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <div
      ref={raiz}
      aria-hidden
      className={`h-px bg-ouro/55 ${
        origem === "center" ? "origin-center" : "origin-left"
      } ${className}`}
    />
  );
}
