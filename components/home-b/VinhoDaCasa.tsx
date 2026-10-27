"use client";

import Image from "next/image";
import { useRef } from "react";

import { BotaoLink } from "@/components/ui/Botao";
import garrafa from "@/assets/img/vinho-rizz-syrah.webp";
import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import { whatsappLink } from "@/lib/site";

import VideoB from "./VideoB";

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
        <div className="flex min-h-[66svh] flex-col items-center justify-between bg-ouro-claro [clip-path:inset(0_round_2rem)] md:[clip-path:inset(0_round_2.5rem)] md:min-h-[78svh] px-6 py-12 text-center text-vinho md:py-16">
          <p className="eyebrow text-vinho">O vinho da casa</p>

          <h2 id="vinho-da-casa" className="flex flex-col items-center not-italic">
            <span data-letreiro className="font-display text-[clamp(5.5rem,16vw,12rem)] leading-[0.8] italic">
              Rizz
            </span>
            <span
              data-letreiro
              className="font-sans text-[clamp(3rem,9vw,6.5rem)] leading-[0.9] font-semibold tracking-[-0.03em] uppercase"
            >
              Syrah
            </span>
            <span data-letreiro className="mt-2 font-display text-[clamp(1.75rem,4vw,3rem)] leading-none italic">
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
        <div className="relative isolate flex min-h-[78svh] items-center justify-center bg-vinho-fundo [clip-path:inset(0_round_2rem)] md:[clip-path:inset(0_round_2.5rem)]">
          {/* O clipe do álbum com a garrafa, a taça e o risoto, bem escuro e
              desfocado: é cenário, quem aparece é a garrafa recortada. */}
          <VideoB nome="vinho" className="absolute inset-0 -z-20 size-full scale-110 object-cover blur-[3px]" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-noite via-vinho-fundo/85 to-vinho-fundo/70" />

          <p className="absolute top-[7%] left-[8%] z-10 text-ambar md:top-[14%] md:right-[8%] md:left-auto md:text-right">
            <span className="block font-display text-2xl italic md:text-4xl">Vinho fino</span>
            <span className="block font-sans text-2xl leading-none font-semibold tracking-[-0.01em] uppercase md:text-4xl">
              Tinto seco
            </span>
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
