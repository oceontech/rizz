"use client";

import { useEffect, useState } from "react";

import { executivo as executivoEstatico } from "@/data/executivo";
import { executivoDisponivel } from "@/lib/hours";

/**
 * "Servindo agora" só aparece dentro da janela do executivo.
 * Resolvido no cliente pelo mesmo motivo do indicador de abertura:
 * horário não sobrevive ao cache da página estática.
 */
type DadosBadge = { condicoesConfirmadas: boolean; dias: string; horario: string };

export default function BadgeExecutivo({
  claro = true,
  executivo = executivoEstatico,
}: {
  claro?: boolean;
  /** Vem do painel; sem ele, usa `data/executivo.ts`. */
  executivo?: DadosBadge;
}) {
  const [ativo, setAtivo] = useState<boolean | null>(null);

  useEffect(() => {
    const atualizar = () => setAtivo(executivoDisponivel());
    atualizar();
    const id = setInterval(atualizar, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!executivo.condicoesConfirmadas) return null;

  if (ativo === null) return <span className="block h-7" aria-hidden />;

  if (!ativo) {
    return (
      <span
        className={`inline-flex h-7 items-center rounded-full px-3 text-[0.625rem] font-medium uppercase tracking-[0.16em] ${
          claro ? "bg-tinta/8 text-tinta/55" : "bg-creme/10 text-creme/55"
        }`}
      >
        Executivo: {executivo.dias}, {executivo.horario}
      </span>
    );
  }

  return (
    <span className="inline-flex h-7 items-center gap-2 rounded-full bg-verde/12 px-3 text-[0.625rem] font-medium uppercase tracking-[0.16em] text-verde">
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-70 motion-reduce:animate-none" />
        <span className="relative inline-flex size-1.5 rounded-full bg-current" />
      </span>
      Executivo disponível agora
    </span>
  );
}
