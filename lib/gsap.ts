"use client";

/**
 * Ponto ÚNICO de importação do GSAP.
 *
 * Nenhum componente importa "gsap" direto: registrar plugin em mais de um
 * lugar cria instâncias concorrentes, e é daí que vêm as cenas que "somem"
 * depois de um refresh().
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText, useGSAP);

  ScrollTrigger.config({
    // No mobile a barra de endereço recolhe e muda a altura da viewport.
    // Sem isso, toda rolagem vira um refresh() e as cenas medidas em svh
    // ficam saltando.
    ignoreMobileResize: true,
    limitCallbacks: true,
  });

  // O Lenis dirige o relógio quando está ativo; sem lag smoothing o scrub
  // dá um salto ao voltar de uma aba em segundo plano.
  gsap.ticker.lagSmoothing(0);

  gsap.defaults({ ease: "power3.out", duration: 0.9 });
}

/**
 * Atalho para o par de condições que todo componente de movimento usa.
 * O ramo "parado" existe para quem pediu menos movimento ver o conteúdo
 * parado — nunca invisível.
 */
export const CONDICOES = {
  movimento: "(prefers-reduced-motion: no-preference)",
  parado: "(prefers-reduced-motion: reduce)",
} as const;

export { gsap, ScrollTrigger, ScrollToPlugin, SplitText, useGSAP };
