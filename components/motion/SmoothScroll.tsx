"use client";

import { useEffect } from "react";
import Lenis from "lenis";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/scroll";

/**
 * Lenis é o dono da rolagem só no desktop com ponteiro fino. No toque a
 * rolagem é 100% nativa: a inércia do próprio sistema é a que o usuário
 * conhece, e o `syncTouch` do Lenis deixava o celular pesado e travado.
 *
 * Usa `lerp` (e não `duration`) de propósito. Com `duration`, cada giro da
 * roda empurra o alvo para frente e a página corre atrás dele com a mesma
 * curva, não importa a distância: nas cenas presas (vídeo do camarão,
 * trilho de pratos) o usuário gira muito, o alvo dispara, e quando a cena
 * solta a página "ganha energia". Com `lerp` a aproximação é proporcional
 * e a inércia acaba junto com o gesto.
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
        lerp: 0.1,
        wheelMultiplier: 0.9,
        smoothWheel: true,
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
