"use client";

import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";

type Props = {
  para: number;
  decimais?: number;
  sufixo?: string;
  prefixo?: string;
  className?: string;
};

/**
 * Número que conta ao entrar em cena (nota média, total de avaliações).
 * O valor final já vai no HTML — a animação só reescreve o texto — para o
 * número existir mesmo sem JS e para leitores de tela lerem o valor certo.
 */
export default function Counter({
  para,
  decimais = 0,
  sufixo = "",
  prefixo = "",
  className,
}: Props) {
  const raiz = useRef<HTMLSpanElement>(null);

  const formatar = (valor: number) =>
    valor.toLocaleString("pt-BR", {
      minimumFractionDigits: decimais,
      maximumFractionDigits: decimais,
    });

  useGSAP(
    () => {
      const no = raiz.current;
      if (!no) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          movimento: "(prefers-reduced-motion: no-preference)",
          parado: "(prefers-reduced-motion: reduce)",
        },
        (contexto) => {
          if (contexto.conditions?.parado) return;

          const estado = { valor: 0 };

          gsap.fromTo(
            estado,
            { valor: 0 },
            {
              valor: para,
              duration: 1.6,
              ease: "power2.out",
              onUpdate() {
                no.textContent = `${prefixo}${formatar(estado.valor)}${sufixo}`;
              },
              scrollTrigger: { trigger: no, start: "top 92%", once: true },
            },
          );
        },
      );

      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <span ref={raiz} className={className}>
      {`${prefixo}${formatar(para)}${sufixo}`}
    </span>
  );
}
