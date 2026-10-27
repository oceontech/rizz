"use client";

import { Volume2, VolumeX } from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import SeloRotativo from "@/components/brand/SeloRotativo";
import { BotaoLink } from "@/components/ui/Botao";
import Preco from "@/components/ui/Preco";
import { ListaSelos } from "@/components/ui/Selos";
import camaraoMesa from "@/assets/img/camarao-empanado-mesa.webp";
import type { HomeDoSite } from "@/lib/dados";
import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import { fotoDoPrato } from "@/lib/images";

import VideoB from "./VideoB";

type Prato = NonNullable<HomeDoSite["maisPedido"]>;

/** Cantos cortados em diagonal, como etiquetas recortadas. */
const CORTE_TOPO = "[clip-path:polygon(14%_0,100%_0,100%_100%,0_100%,0_9%)]";
const CORTE_BASE = "[clip-path:polygon(0_0,100%_0,100%_91%,86%_100%,0_100%)]";

/**
 * Vídeo da apresentação do prato, o único da página com som. Começa mudo
 * (o navegador só deixa tocar sozinho sem áudio) e o botão liga o som,
 * voltando ao início para a fala ser ouvida inteira.
 */
function Apresentacao() {
  const ref = useRef<HTMLVideoElement>(null);
  const [mudo, setMudo] = useState(true);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const observador = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!video.src) video.src = "/videos/b/camarao-apresentacao.mp4";
          void video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { rootMargin: "200px 0px" },
    );
    observador.observe(video);
    return () => observador.disconnect();
  }, []);

  function alternarSom() {
    const video = ref.current;
    if (!video) return;
    if (mudo) {
      if (!video.src) video.src = "/videos/b/camarao-apresentacao.mp4";
      video.currentTime = 0;
      video.muted = false;
      void video.play().catch(() => {});
    } else {
      video.muted = true;
    }
    setMudo(!mudo);
  }

  return (
    <div className={`relative aspect-[9/16] bg-noite ${CORTE_BASE}`}>
      <video
        ref={ref}
        poster="/videos/b/camarao-apresentacao.jpg"
        muted
        loop
        playsInline
        preload="none"
        aria-label="O prato apresentado no salão do Rizz"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent" />
      <button
        type="button"
        onClick={alternarSom}
        aria-pressed={!mudo}
        className="absolute bottom-6 left-5 flex items-center gap-2.5 rounded-full bg-creme/95 py-2.5 pr-4 pl-3 text-xs font-medium tracking-[0.08em] text-tinta uppercase shadow-[0_10px_30px_rgb(0_0_0/0.35)] transition-colors hover:bg-white"
      >
        {mudo ? <VolumeX className="size-4" /> : <Volume2 className="size-4 text-vinho" />}
        {mudo ? "Ouvir a apresentação" : "Som ligado"}
      </button>
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
          <div data-entrada-prato className={`relative aspect-[4/5] md:col-span-6 ${CORTE_TOPO}`}>
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
      <div className="mx-auto grid max-w-[100rem] gap-16 px-5 md:grid-cols-12 md:items-center md:gap-6 md:px-8 lg:gap-10">
        {/* Celular: o texto vem primeiro. */}
        <div data-entrada-prato className="order-1 md:order-2 md:col-span-4 md:pl-10 lg:pl-14">
          <Texto prato={prato} />
        </div>

        {/* Preparo + foto sobreposta */}
        <div data-entrada-prato className="relative order-2 mr-10 md:order-1 md:col-span-4 md:mr-0">
          <div className={`relative aspect-[9/14] md:aspect-[9/15] ${CORTE_TOPO}`}>
            <VideoB nome="camarao-preparo" rotulo="Camarões sendo empanados e o prato sendo montado" className="absolute inset-0 size-full object-cover" />
          </div>
          <div
            data-profundidade="18"
            className="absolute -right-10 bottom-[-12%] w-[58%] shadow-[0_30px_60px_rgb(43_7_16/0.35)] md:-right-[10%] md:bottom-[-14%] md:w-[48%]"
          >
            <div className={`relative aspect-[3/4] ${CORTE_BASE}`}>
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
          <SeloRotativo texto="O MAIS PEDIDO · RIZZ CUCINA & VINO ·" className="absolute -top-10 -left-2 size-28 md:-top-12 md:left-2 md:size-32" />
        </div>

        {/* Apresentação + salão */}
        <div data-entrada-prato className="relative order-3 ml-10 md:col-span-4 md:ml-0 md:pl-10 lg:pl-16">
          <Apresentacao />
          <div
            data-profundidade="24"
            className="absolute -top-10 -left-8 w-[44%] overflow-hidden rounded-full shadow-[0_24px_50px_rgb(43_7_16/0.35)] ring-[6px] ring-white md:-top-14 md:-left-2 md:w-[40%] lg:left-2"
          >
            <div className="relative aspect-square">
              <VideoB nome="camarao-salao" rotulo="O salão do Rizz e o cardápio, até o prato chegar à mesa" className="absolute inset-0 size-full object-cover" />
            </div>
          </div>
          <div data-profundidade="10" className="absolute -right-6 -bottom-14 hidden w-[34%] shadow-[0_24px_50px_rgb(43_7_16/0.3)] lg:block">
            <div className="relative aspect-[3/4] [clip-path:polygon(0_0,100%_0,100%_86%,82%_100%,0_100%)]">
              <Image src={camaraoMesa} alt="Camarão rosa empanado com risoto e creme, servido à mesa" fill placeholder="blur" sizes="12vw" className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
