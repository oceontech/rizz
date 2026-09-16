"use client";

import { useId, useRef } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";

/** Comprimento do círculo do texto (raio 72), um pouco menor que a volta
 *  inteira para sobrar o mesmo respiro entre o fim e o começo. */
const CIRCUNFERENCIA = 2 * Math.PI * 72 - 10;

type Props = {
  texto?: string;
  className?: string;
};

/**
 * Selo circular dourado que gira devagar, sem parar.
 *
 * Só o texto, sem fundo, sombra ou ornamento. O giro pausa quando o selo
 * sai da tela, para não gastar quadro à toa.
 */
export default function SeloRotativo({
  texto = "O MAIS PEDIDO · CRIAÇÃO RIZZ ·",
  className,
}: Props) {
  const raiz = useRef<HTMLDivElement>(null);
  const idTrilha = `trilha-selo-${useId().replace(/:/g, "")}`;

  useGSAP(
    () => {
      const no = raiz.current;
      const disco = no?.querySelector("svg");
      if (!no || !disco) return;

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) return;

        const giro = gsap.to(disco, {
          rotate: 360,
          duration: 28,
          ease: "none",
          repeat: -1,
          paused: true,
        });

        // IntersectionObserver, não ScrollTrigger: o selo mora dentro da
        // cena presa do vídeo do camarão, e um gatilho lá dentro calcula as
        // posições sem o espaço do pin — o giro nunca ligava.
        const vista = new IntersectionObserver(([e]) =>
          e.isIntersecting ? giro.play() : giro.pause(),
        );
        vista.observe(no);

        return () => {
          vista.disconnect();
          giro.kill();
        };
      });

      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <div ref={raiz} className={className} aria-hidden>
      <svg
        viewBox="0 0 200 200"
        className="size-full"
        // Dourado um tom abaixo do ouro da marca (#c9a227).
        style={{ color: "#c29d2c" }}
      >
        <defs>
          <path
            id={idTrilha}
            d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0"
            fill="none"
          />
        </defs>
        <text
          fill="currentColor"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {/* Uma volta só, esticada na circunferência exata (2π·72): com o
              texto repetido, o fim encavalava no começo ("PEDIDOO MAIS"). */}
          <textPath
            href={`#${idTrilha}`}
            startOffset="0"
            textLength={CIRCUNFERENCIA}
            lengthAdjust="spacing"
          >
            {texto}
          </textPath>
        </text>
      </svg>
    </div>
  );
}
