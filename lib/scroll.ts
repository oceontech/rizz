"use client";

import type Lenis from "lenis";
import { gsap } from "@/lib/gsap";

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
  if (typeof window === "undefined") return 0;
  return window.innerWidth >= 860 ? 88 : 68;
}

/**
 * Rola até um elemento (ou seletor). Delega ao Lenis quando ele está ativo,
 * senão usa o ScrollToPlugin. Respeita prefers-reduced-motion pulando direto.
 */
export function scrollToTarget(target: string | HTMLElement, extra = 0) {
  const el =
    typeof target === "string"
      ? document.querySelector<HTMLElement>(target)
      : target;
  if (!el) return;

  const offset = -(headerOffset() + extra);
  const instant = prefersReducedMotion();

  if (lenisInstance) {
    lenisInstance.scrollTo(el, {
      offset,
      duration: instant ? 0 : 1.1,
      immediate: instant,
    });
    return;
  }

  const y = el.getBoundingClientRect().top + window.scrollY + offset;

  if (instant) {
    window.scrollTo(0, y);
    return;
  }

  gsap.to(window, {
    duration: 0.9,
    ease: "power2.inOut",
    scrollTo: { y, autoKill: true },
  });
}
