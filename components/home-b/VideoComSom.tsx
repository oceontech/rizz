"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/**
 * Vídeo com fala, em /videos/b/<nome>.mp4 (pôster .jpg de mesmo nome).
 *
 * Toca ao entrar na tela e pausa ao sair. Com `somAutomatico`, tenta tocar
 * já com som. Os navegadores só deixam um vídeo tocar sozinho com som depois
 * que a pessoa interagiu com a página (um toque ou clique; rolar não conta).
 * Se o som for bloqueado, ele toca mudo e liga o som no primeiro toque na
 * página. Sem `somAutomatico`, o som só liga pelo botão.
 */
export default function VideoComSom({
  nome,
  rotulo,
  somAutomatico = false,
  posicaoBotao = "left-5",
}: {
  nome: string;
  rotulo: string;
  somAutomatico?: boolean;
  /** Classes de posição do botão de som, para fugir de peças sobrepostas. */
  posicaoBotao?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const visivel = useRef(false);
  const [mudo, setMudo] = useState(true);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tocar = async () => {
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
      if (somAutomatico && visivel.current && video.muted) {
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
  }, [nome, somAutomatico]);

  function alternarSom() {
    const video = ref.current;
    if (!video) return;
    if (!video.src) video.src = `/videos/b/${nome}.mp4`;
    if (mudo) video.currentTime = 0;
    video.muted = !mudo;
    if (mudo) void video.play().catch(() => {});
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
        className="absolute inset-0 size-full object-cover"
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/80 to-transparent" />
      <button
        type="button"
        onClick={alternarSom}
        aria-pressed={!mudo}
        aria-label={mudo ? "Ligar o som" : "Desligar o som"}
        className={`absolute bottom-5 ${posicaoBotao} flex items-center gap-2.5 rounded-full bg-creme/95 py-2.5 pr-4 pl-3 text-xs font-medium tracking-[0.08em] text-tinta uppercase shadow-[0_10px_30px_rgb(0_0_0/0.35)] transition-colors hover:bg-white`}
      >
        {mudo ? <VolumeX className="size-4" /> : <Volume2 className="size-4 text-vinho" />}
        {mudo ? "Ligar o som" : "Som ligado"}
      </button>
    </div>
  );
}
