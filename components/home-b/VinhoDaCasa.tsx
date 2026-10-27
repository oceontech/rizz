"use client";

import Image from "next/image";
import { useRef } from "react";

import { BotaoLink } from "@/components/ui/Botao";
import garrafa from "@/assets/img/vinho-rizz-syrah.webp";
import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import { img } from "@/lib/images";
import { whatsappLink } from "@/lib/site";

import Textura from "./Textura";

/**
 * O vinho com o nome da casa, em formato de cartaz: painel dourado com o
 * nome grande à esquerda, cena em vinho com a garrafa à direita.
 *
 * Os dados vêm só do rótulo (tinto seco, Syrah, colheita de inverno, safra
 * 2023, 750 ml, 13,5%). Origem, produtor e preço não estão confirmados e
 * ficam de fora.
 */
export default function VinhoDaCasa() {
  const raiz = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const no = raiz.current;
      if (!no) return;
      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) return;

        gsap.fromTo(
          no.querySelector("[data-garrafa]"),
          { yPercent: 14, rotate: 6 },
          {
            yPercent: -4,
            rotate: -2,
            ease: "none",
            scrollTrigger: { trigger: no, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
        gsap.fromTo(
          no.querySelectorAll("[data-letreiro]"),
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            stagger: 0.1,
            duration: 1,
            scrollTrigger: { trigger: no, start: "top 70%", toggleActions: "play none none reverse" },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <section ref={raiz} aria-labelledby="vinho-da-casa" className="bg-noite py-6 md:py-10">
      <div className="mx-auto grid max-w-[90rem] gap-3 px-3 md:grid-cols-2 md:px-6">
        {/* Painel do nome */}
        <div className="relative isolate flex min-h-[66svh] flex-col items-center justify-between bg-ouro-claro [clip-path:inset(0_round_2rem)] md:[clip-path:inset(0_round_2.5rem)] md:min-h-[78svh] px-6 py-12 text-center text-vinho md:py-16">
          <Textura />
          <p className="eyebrow text-vinho">O vinho da casa</p>

          {/* Mesma combinação dos letreiros da B: cursiva encostando na
              serifada alta em caixa alta. */}
          <h2 id="vinho-da-casa" className="flex flex-col items-center not-italic">
            <span data-letreiro className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[clamp(4rem,13vw,8.5rem)] leading-none">
              Rizz
            </span>
            <span
              data-letreiro
              className="font-[family-name:var(--font-instrument)] text-[clamp(6rem,26vw,13rem)] leading-[0.9] tracking-[0.01em] uppercase"
            >
              Syrah
            </span>
            <span data-letreiro className="mt-3 font-sans text-[0.7rem] font-medium tracking-[0.42em] uppercase md:text-xs">
              Colheita de inverno
            </span>
          </h2>

          <div className="flex flex-col items-center gap-6">
            <p className="eyebrow text-vinho/80">
              Safra 2023 · 750 ml · 13,5% vol.
            </p>
            <BotaoLink
              href={whatsappLink("Olá! Gostaria de saber sobre o vinho Rizz Syrah.")}
              variante="vinho"
              tamanho="lg"
            >
              Perguntar pelo WhatsApp
            </BotaoLink>
          </div>
        </div>

        {/* Cena da garrafa */}
        <div className="relative isolate flex min-h-[78svh] items-center justify-center bg-noite [clip-path:inset(0_round_2rem)] md:[clip-path:inset(0_round_2.5rem)]">
          {/* Fundo `noite`, igual ao da seção: o fio de antisserrilhado do
              canto arredondado some na emenda. */}
          <Image
            src={img("file-parmesao-vinho")}
            alt=""
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="-z-20 object-cover opacity-30 mix-blend-luminosity"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-noite via-vinho-fundo/80 to-vinho-fundo/60" />

          <p className="absolute top-[7%] left-[8%] z-10 text-ambar md:top-[14%] md:right-[8%] md:left-auto md:text-right">
            <span className="relative z-10 -mb-[0.1em] block font-[family-name:var(--font-pinyon)] text-3xl leading-none md:text-5xl">Vinho fino</span>
            <span className="block font-[family-name:var(--font-instrument)] tracking-[0.01em] uppercase text-4xl leading-[0.9] md:text-6xl">Tinto seco</span>
          </p>

          <div data-garrafa className="relative mt-[10svh] h-[58svh] w-auto md:mt-0 md:h-[66svh]">
            {/* Sombra: a mesma garrafa, toda preta, desfocada e deslocada. */}
            <Image
              src={garrafa}
              alt=""
              aria-hidden
              sizes="(min-width: 768px) 20vw, 40vw"
              className="absolute inset-0 h-full w-auto translate-x-[24%] translate-y-[2%] rotate-[5deg] opacity-80 blur-[7px] brightness-0"
            />
            <Image
              src={garrafa}
              alt="Garrafa do vinho Rizz Syrah, colheita de inverno, safra 2023"
              sizes="(min-width: 768px) 20vw, 40vw"
              className="relative h-full w-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
