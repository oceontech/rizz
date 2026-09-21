"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useBoot } from "@/components/motion/Boot";
import type { Promocao } from "@/lib/dados";

import PopupConteudo from "./PopupConteudo";

type PromoSite = Pick<
  Promocao,
  | "id"
  | "titulo"
  | "subtitulo"
  | "texto"
  | "imagemUrl"
  | "cupom"
  | "ctaTexto"
  | "ctaUrl"
  | "inicio"
  | "fim"
  | "paginas"
  | "frequencia"
  | "atrasoSeg"
  | "estilo"
>;

const CHAVE = (id: number) => `rizz-promo-${id}`;

function hojeSP() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

function valePara(pagina: PromoSite["paginas"], pathname: string) {
  if (pagina === "todas") return true;
  if (pagina === "home") return pathname === "/";
  return pathname.startsWith(`/${pagina}`);
}

/** Respeita a frequência escolhida no painel. Storage pode falhar (aba anônima). */
function jaVisto(p: PromoSite) {
  try {
    if (p.frequencia === "sempre") return false;
    if (p.frequencia === "sessao") return sessionStorage.getItem(CHAVE(p.id)) === "1";
    return localStorage.getItem(CHAVE(p.id)) === hojeSP();
  } catch {
    return false;
  }
}

function marcarVisto(p: PromoSite) {
  try {
    if (p.frequencia === "sessao") sessionStorage.setItem(CHAVE(p.id), "1");
    if (p.frequencia === "dia") localStorage.setItem(CHAVE(p.id), hojeSP());
  } catch {
    /* sem storage: aparece de novo, o que é aceitável */
  }
}

function registrar(id: number, tipo: "view" | "click") {
  const corpo = JSON.stringify({ id, tipo });
  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/promocoes/evento", new Blob([corpo], { type: "application/json" }));
  } else {
    void fetch("/api/promocoes/evento", { method: "POST", body: corpo, keepalive: true, headers: { "content-type": "application/json" } });
  }
}

/**
 * Pop-up promocional configurado no painel. Um por vez: o mais recente que
 * vale para a página atual, dentro do período e ainda não visto conforme a
 * frequência. Entra depois do atraso configurado e nunca durante o preloader.
 */
export default function PopupPromocional({ promocoes }: { promocoes: PromoSite[] }) {
  const pathname = usePathname();
  // O atraso só começa a contar depois do preloader liberar a página.
  const { pronto } = useBoot();
  const [atual, setAtual] = useState<PromoSite | null>(null);
  const [visivel, setVisivel] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
  const foco = useRef<Element | null>(null);

  useEffect(() => {
    if (!pronto || !promocoes.length || atual) return;
    const hoje = hojeSP();
    const escolhida = promocoes.find(
      (p) =>
        valePara(p.paginas, pathname) &&
        (!p.inicio || p.inicio <= hoje) &&
        (!p.fim || p.fim >= hoje) &&
        !jaVisto(p),
    );
    if (!escolhida) return;

    const t = setTimeout(() => {
      foco.current = document.activeElement;
      setAtual(escolhida);
      requestAnimationFrame(() => setVisivel(true));
      marcarVisto(escolhida);
      registrar(escolhida.id, "view");
    }, Math.max(1, escolhida.atrasoSeg) * 1000);

    return () => clearTimeout(t);
  }, [pronto, pathname, promocoes, atual]);

  useEffect(() => {
    if (!visivel) return;
    caixa.current?.focus();
    const tecla = (e: KeyboardEvent) => e.key === "Escape" && fechar();
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [visivel]);

  function fechar() {
    setVisivel(false);
    setTimeout(() => {
      setAtual(null);
      if (foco.current instanceof HTMLElement) foco.current.focus();
    }, 350);
  }

  if (!atual) return null;

  return (
    <div
      data-lenis-prevent
      className={`fixed inset-0 z-[120] flex items-end justify-center p-4 transition-opacity duration-300 sm:items-center ${
        visivel ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <button
        type="button"
        aria-label="Fechar promoção"
        tabIndex={-1}
        onClick={fechar}
        className="absolute inset-0 cursor-default bg-[#1a0409]/70 backdrop-blur-sm"
      />
      <div
        ref={caixa}
        role="dialog"
        aria-modal="true"
        aria-labelledby="promo-titulo"
        tabIndex={-1}
        className={`relative w-full max-w-[400px] outline-none transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          visivel ? "translate-y-0 scale-100" : "translate-y-6 scale-[0.97]"
        }`}
      >
        <PopupConteudo
          dados={atual}
          idTitulo="promo-titulo"
          onFechar={fechar}
          onClicar={() => {
            registrar(atual.id, "click");
            fechar();
          }}
        />
      </div>
    </div>
  );
}
