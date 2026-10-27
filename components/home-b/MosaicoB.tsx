"use client";

import { useEffect, useRef } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import { BotaoLink } from "@/components/ui/Botao";
import { site } from "@/lib/site";

import Letreiro from "./Letreiro";
import VideoB from "./VideoB";

/**
 * Versão B do mosaico: mesma cena, mas o que aparece por baixo do vídeo é um
 * cartaz centralizado (letreiro cursiva + serifada alta) sobre o salão em
 * vídeo, em vez de um bloco de texto alinhado à esquerda num fundo vazio.
 *
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
export default function MosaicoB() {
  const raiz = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  /**
   * `autoPlay` ANULA `preload="none"`: para começar a tocar, o navegador tem
   * de buscar a mídia. Medido na carga inicial da home — 990 KB de vídeo mais
   * 183 KB de pôster baixavam antes de qualquer rolagem, para uma seção que
   * fica lá no fim. Agora fonte e pôster só são atribuídos na aproximação,
   * como o IntroCamarao já fazia.
   */
  useEffect(() => {
    const no = raiz.current;
    const video = videoRef.current;
    if (!no || !video) return;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        // No desktop o mosaico é montado com três clipes (ver abaixo); o
        // arquivo vertical só serve ao celular.
        if (window.matchMedia("(min-width: 768px)").matches) {
          observador.disconnect();
          return;
        }
        video.poster = "/videos/mosaico-poster.jpg";
        video.src = "/videos/mosaico.mp4";
        video.load();
        void video.play().catch(() => {});
        observador.disconnect();
      },
      { rootMargin: "600px 0px" },
    );

    observador.observe(no);
    return () => observador.disconnect();
  }, []);

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
          className="absolute inset-0 isolate flex items-center motion-reduce:relative motion-reduce:inset-auto"
        >
          {/* Fundo do cartaz: o salão em vídeo, bem escurecido. */}
          <VideoB nome="salao" className="absolute inset-0 -z-20 size-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-noite/65" />
          <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-noite to-transparent" />

          <div className="wrap flex flex-col items-center text-center">
            <Letreiro cursiva="Venha conhecer" titulo="o Rizz" linha={`${site.endereco.cidade} · ${site.endereco.uf}`} />

            <p className="mt-8 max-w-sm leading-relaxed text-creme/80">
              Almoço e jantar. No Instagram, você acompanha as novidades do restaurante.
            </p>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
              <BotaoLink href="/reservas" tamanho="lg">
                Reservar mesa
              </BotaoLink>
              <BotaoLink href={site.redes.instagram} variante="contorno" tamanho="lg">
                Ver o Instagram
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
            {/* Desktop: três clipes lado a lado, de cores e cenas diferentes
                (vinho, açafrão, chapa), no lugar do vídeo vertical esticado. */}
            <div className="hidden size-full grid-cols-3 md:grid">
              <VideoB nome="vinho" className="size-full object-cover" />
              <VideoB nome="acafrao" className="size-full object-cover" />
              <VideoB nome="grelha" className="size-full object-cover" />
            </div>
            <video
              ref={videoRef}
              className="size-full object-cover md:hidden"
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
