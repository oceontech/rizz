"use client";

import Image from "next/image";
import { useRef } from "react";

import { BotaoLink } from "@/components/ui/Botao";
import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import { img, type ImgKey } from "@/lib/images";

import VideoB from "./VideoB";

type Quadro = { chave: ImgKey; nome: string; video?: string; formato: string };

/**
 * Fotos e clipes do álbum. `formato` varia a altura dos quadros para as
 * colunas não ficarem alinhadas como uma tabela.
 */
const QUADROS: Quadro[] = [
  { chave: "risoto-salmao-trufado", nome: "Risoto de salmão trufado com limão siciliano", formato: "aspect-[3/4]" },
  { chave: "salmao-funghi-risoto-brie", nome: "Salmão ao creme de funghi", video: "salmao-funghi", formato: "aspect-[9/14]" },
  { chave: "risoto-camarao", nome: "Risoto de camarão", formato: "aspect-[4/5]" },
  { chave: "ancho-talharim-parma", nome: "Ancho Red Angus com talharim na fonduta de parmesão", formato: "aspect-[3/4]" },
  { chave: "salmao-pistache-risoto-limao", nome: "Salmão na farofa de pistache com risoto de limão siciliano", formato: "aspect-[4/5]" },
  { chave: "massa-formaggio-file", nome: "Massa ao formaggio com crispy de parma e filé mignon", formato: "aspect-[3/4]" },
  { chave: "carpaccio-salada", nome: "Carpaccio bovino com salada", formato: "aspect-square" },
  { chave: "peixe-arroz-negro", nome: "Camarões com arroz negro", video: "camarao-arroz-negro", formato: "aspect-[9/14]" },
  { chave: "camarao-pesto-pistache", nome: "Camarão rosa com massa ao pesto e farofa de pistache", formato: "aspect-[4/5]" },
  { chave: "brownie-frutas-vermelhas", nome: "Brownie com calda de frutas vermelhas e sorvete de creme", formato: "aspect-[3/4]" },
  { chave: "arancini-salmao-trufado", nome: "Arancini de salmão trufado", formato: "aspect-square" },
  { chave: "burrata-cogumelos-trufados", nome: "Burrata com confit de cogumelos trufados", formato: "aspect-[4/5]" },
];

/**
 * Distribui os quadros em `n` colunas, alternando. No desktop a lista entra
 * duas vezes (a segunda deslocada): com só três quadros por coluna, a coluna
 * mais rápida terminava antes da parede e mostrava o fundo.
 */
const colunas = (n: number) => {
  const lista = n > 2 ? [...QUADROS, ...QUADROS.slice(5), ...QUADROS.slice(0, 5)] : QUADROS;
  return Array.from({ length: n }, (_, c) => lista.filter((_, i) => i % n === c));
};

/** Deslocamento de cada coluna ao longo da rolagem, em % da própria altura. */
const VELOCIDADES = [-14, 10, -20, 6];

function Coluna({ quadros, indice }: { quadros: Quadro[]; indice: number }) {
  return (
    <div data-coluna={indice} className="flex min-w-0 flex-1 flex-col will-change-transform">
      {quadros.map((q, i) => (
        // -mt-px: as fotos encostam sem o fio de antisserrilhado entre elas.
        <figure key={`${q.chave}-${i}`} className={`group relative -mt-px overflow-hidden ${q.formato}`}>
          {q.video ? (
            <VideoB nome={q.video} rotulo={q.nome} className="absolute -inset-px h-[calc(100%+2px)] w-[calc(100%+2px)] object-cover" />
          ) : (
            <Image
              src={img(q.chave)}
              alt={q.nome}
              fill
              placeholder="blur"
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover transition-transform duration-1000 ease-[var(--ease-rizz)] group-hover:scale-[1.05]"
            />
          )}
          <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-noite/85 to-transparent px-4 pt-14 pb-4 font-display text-base leading-snug text-creme italic transition-opacity duration-500 md:px-5 md:text-lg md:opacity-0 md:group-hover:opacity-100">
            {q.nome}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

/**
 * Galeria da versão B: parede de fotos coladas em colunas que andam em
 * velocidades diferentes com a rolagem (duas no celular, quatro no desktop).
 * Deliberadamente diferente do carrossel da seleção do cardápio, que fica
 * logo acima: lá se passa de lado, aqui a parede desliza.
 */
export default function GaleriaB() {
  const raiz = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const no = raiz.current;
      if (!no) return;
      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) return;
        gsap.utils.toArray<HTMLElement>("[data-coluna]", no).forEach((col) => {
          const v = VELOCIDADES[Number(col.dataset.coluna) % VELOCIDADES.length];
          gsap.fromTo(
            col,
            { yPercent: v < 0 ? 0 : -v },
            {
              yPercent: v < 0 ? v : 0,
              ease: "none",
              scrollTrigger: { trigger: no, start: "top bottom", end: "bottom top", scrub: 0.5 },
            },
          );
        });
      });

      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <section ref={raiz} aria-labelledby="galeria-b" className="relative overflow-hidden bg-noite pt-24 md:pt-32">
      <div className="wrap flex flex-col items-center text-center">
        <h2 id="galeria-b" className="flex flex-col items-center not-italic">
          <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[clamp(2.9rem,9vw,5.5rem)] leading-none text-creme">
            Da cozinha
          </span>
          <span className="font-[family-name:var(--font-instrument)] text-[clamp(4rem,15vw,9.5rem)] leading-[0.9] tracking-[0.01em] text-ouro-claro uppercase">
            para a mesa
          </span>
        </h2>
        <p className="mt-6 max-w-md text-lg leading-relaxed text-creme/75">
          Entradas, risotos, carnes, massas e sobremesas do cardápio do Rizz.
        </p>
      </div>

      {/* Parede: a altura é menor que as colunas, que deslizam por dentro. */}
      <div className="relative mt-14 h-[150svh] overflow-hidden md:mt-20 md:h-[165svh]">
        <div className="flex md:hidden">
          {colunas(2).map((c, i) => (
            <Coluna key={i} quadros={c} indice={i} />
          ))}
        </div>
        <div className="hidden md:flex">
          {colunas(4).map((c, i) => (
            <Coluna key={i} quadros={c} indice={i} />
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-noite to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-[45svh] items-end justify-center bg-gradient-to-t from-noite via-noite/80 to-transparent pb-20">
          <div className="pointer-events-auto">
            <BotaoLink href="/cardapio" tamanho="lg">
              Ver o cardápio
            </BotaoLink>
          </div>
        </div>
      </div>
    </section>
  );
}
