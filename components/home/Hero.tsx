"use client";

import { useRef } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import { useBoot } from "@/components/motion/Boot";
import Logo from "@/components/brand/Logo";
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
        const cena = no.querySelector("[data-cena]");

        if (parado) {
          gsap.set(entrada, { opacity: 1, y: 0, filter: "blur(0px)" });
          return;
        }

        // Entrada, só depois que a cortina do preloader sai.
        if (pronto) {
          gsap.fromTo(
            entrada,
            { opacity: 0, y: 24, x: 0, filter: "blur(12px)" },
            {
              opacity: 1,
              y: 0,
              x: 0,
              filter: "blur(0px)",
              duration: 1.15,
              stagger: 0.1,
              ease: "power3.out",
            },
          );
        } else {
          gsap.set(entrada, { opacity: 0 });
        }

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
          no.querySelectorAll("[data-sai]"),
          { opacity: 1, y: 0 },
          { opacity: 0, y: -40, ease: "none", stagger: 0.05 },
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
          <div data-cena className="size-full will-change-transform">
            <video
              className="size-full object-cover"
              src="/videos/hero.mp4"
              poster="/videos/hero-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden
            />
          </div>

          {/* Véu de contraste: sólido onde o texto vive, limpo lá em cima. */}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgb(43_7_16/0.97)_0%,rgb(43_7_16/0.95)_36%,rgb(43_7_16/0.84)_52%,rgb(43_7_16/0.52)_68%,rgb(43_7_16/0.22)_84%,rgb(43_7_16/0.45)_100%)]" />

          {/* Dissolve para a seção seguinte. */}
          <div className="absolute inset-x-0 bottom-0 h-[26svh] bg-gradient-to-b from-transparent to-noite" />
        </div>

        {/* pb generoso no mobile: a bottom nav cobre os últimos ~72px e a
            linha de horário ficava atrás dela. */}
        <div className="wrap pb-24 md:pb-24">
          <p
            data-entra
            data-sai
            className="eyebrow text-ambar text-shadow-cena"
          >
            Desde sempre no ponto
          </p>

          <h1 data-entra data-sai className="mt-4 md:mt-5">
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
            data-sai
            className="mt-5 max-w-[20ch] font-display text-[1.75rem] italic leading-[1.15] text-creme text-shadow-cena md:mt-7 md:max-w-[22ch] md:text-[2.75rem]"
          >
            Criações e releituras da cozinha italiana.
          </p>

          {/* Compactos para caber lado a lado em 390px — empilhados eles
              comiam altura e a coluna ficava desalinhada. */}
          <div
            data-entra
            data-sai
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

          <div data-entra data-sai className="mt-5 md:mt-7">
            <IndicadorAbertura />
          </div>
        </div>
      </section>
    </div>
  );
}
