"use client";

import { useEffect, useState } from "react";

import { statusDeAbertura, type StatusAbertura } from "@/lib/hours";

/**
 * "Aberto agora" depende do relógio, então só pode ser resolvido no cliente:
 * calcular no servidor deixaria a página dinâmica e ainda assim entregaria um
 * horário velho pelo cache. Antes de hidratar não renderiza nada.
 */
export function useStatusAbertura() {
  const [status, setStatus] = useState<StatusAbertura | null>(null);

  useEffect(() => {
    const atualizar = () => setStatus(statusDeAbertura());
    atualizar();

    // Um minuto é resolução suficiente para "abre às 18:30".
    const id = setInterval(atualizar, 60_000);
    return () => clearInterval(id);
  }, []);

  return status;
}

export default function IndicadorAbertura({
  className = "",
  claro = false,
}: {
  className?: string;
  /** true quando o fundo é creme. */
  claro?: boolean;
}) {
  const status = useStatusAbertura();

  if (!status) {
    return <span className={`block h-5 ${className}`} aria-hidden />;
  }

  const tom = claro ? "text-tinta/75" : "text-creme/80";
  const ponto = status.aberto
    ? claro
      ? "text-verde"
      : "text-emerald-400"
    : "text-ambar";

  return (
    <span
      className={`inline-flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs tracking-wide ${tom} ${className}`}
    >
      <span className={`relative flex size-1.5 shrink-0 ${ponto}`}>
        {status.aberto && (
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-60 motion-reduce:animate-none" />
        )}
        <span className="relative inline-flex size-1.5 rounded-full bg-current" />
      </span>
      <span className="font-medium uppercase tracking-[0.18em]">
        {status.rotulo}
      </span>
      <span className="opacity-40">·</span>
      <span className="opacity-80">{status.detalhe}</span>
    </span>
  );
}
