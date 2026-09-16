"use client";

import Image from "next/image";
import { useRef } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import risoto from "@/assets/img/manifesto/risoto-v2.webp";
import angus from "@/assets/img/manifesto/angus-v2.webp";
import ingredientes from "@/assets/img/manifesto/ingredientes-v2.webp";
import type { StaticImageData } from "next/image";

const frases: {
  destaque: string;
  texto: string;
  img: StaticImageData;
  alt: string;
}[] = [
  {
    destaque: "Arroz carnaroli",
    texto: "acertado no ponto na hora, nunca antes. Risoto não espera.",
    img: risoto,
    alt: "Risoto cremoso de carnaroli com fios de açafrão em prato de porcelana",
  },
  {
    destaque: "Red Angus e Duroc",
    texto: "de origem certificada pelo selo VPJ, rastreados do campo ao prato.",
    img: angus,
    alt: "Ancho grelhado com duas fatias em prato de porcelana branca",
  },
  {
    destaque: "Trufa, alho negro, açafrão",
    texto: "em combinações que são nossas — e que você não acha em outro lugar.",
    img: ingredientes,
    alt: "Trufa negra com uma lâmina fina, dois dentes de alho negro e fios de açafrão",
  },
];

/**
 * Palco fixo onde três afirmações se substituem conforme a página rola, com a
 * foto trocando no mesmo compasso.
 *
 * A foto aparece também no mobile: sem ela, a coluna de texto sozinha deixava
 * cada tela do palco quase vazia, o que lia como layout quebrado.
 *
 * Quem pede menos movimento não recebe o palco: as variantes `motion-reduce:`
 * desempilham os blocos e a seção vira uma lista comum, de altura automática.
 * Só apagar a animação não bastaria — os três blocos dividem a mesma célula do
 * grid, então deixá-los todos visíveis os sobrepõe e nada fica legível.
 */
export default function Manifesto() {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const no = raiz.current;
      if (!no) return;

      const textos = gsap.utils.toArray<HTMLElement>("[data-frase]", no);
      const fotos = gsap.utils.toArray<HTMLElement>("[data-foto]", no);
      if (!textos.length) return;

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) {
          // O layout já está em fluxo pelo CSS; aqui só garantimos visibilidade.
          gsap.set([...textos, ...fotos], { opacity: 1, y: 0, scale: 1 });
          return;
        }

        gsap.set(textos, { opacity: 0, y: 40 });
        gsap.set(fotos, { opacity: 0, scale: 1.05 });
        gsap.set(textos[0], { opacity: 1, y: 0 });
        gsap.set(fotos[0], { opacity: 1, scale: 1 });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: no,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.7,
          },
        });

        // Duas janelas SEPARADAS por troca: a frase que sai termina de sumir
        // antes de a próxima começar a aparecer. Se elas se cruzassem, dois
        // parágrafos ficariam legíveis ao mesmo tempo, sobrepostos.
        textos.forEach((_, i) => {
          if (i === 0) return;
          const t = i - 1;

          tl.to(
            textos[t],
            { opacity: 0, y: -40, duration: 0.3, ease: "power1.in" },
            t + 0.4,
          )
            .to(
              fotos[t],
              { opacity: 0, scale: 0.98, duration: 0.3, ease: "power1.in" },
              t + 0.4,
            )
            .fromTo(
              textos[i],
              { opacity: 0, y: 40 },
              { opacity: 1, y: 0, duration: 0.3, ease: "power1.out" },
              t + 0.75,
            )
            .fromTo(
              fotos[i],
              { opacity: 0, scale: 1.05 },
              { opacity: 1, scale: 1, duration: 0.3, ease: "power1.out" },
              t + 0.75,
            );
        });

        tl.fromTo(
          no.querySelector("[data-barra]"),
          { scaleX: 0 },
          { scaleX: 1, ease: "none", duration: textos.length - 1 + 0.3 },
          0,
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
      <section className="sticky top-0 flex h-[100svh] items-center overflow-hidden motion-reduce:static motion-reduce:block motion-reduce:h-auto motion-reduce:overflow-visible motion-reduce:py-24">
        <div className="wrap">
          <p className="eyebrow text-ambar">O que nos define</p>

          {/* Os três blocos ocupam a MESMA célula (1/1) para o palco não mudar
              de altura na troca. Com movimento reduzido voltam ao fluxo. */}
          <div className="mt-7 grid motion-reduce:gap-20">
            {frases.map((f) => (
              <div
                key={f.destaque}
                className="grid min-w-0 items-center gap-5 [grid-area:1/1] motion-reduce:[grid-area:auto] md:grid-cols-[1fr_1.3fr] md:gap-8"
              >
                <p
                  data-frase
                  className="max-w-3xl font-display text-[clamp(1.625rem,4.4vw,3.25rem)] leading-[1.12] text-creme"
                >
                  <span className="text-ambar">{f.destaque}</span>{" "}
                  <span className="italic text-creme/85">{f.texto}</span>
                </p>

                <div
                  data-foto
                  className="relative isolate aspect-[3/2] max-h-[40svh] w-full min-w-0 motion-reduce:max-h-none md:aspect-[6/5] md:max-h-[62svh]"
                >
                  <Image
                    src={f.img}
                    alt={f.alt}
                    unoptimized
                    className="size-full object-contain drop-shadow-[0_0_32px_rgba(129,21,48,0.55)] md:drop-shadow-[0_0_56px_rgba(129,21,48,0.55)]"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 h-px w-full max-w-md bg-creme/15 motion-reduce:hidden">
            <div data-barra className="h-full origin-left bg-ouro" />
          </div>
        </div>
      </section>
    </div>
  );
}
