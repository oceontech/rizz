"use client";

import { ProvedorMovimento } from "@/components/sistema/movimento/provedor-movimento";
import { ProvedorTema } from "@/components/sistema/tema/provedor-tema";
import { Toaster } from "@/components/sistema/ui/sonner";
import { TooltipProvider } from "@/components/sistema/ui/tooltip";

/** Tema claro/escuro (segue o aparelho), movimento reduzido, dicas e avisos do painel. */
export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ProvedorTema>
      <ProvedorMovimento>
        <TooltipProvider delayDuration={300}>
          {children}
          <Toaster position="top-center" />
        </TooltipProvider>
      </ProvedorMovimento>
    </ProvedorTema>
  );
}
