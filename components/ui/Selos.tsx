"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";

import SeloSvg from "@/components/ui/SeloSvg";
import { mapaDeSelos, SELOS_PADRAO, type SeloDef } from "@/lib/selos";

/**
 * Selos cadastrados no painel, disponíveis para todo o site. O layout do site
 * busca a lista (com cache) e a entrega aqui; sem provider, valem os padrões.
 */
const ContextoSelos = createContext<{ lista: SeloDef[]; mapa: Map<string, SeloDef> } | null>(null);

export function SelosProvider({ selos, children }: { selos: SeloDef[]; children: ReactNode }) {
  const valor = useMemo(
    () => ({ lista: selos.filter((s) => s.ativo).sort((a, b) => a.ordem - b.ordem), mapa: mapaDeSelos(selos) }),
    [selos],
  );
  return <ContextoSelos.Provider value={valor}>{children}</ContextoSelos.Provider>;
}

const PADRAO = { lista: SELOS_PADRAO, mapa: mapaDeSelos(SELOS_PADRAO) };

export function useSelos() {
  return useContext(ContextoSelos) ?? PADRAO;
}

const tons = {
  claro: {
    base: "border-tinta/15 text-tinta/75",
    interativo: "hover:border-vinho/45 hover:text-vinho",
    ativo: "border-vinho bg-vinho/[0.07] text-vinho",
  },
  escuro: {
    base: "border-creme/20 text-creme/75",
    interativo: "hover:border-ambar/60 hover:text-ambar",
    ativo: "border-ambar text-ambar",
  },
} as const;

/**
 * Etiqueta legível: o selo desenhado + o nome por extenso. O desenho sozinho
 * não diz nada a quem não conhece a legenda.
 *
 * Com `onAlternar` vira botão de filtro — tocar na etiqueta de um prato
 * mostra só os pratos com ela.
 */
export function EtiquetaSelo({
  id,
  tom = "claro",
  ativo = false,
  atraso = 0,
  onAlternar,
}: {
  id: string;
  tom?: keyof typeof tons;
  ativo?: boolean;
  atraso?: number;
  onAlternar?: (id: string) => void;
}) {
  const selo = useSelos().mapa.get(id);
  if (!selo) return null;
  const t = tons[tom];
  const classe = `inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full border pl-[3px] pr-2.5 font-sans text-[0.6875rem] font-normal not-italic leading-none tracking-[0.03em] transition-colors duration-300 ${
    ativo ? t.ativo : t.base
  }`;
  const desenho = <SeloSvg selo={selo} tamanho={18} animar atraso={atraso} titulo={false} />;

  if (!onAlternar) {
    return (
      <span className={classe} title={selo.descricao ?? selo.nome}>
        {desenho}
        {selo.nome}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onAlternar(id)}
      aria-pressed={ativo}
      title={ativo ? `Remover filtro: ${selo.nome}` : `Filtrar por: ${selo.nome}`}
      className={`${classe} ${t.interativo} cursor-pointer`}
    >
      {desenho}
      {selo.nome}
    </button>
  );
}

export function ListaSelos({
  badges,
  tom = "claro",
  ativos = [],
  onAlternar,
  className = "",
}: {
  badges?: string[];
  tom?: keyof typeof tons;
  ativos?: string[];
  onAlternar?: (id: string) => void;
  className?: string;
}) {
  const { mapa } = useSelos();
  const validos = (badges ?? []).filter((b) => mapa.has(b));
  if (!validos.length) return null;

  return (
    <span className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      {validos.map((b, i) => (
        <EtiquetaSelo key={b} id={b} tom={tom} atraso={i * 0.08} ativo={ativos.includes(b)} onAlternar={onAlternar} />
      ))}
    </span>
  );
}

/** Legenda dos selos, no pé do cardápio — como na peça impressa. */
export function Legenda({ className = "" }: { className?: string }) {
  const { lista } = useSelos();
  return (
    <ul className={`flex flex-wrap gap-x-8 gap-y-3 text-sm italic ${className}`}>
      {lista.map((s, i) => (
        <li key={s.id} className="flex items-center gap-2.5">
          <SeloSvg selo={s} tamanho={26} animar atraso={i * 0.08} />
          <span>{s.descricao ?? s.nome}</span>
        </li>
      ))}
    </ul>
  );
}
