"use client";

import { useEffect } from "react";

import { registrarAtividade } from "@/lib/admin/sessao-actions";

/** Intervalo mínimo entre dois registros: uso contínuo = uma gravação por minuto. */
const INTERVALO_MS = 60_000;

const EVENTOS = ["pointerdown", "keydown", "wheel", "touchstart", "mousemove", "scroll"] as const;

/**
 * Registra que a pessoa está usando o painel (clique, tecla, rolagem, mouse).
 * Mostrado na Equipe como "Ativo agora" / "Ativo há 12 min". Com a aba em
 * segundo plano não registra nada, e a consulta automática das reservas
 * (`AoVivo`) não conta: só gesto de gente.
 */
export function Presenca() {
  useEffect(() => {
    let ultimo = 0;

    const marcar = () => {
      const agora = Date.now();
      if (document.visibilityState !== "visible" || agora - ultimo < INTERVALO_MS) return;
      ultimo = agora;
      registrarAtividade().catch(() => {
        // Sem rede: tenta de novo no próximo gesto.
        ultimo = 0;
      });
    };

    // Abrir uma página do painel já é uso.
    marcar();
    for (const e of EVENTOS) window.addEventListener(e, marcar, { passive: true });
    document.addEventListener("visibilitychange", marcar);
    return () => {
      for (const e of EVENTOS) window.removeEventListener(e, marcar);
      document.removeEventListener("visibilitychange", marcar);
    };
  }, []);

  return null;
}
