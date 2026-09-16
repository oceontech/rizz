"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";

/**
 * Segunda dobra: fotos da casa atravessando a tela, com a marca no centro.
 *
 * Três camadas de contenção de custo, porque esta seção chegou a travar a
 * página inteira:
 *
 * 1. O bundle do three/fiber/drei entra por `next/dynamic` — nunca no
 *    carregamento inicial.
 * 2. O canvas só é MONTADO quando a seção chega perto da viewport, e é
 *    DESMONTADO quando se afasta, devolvendo a memória de GPU.
 * 3. Enquanto montado mas fora de vista, o laço de render fica em `never`.
 *
 * E uma regra para nunca mostrar a tela vazia: a foto parada fica SEMPRE por
 * baixo, e o canvas só aparece (com fade) depois de desenhar o primeiro
 * quadro com as texturas prontas. Antes disso, quem chegava rápido via só o
 * "Rizz" sobre o vinho — o bundle do three e as 10 fotos ainda estavam
 * baixando.
 *
 * As texturas vêm de /public/galeria, reduzidas a 560px. As originais, de até
 * 1216×2160, ocupavam ~67 MB de VRAM no conjunto.
 */
const carregarGaleria = () => import("@/components/ui/GaleriaInfinita");

const GaleriaInfinita = dynamic(carregarGaleria, {
  ssr: false,
  loading: () => null,
});

const FOTOS = [
  "camarao-rizz",
  "risoto-trufado-brie-frigideira",
  "ancho-risoto-acafrao-trufado",
  "parmegiana-brie-risoto",
  "peixe-arroz-negro-aspargos",
  "cordeiro-creme-batatas-hortela",
  "camarao-massa-pesto-pistache",
  "file-risoto-parmesao-vinho",
  "copa-lombo-milanesa-risoto-limao",
  "salao-claraboia-vinho",
].map((n) => ({ src: `/galeria/${n}.webp`, alt: "" }));

