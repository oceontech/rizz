"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { BotaoLink } from "@/components/ui/Botao";
import Preco from "@/components/ui/Preco";
import { ListaSelos } from "@/components/ui/Selos";
import camaraoMesa from "@/assets/img/camarao-empanado-mesa.webp";
import type { HomeDoSite } from "@/lib/dados";
import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import { fotoDoPrato } from "@/lib/images";

import VideoB from "./VideoB";
import VideoComSom from "./VideoComSom";

type Prato = NonNullable<HomeDoSite["maisPedido"]>;

/**
 * O que entra no lugar do vídeo, no celular, quando ele termina: as fotos do
 * prato se revezando devagar (com leve aproximação), o nome, o texto e o
 * preço.
 */
function FinalPrato({ prato }: { prato: Prato }) {
  const foto = fotoDoPrato(prato);
  const fotos = [foto, camaraoMesa].filter((f): f is NonNullable<typeof f> => Boolean(f));
  const [atual, setAtual] = useState(0);

  useEffect(() => {
    if (fotos.length < 2) return;
    const id = setInterval(() => setAtual((a) => (a + 1) % fotos.length), 3800);
    return () => clearInterval(id);
  }, [fotos.length]);

  return (
    <div className="absolute inset-0 bg-noite">
      {fotos.map((f, i) => (
        <Image
          key={i}
          src={f}
          alt=""
          fill
          sizes="100vw"
          className={`object-cover transition-[opacity,transform] duration-[4000ms] ease-out ${i === atual ? "scale-110 opacity-100" : "scale-100 opacity-0"}`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 p-6 text-white">
        <p className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-4xl leading-none text-ambar">{prato.chamada}</p>
        <p className="font-[family-name:var(--font-instrument)] text-[3.25rem] leading-[0.9] tracking-[0.01em] uppercase">{prato.titulo}</p>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-white/80">{prato.texto}</p>
        <div className="mt-5 flex items-center justify-between gap-4">
          <Preco valor={prato.preco} className="text-4xl leading-none text-ouro-claro [&>span]:opacity-100" />
          <BotaoLink href={`/cardapio#${prato.categoriaSlug}`}>Ver no cardápio</BotaoLink>
        </div>
      </div>
    </div>
  );
}

function Texto({ prato }: { prato: Prato }) {
  return (
    <>
      <h2 id="prato-b" className="flex flex-col items-start not-italic">
        <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[clamp(2.4rem,4.4vw,3.75rem)] leading-none text-ambar">
          {prato.chamada}
        </span>
        <span className="font-[family-name:var(--font-instrument)] text-[clamp(3.5rem,6vw,6.25rem)] leading-[0.9] tracking-[0.01em] text-vinho uppercase">
          {prato.titulo}
        </span>
      </h2>

      <p className="mt-6 max-w-md text-lg leading-relaxed text-tinta/75">{prato.texto}</p>

      <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-4 border-t border-tinta/10 pt-7">
        <div>
          <p className="eyebrow text-tinta/50">Preço</p>
          <Preco valor={prato.preco} className="mt-2 text-5xl leading-none text-vinho md:text-6xl [&>span]:opacity-100" />
        </div>
        <ListaSelos badges={prato.badges} />
      </div>

      <div className="mt-8">
        <BotaoLink href={`/cardapio#${prato.categoriaSlug}`} variante="vinho" tamanho="lg">
          Ver no cardápio
        </BotaoLink>
      </div>
    </>
  );
}

/**
 * Prato mais pedido da versão B.
 *
 * Com o camarão (o prato que o restaurante destaca hoje), a seção vira uma
 * composição de tela larga com os vídeos do álbum:
 *
 *   - à esquerda, o preparo (empanar e montar o prato), alto, de canto
 *     cortado, com a foto do prato sobreposta no pé;
 *   - no meio, o letreiro, o texto e o preço;
 *   - à direita, a apresentação do prato (com som, no botão) e, encostado
 *     no canto dela, um recorte redondo com a chegada ao salão.
 *
 * Com outro prato escolhido no painel, os vídeos (que são do camarão) saem e
 * fica a foto dele ao lado do texto.
 *
 * `[data-entrada-prato]` é o gancho da entrada pelo vídeo (IntroCamarao).
 */
export default function PratoAssinaturaB({ prato, entradaPeloVideo = false }: { prato: Prato; entradaPeloVideo?: boolean }) {
  const raiz = useRef<HTMLElement>(null);
  const foto = fotoDoPrato(prato);
  const camarao = prato.id === "camarao-empanado";

  useGSAP(
    () => {
      const no = raiz.current;
      if (!no) return;
      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) return;
        // Peças sobrepostas andam em ritmos diferentes: dá profundidade.
        no.querySelectorAll<HTMLElement>("[data-profundidade]").forEach((el) => {
          const f = Number(el.dataset.profundidade);
          gsap.fromTo(
            el,
            { yPercent: f },
            { yPercent: -f, ease: "none", scrollTrigger: { trigger: no, start: "top bottom", end: "bottom top", scrub: true } },
          );
        });
      });

      return () => mm.revert();
    },
    { scope: raiz, dependencies: [entradaPeloVideo], revertOnUpdate: true },
  );

  if (!camarao) {
    return (
      <section ref={raiz} aria-labelledby="prato-b" className="relative overflow-hidden bg-white py-24 text-tinta md:py-32">
        <div className="wrap grid items-center gap-14 md:grid-cols-12 md:gap-8">
          <div data-entrada-prato className={`relative aspect-[4/5] md:col-span-6`}>
            {foto ? (
              <Image
                src={foto}
                alt={`${prato.titulo}. ${prato.texto}`}
                placeholder={typeof foto === "string" ? "empty" : "blur"}
                fill
                sizes="(min-width: 860px) 46vw, 92vw"
                className="object-cover"
              />
            ) : (
              <div className="size-full bg-creme" />
            )}
          </div>
          <div data-entrada-prato className="md:col-span-5 md:col-start-8">
            <Texto prato={prato} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={raiz} aria-labelledby="prato-b" className="relative overflow-hidden bg-white pt-20 pb-28 text-tinta md:py-28">
      <div className="mx-auto grid max-w-[100rem] gap-12 px-5 md:grid-cols-12 md:items-center md:gap-6 md:px-8 lg:gap-10">
        {/* Celular: o texto vem primeiro. */}
        <div data-entrada-prato className="order-1 md:order-2 md:col-span-4 md:pl-10 lg:pl-14">
          <Texto prato={prato} />
        </div>

        {/* Preparo + foto sobreposta */}
        {/* No celular fica só a apresentação, para a tela não pesar. */}
        <div data-entrada-prato className="relative order-2 hidden md:order-1 md:col-span-4 md:block">
          <div className="relative aspect-[9/15] overflow-hidden">
            <VideoB nome="camarao-preparo" rotulo="Camarões sendo empanados e o prato sendo montado" className="absolute inset-0 size-full object-cover" />
          </div>
          <div
            data-profundidade="18"
            className="absolute -right-10 bottom-[-12%] w-[58%] shadow-[0_30px_60px_rgb(43_7_16/0.35)] md:-right-[10%] md:bottom-[-14%] md:w-[48%]"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              {foto && (
                <Image
                  src={foto}
                  alt={`${prato.titulo}. ${prato.texto}`}
                  placeholder={typeof foto === "string" ? "empty" : "blur"}
                  fill
                  sizes="(min-width: 860px) 14vw, 50vw"
                  className="object-cover"
                />
              )}
            </div>
          </div>
        </div>

        {/* Apresentação. No celular, no fim do vídeo entram as fotos e o preço. */}
        <div data-entrada-prato className="relative order-3 md:col-span-4 md:pl-10 lg:pl-16">
          <VideoComSom
            nome="camarao-apresentacao"
            rotulo="O prato apresentado no salão do Rizz"
            somAutomatico
            final={<FinalPrato prato={prato} />}
          />
        </div>
      </div>
    </section>
  );
}
