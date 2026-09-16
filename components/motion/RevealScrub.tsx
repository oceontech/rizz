"use client";

import {
  useRef,
  type ComponentType,
  type ElementType,
  type ReactNode,
  type Ref,
} from "react";

import { CONDICOES, gsap, SplitText, useGSAP } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  id?: string;
  /** Quanto da rolagem a revelação consome. Maior = mais lenta. */
  alcance?: number;
};

/**
 * Título que sobe linha a linha **atrelado à rolagem**, não disparado por ela.
 *
 * `autoSplit` refaz o corte quando a webfont carrega ou a largura muda — sem
 * ele, as linhas ficam quebradas no lugar errado depois do swap da fonte.
 */
export default function RevealScrub({
  children,
  className,
  as: Tag = "h2",
  id,
  alcance = 45,
}: Props) {
  const raiz = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const no = raiz.current;
      if (!no) return;

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) {
          gsap.set(no, { opacity: 1 });
          return;
        }

        const split = SplitText.create(no, {
          type: "lines",
          mask: "lines",
          autoSplit: true,
          linesClass: "linha-split",
          onSplit(self) {
            return gsap.fromTo(
              self.lines,
              { yPercent: 118, y: 0, opacity: 0 },
              {
                yPercent: 0,
                y: 0,
                opacity: 1,
                ease: "power2.out",
                stagger: 0.12,
                scrollTrigger: {
                  trigger: no,
                  start: "top 88%",
                  end: `top ${88 - alcance}%`,
                  scrub: 0.8,
                },
              },
            );
          },
        });

        return () => split.revert();
      });

      return () => mm.revert();
    },
    { scope: raiz },
  );

  /** Mesmo motivo do Reveal: ver a nota lá sobre a ampliação de JSX do R3F. */
  const Componente = Tag as ComponentType<{
    ref?: Ref<HTMLElement>;
    className?: string;
    id?: string;
    children?: ReactNode;
  }>;

  return (
    <Componente ref={raiz} className={className} id={id}>
      {children}
    </Componente>
  );
}
