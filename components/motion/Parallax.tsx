"use client";

import { useRef, type ReactNode } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  className?: string;
  /** Deslocamento total, em % da altura da janela. 8–16 é o intervalo útil. */
  forca?: number;
  /** Direção do movimento interno. */
  eixo?: "y" | "x";
};

/**
 * Janela com camada interna que desliza mais devagar que a página.
 *
 * A camada nasce maior que a janela (scale) justamente para ter folga: sem
 * isso, o deslocamento mostraria a borda do recorte.
 */
export default function Parallax({
  children,
  className = "",
  forca = 12,
  eixo = "y",
}: Props) {
  const janela = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const no = janela.current;
      const camada = no?.firstElementChild;
      if (!no || !camada) return;

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) {
          gsap.set(camada, { scale: 1, yPercent: 0, xPercent: 0, x: 0, y: 0 });
          return;
        }

        const escala = 1 + (forca * 2) / 100;
        const de = eixo === "y" ? { yPercent: -forca } : { xPercent: -forca };
        const para = eixo === "y" ? { yPercent: forca } : { xPercent: forca };

        gsap.fromTo(
          camada,
          { ...de, x: 0, y: 0, scale: escala },
          {
            ...para,
            x: 0,
            y: 0,
            scale: escala,
            ease: "none",
            scrollTrigger: {
              trigger: no,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: janela },
  );

  return (
    <div ref={janela} className={`parallax-janela ${className}`}>
      <div className="parallax-camada size-full">{children}</div>
    </div>
  );
}
