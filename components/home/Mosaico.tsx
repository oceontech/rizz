"use client";

import { useRef } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import Filete from "@/components/motion/Filete";
import { BotaoLink } from "@/components/ui/Botao";
import { site } from "@/lib/site";

/**
 * Cena em três tempos, toda atrelada à rolagem:
 *
 *  1. o vídeo-mosaico começa recortado no centro e **se abre até sangrar a
 *     tela inteira**;
 *  2. ele então ganha desfoque e esmaece;
 *  3. por baixo dele, que esteve sobreposto o tempo todo, o conteúdo da
 *     seção é revelado.
 *
 * O palco usa `sticky` em vez de `pin`: num site medido em svh, o pin
 * reescreve o layout e briga com a barra de endereço que recolhe no mobile.
 *
 * Em tela cheia o vídeo é 9:16 esticado por `object-cover`, então as colunas
 * das pontas do mosaico ficam cortadas no desktop — é o preço de ele sangrar,
 * e foi uma escolha deliberada.
 */
export default function Mosaico() {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const no = raiz.current;
      if (!no) return;

      // Nome próprio: `data-janela` já é usado pelo prato-assinatura, e o
      // nome repetido faz qualquer busca global casar o elemento errado.
      const janela = no.querySelector("[data-janela-mosaico]");
      const filme = no.querySelector("[data-filme]");
      const revelado = no.querySelector("[data-revelado]");
      if (!janela || !filme || !revelado) return;

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) {
          gsap.set(janela, {
            clipPath: "inset(0% round 0px)",
            opacity: 1,
            filter: "blur(0px)",
          });
          gsap.set(revelado, { opacity: 1, y: 0 });
          return;
        }

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: no,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.7,
          },
        });

        // 1. Abre até tela cheia.
        tl.fromTo(
          janela,
          { clipPath: "inset(20% 26% round 6px)" },
          { clipPath: "inset(0% 0% round 0px)", ease: "none", duration: 0.45 },
          0,
        )
          .fromTo(
            filme,
            { scale: 1.14 },
            { scale: 1, ease: "none", duration: 0.45 },
            0,
          )
          // 2. Desfoca e esmaece — os dois extremos do blur sempre declarados.
          .fromTo(
            janela,
            { filter: "blur(0px)", opacity: 1 },
            {
              filter: "blur(26px)",
              opacity: 0,
              ease: "none",
              duration: 0.32,
            },
            0.6,
          )
          .fromTo(
            filme,
            { scale: 1 },
            { scale: 1.12, ease: "none", duration: 0.32 },
            0.6,
          )
          // 3. O que estava por baixo aparece.
          .fromTo(
            revelado,
            { opacity: 0, y: 36 },
            { opacity: 1, y: 0, ease: "none", duration: 0.3 },
            0.64,
          );
      });

      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <div
      ref={raiz}
      className="relative h-[300svh] bg-noite motion-reduce:h-auto"
    >
      <section className="sticky top-0 flex h-[100svh] items-center overflow-hidden motion-reduce:static motion-reduce:h-auto motion-reduce:py-24">
        {/* Camada revelada: vive ATRÁS do vídeo o tempo todo. */}
        <div
          data-revelado
          className="absolute inset-0 flex items-center motion-reduce:relative motion-reduce:inset-auto"
        >
          <div className="wrap">
            <p className="eyebrow text-ambar">Por dentro</p>

            <h2 className="mt-6 max-w-2xl text-titulo text-creme">
              Um pedaço de uma noite qualquer
            </h2>

            <Filete className="mt-8 w-full max-w-sm" />

            <p className="mt-8 max-w-prose leading-relaxed text-creme/70">
              O salão de tijolo aparente sob a claraboia, a adega montada na
              parede, o chopp puxado na hora e a cozinha em movimento. É mais
              ou menos assim de terça a domingo.
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <BotaoLink href="/reservas" tamanho="lg">
                Reservar uma mesa
              </BotaoLink>
              <BotaoLink
                href={site.redes.instagram}
                variante="contorno"
                tamanho="lg"
              >
                Ver no Instagram
              </BotaoLink>
            </div>
          </div>
        </div>

        {/* Vídeo sobreposto: abre, desfoca e some. */}
        <div
          data-janela-mosaico
          className="absolute inset-0 will-change-[clip-path,filter,opacity] motion-reduce:relative motion-reduce:mx-auto motion-reduce:mt-12 motion-reduce:aspect-[9/16] motion-reduce:max-w-sm"
        >
          <div data-filme className="size-full will-change-transform">
            <video
              className="size-full object-cover"
              src="/videos/mosaico.mp4"
              poster="/videos/mosaico-poster.jpg"
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              aria-label="Mosaico de vídeos do restaurante: pratos sendo servidos, o salão, a adega e o chopp"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-noite/20" />
        </div>
      </section>
    </div>
  );
}
