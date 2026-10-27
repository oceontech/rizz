"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BotaoLink } from "@/components/ui/Botao";
import { diasDoRodizio, horarioDoRodizio, rodizio, statusDoRodizio, type StatusRodizio } from "@/lib/rodizio";
import { whatsappLink } from "@/lib/site";

/**
 * Situação do rodízio no relógio de quem visita. Como o "aberto agora", só
 * pode ser resolvida no cliente: no servidor a página ficaria dinâmica ou o
 * cache entregaria o dia errado. Antes de hidratar, nada aparece.
 */
export function useRodizio() {
  const [status, setStatus] = useState<StatusRodizio | null>(null);
  useEffect(() => {
    const atualizar = () => setStatus(statusDoRodizio());
    atualizar();
    const id = setInterval(atualizar, 60_000);
    return () => clearInterval(id);
  }, []);
  return status;
}

/** Ponto que pulsa quando o rodízio é hoje ou está acontecendo. */
function Ponto({ vivo }: { vivo: boolean }) {
  return (
    <span className="relative flex size-2 shrink-0 text-ambar">
      {vivo && <span className="absolute inline-flex size-full animate-ping rounded-full bg-current opacity-70 motion-reduce:animate-none" />}
      <span className="relative inline-flex size-2 rounded-full bg-current" />
    </span>
  );
}

/**
 * Selo compacto, para fundos escuros (hero). Só aparece quando o rodízio é
 * hoje ou amanhã: nos outros dias ele seria ruído na primeira dobra.
 */
export function SeloRodizio({ href = "#rodizio", className = "" }: { href?: string; className?: string }) {
  const status = useRodizio();
  if (!status || status.fase === "proximo") return null;
  const vivo = status.fase === "agora" || status.fase === "hoje";

  return (
    <Link
      href={href}
      className={`group inline-flex items-center gap-3 rounded-full border border-ambar/40 bg-noite/60 py-2 pr-4 pl-3.5 text-creme backdrop-blur-sm transition-colors hover:border-ambar ${className}`}
    >
      <Ponto vivo={vivo} />
      <span className="text-[0.6875rem] font-medium tracking-[0.16em] uppercase">{status.rotulo}</span>
      <span className="hidden text-xs text-creme/70 sm:inline">· {status.detalhe}</span>
      <span aria-hidden className="text-ambar transition-transform group-hover:translate-x-0.5">→</span>
    </Link>
  );
}

/**
 * Cartão do rodízio para o cardápio (fundo creme): situação de hoje, as três
 * etapas e os caminhos para reservar ou consultar o valor.
 */
export function CartaoRodizio({ className = "" }: { className?: string }) {
  const status = useRodizio();
  const vivo = status?.fase === "agora" || status?.fase === "hoje";

  return (
    <aside
      aria-label="Rodízio de risotos"
      className={`relative isolate overflow-hidden rounded-3xl bg-vinho p-6 text-creme md:p-9 ${className}`}
    >
      <div aria-hidden className="absolute -top-24 -right-24 -z-10 size-72 rounded-full bg-ambar/15 blur-3xl" />

      <div className="flex flex-wrap items-center gap-3">
        {status ? (
          <span className={`inline-flex items-center gap-2.5 rounded-full px-3 py-1.5 text-[0.6875rem] font-medium tracking-[0.16em] uppercase ${vivo ? "bg-ambar text-noite" : "bg-creme/10 text-creme/85"}`}>
            {vivo ? <span className="size-1.5 animate-pulse rounded-full bg-noite motion-reduce:animate-none" /> : <Ponto vivo={false} />}
            {status.rotulo}
          </span>
        ) : (
          <span className="h-7" />
        )}
        {status && <span className="text-sm text-creme/70">{status.detalhe}</span>}
      </div>

      <h2 className="mt-6 flex flex-col items-start not-italic">
        <span className="relative z-10 -mb-[0.1em] font-display text-[clamp(1.9rem,4vw,2.75rem)] leading-none italic">Rodízio de</span>
        <span className="font-sans text-[clamp(2.4rem,6vw,4rem)] leading-[0.95] font-semibold tracking-[-0.02em] text-ouro-claro uppercase">risotos</span>
      </h2>
      <p className="mt-3 text-sm text-creme/75">
        {diasDoRodizio()}, no jantar · {horarioDoRodizio()}
      </p>

      {/* Celular: lista corrida; a partir de sm, três cartões. */}
      <ol className="mt-6 divide-y divide-creme/10 sm:mt-7 sm:grid sm:grid-cols-3 sm:gap-4 sm:divide-y-0">
        {rodizio.etapas.map((e, i) => (
          <li key={e.titulo} className="flex gap-4 py-3 sm:block sm:rounded-2xl sm:bg-creme/8 sm:p-4">
            <span className="font-display text-2xl leading-none text-ambar italic">0{i + 1}</span>
            <div>
              <p className="font-medium sm:mt-1">{e.titulo}</p>
              <p className="mt-0.5 text-sm leading-snug text-creme/70 sm:mt-1">{e.texto}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="mt-7 flex flex-wrap gap-3">
        <BotaoLink href="/reservas">Reservar mesa</BotaoLink>
        <BotaoLink href={whatsappLink("Olá! Gostaria de saber o valor e os sabores do rodízio de risotos desta semana.")} variante="contorno">
          Valor e sabores da semana
        </BotaoLink>
      </div>
    </aside>
  );
}
