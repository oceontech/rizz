"use client";

import { useRef, type ElementType, type ReactNode } from "react";

import { gsap, useGSAP } from "@/lib/gsap";

type Props = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Atraso em segundos depois de entrar em cena. */
  delay?: number;
  /** Deslocamento vertical inicial, em pixels. */
  y?: number;
  /** Anima os filhos diretos em cascata em vez do bloco inteiro. */
  stagger?: boolean;
  id?: string;
};

/**
 * Entrada padrão do site.
 *
 * Sempre fromTo: com `from` puro, um ScrollTrigger.refresh() reaplica o estado
 * inicial e a seção some da tela. E sempre com ramo "still" no matchMedia,
 * para quem pediu menos movimento ver o conteúdo parado, não invisível.
 */
export default function Reveal({
  children,
  className,
  as: Tag = "div",
  delay = 0,
  y = 28,
  stagger = false,
  id,
}: Props) {
  const raiz = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const no = raiz.current;
      if (!no) return;

      const alvos: Element[] = stagger ? Array.from(no.children) : [no];
      if (!alvos.length) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          movimento: "(prefers-reduced-motion: no-preference)",
          parado: "(prefers-reduced-motion: reduce)",
        },
        (contexto) => {
          if (contexto.conditions?.parado) {
            gsap.set(alvos, { opacity: 1, y: 0 });
            return;
          }

          gsap.fromTo(
            alvos,
            { opacity: 0, y, x: 0 },
            {
              opacity: 1,
              y: 0,
              x: 0,
              duration: 0.95,
              delay,
              ease: "power3.out",
              stagger: stagger ? 0.09 : 0,
              scrollTrigger: {
                trigger: no,
                start: "top 88%",
                once: true,
              },
            },
          );
        },
      );

      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <Tag ref={raiz} className={className} id={id}>
      {children}
    </Tag>
  );
}
