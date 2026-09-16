"use client";

import { useRef } from "react";

import { CONDICOES, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

const palavras = [
  "Risotos",
  "Massas",
  "Red Angus",
  "Cordeiro",
  "Peixes",
  "Trufas",
  "Vinhos",
];

/**
 * Faixa infinita cuja velocidade — e direção — respondem à rolagem.
 *
 * Rolar para baixo acelera para a esquerda; rolar para cima inverte. Parada,
 * ela segue devagar. É o detalhe que faz a página parecer viva sem pedir nada
 * do usuário.
 */
export default function Marquee() {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const no = raiz.current;
      const trilho = no?.querySelector("[data-trilho]");
      if (!no || !trilho) return;

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) return;

        // Metade do trilho é a duplicata, então -50% fecha o ciclo.
        const loop = gsap.to(trilho, {
          xPercent: -50,
          x: 0,
          repeat: -1,
          duration: 26,
          ease: "none",
        });

        let direcao = 1;

        const gatilho = ScrollTrigger.create({
          trigger: no,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            const v = self.getVelocity();
            const sinal = self.direction;

            if (sinal !== direcao) {
              direcao = sinal;
              gsap.to(loop, {
                timeScale: sinal,
                duration: 0.4,
                overwrite: true,
              });
            }

            // Empurrão proporcional à velocidade, com teto para não embolar.
            const impulso = gsap.utils.clamp(1, 7, 1 + Math.abs(v) / 420);
            gsap.to(loop, {
              timeScale: sinal * impulso,
              duration: 0.25,
              overwrite: true,
            });
          },
        });

        return () => {
          gatilho.kill();
          loop.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: raiz },
  );

  const fila = (
    <ul className="flex shrink-0 items-center" aria-hidden>
      {palavras.map((p) => (
        <li key={p} className="flex items-center">
          <span className="whitespace-nowrap px-7 font-display text-2xl italic text-creme/80 md:px-10 md:text-4xl">
            {p}
          </span>
          {/* Losango discreto como separador. */}
          <span className="size-1 shrink-0 rotate-45 bg-ouro/70" />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      ref={raiz}
      className="overflow-hidden border-y border-creme/12 bg-noite-2 py-5 md:py-7"
    >
      <div className="flex [mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]">
        <div data-trilho className="flex will-change-transform">
          {fila}
          {fila}
        </div>
      </div>
      <p className="sr-only">Especialidades da casa: {palavras.join(", ")}.</p>
    </div>
  );
}
