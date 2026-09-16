"use client";

import Image from "next/image";
import { useRef } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import { img, type ImgKey } from "@/lib/images";
import { site } from "@/lib/site";

/**
 * Segunda dobra: a casa vista de perto.
 *
 * Uma grade de fotos com o salão no centro. Ao rolar, o salão se abre até
 * ocupar a tela inteira enquanto os pratos em volta se afastam para fora —
 * como se a câmera entrasse no restaurante.
 *
 * Substitui a galeria em WebGL, que pesava em todas as telas. Aqui só há
 * `transform`, `opacity` e `clip-path`, e a seção prende com `position:
 * sticky` do próprio CSS — sem pin do ScrollTrigger, que no celular briga
 * com a barra de endereço e dá solavancos.
 *
 * O salão é renderizado já em tela cheia e RECORTADO por `clip-path`: abrir
 * o recorte mantém a foto nítida o tempo todo, ao contrário de ampliar uma
 * foto pequena com `scale`.
 */

type Foto = {
  chave: ImgKey;
  alt: string;
  /** Posição e tamanho na grade (classes do Tailwind). */
  classe: string;
};

const PRATOS: Foto[] = [
  {
    chave: "camarao-rizz",
    alt: "Camarão rosa empanado sobre risoto",
    classe: "left-[3%] top-[8%] w-[30vw] md:left-[6%] md:top-[10%] md:w-[15vw]",
  },
  {
    chave: "ancho-acafrao-trufado",
    alt: "Ancho Red Angus com risoto de açafrão trufado",
    classe: "right-[4%] top-[5%] w-[27vw] md:right-[8%] md:top-[6%] md:w-[13vw]",
  },
  {
    chave: "risoto-trufado-brie",
    alt: "Risoto trufado com brie na frigideira",
    classe: "left-[-6%] top-[40%] w-[26vw] md:left-[12%] md:top-[44%] md:w-[11vw]",
  },
  {
    chave: "cordeiro-hortela",
    alt: "Cordeiro com creme de batatas e hortelã",
    classe: "right-[-5%] top-[42%] w-[28vw] md:right-[13%] md:top-[40%] md:w-[12vw]",
  },
  {
    chave: "camarao-pesto-pistache",
    alt: "Camarão com massa ao pesto de pistache",
    classe: "bottom-[6%] left-[6%] w-[28vw] md:bottom-[7%] md:left-[4%] md:w-[14vw]",
  },
  {
    chave: "peixe-arroz-negro",
    alt: "Peixe com arroz negro e aspargos",
    classe: "bottom-[4%] right-[5%] w-[30vw] md:bottom-[5%] md:right-[5%] md:w-[15vw]",
  },
];

/** Janela inicial do salão, em % da tela a recortar de cada lado. */
const JANELA = {
  estreita: "inset(30% 29% 30% 29% round 18px)",
  larga: "inset(24% 38% 24% 38% round 22px)",
};

