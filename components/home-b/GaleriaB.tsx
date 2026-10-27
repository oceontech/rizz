"use client";

import Image from "next/image";
import { useRef } from "react";

import { BotaoLink } from "@/components/ui/Botao";
import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import { img, type ImgKey } from "@/lib/images";

type Foto = { chave: ImgKey; nome: string };

/** As três da tira, como numa cabine de fotos. */
const TIRA: Foto[] = [
  { chave: "burrata-cogumelos-trufados", nome: "Burrata com confit de cogumelos trufados" },
  { chave: "arancini-salmao-trufado", nome: "Arancini de salmão trufado" },
  { chave: "risoto-trufado-brie", nome: "Risoto de alho negro trufado com funghi e brie" },
];

/**
 * `alto` alterna a altura e o deslocamento vertical das molduras: o trilho
 * fica com o ritmo de uma parede de quadros, não de uma fileira de cards.
 */
const QUADROS: (Foto & { alto?: boolean })[] = [
  { chave: "risoto-salmao-trufado", nome: "Risoto de salmão trufado com limão siciliano", alto: true },
  { chave: "risoto-camarao", nome: "Risoto de camarão" },
  { chave: "ancho-talharim-parma", nome: "Ancho Red Angus com talharim na fonduta de parmesão", alto: true },
  { chave: "salmao-pistache-risoto-limao", nome: "Salmão na farofa de pistache com risoto de limão siciliano" },
  { chave: "massa-formaggio-file", nome: "Massa ao formaggio com crispy de parma e filé mignon", alto: true },
  { chave: "carpaccio-salada", nome: "Carpaccio bovino com salada" },
  { chave: "camarao-pesto-pistache", nome: "Camarão rosa com massa ao pesto e farofa de pistache", alto: true },
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

        // A tira balança de leve enquanto o trilho passa.
        gsap.fromTo(
          no.querySelector("[data-tira]"),
          { rotate: -7 },
          {
            rotate: 2,
            ease: "none",
            scrollTrigger: { trigger: no, start: "top top", end: "40% bottom", scrub: true },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <section
      ref={raiz}
      aria-labelledby="galeria-b"
      className="relative h-[420svh] bg-vinho-fundo motion-reduce:h-auto"
    >
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:overflow-x-auto motion-reduce:py-24">
        <div
          data-trilho
          className="flex w-max items-center gap-10 pr-[12vw] pl-[6vw] will-change-transform md:gap-16 md:pl-[8vw]"
        >
          <div className="w-[78vw] shrink-0 md:w-[30rem]">
            <p className="eyebrow text-ambar">Galeria</p>
            <h2 id="galeria-b" className="mt-5 text-display text-creme">
              Da cozinha para a mesa.
            </h2>
            <p className="mt-6 max-w-sm text-lg leading-relaxed text-creme/75">
              Entradas, risotos, carnes, massas e sobremesas do cardápio do Rizz.
            </p>
          </div>

          {/* Tira de cabine de fotos: três quadros numa fita preta. */}
          <figure data-tira className="w-[46vw] shrink-0 origin-top rotate-[-4deg] bg-[#120307] p-2.5 pb-10 shadow-[0_30px_70px_rgb(0_0_0/0.5)] md:w-[15rem]">
            <ul className="flex flex-col gap-2.5">
              {TIRA.map((f) => (
                <li key={f.chave} className="aspect-[4/5] overflow-hidden">
                  <Image
                    src={img(f.chave)}
                    alt={f.nome}
                    placeholder="blur"
                    sizes="(min-width: 768px) 240px, 46vw"
                    className="size-full object-cover"
                  />
                </li>
              ))}
            </ul>
            <figcaption className="mt-4 text-center font-display text-lg text-creme/80 italic">Rizz · trufados</figcaption>
          </figure>

          {QUADROS.map((f) => (
            <figure
              key={f.chave}
              className={`w-[64vw] shrink-0 md:w-[22rem] ${f.alto ? "-translate-y-[6svh]" : "translate-y-[8svh] md:w-[19rem]"}`}
            >
              <div className={`overflow-hidden bg-creme p-2.5 ${f.alto ? "aspect-[3/4]" : "aspect-[4/5]"}`}>
                <Image
                  src={img(f.chave)}
                  alt={f.nome}
                  placeholder="blur"
                  sizes="(min-width: 768px) 360px, 64vw"
                  className="size-full object-cover"
                />
              </div>
              <figcaption className="mt-4 max-w-[18rem] font-display text-lg leading-snug text-creme/85 italic">{f.nome}</figcaption>
            </figure>
          ))}

          <div className="flex w-[70vw] shrink-0 flex-col items-start gap-6 md:w-[24rem]">
            <p className="font-display text-titulo text-creme italic">Tem mais no cardápio.</p>
            <BotaoLink href="/cardapio" tamanho="lg">
              Ver o cardápio
            </BotaoLink>
          </div>
        </div>
      </div>
    </section>
  );
}
