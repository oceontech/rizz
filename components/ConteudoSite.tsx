"use client";

import type { ReactNode } from "react";

import { aplicarConteudo, type ConteudoSiteConfig } from "@/lib/conteudo";

/**
 * Aplica no navegador os horários, o rodízio e o contato salvos no painel,
 * DURANTE a renderização e antes dos filhos: assim "aberto agora", turnos de
 * reserva e links do WhatsApp já desenham com os valores certos, iguais aos
 * do servidor (sem divergência na hidratação).
 */
export default function ConteudoSite({ valor, children }: { valor: ConteudoSiteConfig; children: ReactNode }) {
  aplicarConteudo(valor);
  return children;
}
