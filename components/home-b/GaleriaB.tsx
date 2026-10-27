"use client";

import Image from "next/image";
import { useRef } from "react";

import { BotaoLink } from "@/components/ui/Botao";
import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import { img, type ImgKey } from "@/lib/images";

import VideoB from "./VideoB";

type Foto = { chave: ImgKey; nome: string };

/**
 * Fotos e vídeos colados uns nos outros, sem moldura nem vão: uma faixa
 * contínua. Com `video`, o quadro toca o clipe do álbum em vez da foto.
 * `larga` alterna a largura para a faixa não virar uma fileira de cards.
 */
const FAIXA: (Foto & { larga?: boolean; video?: string })[] = [
  { chave: "risoto-salmao-trufado", nome: "Risoto de salmão trufado com limão siciliano", larga: true },
  { chave: "salmao-funghi-risoto-brie", nome: "Salmão ao creme de funghi", video: "salmao-funghi" },
  { chave: "risoto-camarao", nome: "Risoto de camarão" },
  { chave: "ancho-talharim-parma", nome: "Ancho Red Angus com talharim na fonduta de parmesão", larga: true },
  { chave: "salmao-pistache-risoto-limao", nome: "Salmão na farofa de pistache com risoto de limão siciliano" },
  { chave: "massa-formaggio-file", nome: "Massa ao formaggio com crispy de parma e filé mignon", larga: true },
  { chave: "carpaccio-salada", nome: "Carpaccio bovino com salada" },
  { chave: "peixe-arroz-negro", nome: "Camarões com arroz negro", video: "camarao-arroz-negro" },
  { chave: "camarao-pesto-pistache", nome: "Camarão rosa com massa ao pesto e farofa de pistache", larga: true },
  { chave: "brownie-frutas-vermelhas", nome: "Brownie com calda de frutas vermelhas e sorvete de creme" },
];

/**
 * Galeria da versão B: um trilho horizontal que anda com a rolagem vertical.
 *
 * Mesmo esquema das outras cenas da home: palco `sticky` dentro de uma seção
 * alta, sem pin do ScrollTrigger. O deslocamento é medido na hora (função +
 * `invalidateOnRefresh`), então serve para qualquer largura de tela.
 *
 * Com movimento reduzido não há palco: o trilho vira uma faixa com rolagem
 * lateral comum.
 */
export default function GaleriaB() {
  const raiz = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const no = raiz.current;
      const trilho = no?.querySelector<HTMLElement>("[data-trilho]");
      if (!no || !trilho) return;

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) return;

        gsap.to(trilho, {
          x: () => -(trilho.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: no,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
      });

      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <section
      ref={raiz}
      aria-labelledby="galeria-b"
      className="relative h-[460svh] bg-noite motion-reduce:h-auto"
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:overflow-x-auto motion-reduce:py-24">
        <div
          data-trilho
          className="flex w-max items-center gap-10 pr-[12vw] pl-[6vw] will-change-transform md:gap-16 md:pl-[8vw]"
        >
          <div className="w-[78vw] shrink-0 md:w-[30rem]">
            <p className="eyebrow text-ambar">Galeria</p>
            <h2 id="galeria-b" className="mt-5 flex flex-col leading-none not-italic">
              <span className="font-display text-[clamp(2.6rem,7vw,5rem)] text-creme italic">Da cozinha</span>
              <span className="mt-1 font-sans text-[clamp(2.4rem,6.4vw,4.6rem)] font-semibold tracking-[-0.03em] text-ouro-claro uppercase">
                para a mesa
              </span>
            </h2>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-creme/75">
              Entradas, risotos, carnes, massas e sobremesas do cardápio do Rizz.
            </p>
          </div>

          <ul className="flex h-[62svh] shrink-0 md:h-[70svh] [&>li+li]:-ml-px">
            {FAIXA.map((f) => (
              <li key={f.chave} className={`group relative h-full shrink-0 overflow-hidden ${f.larga ? "w-[72vw] md:w-[30rem]" : "w-[52vw] md:w-[21rem]"}`}>
                {f.video ? (
                  <VideoB nome={f.video} rotulo={f.nome} className="size-full object-cover" />
                ) : (
                  <Image
                    src={img(f.chave)}
                    alt={f.nome}
                    placeholder="blur"
                    sizes="(min-width: 768px) 480px, 72vw"
                    className="size-full object-cover transition-transform duration-700 ease-[var(--ease-rizz)] group-hover:scale-[1.04]"
                  />
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-noite/85 to-transparent px-5 pt-16 pb-5">
                  <p className="font-display text-lg leading-snug text-creme italic">{f.nome}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex w-[70vw] shrink-0 flex-col items-start gap-6 md:w-[24rem]">
            <p className="flex flex-col leading-none">
              <span className="font-display text-[clamp(2.4rem,5vw,3.5rem)] text-creme italic">Tem mais</span>
              <span className="mt-1 font-sans text-[clamp(2rem,4.4vw,3rem)] font-semibold tracking-[-0.03em] text-ouro-claro uppercase">no cardápio</span>
            </p>
            <BotaoLink href="/cardapio" tamanho="lg">
              Ver o cardápio
            </BotaoLink>
          </div>
        </div>
      </div>
    </section>
  );
}
