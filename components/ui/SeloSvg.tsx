"use client";

import {
  Beef,
  Crown,
  Fish,
  Flame,
  Heart,
  Leaf,
  Milk,
  Sparkles,
  Sprout,
  Star,
  Wheat,
  WheatOff,
  Wine,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useId, useRef, useState, type SVGProps } from "react";

import { corDoTexto, type FormaSelo, type SeloDef, type SimboloSelo } from "@/lib/selos";

// ─── Formatos (viewBox 48×48) ─────────────────────────────────────

/** Contorno ondulado de carimbo: 14 ondas em volta do centro. */
function carimbo(r: number, onda: number, n = 14) {
  const pontos = Array.from({ length: n }, (_, k) => {
    const a = (k / n) * Math.PI * 2 - Math.PI / 2;
    return [24 + r * Math.cos(a), 24 + r * Math.sin(a)] as const;
  });
  const [x0, y0] = pontos[0]!;
  const arcos = pontos
    .map((_, k) => {
      const [x, y] = pontos[(k + 1) % n]!;
      return `A${onda} ${onda} 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} ${arcos}Z`;
}

/** Estrela de muitas pontas, para a roseta (selo de prêmio). */
function roseta(externo: number, interno: number, pontas = 12) {
  const passos = pontas * 2;
  return (
    Array.from({ length: passos }, (_, k) => {
      const r = k % 2 ? interno : externo;
      const a = (k / passos) * Math.PI * 2 - Math.PI / 2;
      return `${k ? "L" : "M"}${(24 + r * Math.cos(a)).toFixed(2)} ${(24 + r * Math.sin(a)).toFixed(2)}`;
    }).join(" ") + "Z"
  );
}

function poligono(r: number, lados: number, giro = -90) {
  return (
    Array.from({ length: lados }, (_, k) => {
      const a = ((k * 360) / lados + giro) * (Math.PI / 180);
      return `${k ? "L" : "M"}${(24 + r * Math.cos(a)).toFixed(2)} ${(24 + r * Math.sin(a)).toFixed(2)}`;
    }).join(" ") + "Z"
  );
}

const FORMA: Record<FormaSelo, { d: string; centro: number; escalaAnel: number }> = {
  circulo: { d: "M24 2a22 22 0 1 1 0 44a22 22 0 1 1 0-44Z", centro: 24, escalaAnel: 0.8 },
  carimbo: { d: carimbo(19.6, 3.4), centro: 24, escalaAnel: 0.74 },
  escudo: {
    d: "M24 2.5 41.5 8.2V22c0 11.2-7.2 19.4-17.5 23.5C13.7 41.4 6.5 33.2 6.5 22V8.2Z",
    centro: 22.5,
    escalaAnel: 0.8,
  },
  hexagono: { d: poligono(22.5, 6), centro: 24, escalaAnel: 0.78 },
  losango: { d: poligono(23, 4), centro: 24, escalaAnel: 0.7 },
  roseta: { d: roseta(23, 19.5), centro: 24, escalaAnel: 0.72 },
  gota: { d: "M24 2.5C30 11 40.5 20.5 40.5 29.5a16.5 16.5 0 0 1-33 0C7.5 20.5 18 11 24 2.5Z", centro: 29, escalaAnel: 0.78 },
  folha: {
    d: "M24 2.5C36 8 43 19 41.5 31 40 41 31.5 45.5 24 45.5S8 41 6.5 31C5 19 12 8 24 2.5Z",
    centro: 25.5,
    escalaAnel: 0.78,
  },
};

// ─── Símbolos ─────────────────────────────────────────────────────

/** Trufa: um torrão rugoso com o brilho de uma lâmina. */
function Trufa(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 3.5c2.2 0 3 1.3 4.6 1.6 1.9.4 3.6 1.8 3.6 4.2 0 1.6.9 2.4.9 4.1 0 3.6-3.5 6.9-9.1 6.9s-9.1-3.3-9.1-6.9c0-1.7.9-2.5.9-4.1 0-2.4 1.7-3.8 3.6-4.2C8.9 4.8 9.8 3.5 12 3.5Z" />
      <path d="M8.5 11.5h.01M12 9.5h.01M15.5 12h.01M10.5 14.8h.01M14 15.8h.01" strokeWidth={2.6} />
    </svg>
  );
}

/** Pimenta: o lucide não tem; um fruto curvo com o cabinho. */
function Pimenta(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15.5 7.5c2.6.8 3.9 3.2 3 6.4C17.3 18 12.4 20.8 5 20.5c4.3-1.7 6.3-4.4 7-8.3.5-2.8 1.4-4.9 3.5-4.7Z" />
      <path d="M15.5 7.5c.2-1.7 1-3 2.6-3.6M14 8.3c-.4-1.1-1.4-1.6-2.6-1.4" />
    </svg>
  );
}

