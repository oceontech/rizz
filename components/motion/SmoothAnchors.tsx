"use client";

import { useEffect } from "react";

import { scrollToTarget } from "@/lib/scroll";

/**
 * Âncoras internas (#secao) viram rolagem suave via delegação de evento.
 *
 * Usa <a> comum de propósito: next/link faria uma navegação de rota para
 * chegar ao mesmo lugar, o que zera a posição e briga com o dono da rolagem.
 */
export default function SmoothAnchors() {
  useEffect(() => {
    function aoClicar(evento: MouseEvent) {
      if (evento.defaultPrevented || evento.button !== 0) return;
      if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey)
        return;

      const alvo = (evento.target as HTMLElement | null)?.closest("a");
      if (!alvo) return;

      const href = alvo.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;
      if (alvo.hasAttribute("download") || alvo.target === "_blank") return;

      const destino = document.querySelector<HTMLElement>(href);
      if (!destino) return;

      evento.preventDefault();
      scrollToTarget(destino);

      // Mantém a URL compartilhável sem provocar o pulo nativo do browser.
      window.history.replaceState(null, "", href);

      // Acessibilidade: o foco precisa acompanhar a rolagem.
      destino.setAttribute("tabindex", "-1");
      destino.focus({ preventScroll: true });
    }

    document.addEventListener("click", aoClicar);
    return () => document.removeEventListener("click", aoClicar);
  }, []);

  return null;
}
