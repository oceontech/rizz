"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { ScrollTrigger } from "@/lib/gsap";

/**
 * Remede as cenas quando a altura da página muda por fora do GSAP:
 * troca de rota, fontes que terminam de carregar, mídia que decodifica.
 * Sem isso, o start/end das ScrollTriggers fica calculado em cima de uma
 * página que ainda não tinha altura final.
 */
export default function ScrollRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    let vivo = true;

    document.fonts?.ready.then(() => {
      if (vivo) ScrollTrigger.refresh();
    });

    // Imagens com lazy loading mudam a altura ao entrar em cena.
    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      vivo = false;
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return null;
}
