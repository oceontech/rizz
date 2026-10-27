"use client";

import Image from "next/image";
import { useRef } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import { img, type ImgKey } from "@/lib/images";
import { site } from "@/lib/site";

/**
 * Segunda dobra da versão B: a casa vista de perto.

 * Diferenças da A: as fotos em volta vêm do álbum do restaurante, e o nome
 * "Rizz" entra crescendo enquanto o salão se abre e fica na tela (na A ele
 * saía).
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
  /** Só no desktop: surge durante a rolagem, depois que a cena prende. */
  surge?: boolean;
};

/**
 * Fotos do álbum do restaurante. No desktop ficam mais espalhadas, até as
 * bordas, e quatro a mais surgem enquanto o salão se abre.
 */
const PRATOS: Foto[] = [
  {
    chave: "risoto-camarao-aspargos",
    alt: "Risoto de camarão com aspargos",
    classe: "left-[3%] top-[8%] w-[30vw] md:left-[3%] md:top-[6%] md:w-[13vw]",
  },
  {
    chave: "file-creme-funghi-risoto-brie",
    alt: "Filé mignon ao creme de funghi com risoto de brie trufado",
    classe:
      "right-[4%] top-[5%] w-[27vw] md:right-[4%] md:top-[4%] md:w-[12vw]",
  },
  {
    chave: "espaguete-carbonara",
    alt: "Espaguete à carbonara",
    classe:
      "left-[-6%] top-[40%] w-[26vw] md:left-[16%] md:top-[46%] md:w-[10vw]",
  },
  {
    chave: "salmao-funghi-risoto-brie",
    alt: "Salmão ao creme de funghi com risoto de brie trufado",
    classe:
      "right-[-5%] top-[42%] w-[28vw] md:right-[17%] md:top-[52%] md:w-[10vw]",
  },
  {
    chave: "risoto-costela-rucula",
    alt: "Risoto de costela bovina com rúcula e redução de balsâmico",
    classe:
      "bottom-[6%] left-[6%] w-[28vw] md:bottom-[4%] md:left-[2%] md:w-[12vw]",
  },
  {
    chave: "brigadeiro-colher",
    alt: "Brigadeiro artesanal de colher",
    classe:
      "bottom-[4%] right-[5%] w-[30vw] md:bottom-[3%] md:right-[3%] md:w-[13vw]",
  },
  {
    chave: "burrata-cogumelos-trufados",
    alt: "Burrata com confit de cogumelos trufados",
    classe: "hidden md:block md:left-[21%] md:top-[5%] md:w-[8.5vw]",
    surge: true,
  },
  {
    chave: "polenta-ragu-cogumelos",
    alt: "Polenta cremosa com ragu de cogumelos",
    classe: "hidden md:block md:right-[21%] md:top-[9%] md:w-[8.5vw]",
    surge: true,
  },
  {
    chave: "tilapia-milanesa-risoto-funghi",
    alt: "Tilápia à milanesa com risoto de funghi",
    classe: "hidden md:block md:left-[24%] md:bottom-[3%] md:w-[8vw]",
    surge: true,
  },
  {
    chave: "pudim",
    alt: "Pudim da casa",
    classe: "hidden md:block md:right-[24%] md:bottom-[5%] md:w-[8vw]",
    surge: true,
  },
];

/** Janela inicial do salão, em % da tela a recortar de cada lado. */
const JANELA = {
  estreita: "inset(30% 29% 30% 29% round 18px)",
  larga: "inset(24% 38% 24% 38% round 22px)",
};

export default function GaleriaCasaB() {
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
      const pousos = gsap.utils.toArray<HTMLElement>(
        "[data-prato-pouso]:not([data-surge])",
        no,
      );
      const surgem = gsap.utils.toArray<HTMLElement>("[data-surge]", no);
      const flutuam = gsap.utils.toArray<HTMLElement>("[data-flutua]", no);
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
            gsap.set(titulo, { autoAlpha: 1, scale: 1 });
            return;
          }

          // Flutuação contínua, cada foto no seu ritmo: a cena respira mesmo
          // parada. Camada própria, para não disputar `y` com entrada e fuga.
          flutuam.forEach((el, i) => {
            gsap.fromTo(
              el,
              { y: -8, rotate: i % 2 ? -1.2 : 1.2 },
              {
                y: 10,
                rotate: i % 2 ? 1.2 : -1.2,
                duration: 3.2 + (i % 4) * 0.6,
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true,
                delay: (i % 3) * 0.4,
              },
            );
          });
          gsap.set(surgem, { autoAlpha: 0, scale: 0.5 });

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
            {
              clipPath: "inset(0% 0% 0% 0% round 0px)",
              duration: 1,
              ease: "power2.inOut",
            },
            0,
          )
            .to(
              surgem,
              {
                autoAlpha: 1,
                scale: 1,
                duration: 0.22,
                stagger: 0.05,
                ease: "back.out(1.6)",
              },
              0.04,
            )
            .fromTo(
              salaoFoto,
              { scale: 1.35 },
              { scale: 1, duration: 1, ease: "power2.inOut" },
              0,
            )
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
            // O nome entra junto com a abertura do salão, crescendo, e fica.
            .fromTo(
              titulo,
              { autoAlpha: 0, scale: 0.55 },
              { autoAlpha: 1, scale: 1, duration: 0.8, ease: "power2.out" },
              0.05,
            )
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
          {/* Celular: o salão vertical. Desktop: foto horizontal do ambiente
              interno, em resolução cheia — a vertical ficava esticada e mole
              em tela larga. */}
          <div
            data-salao-foto
            className="relative size-full will-change-transform"
          >
            <Image
              src={img("salao-claraboia")}
              alt="Salão do Rizz com claraboia e taças de vinho"
              placeholder="blur"
              fill
              sizes="100vw"
              className="object-cover md:hidden"
            />
            <Image
              src="/hero/hero-2.webp"
              alt="Entrada do salão do Rizz, com arcos de tijolo e lustre"
              fill
              sizes="100vw"
              className="hidden object-cover md:block"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-noite/80 via-noite/10 to-noite/30" />
        </div>

        {PRATOS.map((p) => (
          <div
            key={p.chave}
            data-prato
            className={`absolute aspect-[3/4] will-change-transform ${p.classe}`}
          >
            <div data-flutua className="size-full">
              <div
                data-prato-pouso
                data-surge={p.surge || undefined}
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
          </div>
        ))}

        <div
          data-titulo
          className="pointer-events-none invisible absolute inset-0 grid place-items-center opacity-0 will-change-transform"
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
            Conheça a casa.
          </p>
        </div>
      </div>
    </section>
  );
}
