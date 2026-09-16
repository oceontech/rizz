"use client";

import { useEffect } from "react";
import Lenis from "lenis";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/scroll";

/**
 * Lenis é o dono da rolagem em todos os aparelhos — só fica de fora para
 * quem pediu menos movimento.
 *
 * Usa `lerp` (e não `duration`) de propósito. Com `duration`, cada giro da
 * roda empurra o alvo para frente e a página corre atrás dele com a mesma
 * curva, não importa a distância: nas cenas presas (vídeo do camarão,
 * trilho de pratos) o usuário gira muito, o alvo dispara, e quando a cena
 * solta a página "ganha energia". Com `lerp` a aproximação é proporcional
 * e a inércia acaba junto com o gesto.
 *
 * No touch, `syncTouch` troca a inércia nativa pela do Lenis, com expoente
 * mais baixo que o padrão (1.7) pelo mesmo motivo: um peteleco dentro de
 * uma cena presa não pode virar um arremesso quando ela libera.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const querSuavidade = window.matchMedia("(prefers-reduced-motion: no-preference)");

    let lenis: Lenis | null = null;
    let ticker: ((tempo: number) => void) | null = null;

    function ligar() {
      if (lenis) return;

      lenis = new Lenis({
        lerp: 0.1,
        wheelMultiplier: 0.9,
        smoothWheel: true,
        syncTouch: true,
        syncTouchLerp: 0.09,
        touchInertiaExponent: 1.35,
        touchMultiplier: 1,
        // Trilhos com overflow-x (cards de pratos) seguem arrastáveis de lado.
        allowNestedScroll: true,
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
