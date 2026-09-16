"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import Filete from "@/components/motion/Filete";
import RevealScrub from "@/components/motion/RevealScrub";
import { BotaoLink } from "@/components/ui/Botao";
import { ListaSelos, SeloOrigem } from "@/components/ui/Selos";
import { destaquesHome } from "@/data/menu";
import { preco } from "@/lib/format";
import { img } from "@/lib/images";

/**
 * Galeria que anda de lado.
 *
 * No desktop a seção prende e a trilha corre horizontalmente com a rolagem —
 * o gesto vira travelling de câmera. No mobile isso seria sequestrar o scroll
 * num aparelho onde arrastar de lado já é natural, então lá é snap nativo.
 */
export default function Destaques() {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const no = raiz.current;
      const trilho = no?.querySelector<HTMLElement>("[data-trilho]");
      if (!no || !trilho) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          desktop:
            "(min-width: 860px) and (prefers-reduced-motion: no-preference)",
          resto: "(max-width: 859px), (prefers-reduced-motion: reduce)",
        },
        (contexto) => {
          if (!contexto.conditions?.desktop) return;

          const distancia = () =>
            Math.max(0, trilho.scrollWidth - window.innerWidth + 96);

          gsap.fromTo(
            trilho,
            { x: 0 },
            {
              x: () => -distancia(),
              ease: "none",
              scrollTrigger: {
                trigger: no,
                start: "top top",
                end: () => `+=${distancia()}`,
                scrub: 0.7,
                pin: no.querySelector("[data-palco]"),
                anticipatePin: 1,
                invalidateOnRefresh: true,
              },
            },
          );

          // Cada foto corre um pouco dentro do próprio card.
          gsap.utils
            .toArray<HTMLElement>("[data-card-foto]", no)
            .forEach((foto) => {
              gsap.fromTo(
                foto,
                { xPercent: -5, x: 0, scale: 1.12 },
                {
                  xPercent: 5,
                  x: 0,
                  scale: 1.12,
                  ease: "none",
                  scrollTrigger: {
                    trigger: no,
                    start: "top top",
                    end: () => `+=${distancia()}`,
                    scrub: 0.7,
                    invalidateOnRefresh: true,
                  },
                },
              );
            });
        },
      );

      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <div ref={raiz} className="bg-noite">
      {/* O palco precisa caber em 100svh: a foto é medida em svh, não por
          proporção, senão os cards estouram a altura da viewport quando a
          seção prende. */}
      <div
        data-palco
        className="overflow-hidden py-24 md:flex md:h-[100svh] md:flex-col md:justify-center md:py-0"
      >
        <div className="wrap">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="eyebrow text-ambar">Da cozinha</p>
              <RevealScrub className="mt-4 text-titulo text-creme">
                Alguns favoritos
              </RevealScrub>
            </div>

            <BotaoLink href="/cardapio" variante="contorno">
              Cardápio completo
            </BotaoLink>
          </div>

          <Filete className="mt-7" />
        </div>

        <ul
          data-trilho
          className="no-scrollbar mt-8 flex snap-x snap-mandatory scroll-px-5 gap-4 overflow-x-auto px-5 pb-2 md:mt-10 md:gap-7 md:overflow-visible md:px-12"
        >
          {destaquesHome.map((item, i) => (
            <li
              key={item.id}
              className="w-[76vw] shrink-0 snap-start sm:w-[21rem] md:w-[19rem]"
            >
              <Link
                href="/cardapio"
                className="group block focus-visible:outline-none"
              >
                <div className="relative aspect-[3/4] overflow-hidden md:aspect-auto md:h-[42svh]">
                  {item.img && (
                    <Image
                      data-card-foto
                      src={img(item.img)}
                      alt={`${item.nome}${item.descricao ? ` — ${item.descricao.toLowerCase()}` : ""}`}
                      placeholder="blur"
                      sizes="(min-width: 860px) 19rem, 76vw"
                      className="size-full object-cover transition-[filter] duration-700 ease-[var(--ease-rizz)] group-hover:brightness-110"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-noite/55 via-transparent to-transparent" />
                  <span className="absolute left-4 top-4 font-display text-sm text-creme/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>

                <div className="mt-4 flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="flex flex-wrap items-center gap-x-2 gap-y-1 font-display text-lg leading-snug text-creme transition-colors duration-300 group-hover:text-ambar">
                      {item.nome}
                      <ListaSelos badges={item.badges} />
                      {item.vpj && (
                        <SeloOrigem className="border-ouro/50 text-ouro" />
                      )}
                    </h3>
                    {item.descricao && (
                      <p className="mt-1.5 line-clamp-2 text-sm leading-snug text-creme/50">
                        {item.descricao}
                      </p>
                    )}
                  </div>

                  <p className="shrink-0 font-display text-lg text-ambar">
                    {preco(item.preco)}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