export default function Galeria() {
  const raiz = useRef<HTMLDivElement>(null);
  const fotosRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [montar, setMontar] = useState(false);
  const [visivel, setVisivel] = useState(false);
  const [pronto, setPronto] = useState(false);
  const [geracao, setGeracao] = useState(0);
  const [comMovimento, setComMovimento] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: no-preference)");
    const aplicar = () => setComMovimento(mq.matches);
    aplicar();
    mq.addEventListener("change", aplicar);
    return () => mq.removeEventListener("change", aplicar);
  }, []);

  /**
   * Pré-carga ociosa: depois que a página assentou, baixa o bundle e aquece
   * o cache HTTP das fotos. Nada disso toca a GPU — o WebGL só nasce quando a
   * seção se aproxima —, mas quando nasce não fica esperando a rede.
   */
  useEffect(() => {
    if (!comMovimento) return;
    let cancelado = false;
    const aquecer = () => {
      if (cancelado) return;
      void carregarGaleria();
      for (const f of FOTOS) {
        const im = new Image();
        im.decoding = "async";
        im.src = f.src;
      }
    };

    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(aquecer, { timeout: 2500 });
      return () => {
        cancelado = true;
        window.cancelIdleCallback(id);
      };
    }
    const id = setTimeout(aquecer, 1200);
    return () => {
      cancelado = true;
      clearTimeout(id);
    };
  }, [comMovimento]);

  useEffect(() => {
    const no = raiz.current;
    if (!no) return;

    /**
     * Histerese: monta perto (60% de uma tela) e só desmonta longe (150%).
     * Com uma margem única, qualquer vai-e-vem na borda recriava o contexto
     * WebGL — e cada recriação é uma tela sem foto enquanto as texturas
     * sobem de novo para a GPU. No celular, contextos demais também fazem o
     * navegador derrubar o mais antigo.
     */
    const perto = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setMontar(true);
      },
      { rootMargin: "60% 0px" },
    );
    const longe = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) {
          setMontar(false);
          // O próximo canvas precisa provar de novo que desenhou.
          setPronto(false);
        }
      },
      { rootMargin: "150% 0px" },
    );
    // Em vista de fato: só aí o laço de render roda.
    const emVista = new IntersectionObserver(([e]) => setVisivel(e.isIntersecting), {
      rootMargin: "0px",
    });

    perto.observe(no);
    longe.observe(no);
    emVista.observe(no);
    return () => {
      perto.disconnect();
      longe.disconnect();
      emVista.disconnect();
    };
  }, []);

  const aoFicarPronto = useCallback(() => setPronto(true), []);
  const aoPerderContexto = useCallback(() => {
    setPronto(false);
    setGeracao((g) => g + 1);
  }, []);

  // Fade do canvas por cima da foto parada.
  useGSAP(
    () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      gsap.to(canvas, {
        autoAlpha: pronto ? 1 : 0,
        duration: pronto ? 0.9 : 0.2,
        ease: "power2.out",
        overwrite: true,
      });
    },
    { dependencies: [pronto, montar, geracao], scope: raiz },
  );

  /**
   * Saída: na última meia tela antes de a seção soltar, as fotos se
   * recolhem numa janela de cantos arredondados e se afastam, enquanto a
   * marca cresce e se dissolve — a galeria "fecha" em vez de ser cortada
   * pela seção seguinte.
   */
  useGSAP(
    () => {
      const no = raiz.current;
      const fotos = fotosRef.current;
      if (!no || !fotos) return;
      const marca = no.querySelector("[data-marca]");
      const veu = no.querySelector("[data-veu]");

      const mm = gsap.matchMedia();
      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) return;

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: no,
            start: "bottom 160%",
            end: "bottom bottom",
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        });

        tl.fromTo(
          fotos,
          { clipPath: "inset(0% 0% 0% 0% round 0px)", scale: 1 },
          { clipPath: "inset(14% 9% 14% 9% round 28px)", scale: 0.92, duration: 1 },
          0,
        )
          .fromTo(fotos, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.35, ease: "power1.in" }, 0.65)
          .fromTo(veu, { opacity: 0 }, { opacity: 0.6, duration: 1 }, 0)
          .fromTo(
            marca,
            { scale: 1, letterSpacing: "0em" },
            { scale: 1.35, letterSpacing: "0.06em", duration: 0.75, ease: "power1.inOut" },
            0,
          )
          .fromTo(
            marca,
            { opacity: 1, y: 0 },
            { opacity: 0, y: -30, duration: 0.3, ease: "power1.in" },
            0.7,
          );
      });

      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <section
      ref={raiz}
      aria-label="Fotos do Rizz"
      className="relative h-[200svh] bg-noite"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div ref={fotosRef} className="absolute inset-0 will-change-transform">
          {/* Sempre presente: é o que se vê enquanto o WebGL não desenhou. */}
          <div
            className="absolute inset-0 bg-cover bg-center opacity-45"
            style={{ backgroundImage: `url(${FOTOS[0].src})` }}
          />

          {comMovimento && montar ? (
            <div ref={canvasRef} className="invisible absolute inset-0 bg-noite opacity-0">
              <GaleriaInfinita
                key={geracao}
                fotos={FOTOS}
                pausado={!visivel}
                onPronto={aoFicarPronto}
                onPerdido={aoPerderContexto}
                className="absolute inset-0"
              />
            </div>
          ) : null}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-noite/35" />
        <div data-veu className="pointer-events-none absolute inset-0 bg-noite opacity-0" />

        <div className="pointer-events-none absolute inset-0 grid place-items-center">
          <p
            data-marca
            className="font-display text-[22vw] italic leading-none text-creme [text-shadow:0_2px_40px_rgb(43_7_16/0.9)] md:text-[14vw]"
          >
            Rizz
          </p>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[18svh] bg-gradient-to-b from-transparent to-noite" />
      </div>
    </section>
  );
}
