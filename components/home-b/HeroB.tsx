"use client";

import { useRef } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import { useBoot } from "@/components/motion/Boot";
import HeroFundo from "@/components/home/HeroFundo";
import { BotaoLink } from "@/components/ui/Botao";
import { SeloRodizio } from "@/components/rodizio/AvisoRodizio";
import IndicadorAbertura from "@/components/ui/StatusAbertura";
import { site } from "@/lib/site";

/**
 * Hero da versão B: igual ao da A (vídeo em tela cheia, sem moldura), só com
 * o bloco de texto centralizado e a chamada no letreiro da B (cursiva +
 * serifada alta).
 *
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
export default function HeroB() {
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
      <section className="sticky top-0 flex h-[100svh] min-h-[34rem] items-end justify-center overflow-hidden md:items-center">
        <div className="absolute inset-0 -z-10">
          {/* Fotos com zoom no desktop, vídeo no celular — ver HeroFundo. */}
          <div data-cena className="size-full will-change-transform">
            <HeroFundo />
          </div>

          {/* Véu: no celular pesa embaixo, onde fica o texto; no desktop, com
              o bloco no centro, escurece por igual e mais no meio, para o
              letreiro não brigar com a placa "Rizz" das fotos. */}
          <div
            data-veu
            className="absolute inset-0 bg-[linear-gradient(to_top,rgb(43_7_16/0.97)_0%,rgb(43_7_16/0.92)_38%,rgb(43_7_16/0.6)_60%,rgb(43_7_16/0.25)_82%,rgb(43_7_16/0.45)_100%)] md:bg-[radial-gradient(ellipse_60%_70%_at_50%_52%,rgb(43_7_16/0.86)_0%,rgb(43_7_16/0.72)_55%,rgb(43_7_16/0.55)_100%)]"
          />

          <div
            className="absolute inset-x-0 -bottom-2"
            style={{
              height: "calc(26svh + 0.5rem)",
              background: "linear-gradient(to bottom, rgb(43 7 16 / 0), rgb(43 7 16) 82%, rgb(43 7 16))",
            }}
          />
        </div>

        {/* pb generoso no mobile: a bottom nav cobre os últimos ~72px. */}
        <div data-sai className="wrap flex flex-col items-center pb-24 text-center md:pt-16 md:pb-0">
          <p data-entra className="eyebrow text-ambar text-shadow-cena">
            {site.endereco.cidade} · {site.endereco.uf}
          </p>

          {/* Rodízio em destaque, acima da chamada; só hoje ou amanhã. */}
          <div data-entra className="mt-6 empty:hidden">
            <SeloRodizio destaque />
          </div>

          {/* Sem o logo: o header já mostra a marca. O nome segue no h1 para
              leitores de tela e buscadores. */}
          <h1 data-entra className="mt-6 flex flex-col items-center not-italic md:mt-8">
            <span className="sr-only">{site.nome}, restaurante em Espírito Santo do Pinhal. </span>
            <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[2.5rem] leading-none text-creme md:text-[3.5rem]">
              Especialidade em
            </span>
            <span className="font-[family-name:var(--font-instrument)] text-[5rem] leading-[0.9] tracking-[0.01em] text-ouro-claro uppercase [text-shadow:0_6px_40px_rgb(0_0_0/0.45)] md:text-[8.5rem]">
              Risotos
            </span>
          </h1>

          <p data-entra className="mt-4 max-w-[30ch] text-sm leading-relaxed text-creme/80 md:mt-5 md:max-w-md md:text-base">
            Cozinha contemporânea e vinhos para acompanhar seu almoço ou jantar.
          </p>

          <div data-entra className="mt-6 flex flex-wrap items-center justify-center gap-2.5 md:mt-8 md:gap-3">
            <BotaoLink href="/cardapio" variante="ambar" className="md:h-14 md:px-8 md:text-xs">
              Ver cardápio
            </BotaoLink>
            <BotaoLink href="/reservas" variante="contorno" className="md:h-14 md:px-8 md:text-xs">
              Reservar mesa
            </BotaoLink>
          </div>

          <div data-entra className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:mt-7">
            <IndicadorAbertura />
            <a href="#visite" className="text-xs text-creme/75 underline underline-offset-4 hover:text-ambar">
              Horários e endereço
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