const ICONES: Record<Exclude<SimboloSelo, "letra">, LucideIcon | typeof Trufa> = {
  folha: Leaf,
  broto: Sprout,
  trufa: Trufa,
  estrela: Star,
  coroa: Crown,
  chama: Flame,
  pimenta: Pimenta,
  trigo: Wheat,
  semGluten: WheatOff,
  leite: Milk,
  peixe: Fish,
  boi: Beef,
  coracao: Heart,
  taca: Wine,
  brilho: Sparkles,
};

// ─── Entrada animada ──────────────────────────────────────────────

/** Um só IntersectionObserver para todos os selos da página (o cardápio tem dezenas). */
let observador: IntersectionObserver | null = null;
const aoAparecer = new WeakMap<Element, () => void>();

function observar(el: Element, cb: () => void) {
  if (typeof IntersectionObserver === "undefined") return cb();
  observador ??= new IntersectionObserver(
    (entradas) => {
      for (const e of entradas) {
        if (!e.isIntersecting) continue;
        aoAparecer.get(e.target)?.();
        aoAparecer.delete(e.target);
        observador?.unobserve(e.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  aoAparecer.set(el, cb);
  observador.observe(el);
  return () => {
    aoAparecer.delete(el);
    observador?.unobserve(el);
  };
}

/**
 * Selo desenhado em SVG: o formato na cor do selo, um anel fino por dentro e
 * o símbolo (ou as letras) no centro. Com `animar`, entra quando aparece na
 * tela: o formato gira e cresce com mola, o anel se desenha, o símbolo surge.
 * `chave` reinicia a animação (prévia do editor).
 */
export default function SeloSvg({
  selo,
  tamanho = 20,
  animar = false,
  atraso = 0,
  chave,
  className = "",
  titulo = true,
}: {
  selo: Pick<SeloDef, "nome" | "descricao" | "forma" | "simbolo" | "letra" | "cor">;
  tamanho?: number;
  animar?: boolean;
  /** Em segundos: escalona selos lado a lado. */
  atraso?: number;
  chave?: string | number;
  className?: string;
  /** Mostra o nome no hover (title). Desligue quando o nome já está escrito ao lado. */
  titulo?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const brilho = `selo-brilho-${useId().replace(/:/g, "")}`;
  const [visivel, setVisivel] = useState(!animar);

  useEffect(() => {
    if (!animar || !ref.current) return;
    setVisivel(false);
    return observar(ref.current, () => setVisivel(true));
  }, [animar, chave]);

  const forma = FORMA[selo.forma] ?? FORMA.circulo;
  const tinta = corDoTexto(selo.cor);
  const letra = (selo.letra ?? "").trim().slice(0, 3).toUpperCase();
  const Icone = selo.simbolo === "letra" ? null : ICONES[selo.simbolo];
  const tamanhoLetra = letra.length >= 3 ? 11.5 : letra.length === 2 ? 15 : 20;
  const lado = 20;

  return (
    <svg
      ref={ref}
      viewBox="0 0 48 48"
      width={tamanho}
      height={tamanho}
      role="img"
      aria-label={selo.descricao ?? selo.nome}
      data-selo-animado={animar ? (visivel ? "dentro" : "fora") : undefined}
      style={{ "--selo-atraso": `${atraso}s` } as React.CSSProperties}
      className={`selo-svg shrink-0 overflow-visible ${className}`}
    >
      {titulo && <title>{selo.descricao ?? selo.nome}</title>}
      <g className="selo-forma">
        <path d={forma.d} fill={selo.cor} stroke={selo.cor} strokeWidth={2.5} strokeLinejoin="round" />
        {/* Brilho suave no alto, para o selo não parecer chapado */}
        <path d={forma.d} fill={`url(#${brilho})`} opacity={0.18} />
        <path
          className="selo-anel"
          d={forma.d}
          pathLength={1}
          fill="none"
          stroke={tinta}
          strokeOpacity={0.42}
          strokeWidth={1.1 / forma.escalaAnel}
          transform={`translate(24 ${forma.centro}) scale(${forma.escalaAnel}) translate(-24 -${forma.centro})`}
        />
      </g>
      <g className="selo-simbolo" color={tinta}>
        {Icone ? (
          <Icone x={24 - lado / 2} y={forma.centro - lado / 2} width={lado} height={lado} strokeWidth={2.1} aria-hidden />
        ) : (
          <text
            x={24}
            y={forma.centro}
            textAnchor="middle"
            dominantBaseline="central"
            fill={tinta}
            fontSize={tamanhoLetra}
            fontWeight={700}
            letterSpacing={letra.length >= 3 ? 0.4 : 0}
            style={{ fontFamily: "var(--font-sans, ui-sans-serif, system-ui, sans-serif)" }}
          >
            {letra || "?"}
          </text>
        )}
      </g>
      <defs>
        <linearGradient id={brilho} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="0.6" stopColor="#fff" stopOpacity={0} />
        </linearGradient>
      </defs>
    </svg>
  );
}
