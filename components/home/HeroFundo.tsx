"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";

/**
 * Fundo do hero, escolhido por largura.
 *
 * DESKTOP: cinco fotos com zoom lento alternando. Antes era um vídeo de
 * 4,2 MB em autoplay — a causa principal da lentidão relatada na home. As
 * cinco fotos somam menos de 1 MB e o navegador só decodifica uma por vez.
 *
 * CELULAR: segue o vídeo vertical, que lá é leve e enquadra certo.
 *
 * A decisão acontece DEPOIS da montagem, e o que vai no HTML servido é só o
 * pôster como fundo. Assim o desktop nunca baixa o vídeo e o celular nunca
 * baixa as cinco fotos — nenhum dos dois paga pelo outro.
 */

const FOTOS = [
  "/hero/hero-1.webp",
  "/hero/hero-2.webp",
  "/hero/hero-3.webp",
  "/hero/hero-4.webp",
  "/hero/hero-5.webp",
];

const DURACAO = 6.5;
const CRUZAMENTO = 1.4;

export default function HeroFundo() {
  const raiz = useRef<HTMLDivElement>(null);
  const [modo, setModo] = useState<"indefinido" | "fotos" | "video">(
    "indefinido",
  );

  /**
   * As quatro fotos seguintes só entram no DOM depois que a primeira pintou.
   *
   * Medido: com as cinco montadas de uma vez, a carga inicial do desktop
   * baixava 820 KB de hero — e as fotos 2 a 5 só aparecem a partir dos 6,5s.
   * Agora a primeira dobra custa uma imagem, e o resto chega enquanto a
   * pessoa lê o título.
   */
  const [completo, setCompleto] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const aplicar = () => setModo(mq.matches ? "fotos" : "video");
    aplicar();
    mq.addEventListener("change", aplicar);
    return () => mq.removeEventListener("change", aplicar);
  }, []);

  /**
   * As outras quatro entram só DEPOIS do `load` da janela, num momento ocioso.
   *
   * A primeira tentativa disparava no `onLoad` da própria primeira imagem — o
   * que acontece durante o carregamento inicial. Medido: as cinco continuavam
   * baixando na primeira carga (820 KB). Adiar exige esperar a página ficar
   * pronta, não a imagem.
   */
  useEffect(() => {
    if (modo !== "fotos" || completo) return;

    let ocioso: number | undefined;
    let timer: number | undefined;

    const agendar = () => {
      if (typeof window.requestIdleCallback === "function") {
        ocioso = window.requestIdleCallback(() => setCompleto(true), {
          timeout: 3000,
        });
      } else {
        timer = window.setTimeout(() => setCompleto(true), 1200);
      }
    };

    if (document.readyState === "complete") {
      agendar();
    } else {
      window.addEventListener("load", agendar, { once: true });
    }

    return () => {
      window.removeEventListener("load", agendar);
      if (ocioso !== undefined) window.cancelIdleCallback?.(ocioso);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [modo, completo]);

  const fotosVisiveis = completo ? FOTOS : FOTOS.slice(0, 1);

  useGSAP(
    () => {
      // Só orquestra quando as cinco existem; com uma só, ela fica parada.
      if (modo !== "fotos" || !completo) return;
      const no = raiz.current;
      if (!no) return;

      const slides = Array.from(
        no.querySelectorAll<HTMLElement>("[data-slide]"),
      );
      if (slides.length === 0) return;

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        // Sem movimento: a primeira foto, parada e nítida.
        if (contexto.conditions?.parado) {
          gsap.set(slides, { opacity: 0, scale: 1 });
          gsap.set(slides[0], { opacity: 1 });
          return;
        }

        gsap.set(slides, { opacity: 0, scale: 1.06 });
        gsap.set(slides[0], { opacity: 1 });

        const tl = gsap.timeline({ repeat: -1 });

        slides.forEach((slide, i) => {
          const proximo = slides[(i + 1) % slides.length];
          const inicio = i * DURACAO;

          // Zoom contínuo enquanto a foto está em cena.
          tl.fromTo(
            slide,
            { scale: 1.06 },
            {
              scale: 1.18,
              duration: DURACAO + CRUZAMENTO,
              ease: "none",
              immediateRender: i === 0,
            },
            inicio,
          );

          /**
           * `immediateRender: false` é o ponto crítico aqui.
           *
           * `fromTo` aplica o estado "from" NA CONSTRUÇÃO por padrão. Como a
           * última volta do laço tem `proximo === slides[0]`, o `{opacity: 0}`
           * dela apagava o primeiro slide no instante em que a timeline era
           * montada — e nada aparecia até a timeline chegar aos 6,5s e cruzar
           * para a segunda foto. Medido: hero em branco por 7,3 segundos.
           */
          tl.to(
            slide,
            { opacity: 0, duration: CRUZAMENTO, ease: "power1.inOut" },
            inicio + DURACAO,
          ).fromTo(
            proximo,
            { opacity: 0 },
            {
              opacity: 1,
              duration: CRUZAMENTO,
              ease: "power1.inOut",
              immediateRender: false,
            },
            inicio + DURACAO,
          );
        });

        return () => {
          tl.kill();
        };
      });

      return () => mm.revert();
    },
    // `completo` PRECISA estar aqui: a timeline só é montada quando os cinco
    // slides existem, e sem esta dependência o hook não re-executa quando ele
    // vira true — o hero ficava numa foto parada, sem transform nenhum.
    { scope: raiz, dependencies: [modo, completo] },
  );

  return (
    <div
      ref={raiz}
      className="relative size-full bg-noite bg-cover bg-center"
      /**
       * O pôster de fundo é o do vídeo VERTICAL. Serve de rede no celular;
       * no desktop ele apareceria esticado, então lá fica só o vinho até a
       * primeira foto pintar — e ela tem `priority`.
       */
      style={{
        backgroundImage:
          modo === "fotos"
            ? "url(/videos/hero-desktop-poster.jpg)"
            : "url(/videos/hero-poster.jpg)",
      }}
    >
      {modo === "fotos" &&
        fotosVisiveis.map((src, i) => (
          <div
            key={src}
            data-slide
            /**
             * A primeira já nasce acesa. Antes quem acendia era a timeline —
             * que só é construída depois do `load` + ocioso —, e no intervalo
             * as cinco ficavam em opacidade 0: hero em branco por ~5s. O GSAP
             * assume a partir daqui.
             */
            style={{ opacity: i === 0 ? 1 : 0 }}
            className="absolute inset-0 will-change-transform"
          >
            {/* `next/image` serve AVIF e dimensiona por viewport — em imagem
                full-bleed isso corta bytes de verdade, que é o ponto aqui. */}
            <Image
              src={src}
              alt=""
              aria-hidden
              fill
              sizes="100vw"
              priority={i === 0}
              className="object-cover"
            />
          </div>
        ))}

      {modo === "video" && (
        <video
          className="size-full object-cover"
          src="/videos/hero.mp4"
          poster="/videos/hero-poster.jpg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden
        />
      )}
    </div>
  );
}
