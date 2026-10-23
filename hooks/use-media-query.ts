"use client";

import { useSyncExternalStore } from "react";

/** true quando a media query casa. No servidor, assume false. */
export function useMediaQuery(consulta: string) {
  return useSyncExternalStore(
    (avisar) => {
      const lista = window.matchMedia(consulta);
      lista.addEventListener("change", avisar);
      return () => lista.removeEventListener("change", avisar);
    },
    () => window.matchMedia(consulta).matches,
    () => false,
  );
}

export function useDesktop() {
  return useMediaQuery("(min-width: 768px)");
}