export default function Galeria() {
  const raiz = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const no = raiz.current;
      if (!no) return;

      const salao = no.querySelector<HTMLElement>("[data-salao]");
      const salaoFoto = no.querySelector<HTMLElement>("[data-salao-foto]");
      const pratos = gsap.utils.toArray<HTMLElement>("[data-prato]", no);
      // Entrada e rolagem animam camadas diferentes: se as duas mexessem no
      // mesmo `y`, a rolagem gravaria o ponto de partida no meio da entrada.
      const pousos = gsap.utils.toArray<HTMLElement>("[data-prato-pouso]", no);
      const titulo = no.querySelector<HTMLElement>("[data-titulo]");
      const legenda = no.querySelector<HTMLElement>("[data-legenda]");
      if (!salao || !salaoFoto || !titulo || !legenda) return;

      const mm = gsap.matchMedia();

      mm.add(
        {
          ...CONDICOES,
          larga: "(min-width: 768px)",
        },
        (contexto) => {
          const { parado, larga } = contexto.conditions ?? {};

          if (parado) {
            gsap.set(salao, { clipPath: "inset(0% 0% 0% 0% round 0px)" });
            gsap.set(pratos, { autoAlpha: 0 });
            gsap.set(legenda, { autoAlpha: 1 });
            return;
          }

          // Entrada: os pratos pousam na grade antes de a cena prender.
          gsap.fromTo(
            pousos,
            { autoAlpha: 0, y: 60, rotate: (i) => (i % 2 ? 4 : -4) },
            {
              autoAlpha: 1,
              y: 0,
              rotate: 0,
              duration: 1.1,
              ease: "power3.out",
              stagger: 0.08,
              scrollTrigger: {
                trigger: no,
                start: "top 75%",
                toggleActions: "play none none reverse",
              },
            },
          );

          /**
           * Cada prato foge na direção em que já está em relação ao centro.
           * A distância é medida na hora (e remedida no refresh), então a
           * mesma regra serve para qualquer tela.
           */
          const fuga = (el: HTMLElement, eixo: "x" | "y") => {
            // Posição de layout (ignora transforms e a rolagem do momento).
            const palco = el.offsetParent as HTMLElement | null;
            if (!palco) return 0;
            const desvio =
              eixo === "x"
                ? el.offsetLeft + el.offsetWidth / 2 - palco.clientWidth / 2
                : el.offsetTop + el.offsetHeight / 2 - palco.clientHeight / 2;
            return desvio * 1.6;
          };

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: no,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
              invalidateOnRefresh: true,
            },
          });

          tl.fromTo(
            salao,
            { clipPath: larga ? JANELA.larga : JANELA.estreita },
            { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: 1, ease: "power2.inOut" },
            0,
          )
            .fromTo(salaoFoto, { scale: 1.35 }, { scale: 1, duration: 1, ease: "power2.inOut" }, 0)
            .to(
              pratos,
              {
                x: (_, el) => fuga(el as HTMLElement, "x"),
                y: (_, el) => fuga(el as HTMLElement, "y"),
                scale: 1.35,
                duration: 1,
                ease: "power2.in",
              },
              0,
            )
            .to(pratos, { autoAlpha: 0, duration: 0.3 }, 0.65)
            // O nome sai da frente enquanto a casa se abre…
            .to(titulo, { yPercent: -40, autoAlpha: 0, duration: 0.45 }, 0.05)
            // …e a legenda assume quando o salão já tomou a tela.
            .fromTo(
              legenda,
              { autoAlpha: 0, y: 30 },
              { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" },
              0.8,
            )
            .to({}, { duration: 0.25 });
        },
      );

      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <section
      ref={raiz}
      aria-label="O salão e os pratos do Rizz"
      className="relative h-[250svh] bg-noite"
      // Sobe 1px: cobre qualquer resto de subpixel na emenda com o hero.
      style={{ marginTop: -1 }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* Salão: em tela cheia, recortado pela janela central. */}
        <div
          data-salao
          className="absolute inset-0 will-change-[clip-path]"
          style={{ clipPath: JANELA.estreita }}
        >
          <Image
            data-salao-foto
            src={img("salao-claraboia")}
            alt="Salão do Rizz com claraboia e taças de vinho"
            placeholder="blur"
            sizes="100vw"
            className="size-full object-cover will-change-transform"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-noite/80 via-noite/10 to-noite/30" />
        </div>

        {PRATOS.map((p) => (
          <div
            key={p.chave}
            data-prato
            className={`absolute aspect-[3/4] will-change-transform ${p.classe}`}
          >
            <div
              data-prato-pouso
              className="size-full overflow-hidden rounded-xl shadow-[0_20px_60px_rgb(0_0_0/0.45)]"
            >
              <Image
                src={img(p.chave)}
                alt={p.alt}
                placeholder="blur"
                sizes="(min-width: 768px) 16vw, 32vw"
                className="size-full object-cover"
              />
            </div>
          </div>
        ))}

        <div
          data-titulo
          className="pointer-events-none absolute inset-0 grid place-items-center"
        >
          <p className="font-display text-[22vw] italic leading-none text-creme [text-shadow:0_4px_40px_rgb(43_7_16/0.85)] md:text-[12vw]">
            Rizz
          </p>
        </div>

        <div
          data-legenda
          className="invisible absolute inset-x-0 bottom-[12svh] px-6 text-center opacity-0"
        >
          <p className="eyebrow text-ambar">
            {site.endereco.cidade} · {site.endereco.uf}
          </p>
          <p className="mx-auto mt-4 max-w-[20ch] font-display text-titulo italic leading-tight text-creme">
            Cozinha italiana contemporânea.
          </p>
        </div>
      </div>
    </section>
  );
}
