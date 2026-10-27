"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import { BotaoLink } from "@/components/ui/Botao";
import fotoRodizio from "@/assets/img/rodizio-mesa.webp";
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
export function SeloRodizio({
  href = "#rodizio",
  className = "",
  destaque = false,
}: {
  href?: string;
  className?: string;
  /** Pílula âmbar cheia, com brilho passando: para não se confundir com o horário. */
  destaque?: boolean;
}) {
  const status = useRodizio();
  if (!status || status.fase === "proximo") return null;
  const vivo = status.fase === "agora" || status.fase === "hoje";

  if (destaque) {
    return (
      <Link
        href={href}
        className={`group relative inline-flex items-center gap-3 overflow-hidden rounded-full bg-ambar py-2.5 pr-5 pl-4 text-noite shadow-[0_10px_40px_rgb(232_137_12/0.45)] transition-transform hover:scale-[1.03] ${className}`}
      >
        <span aria-hidden className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 animate-[brilho_3.2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/45 to-transparent motion-reduce:hidden" />
        <span className="relative flex size-2">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-noite/50 motion-reduce:animate-none" />
          <span className="relative inline-flex size-2 rounded-full bg-noite" />
        </span>
        <span className="relative text-xs font-semibold tracking-[0.14em] uppercase">{status.rotulo}</span>
        <span className="relative hidden text-xs font-medium text-noite/70 sm:inline">· {status.detalhe}</span>
        <span aria-hidden className="relative transition-transform group-hover:translate-x-0.5">→</span>
      </Link>
    );
  }

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
      className={`relative isolate overflow-hidden rounded-3xl bg-noite p-6 text-creme md:p-10 ${className}`}
    >
      {/* Foto dos risotos do rodízio ao fundo, escurecida à esquerda, onde
          fica o texto, e mais aberta à direita. */}
      <Image src={fotoRodizio} alt="" fill placeholder="blur" sizes="(min-width: 860px) 80rem, 100vw" className="-z-20 object-cover" />
      <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-noite via-noite/85 to-noite/55 md:bg-gradient-to-r md:from-noite md:via-noite/85 md:to-noite/30" />

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
        <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[clamp(2.4rem,5vw,3.5rem)] leading-none">Rodízio de</span>
        <span className="font-[family-name:var(--font-instrument)] text-[clamp(4rem,10vw,6.5rem)] leading-[0.88] tracking-[0.01em] text-ouro-claro uppercase">risotos</span>
      </h2>
      <p className="mt-3 text-base text-creme/85">
        {diasDoRodizio()}, no jantar · {horarioDoRodizio()}
      </p>

      {/* Celular: lista corrida; a partir de sm, três cartões. */}
      <ol className="mt-6 divide-y divide-creme/10 sm:mt-7 sm:grid sm:grid-cols-3 sm:gap-4 sm:divide-y-0">
        {rodizio.etapas.map((e, i) => (
          <li key={e.titulo} className="flex gap-4 py-3 sm:block sm:rounded-2xl sm:bg-noite/55 sm:p-5 sm:backdrop-blur-sm">
            <span className="font-[family-name:var(--font-instrument)] text-3xl leading-none text-ambar">0{i + 1}</span>
            <div>
              <p className="font-[family-name:var(--font-instrument)] text-2xl tracking-[0.01em] uppercase sm:mt-2">{e.titulo}</p>
              <p className="mt-1 text-[0.9375rem] leading-snug text-creme/85">{e.texto}</p>
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
