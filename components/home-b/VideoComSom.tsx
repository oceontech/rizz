"use client";

import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";

import { scrollToTarget } from "@/lib/scroll";

/**
 * Vídeo com fala, em /videos/b/<nome>.mp4 (pôster .jpg de mesmo nome).
 *
 * - Toca quando está de fato à vista e pausa quando sai. "À vista" é mais do
 *   que estar na área da tela: o vídeo do camarão fica dentro da cena presa
 *   do IntroCamarao, invisível (opacidade 0) enquanto o vídeo da abertura
 *   corre. Só o IntersectionObserver não enxerga isso, e o som começava por
 *   cima da abertura. Por isso cada rolagem confere a opacidade e a
 *   visibilidade dos ancestrais.
 * - Se a pessoa pausou, ele não volta a tocar sozinho.
 * - Com `somAutomatico`, tenta tocar já com som. Os navegadores só deixam um
 *   vídeo tocar sozinho com som depois que a pessoa interagiu com a página
 *   (um toque ou clique; rolar não conta). Se o som for bloqueado, ele toca
 *   mudo e liga o som no primeiro toque na página.
 * - Com `seguinte`, no celular, o vídeo toca uma vez só e, ao terminar, a
 *   página rola sozinha até esse bloco (as fotos logo abaixo). Se a pessoa já
 *   rolou antes do fim, o vídeo saiu da tela, pausou e nada acontece. Voltar
 *   à seção depois do fim não recomeça sozinho; o play recomeça. No desktop
 *   o vídeo segue em loop.
 */
export default function VideoComSom({
  nome,
  rotulo,
  somAutomatico = false,
  posicaoBotao = "left-5",
  seguinte,
}: {
  nome: string;
  rotulo: string;
  somAutomatico?: boolean;
  /** Classes de posição do botão de som, para fugir de peças sobrepostas. */
  posicaoBotao?: string;
  /** Bloco para onde a página rola quando o vídeo acaba (só no celular). */
  seguinte?: RefObject<HTMLElement | null>;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const visivel = useRef(false);
  const pausadoPelaPessoa = useRef(false);
  const umaVez = useRef(false);
  const terminou = useRef(false);
  const [mudo, setMudo] = useState(true);
  const [tocando, setTocando] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    umaVez.current = Boolean(seguinte) && !window.matchMedia("(min-width: 768px)").matches;
    video.loop = !umaVez.current;

    /** Na tela e sem ancestral transparente ou escondido. */
    const aVista = () => {
      if (!visivel.current) return false;
      if (getComputedStyle(video).visibility === "hidden") return false;
      for (let el: HTMLElement | null = video; el && el !== document.body; el = el.parentElement) {
        if (Number(getComputedStyle(el).opacity) < 0.6) return false;
      }
      return true;
    };

    const tocar = async () => {
      if (pausadoPelaPessoa.current || terminou.current || !video.paused) return;
      if (!video.src) video.src = `/videos/b/${nome}.mp4`;
      if (!somAutomatico) {
        void video.play().catch(() => {});
        return;
      }
      try {
        video.muted = false;
        await video.play();
        setMudo(false);
      } catch {
        video.muted = true;
        setMudo(true);
        void video.play().catch(() => {});
      }
    };

    const avaliar = () => {
      if (aVista()) void tocar();
      else if (!video.paused) video.pause();
    };

    let quadro = 0;
    const aoRolar = () => {
      if (quadro) return;
      quadro = requestAnimationFrame(() => {
        quadro = 0;
        avaliar();
      });
    };

    const observador = new IntersectionObserver(
      ([e]) => {
        visivel.current = e.isIntersecting;
        avaliar();
      },
      { threshold: 0.45 },
    );
    observador.observe(video);
    window.addEventListener("scroll", aoRolar, { passive: true });

    // Primeiro toque na página: se o vídeo está à vista e mudo, liga o som.
    const aoInteragir = () => {
      if (somAutomatico && aVista() && video.muted && !pausadoPelaPessoa.current) {
        video.muted = false;
        setMudo(false);
      }
    };
    window.addEventListener("pointerdown", aoInteragir);
    window.addEventListener("keydown", aoInteragir);

    return () => {
      observador.disconnect();
      cancelAnimationFrame(quadro);
      window.removeEventListener("scroll", aoRolar);
      window.removeEventListener("pointerdown", aoInteragir);
      window.removeEventListener("keydown", aoInteragir);
    };
  }, [nome, somAutomatico, seguinte]);

  function aoTerminar() {
    terminou.current = true;
    const alvo = seguinte?.current;
    // Só rola se a pessoa ainda está assistindo.
    if (umaVez.current && alvo && visivel.current) scrollToTarget(alvo, 16);
  }

  function alternarReproducao() {
    const video = ref.current;
    if (!video) return;
    if (!video.src) video.src = `/videos/b/${nome}.mp4`;
    if (video.paused) {
      pausadoPelaPessoa.current = false;
      terminou.current = false;
      void video.play().catch(() => {});
    } else {
      pausadoPelaPessoa.current = true;
      video.pause();
    }
  }

  function alternarSom() {
    const video = ref.current;
    if (!video) return;
    if (!video.src) video.src = `/videos/b/${nome}.mp4`;
    video.muted = !mudo;
    if (mudo && video.paused) {
      pausadoPelaPessoa.current = false;
      terminou.current = false;
      void video.play().catch(() => {});
    }
    setMudo(!mudo);
  }

  return (
    <div className="relative aspect-[9/16] overflow-hidden bg-noite">
      <video
        ref={ref}
        poster={`/videos/b/${nome}.jpg`}
        muted
        loop
        playsInline
        preload="none"
        aria-label={rotulo}
        onPlay={() => setTocando(true)}
        onPause={() => setTocando(false)}
        onEnded={aoTerminar}
        onClick={alternarReproducao}
        className="absolute inset-0 size-full cursor-pointer object-cover"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent" />

      {/* Pausado ou terminado: ícone de play no centro, que também é clicável. */}
      {!tocando && (
        <button
          type="button"
          onClick={alternarReproducao}
          aria-label="Reproduzir vídeo"
          className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-transform hover:scale-105"
        >
          <Play className="ml-1 size-7 fill-current" />
        </button>
      )}

      <div className={`absolute bottom-5 ${posicaoBotao} flex items-center gap-2`}>
        <button
          type="button"
          onClick={alternarReproducao}
          aria-label={tocando ? "Pausar vídeo" : "Reproduzir vídeo"}
          className="grid size-10 place-items-center rounded-full bg-creme/95 text-tinta shadow-[0_10px_30px_rgb(0_0_0/0.35)] transition-colors hover:bg-white"
        >
          {tocando ? <Pause className="size-4 fill-current" /> : <Play className="ml-0.5 size-4 fill-current" />}
        </button>
        <button
          type="button"
          onClick={alternarSom}
          aria-pressed={!mudo}
          aria-label={mudo ? "Ligar o som" : "Desligar o som"}
          className="flex h-10 items-center gap-2.5 rounded-full bg-creme/95 pr-4 pl-3 text-xs font-medium tracking-[0.08em] text-tinta uppercase shadow-[0_10px_30px_rgb(0_0_0/0.35)] transition-colors hover:bg-white"
        >
          {mudo ? <VolumeX className="size-4" /> : <Volume2 className="size-4 text-vinho" />}
          {mudo ? "Ligar o som" : "Som ligado"}
        </button>
      </div>
    </div>
  );
}
