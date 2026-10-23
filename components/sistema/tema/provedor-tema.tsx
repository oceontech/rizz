"use client";

import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

/** Tema claro/escuro: segue o aparelho por padrão e guarda a escolha. */
export function ProvedorTema({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}
