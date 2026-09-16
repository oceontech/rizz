"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Boot = { pronto: boolean; liberar: () => void };

const BootContext = createContext<Boot>({ pronto: true, liberar: () => {} });

/**
 * O preloader segura a entrada do hero. Sem esse sinal, a animação do hero
 * roda atrás da cortina e o usuário vê o fim dela, não o começo.
 */
export function BootProvider({ children }: { children: ReactNode }) {
  const [pronto, setPronto] = useState(false);
  const liberar = useCallback(() => setPronto(true), []);
  const valor = useMemo(() => ({ pronto, liberar }), [pronto, liberar]);

  return <BootContext.Provider value={valor}>{children}</BootContext.Provider>;
}

export function useBoot() {
  return useContext(BootContext);
}
