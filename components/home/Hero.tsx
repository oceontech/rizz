"use client";

import { useRef } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import { useBoot } from "@/components/motion/Boot";
import Logo from "@/components/brand/Logo";
import HeroFundo from "@/components/home/HeroFundo";
import { BotaoLink } from "@/components/ui/Botao";
import IndicadorAbertura from "@/components/ui/StatusAbertura";
import { site, whatsappLink } from "@/lib/site";

/**
 * Hero: o vídeo ocupa a tela inteira, sem moldura.
 *
 * O véu é pesado na metade de baixo e leve em cima. A faixa escura sobe até
 * onde o bloco de texto realmente começa (o eyebrow), não só até a base —
 * senão o rótulo cai sobre os pratos claros do vídeo e some. A metade
 * superior fica limpa, que é onde o vídeo mostra o salão e tem impacto.
 *
 * A base tem ainda um degradê até a cor de fundo, então a cena **dissolve**
 * na seção seguinte em vez de terminar numa borda reta.
 */
export default function Hero() {
  const raiz = useRef<HTMLDivElement>(null);
  const { pronto } = useBoot();

  useGSAP(
    () => {
      const no = raiz.current;
      if (!no) return;

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        const parado = contexto.conditions?.parado;
        const entrada = no.querySelectorAll("[data-entra]");
        const veu = no.querySelector("[data-veu]");
        const conteudo = no.querySelector("[data-sai]");
        const cena = no.querySelector("[data-cena]");

        if (parado) {
          gsap.set(entrada, { opacity: 1, y: 0 });
          gsap.set(veu, { opacity: 1 });
          return;
        }

        /**
         * Entrada, só depois que a cortina do preloader sai. O fundo já
         * está rodando por baixo; primeiro o véu vinho encorpa, depois os
         * conteúdos sobem um a um.
         */
        if (pronto) {
          gsap
            .timeline()
            .fromTo(veu, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: "power2.out" })
            .fromTo(
              entrada,
              { opacity: 0, y: 70 },
              {
                opacity: 1,
                y: 0,
                duration: 1.2,
                stagger: 0.12,
                ease: "power3.out",
              },
              0.45,
            );
        } else {
          gsap.set(entrada, { opacity: 0 });
          gsap.set(veu, { opacity: 0 });
        }

        /**
         * A saída na rolagem move o BLOCO inteiro (`data-sai`), não cada
         * item: animando os mesmos elementos da entrada, o `fromTo` da
         * rolagem acendia tudo na montagem e a entrada começava já visível.
         */
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: no,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.6,
          },
        });

        tl.fromTo(
          cena,
          { scale: 1, yPercent: 0, y: 0 },
          { scale: 1.16, yPercent: 4, y: 0, ease: "none" },
          0,
        ).fromTo(
          conteudo,
          { opacity: 1, y: 0 },
          { opacity: 0, y: -60, ease: "none" },
          0.1,
        );
      });

      return () => mm.revert();
    },
    { scope: raiz, dependencies: [pronto] },
  );

  return (
    <div ref={raiz} className="relative h-[190svh]">
      <section className="sticky top-0 flex h-[100svh] min-h-[34rem] items-end overflow-hidden">
        <div className="absolute inset-0 -z-10">
          {/* Fotos com zoom no desktop, vídeo no celular — ver HeroFundo. */}
          <div data-cena className="size-full will-change-transform">
            <HeroFundo />
          </div>

          {/* Véu de contraste: sólido onde o texto vive, limpo lá em cima. */}
          <div data-veu className="absolute inset-0 bg-[linear-gradient(to_top,rgb(43_7_16/0.97)_0%,rgb(43_7_16/0.95)_36%,rgb(43_7_16/0.84)_52%,rgb(43_7_16/0.52)_68%,rgb(43_7_16/0.22)_84%,rgb(43_7_16/0.45)_100%)]" />

          {/* Dissolve para a seção seguinte. Termina em vinho SÓLIDO e passa
              um pouco da borda: o fundo mora numa camada própria (escala e
              zoom), e sem isso sobrava uma linha de 1px dele na emenda. */}
          <div
            className="absolute inset-x-0 -bottom-2"
            style={{
              height: "calc(26svh + 0.5rem)",
              background:
                "linear-gradient(to bottom, rgb(43 7 16 / 0), rgb(43 7 16) 82%, rgb(43 7 16))",
            }}
          />
        </div>

        {/* pb generoso no mobile: a bottom nav cobre os últimos ~72px e a
            linha de horário ficava atrás dela. */}
        <div data-sai className="wrap pb-24 md:pb-24">
          <p
            data-entra
            className="eyebrow text-ambar text-shadow-cena"
          >
            Desde sempre no ponto
          </p>

          <h1 data-entra className="mt-4 md:mt-5">
            <span className="sr-only">
              {site.nome} — cozinha italiana contemporânea
            </span>
            <Logo
              variante="branca"
              decorativo
              priority
              sizes="(min-width: 860px) 19rem, 48vw"
              className="h-auto w-[min(48vw,12rem)] md:w-[19rem]"
            />
          </h1>

          <p
            data-entra
            className="mt-5 max-w-[20ch] font-display text-[1.75rem] italic leading-[1.15] text-creme text-shadow-cena md:mt-7 md:max-w-[22ch] md:text-[2.75rem]"
          >
            Criações e releituras da cozinha italiana.
          </p>

          {/* Compactos para caber lado a lado em 390px — empilhados eles
              comiam altura e a coluna ficava desalinhada. */}
          <div
            data-entra
            className="mt-6 flex flex-wrap items-center gap-2.5 md:mt-9 md:gap-3"
          >
            <BotaoLink
              href="/cardapio"
              variante="ambar"
              className="md:h-14 md:px-8 md:text-xs"
            >
              Ver o cardápio
            </BotaoLink>
            <BotaoLink
              href={whatsappLink(
                `Olá! Gostaria de reservar uma mesa no ${site.nome}.`,
              )}
              variante="contorno"
              className="md:h-14 md:px-8 md:text-xs"
            >
              Reservar mesa
            </BotaoLink>
          </div>

          <div data-entra className="mt-5 md:mt-7">
            <IndicadorAbertura />
          </div>
        </div>
      </section>
    </div>
  );
}
