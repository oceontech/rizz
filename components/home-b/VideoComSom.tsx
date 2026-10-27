"use client";

import { Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Vídeo com fala, em /videos/b/<nome>.mp4 (pôster .jpg de mesmo nome).
 *
 * - Toca ao entrar na tela e pausa ao sair. Se a pessoa pausou, ele não volta
 *   a tocar sozinho.
 * - Tocar no vídeo pausa ou retoma; o botão liga e desliga o som.
 * - Com `somAutomatico`, tenta tocar já com som. Os navegadores só deixam um
 *   vídeo tocar sozinho com som depois que a pessoa interagiu com a página
 *   (um toque ou clique; rolar não conta). Se o som for bloqueado, ele toca
 *   mudo e liga o som no primeiro toque na página.
 * - Com `final`, no celular, o vídeo toca uma vez só. Faltando 2 segundos,
 *   esse conteúdo (as fotos do prato) entra por cima, mas o vídeo segue
 *   tocando por baixo até o fim, para a fala não ser cortada. Depois de
 *   terminado, voltar à seção mantém as fotos (sem recomeçar sozinho); o
 *   botão "Rever" toca de novo. No desktop o vídeo segue em loop.
 */
export default function VideoComSom({
  nome,
  rotulo,
  somAutomatico = false,
  posicaoBotao = "left-5",
  final,
}: {
  nome: string;
  rotulo: string;
  somAutomatico?: boolean;
  /** Classes de posição do botão de som, para fugir de peças sobrepostas. */
  posicaoBotao?: string;
  final?: ReactNode;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const visivel = useRef(false);
  const pausadoPelaPessoa = useRef(false);
  const comFinal = useRef(false);
  const terminou = useRef(false);
  const [mudo, setMudo] = useState(true);
  const [tocando, setTocando] = useState(false);
  const [noFinal, setNoFinal] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    comFinal.current = Boolean(final) && !window.matchMedia("(min-width: 768px)").matches;
    video.loop = !comFinal.current;

    const tocar = async () => {
      if (pausadoPelaPessoa.current || terminou.current) return;
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

    const observador = new IntersectionObserver(
      ([e]) => {
        visivel.current = e.isIntersecting;
        if (e.isIntersecting) void tocar();
        else video.pause();
      },
      { threshold: 0.45 },
    );
    observador.observe(video);

    // Primeiro toque na página: se o vídeo está à vista e mudo, liga o som.
    const aoInteragir = () => {
      if (somAutomatico && visivel.current && video.muted && !pausadoPelaPessoa.current) {
        video.muted = false;
        setMudo(false);
      }
    };
    window.addEventListener("pointerdown", aoInteragir);
    window.addEventListener("keydown", aoInteragir);

    return () => {
      observador.disconnect();
      window.removeEventListener("pointerdown", aoInteragir);
      window.removeEventListener("keydown", aoInteragir);
    };
  }, [nome, somAutomatico, final]);

  function aoAvancar() {
    const video = ref.current;
    if (!video || !comFinal.current || noFinal || !video.duration) return;
    // Só a imagem muda: o áudio continua até o fim do arquivo.
    if (video.duration - video.currentTime <= 2) setNoFinal(true);
  }

  function alternarReproducao() {
    const video = ref.current;
    if (!video) return;
    if (!video.src) video.src = `/videos/b/${nome}.mp4`;
    if (video.paused) {
      pausadoPelaPessoa.current = false;
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
    if (mudo) {
      pausadoPelaPessoa.current = false;
      void video.play().catch(() => {});
    }
    setMudo(!mudo);
  }

  function rever() {
    const video = ref.current;
    if (!video) return;
    setNoFinal(false);
    terminou.current = false;
    pausadoPelaPessoa.current = false;
    video.currentTime = 0;
    void video.play().catch(() => {});
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
        onTimeUpdate={aoAvancar}
        onEnded={() => {
          terminou.current = true;
          setNoFinal(true);
        }}
        onClick={alternarReproducao}
        className="absolute inset-0 size-full cursor-pointer object-cover"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent" />

      {/* Pausado: ícone de play no centro, que também é clicável. */}
      {!tocando && !noFinal && (
        <button
          type="button"
          onClick={alternarReproducao}
          aria-label="Reproduzir vídeo"
          className="absolute top-1/2 left-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-transform hover:scale-105"
        >
          <Play className="ml-1 size-7 fill-current" />
        </button>
      )}

      <div className={`absolute bottom-5 ${posicaoBotao} flex items-center gap-2 transition-opacity ${noFinal ? "pointer-events-none opacity-0 md:pointer-events-auto md:opacity-100" : ""}`}>
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

      {/* Final (celular): o conteúdo entra por cima do vídeo. */}
      {final && (
        <div
          aria-hidden={!noFinal}
          className={`absolute inset-0 transition-[opacity,transform] duration-700 ease-[var(--ease-rizz)] md:hidden ${noFinal ? "opacity-100" : "pointer-events-none scale-105 opacity-0"}`}
        >
          {noFinal && final}
          <button
            type="button"
            onClick={rever}
            className="absolute bottom-5 left-1/2 flex h-10 -translate-x-1/2 items-center gap-2 rounded-full bg-creme/95 px-4 text-xs font-medium tracking-[0.08em] whitespace-nowrap text-tinta uppercase shadow-[0_10px_30px_rgb(0_0_0/0.35)]"
          >
            <RotateCcw className="size-3.5" /> Rever a apresentação
          </button>
        </div>
      )}
    </div>
  );
}
