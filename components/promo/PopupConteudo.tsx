"use client";

import { useState } from "react";

/**
 * Miolo do pop-up promocional — o mesmo no site e na prévia do painel.
 * Só usa cores literais da marca, para renderizar igual nas duas folhas de
 * estilo (a do site e a do painel).
 */
export type DadosPopup = {
  titulo: string;
  subtitulo: string | null;
  texto: string | null;
  imagemUrl: string | null;
  cupom: string | null;
  ctaTexto: string | null;
  ctaUrl: string | null;
  estilo: "vinho" | "creme" | "noite";
};

const ESTILOS = {
  vinho: {
    fundo: "bg-[#70012a] text-[#fdf1e5]",
    eyebrow: "text-[#e8890c]",
    titulo: "text-[#fdf1e5]",
    texto: "text-[#fdf1e5]/75",
    cupom: "border-[#e8890c]/60 bg-[#4a0018] text-[#fdf1e5]",
    botao: "bg-[#e8890c] text-[#2b0710] hover:bg-[#f09a2a]",
    fechar: "text-[#fdf1e5]/60 hover:text-[#fdf1e5]",
  },
  creme: {
    fundo: "bg-[#fdf1e5] text-[#3a1219]",
    eyebrow: "text-[#70012a]/70",
    titulo: "text-[#70012a]",
    texto: "text-[#3a1219]/70",
    cupom: "border-[#70012a]/35 bg-[#f6e7d6] text-[#70012a]",
    botao: "bg-[#70012a] text-[#fdf1e5] hover:bg-[#8a0a36]",
    fechar: "text-[#3a1219]/50 hover:text-[#3a1219]",
  },
  noite: {
    fundo: "bg-[#2b0710] text-[#fdf1e5]",
    eyebrow: "text-[#c9a227]",
    titulo: "text-[#fdf1e5]",
    texto: "text-[#fdf1e5]/70",
    cupom: "border-[#c9a227]/50 bg-[#3a0a16] text-[#e3c55f]",
    botao: "bg-[#c9a227] text-[#2b0710] hover:bg-[#d8b43c]",
    fechar: "text-[#fdf1e5]/55 hover:text-[#fdf1e5]",
  },
} as const;

export default function PopupConteudo({
  dados,
  onFechar,
  onClicar,
  idTitulo,
}: {
  dados: DadosPopup;
  onFechar?: () => void;
  onClicar?: () => void;
  idTitulo?: string;
}) {
  const e = ESTILOS[dados.estilo] ?? ESTILOS.vinho;
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    if (!dados.cupom) return;
    try {
      await navigator.clipboard.writeText(dados.cupom);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      /* sem permissão de área de transferência: o código segue visível */
    }
  }

  const externo = dados.ctaUrl?.startsWith("http");

  return (
    <div className={`relative w-full overflow-hidden rounded-[1.25rem] shadow-2xl ${e.fundo}`}>
      {onFechar && (
        <button
          type="button"
          onClick={onFechar}
          aria-label="Fechar"
          className={`absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-black/15 backdrop-blur transition-colors ${e.fechar}`}
        >
          <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      )}

      {dados.imagemUrl && (
        // eslint-disable-next-line @next/next/no-img-element -- URL do Blob, tamanho variável
        <img src={dados.imagemUrl} alt="" className="aspect-[16/10] w-full object-cover" />
      )}

      <div className="px-6 pb-7 pt-6 text-center sm:px-8">
        {dados.subtitulo && (
          <p className={`text-[0.6875rem] font-medium uppercase tracking-[0.22em] ${e.eyebrow}`}>
            {dados.subtitulo}
          </p>
        )}
        <h2
          id={idTitulo}
          className={`mt-2 text-balance font-[family-name:var(--font-cormorant)] text-[2rem] font-medium italic leading-[1.08] sm:text-[2.35rem] ${e.titulo}`}
        >
          {dados.titulo || "Título da promoção"}
        </h2>
        {dados.texto && <p className={`mx-auto mt-3 max-w-sm text-[0.9375rem] leading-relaxed ${e.texto}`}>{dados.texto}</p>}

        {dados.cupom && (
          <button
            type="button"
            onClick={copiar}
            className={`mx-auto mt-5 flex items-center gap-3 rounded-xl border border-dashed px-4 py-2.5 ${e.cupom}`}
          >
            <span className="text-[0.625rem] uppercase tracking-[0.18em] opacity-70">Cupom</span>
            <span className="font-mono text-base font-semibold tracking-wider">{dados.cupom}</span>
            <span className="text-[0.6875rem] opacity-70">{copiado ? "copiado!" : "copiar"}</span>
          </button>
        )}

        {dados.ctaTexto && dados.ctaUrl && (
          <a
            href={dados.ctaUrl}
            onClick={onClicar}
            target={externo ? "_blank" : undefined}
            rel={externo ? "noopener" : undefined}
            className={`mt-6 inline-flex h-12 items-center justify-center rounded-full px-7 text-sm font-medium tracking-wide transition-colors ${e.botao}`}
          >
            {dados.ctaTexto}
          </a>
        )}

        {onFechar && (
          <p className="mt-4">
            <button type="button" onClick={onFechar} className={`text-xs underline-offset-4 hover:underline ${e.fechar}`}>
              Agora não
            </button>
          </p>
        )}
      </div>
    </div>
  );
}
