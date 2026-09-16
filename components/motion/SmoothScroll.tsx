"use client";

import { useEffect } from "react";
import Lenis from "lenis";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/scroll";

/**
 * Lenis é o dono da rolagem — e só no desktop com ponteiro fino.
 *
 * Em touch a rolagem fica 100% nativa: o site é mobile-first e as cenas são
 * medidas em svh/lvh, então interceptar o scroll no celular só criaria briga
 * com a barra de endereço que recolhe.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const querSuavidade = window.matchMedia(
      "(min-width: 1024px) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );

    let lenis: Lenis | null = null;
    let ticker: ((tempo: number) => void) | null = null;

    function ligar() {
      if (lenis) return;

      lenis = new Lenis({
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        wheelMultiplier: 1,
        touchMultiplier: 1.6,
      });

      // O resto do sistema só LÊ a posição — quem avisa é o Lenis.
      lenis.on("scroll", ScrollTrigger.update);

      ticker = (tempo: number) => lenis?.raf(tempo * 1000);
      gsap.ticker.add(ticker);

      setLenis(lenis);
      ScrollTrigger.refresh();
    }

    function desligar() {
      if (!lenis) return;
      if (ticker) gsap.ticker.remove(ticker);
      lenis.destroy();
      lenis = null;
      ticker = null;
      setLenis(null);
      ScrollTrigger.refresh();
    }

    function avaliar() {
      if (querSuavidade.matches) ligar();
      else desligar();
    }

    avaliar();
    querSuavidade.addEventListener("change", avaliar);

    return () => {
      querSuavidade.removeEventListener("change", avaliar);
      desligar();
    };
  }, []);

  return null;
}
