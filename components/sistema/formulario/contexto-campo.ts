"use client";

import { createContext, useContext } from "react";

export type ContextoCampo = { id: string; descricaoId?: string; invalido: boolean };

export const CampoContexto = createContext<ContextoCampo | null>(null);

/** Id, mensagem e estado de erro do Campo em volta (os smart inputs se ligam sozinhos). */
export function useCampo() {
  return useContext(CampoContexto);
}
