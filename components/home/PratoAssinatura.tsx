"use client";

import Image from "next/image";
import { useRef } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import Filete from "@/components/motion/Filete";
import RevealScrub from "@/components/motion/RevealScrub";
import SeloRotativo from "@/components/brand/SeloRotativo";
import { BotaoLink } from "@/components/ui/Botao";
import { ListaSelos } from "@/components/ui/Selos";
import { pratoAssinatura } from "@/data/menu";
import { preco } from "@/lib/format";
import { img } from "@/lib/images";

/**
 * A dobra do prato mais pedido.
 *
 * A foto não aparece: ela **se abre**. O recorte vai de uma faixa estreita no
 * centro até o retrato inteiro conforme a rolagem avança, e a camada interna
 * corre em parallax dentro dele. É o único bloco do site com esse tratamento
 * — é o que o faz ler como destaque de verdade.
 */
export default function PratoAssinatura({ entradaPeloVideo = false }: { entradaPeloVideo?: boolean }) {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Na transição sobreposta, a timeline do vídeo dirige toda a entrada.
      if (entradaPeloVideo) return;
      const no = raiz.current;
      if (!no) return;

      const janela = no.querySelector("[data-janela]");
      const foto = no.querySelector("[data-foto]");
      const numero = no.querySelector("[data-numero]");
      if (!janela) return;

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) {
          gsap.set(janela, { clipPath: "inset(0% round 2px)" });
          return;
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: no,
            start: "top 80%",
            end: "top 10%",
            scrub: 0.7,
          },
        });

        tl.fromTo(
          janela,
          { clipPath: "inset(38% 0% 38% 0% round 2px)" },
          { clipPath: "inset(0% 0% 0% 0% round 2px)", ease: "none" },
          0,
        ).fromTo(
          foto,
          { scale: 1.35, yPercent: 0, y: 0 },
          { scale: 1.12, yPercent: 0, y: 0, ease: "none" },
          0,
        );

        // O número corre mais rápido que a página — profundidade barata.
        if (numero) {
          gsap.fromTo(
            numero,
            { yPercent: 60, y: 0 },
            {
              yPercent: -60,
              y: 0,
              ease: "none",
              scrollTrigger: {
                trigger: no,
                start: "top bottom",
                end: "bottom top",
                scrub: true,
              },
            },
          );
        }
      });

      return () => mm.revert();
    },
    { scope: raiz, dependencies: [entradaPeloVideo], revertOnUpdate: true },
  );

  return (
    <section ref={raiz} className="relative overflow-hidden bg-white py-24 text-tinta md:py-36">
      {/* Algarismo gigante de fundo, quase imperceptível. */}
      <span
        data-numero
        aria-hidden
        className="pointer-events-none absolute -right-6 top-1/2 select-none font-display text-[38vw] leading-none text-vinho/[0.04] md:-right-16 md:text-[22vw]"
      >
        01
      </span>

      <div className="wrap">
        <div className="grid items-center gap-12 md:grid-cols-2 md:gap-20">
          <div data-entrada-prato className="relative">
            <div
              data-janela
              className="relative aspect-[4/5] overflow-hidden will-change-[clip-path]"
            >
              <Image
                data-foto
                src={img("camarao-rizz")}
                alt="Camarão rosa empanado e dourado sobre risoto de alho-poró com creme de catupiry, servido em prato azul"
                placeholder="blur"
                sizes="(min-width: 860px) 46vw, 92vw"
                className="size-full object-cover will-change-transform"
                priority
              />
            </div>

            <SeloRotativo
              texto="O MAIS PEDIDO · CRIAÇÃO RIZZ · "
              className="absolute -right-5 -top-7 size-28 text-vinho md:-right-10 md:-top-10 md:size-36"
            />
          </div>

          <div data-entrada-prato>
            <p className="eyebrow text-vinho">{pratoAssinatura.chamada}</p>

            {entradaPeloVideo ? (
              <h2 className="mt-6 text-titulo text-tinta">{pratoAssinatura.nome}</h2>
            ) : (
              <RevealScrub className="mt-6 text-titulo text-tinta">
                {pratoAssinatura.nome}
              </RevealScrub>
            )}

            {entradaPeloVideo ? (
              <div aria-hidden className="mt-7 h-px w-full max-w-sm bg-ouro/55" />
            ) : (
              <Filete className="mt-7 w-full max-w-sm" />
            )}

            <p className="mt-6 font-display text-xl italic text-vinho md:text-2xl">
              {pratoAssinatura.descricao}
            </p>

            <p className="mt-6 max-w-prose leading-relaxed text-tinta/75">
              {pratoAssinatura.texto}
            </p>

            <div className="mt-10 flex flex-wrap items-end gap-5">
              <p className="font-display text-6xl leading-none text-tinta md:text-7xl">
                <span className="align-super text-lg text-tinta/60">R$</span>{" "}
                {preco(pratoAssinatura.preco)}
              </p>
              <ListaSelos badges={pratoAssinatura.badges} />
            </div>

            <div className="mt-10">
              <BotaoLink href="/cardapio#peixes-e-frutos-do-mar" tamanho="lg">
                Ver no cardápio
              </BotaoLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
