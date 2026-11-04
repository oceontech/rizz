"use client";

import type Lenis from "lenis";

/**
 * Registro do dono da rolagem.
 *
 * Só existe UM dono: no desktop com ponteiro fino é o Lenis; no mobile é a
 * rolagem nativa. Tudo que precisa mover a página pede aqui — nunca chama
 * window.scrollTo nem gsap.to(window) por conta própria.
 */
let lenisInstance: Lenis | null = null;

export function setLenis(instance: Lenis | null) {
  lenisInstance = instance;
}

export function getLenis() {
  return lenisInstance;
}

function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/** Altura do header fixo, para a âncora não parar embaixo dele. */
function headerOffset() {
  if (typeof document === "undefined") return 0;
  return document.querySelector("header")?.offsetHeight ?? 0;
}

/**
 * Rola até um elemento (ou seletor). Delega ao Lenis quando ele está ativo,
 * senão usa a rolagem suave do próprio navegador. Respeita
 * prefers-reduced-motion pulando direto.
 */
export function scrollToTarget(target: string | HTMLElement, extra = 0) {
  const el =
    typeof target === "string"
      ? document.querySelector<HTMLElement>(target)
      : target;
  if (!el) return;

  const offset = -(headerOffset() + extra);
  const instant = prefersReducedMotion();
  const y = el.getBoundingClientRect().top + window.scrollY + offset;

  if (lenisInstance) {
    // Posição numérica, não o elemento: com o elemento, o Lenis ainda
    // desconta o `scroll-padding-top` do CSS e para ~160px mais baixo que a
    // rolagem nativa do celular.
    lenisInstance.scrollTo(y, {
      duration: instant ? 0 : 1.1,
      immediate: instant,
    });
    return;
  }

  // Sem Lenis (celular e tablet): rolagem suave NATIVA, nunca um tween do
  // GSAP. No iPhone a página segue deslizando por inércia depois do dedo
  // sair; tocando numa aba nesse meio-tempo, o `autoKill` do ScrollToPlugin
  // via a página andando sozinha, achava que era o usuário e cancelava no
  // primeiro quadro (as abas do cardápio e dos vinhos "não faziam nada").
  // Rolando pelo navegador, o Safari para a inércia e vai até o destino.
  window.scrollTo({ top: Math.max(0, y), behavior: instant ? "auto" : "smooth" });
}
