"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import { ScrollTrigger } from "@/lib/gsap";

/**
 * Remede as cenas quando a altura da página muda por fora do GSAP:
 * troca de rota, fontes que terminam de carregar, mídia que decodifica.
 * Sem isso, o start/end das ScrollTriggers fica calculado em cima de uma
 * página que ainda não tinha altura final.
 *
 * Fontes e `load` só remedem se a altura da página mudou desde o último
 * refresh. O refresh leva a página ao topo para medir e depois devolve a
 * posição; no celular com rede lenta o `load` chega quando a pessoa já
 * começou a rolar (o GSAP adia para o fim do gesto), e a página dava um
 * tranco logo após a primeira rolagem do hero — no iPhone ainda com a
 * barra de endereço voltando. Na maioria das vezes a altura nem mudou
 * (imagens e vídeos têm espaço reservado), então não há o que remedir.
 */
export default function ScrollRefresh() {
  const pathname = usePathname();

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  useEffect(() => {
    let vivo = true;
    let altura = -1;
    const anotar = () => {
      altura = document.documentElement.scrollHeight;
    };
    ScrollTrigger.addEventListener("refresh", anotar);

    const seMudou = () => {
      if (vivo && document.documentElement.scrollHeight !== altura) ScrollTrigger.refresh();
    };

    document.fonts?.ready.then(seMudou);
    window.addEventListener("load", seMudou);

    return () => {
      vivo = false;
      ScrollTrigger.removeEventListener("refresh", anotar);
      window.removeEventListener("load", seMudou);
    };
  }, []);

  return null;
}
