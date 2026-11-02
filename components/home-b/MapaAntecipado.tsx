"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Embed do mapa que começa a carregar ~2 telas antes de aparecer.
 *
 * Com `loading="lazy"` o celular (o Safari principalmente) só baixava o
 * mapa quando ele já estava quase na tela, e a pessoa via o quadro vazio e
 * o mapa se montando. Agora o carregamento começa com folga e o mapa entra
 * com um fade só depois de pronto, sobre o fundo escuro do quadro.
 */
export default function MapaAntecipado({ src, titulo, className }: { src: string; titulo: string; className?: string }) {
  const ref = useRef<HTMLIFrameElement>(null);
  const [perto, setPerto] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        setPerto(true);
        obs.disconnect();
      },
      { rootMargin: "200% 0px" },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <iframe
      ref={ref}
      src={perto ? src : undefined}
      title={titulo}
      referrerPolicy="no-referrer-when-downgrade"
      tabIndex={-1}
      onLoad={() => perto && setPronto(true)}
      className={`transition-opacity duration-700 ${pronto ? "opacity-100" : "opacity-0"} ${className ?? ""}`}
    />
  );
}
