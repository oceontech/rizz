"use client";

import { useRef } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";

type Props = {
  texto?: string;
  className?: string;
};

/**
 * Selo circular cujo giro é **conduzido pela rolagem**, não por um loop de
 * CSS. Parar de girar quando a página para é o que faz o elemento parecer
 * preso à cena em vez de um enfeite animado por cima dela.
 */
export default function SeloRotativo({
  texto = "O MAIS PEDIDO · CRIAÇÃO RIZZ · ",
  className,
}: Props) {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const no = raiz.current;
      const disco = no?.querySelector("svg");
      if (!no || !disco) return;

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) return;

        gsap.fromTo(
          disco,
          { rotate: -70 },
          {
            rotate: 70,
            ease: "none",
            scrollTrigger: {
              trigger: no,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.5,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <div ref={raiz} className={className} aria-hidden>
      <svg viewBox="0 0 200 200" className="size-full">
        <defs>
          <path
            id="trilha-selo"
            d="M100,100 m-74,0 a74,74 0 1,1 148,0 a74,74 0 1,1 -148,0"
            fill="none"
          />
        </defs>
        <text
          fill="currentColor"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            fontWeight: 500,
            letterSpacing: "0.2em",
          }}
        >
          <textPath href="#trilha-selo" startOffset="0">
            {texto.repeat(2)}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
