"use client";

import { useRef } from "react";

import { useBoot } from "@/components/motion/Boot";
import Logo from "@/components/brand/Logo";
import HeroFundo from "@/components/home/HeroFundo";
import { BotaoLink } from "@/components/ui/Botao";
import IndicadorAbertura from "@/components/ui/StatusAbertura";
import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/site";

/**
 * Hero da versão B.
 *
 * No celular o vídeo deixa de ser fundo coberto por véu: fica limpo, numa
 * janela em arco no centro, e o texto vem embaixo, centralizado. No desktop
 * segue como na versão A (fotos em tela cheia com véu), só com a chamada no
 * estilo de letras misturadas da B.
 *
 * Um único `HeroFundo` serve aos dois: as classes da moldura é que mudam com
 * a largura. Montar dois faria o celular baixar o vídeo duas vezes.
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
        const entrada = no.querySelectorAll("[data-entra]");
        const veu = no.querySelector("[data-veu]");
        const moldura = no.querySelector("[data-moldura]");
        const conteudo = no.querySelector("[data-sai]");
        const cena = no.querySelector("[data-cena]");

        if (contexto.conditions?.parado) {
          gsap.set(entrada, { opacity: 1, y: 0 });
          gsap.set(veu, { opacity: 1 });
          return;
        }

        if (pronto) {
          gsap
            .timeline()
            .fromTo(veu, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: "power2.out" })
            .fromTo(moldura, { clipPath: "inset(18% 0% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "power3.out" }, 0)
            .fromTo(
              entrada,
              { opacity: 0, y: 50 },
              { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, ease: "power3.out" },
              0.35,
            );
        } else {
          gsap.set(entrada, { opacity: 0 });
          gsap.set(veu, { opacity: 0 });
        }

        gsap
          .timeline({
            scrollTrigger: { trigger: no, start: "top top", end: "bottom bottom", scrub: 0.6 },
          })
          .fromTo(cena, { scale: 1, yPercent: 0 }, { scale: 1.16, yPercent: 4, ease: "none" }, 0)
          .fromTo(conteudo, { opacity: 1, y: 0 }, { opacity: 0, y: -60, ease: "none" }, 0.1);
      });

      return () => mm.revert();
    },
    { scope: raiz, dependencies: [pronto] },
  );

  return (
    <div ref={raiz} className="relative h-[170svh] md:h-[190svh]">
      {/* No celular, o espaço de cima é do header e o de baixo, da barra de
          navegação: a coluna se encaixa entre os dois. */}
      <section className="sticky top-0 flex h-[100svh] min-h-[36rem] flex-col items-center overflow-hidden pt-[calc(var(--altura-header-cheia)+0.25rem)] pb-[calc(var(--spacing-nav)+1rem)] md:block md:min-h-[34rem] md:p-0">
        <p className="eyebrow mb-3 text-ambar md:hidden">
          {site.endereco.cidade}, {site.endereco.uf}
        </p>

        <div
          data-moldura
          className="relative min-h-0 w-[min(78vw,22rem)] flex-1 overflow-hidden rounded-t-full md:absolute md:inset-0 md:-z-10 md:w-auto md:rounded-none"
        >
          <div data-cena className="size-full will-change-transform">
            <HeroFundo />
          </div>

          {/* Pé do arco no celular: o logo pousa sobre ele. */}
          <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-noite via-noite/50 to-transparent md:hidden" />

          <div
            data-veu
            className="absolute inset-0 hidden bg-[linear-gradient(to_top,rgb(43_7_16/0.97)_0%,rgb(43_7_16/0.95)_36%,rgb(43_7_16/0.84)_52%,rgb(43_7_16/0.52)_68%,rgb(43_7_16/0.22)_84%,rgb(43_7_16/0.45)_100%)] md:block"
          />
          <div
            className="absolute inset-x-0 -bottom-2 hidden md:block"
            style={{
              height: "calc(26svh + 0.5rem)",
              background: "linear-gradient(to bottom, rgb(43 7 16 / 0), rgb(43 7 16) 82%, rgb(43 7 16))",
            }}
          />
        </div>

        <div
          data-sai
          className="wrap flex flex-col items-center text-center md:absolute md:inset-x-0 md:bottom-0 md:items-start md:pb-24 md:text-left"
        >
          <p data-entra className="eyebrow hidden text-ambar text-shadow-cena md:block">
            {site.endereco.cidade}, {site.endereco.uf}
          </p>

          <h1 data-entra className="-mt-9 md:mt-5">
            <span className="sr-only">{site.nome}. Restaurante em Espírito Santo do Pinhal.</span>
            <Logo
              variante="branca"
              decorativo
              priority
              sizes="(min-width: 860px) 19rem, 44vw"
              className="h-auto w-[min(44vw,11rem)] drop-shadow-[0_6px_24px_rgb(43_7_16/0.7)] md:w-[19rem]"
            />
          </h1>

          <p data-entra className="mt-3 flex flex-col items-center leading-none md:mt-7 md:items-start">
            <span className="font-display text-[1.6rem] text-creme italic md:text-[2.5rem]">Especialidade em</span>
            <span className="mt-1 font-sans text-[2.6rem] font-semibold tracking-[-0.03em] text-ouro-claro uppercase md:text-[4.25rem]">
              Risotos
            </span>
          </p>

          <p data-entra className="mt-4 hidden max-w-md text-base leading-relaxed text-creme/80 md:block">
            Cozinha contemporânea e vinhos para acompanhar seu almoço ou jantar.
          </p>

          <div data-entra className="mt-5 flex items-center gap-2.5 md:mt-8 md:gap-3">
            <BotaoLink href="/cardapio" variante="ambar" className="md:h-14 md:px-8 md:text-xs">
              Ver cardápio
            </BotaoLink>
            <BotaoLink href="/reservas" variante="contorno" className="md:h-14 md:px-8 md:text-xs">
              Reservar mesa
            </BotaoLink>
          </div>

          <div data-entra className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 md:mt-7 md:justify-start">
            <IndicadorAbertura />
            <a href="#visite" className="hidden text-xs text-creme/75 underline underline-offset-4 hover:text-ambar md:inline">
              Horários e endereço
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
