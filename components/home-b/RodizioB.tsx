"use client";

import Image from "next/image";
import { useRef } from "react";

import { useRodizio } from "@/components/rodizio/AvisoRodizio";
import { BotaoLink } from "@/components/ui/Botao";
import mesa from "@/assets/img/rodizio-mesa.webp";
import colheres from "@/assets/img/rodizio-colheres.webp";
import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import { diasDoRodizio, horarioDoRodizio, rodizio } from "@/lib/rodizio";
import { whatsappLink } from "@/lib/site";

import VideoComSom from "./VideoComSom";

/**
 * Rodízio de risotos (quartas e quintas, no jantar), com a situação ao vivo:
 * "acontecendo agora", "hoje", "amanhã" ou o próximo dia.
 *
 * À esquerda o letreiro, o status e as três etapas; à direita o vídeo do
 * restaurante explicando o rodízio (som pelo botão) com as fotos dos
 * risotos sobrepostas.
 */
export default function RodizioB() {
  const raiz = useRef<HTMLElement>(null);
  const status = useRodizio();
  const vivo = status?.fase === "agora" || status?.fase === "hoje";

  useGSAP(
    () => {
      const no = raiz.current;
      if (!no) return;
      const mm = gsap.matchMedia();
      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) return;
        no.querySelectorAll<HTMLElement>("[data-profundidade]").forEach((el) => {
          const f = Number(el.dataset.profundidade);
          gsap.fromTo(el, { yPercent: f }, { yPercent: -f, ease: "none", scrollTrigger: { trigger: no, start: "top bottom", end: "bottom top", scrub: true } });
        });
        gsap.fromTo(
          no.querySelectorAll("[data-etapa]"),
          { autoAlpha: 0, y: 30 },
          { autoAlpha: 1, y: 0, stagger: 0.12, duration: 0.9, scrollTrigger: { trigger: no, start: "top 65%", toggleActions: "play none none reverse" } },
        );
      });
      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <section ref={raiz} id="rodizio" aria-labelledby="rodizio-b" className="relative scroll-mt-24 overflow-hidden bg-noite pt-24 pb-28 text-creme md:pt-32 md:pb-24">
      {/* Brilho âmbar atrás do letreiro, mais forte quando é dia de rodízio. */}
      <div aria-hidden className={`pointer-events-none absolute top-10 -left-40 size-[40rem] rounded-full bg-ambar blur-[140px] transition-opacity duration-1000 ${vivo ? "opacity-20" : "opacity-10"}`} />

      <div className="relative mx-auto grid max-w-[100rem] gap-16 px-5 md:grid-cols-12 md:items-center md:gap-10 md:px-8">
        <div className="md:col-span-6 lg:col-span-6 lg:pl-10">
          {/* Situação ao vivo */}
          <div className="min-h-9">
            {status && (
              <span
                className={`inline-flex items-center gap-3 rounded-full py-2 pr-4 pl-3 text-[0.6875rem] font-medium tracking-[0.16em] uppercase ${vivo ? "bg-ambar text-noite" : "border border-creme/20 text-creme/85"}`}
              >
                <span className="relative flex size-2">
                  {vivo && <span className="absolute inline-flex size-full animate-ping rounded-full bg-noite/60 motion-reduce:animate-none" />}
                  <span className={`relative inline-flex size-2 rounded-full ${vivo ? "bg-noite" : "bg-ambar"}`} />
                </span>
                {status.rotulo}
                <span className={`normal-case tracking-normal ${vivo ? "text-noite/70" : "text-creme/60"}`}>· {status.detalhe}</span>
              </span>
            )}
          </div>

          <h2 id="rodizio-b" className="mt-7 flex flex-col items-start not-italic">
            <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[clamp(3rem,8vw,5.5rem)] leading-none">Rodízio de</span>
            <span className="font-[family-name:var(--font-instrument)] text-[clamp(5rem,17vw,11rem)] leading-[0.88] tracking-[0.01em] text-ouro-claro uppercase">
              risotos
            </span>
          </h2>

          <p className="mt-6 text-lg text-creme/80">
            {diasDoRodizio()}, no jantar · {horarioDoRodizio()}
          </p>

          <ol className="mt-10 border-t border-creme/12">
            {rodizio.etapas.map((e, i) => (
              <li key={e.titulo} data-etapa className="grid grid-cols-[4.5rem_1fr] items-baseline gap-4 border-b border-creme/12 py-5 md:grid-cols-[6rem_1fr]">
                <span className="font-[family-name:var(--font-instrument)] text-5xl leading-none text-ambar md:text-6xl">0{i + 1}</span>
                <div>
                  <p className="font-[family-name:var(--font-instrument)] text-2xl tracking-[0.01em] uppercase md:text-3xl">{e.titulo}</p>
                  <p className="mt-1 leading-relaxed text-creme/70">{e.texto}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-10 flex flex-wrap gap-3">
            <BotaoLink href="/reservas" tamanho="lg">
              Reservar mesa
            </BotaoLink>
            <BotaoLink href={whatsappLink("Olá! Gostaria de saber o valor e os sabores do rodízio de risotos desta semana.")} variante="contorno" tamanho="lg">
              Valor e sabores da semana
            </BotaoLink>
          </div>
        </div>

        {/* Vídeo e fotos */}
        <div className="relative mx-auto w-full max-w-sm md:col-span-5 md:col-start-8 md:max-w-none lg:col-span-4 lg:col-start-8">
          <VideoComSom nome="rodizio" posicaoBotao="left-5 md:left-auto md:right-5" rotulo="O rodízio de risotos explicado no restaurante: arancini, seis risotos e a sobremesa da semana" />
          <div data-profundidade="16" className="absolute -right-6 -bottom-12 w-[58%] shadow-[0_30px_60px_rgb(0_0_0/0.5)] md:right-auto md:-bottom-16 md:-left-[22%] md:w-[66%]">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image src={mesa} alt="Os risotos do rodízio em potinhos coloridos, com arancini ao centro" fill placeholder="blur" sizes="(min-width: 768px) 28vw, 60vw" className="object-cover" />
            </div>
          </div>
          <div data-profundidade="24" className="absolute -top-10 -right-6 hidden w-[42%] shadow-[0_30px_60px_rgb(0_0_0/0.5)] lg:block">
            <div className="relative aspect-[3/4] overflow-hidden">
              <Image src={colheres} alt="Risotos servidos em petisqueiras de cerâmica coloridas" fill placeholder="blur" sizes="14vw" className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
