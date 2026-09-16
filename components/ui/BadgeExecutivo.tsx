"use client";

import { useEffect, useState } from "react";

import { executivoDisponivel } from "@/lib/hours";

/**
 * "Servindo agora" só aparece dentro da janela do executivo.
 * Resolvido no cliente pelo mesmo motivo do indicador de abertura:
 * horário não sobrevive ao cache da página estática.
 */
export default function BadgeExecutivo({ claro = true }: { claro?: boolean }) {
  const [ativo, setAtivo] = useState<boolean | null>(null);

  useEffect(() => {
    const atualizar = () => setAtivo(executivoDisponivel());
    atualizar();
    const id = setInterval(atualizar, 60_000);
    return () => clearInterval(id);
  }, []);

  if (ativo === null) return <span className="block h-7" aria-hidden />;

  if (!ativo) {
    return (
      <span
        className={`inline-flex h-7 items-center rounded-full px-3 text-[0.625rem] font-medium uppercase tracking-[0.16em] ${
          claro ? "bg-tinta/8 text-tinta/55" : "bg-creme/10 text-creme/55"
        }`}
      >
        Fora do horário
      </span>
    );
  }

  return (
    <span className="inline-flex h-7 items-center gap-2 rounded-full bg-verde/12 px-3 text-[0.625rem] font-medium uppercase tracking-[0.16em] text-verde">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-70 motion-reduce:animate-none" />
        <span className="relative inline-flex size-1.5 rounded-full bg-current" />
      </span>
      Servindo agora
    </span>
  );
}
