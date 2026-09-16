"use client";

import { useRef, type ReactNode } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import { pratoAssinatura } from "@/data/menu";

/** O próprio vídeo avança e retrocede com o scroll, sem reprodução automática. */
export default function IntroCamarao({ children }: { children: ReactNode }) {
  const raiz = useRef<HTMLDivElement>(null);
  const cenaRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const camadaRef = useRef<HTMLDivElement>(null);
  const conteudoRef = useRef<HTMLDivElement>(null);
  const chamadaRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const no = raiz.current;
      const video = videoRef.current;
      const cena = cenaRef.current;
      const camada = camadaRef.current;
      const conteudo = conteudoRef.current;
      const chamada = chamadaRef.current;
      if (!no || !video || !cena || !camada || !conteudo || !chamada) return;

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) return;

        gsap.set(camada, { display: "block", autoAlpha: 1 });
        gsap.set(conteudo, { autoAlpha: 0 });
        gsap.set(chamada, { display: "flex", autoAlpha: 0 });
        const textos = chamada.querySelectorAll("[data-chamada-texto]");
        const entradas = conteudo.querySelectorAll("[data-entrada-prato]");

        const quadro = { progresso: 0 };

        function sincronizar() {
          if (
            !video ||
            video.readyState < 2 ||
            !Number.isFinite(video.duration) ||
            video.seeking
          ) return;

          // O arquivo tem 24 fps. Evita buscar além do último quadro e
          // espera cada decodificação antes de pedir o próximo seek.
          const tempo = quadro.progresso * Math.max(0, video.duration - 1 / 24);
          if (Math.abs(video.currentTime - tempo) > 1 / 48) {
            video.currentTime = tempo;
          }
        }

        video.addEventListener("loadeddata", sincronizar);
        video.addEventListener("seeked", sincronizar);

        /**
         * Distância da trava medida pelo que cada fase precisa, não "quanto
         * maior melhor". Antes eram 3,5 telas (mín. 2400px) e só ~36% disso
         * era vídeo: o resto era a chamada parada e o prato entrando com a
         * cena ainda presa — o usuário rolava sem ver nada mudar e achava
         * que tinha travado.
         *
         * Linha do tempo (unidades):
         *   0    → 1     vídeo
         *   0.86 → 1.08  chamada entra
         *   1.08 → 1.30  chamada fica (respiro curto)
         *   1.30 → 1.50  chamada sai, prato entra
         *   ~1.66        solta
         */
        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: no,
            start: "top top",
            end: () => `+=${Math.round(Math.max(1500, document.documentElement.clientHeight * 2.4))}`,
            pin: cena,
            pinSpacing: true,
            anticipatePin: 1,
            // Scrub curto: com atraso longo a animação ainda está correndo
            // quando a trava solta, e a página parece dar um tranco.
            scrub: 0.4,
            invalidateOnRefresh: true,
          },
        });

        timeline.to(quadro, {
          progresso: 1,
          duration: 1,
          ease: "none",
          onUpdate: sincronizar,
        });
        // A chamada começa nos instantes finais do vídeo, antes da passagem branca.
        timeline
          .to(camada, { autoAlpha: 0, duration: 0.2, ease: "power1.inOut" }, 0.86)
          .to(chamada, { autoAlpha: 1, duration: 0.2, ease: "power1.inOut" }, 0.86)
          .fromTo(
            textos,
            { y: 24, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.2, stagger: 0.03, ease: "power2.out" },
            0.86,
          )
          .to(textos, { y: -24, opacity: 0, duration: 0.16, stagger: 0.03, ease: "power2.in" }, 1.3)
          .to(chamada, { autoAlpha: 0, duration: 0.18, ease: "power1.inOut" }, 1.34)
          .to(conteudo, { autoAlpha: 1, duration: 0.2, ease: "power1.inOut" }, 1.34)
          .fromTo(
            entradas,
            { y: 36, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.22, stagger: 0.06, ease: "power2.out" },
            1.36,
          )
          .to({}, { duration: 0.02 });

        // Carrega a mídia ao se aproximar, sem competir com o vídeo do hero.
        const observador = new IntersectionObserver(
          ([entrada]) => {
            if (!entrada.isIntersecting) return;
            video.preload = "auto";
            // Retrato no celular, landscape no desktop: o mesmo clipe em 24fps
            // e 5,04s nos dois, então a matemática do seek não muda.
            const largo = window.matchMedia("(min-width: 768px)").matches;
            video.src = largo
              ? "/videos/camarao-reveal-desktop.mp4"
              : "/videos/camarao-reveal.mp4";
            video.poster = largo
              ? "/videos/camarao-reveal-desktop-poster.jpg"
              : "/videos/camarao-reveal-poster.jpg";
            video.load();
            observador.disconnect();
          },
          { rootMargin: "800px 0px" },
        );
        observador.observe(no);

        return () => {
          observador.disconnect();
          video.removeEventListener("loadeddata", sincronizar);
          video.removeEventListener("seeked", sincronizar);
          video.pause();
          video.removeAttribute("src");
          video.load();
        };
      });

      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <div ref={raiz} data-camarao-transicao className="relative -mb-px w-full bg-white">
      <div ref={cenaRef} className="relative min-h-[100svh] w-full bg-white">
        <div ref={conteudoRef} data-camarao-conteudo>{children}</div>
        <div ref={camadaRef} data-camarao-video aria-hidden="true" className="pointer-events-none absolute inset-0 z-10 hidden bg-white">
          <div className="relative h-[100svh] w-full overflow-hidden">
            {/*
              `object-cover` nos dois: no desktop o arquivo é 16:9 e deve
              preencher a tela. Sem `width`/`height` fixos — eles travavam a
              proporção em 9:16, errada para a fonte landscape.
            */}
            <video
              ref={videoRef}
              className="block size-full object-cover"
              muted
              playsInline
              preload="none"
              disablePictureInPicture
              tabIndex={-1}
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[25%] bg-[linear-gradient(to_bottom,rgb(255_255_255/0)_0%,rgb(255_255_255/0.65)_45%,#fff_90%,#fff_100%)]" />
          </div>
        </div>
        <div
          ref={chamadaRef}
          data-camarao-chamada
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-20 hidden h-[100svh] flex-col items-center justify-center gap-5 bg-white px-6 text-center"
        >
          <p data-chamada-texto className="font-display text-display font-medium italic leading-tight text-vinho">
            O mais pedido!
          </p>
          <p data-chamada-texto className="max-w-[30ch] font-sans text-base font-light leading-relaxed text-tinta/80 md:text-xl">
            {pratoAssinatura.nome}
          </p>
        </div>
      </div>
    </div>
  );
}
