"use client";

import { useEffect, useRef } from "react";

/**
 * Vídeo mudo em loop que só baixa quando chega perto da tela, como o
 * Mosaico: com `autoPlay` direto, a página pagaria todos os vídeos da B
 * (cerca de 10 MB) já na primeira carga.
 *
 * `nome` aponta para /videos/b/<nome>.mp4 e o pôster de mesmo nome.
 * Com movimento reduzido, fica só o pôster.
 */
export default function VideoB({
  nome,
  className = "",
  rotulo,
}: {
  nome: string;
  className?: string;
  /** Descrição para leitores de tela; sem ela o vídeo é decorativo. */
  rotulo?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return;
        video.src = `/videos/b/${nome}.mp4`;
        video.load();
        void video.play().catch(() => {});
        observador.disconnect();
      },
      { rootMargin: "600px 0px" },
    );

    observador.observe(video);
    return () => observador.disconnect();
  }, [nome]);

  return (
    <video
      ref={ref}
      poster={`/videos/b/${nome}.jpg`}
      muted
      loop
      playsInline
      preload="none"
      aria-label={rotulo}
      aria-hidden={rotulo ? undefined : true}
      className={className}
    />
  );
}
