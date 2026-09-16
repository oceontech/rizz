"use client";

import { usePathname } from "next/navigation";
import { useRef } from "react";

import { CONDICOES, gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { site, whatsappLink } from "@/lib/site";

/**
 * Quarto acesso persistente, fora das três abas.
 *
 * As abas cobrem navegação; a conversão precisa de alvo próprio, senão
 * disputa espaço com o menu e perde.
 *
 * Entra depois da primeira dobra para não competir com os CTAs que já estão
 * na tela — e isso vale em TODAS as páginas, não só na home.
 *
 * Tentei soltá-lo de imediato fora da home, partindo da ideia de que o topo
 * do cardápio no celular ficava sem ação de reserva. Era falso: o RESERVAR do
 * header aparece sim abaixo de 768px (ver Header.tsx). O resultado foi um
 * segundo botão redundante que ainda cobria o campo de busca do cardápio em
 * telas de 640px de altura. Revertido.
 *
 * Em /reservas não aparece: a página inteira já é o pedido de mesa.
 */
export default function FloatingCta() {
  const raiz = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const naReservas = pathname.startsWith("/reservas");

  useGSAP(
    () => {
      const no = raiz.current;
      if (!no) return;

      gsap.set(no, { autoAlpha: 0, scale: 0.8, y: 10 });

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        const parado = contexto.conditions?.parado;

        const gatilho = ScrollTrigger.create({
          start: "top -75%",
          end: "max",
          onToggle: (self) => {
            const visivel = self.isActive;
            const estado = {
              autoAlpha: visivel ? 1 : 0,
              scale: visivel ? 1 : 0.8,
              y: visivel ? 0 : 10,
            };

            if (parado) {
              gsap.set(no, estado);
              return;
            }

            gsap.to(no, {
              ...estado,
              duration: 0.45,
              ease: "back.out(1.5)",
              overwrite: true,
            });
          },
        });

        return () => gatilho.kill();
      });

      return () => mm.revert();
    },
    { scope: raiz },
  );

  if (naReservas) return null;

  return (
    <div
      ref={raiz}
      className="fixed right-4 z-40 bottom-[calc(var(--spacing-nav)+1rem+env(safe-area-inset-bottom,0px))] md:bottom-8 md:right-8"
    >
      <a
        href={whatsappLink(
          `Olá! Gostaria de reservar uma mesa no ${site.nome}.`,
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2.5 rounded-full bg-ambar px-4 py-3.5 text-noite shadow-[0_12px_40px_-10px_rgb(0_0_0/0.7)] transition-colors duration-300 hover:bg-ouro-claro md:px-5"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-5 shrink-0"
          aria-hidden
        >
          <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.3-1.38a9.86 9.86 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.13-2.9-7A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.42 5.82c0 4.54-3.7 8.23-8.24 8.23a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.17 8.17 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.24-8.23m-2.9 4.2c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02s.87 2.34 1 2.5c.12.17 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.19 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.05.14-1.16-.06-.1-.22-.16-.46-.28-.24-.12-1.44-.71-1.66-.79-.22-.08-.39-.12-.55.12-.16.25-.63.79-.77.95-.14.17-.28.19-.53.06-.24-.12-1.03-.38-1.96-1.21-.72-.65-1.21-1.45-1.35-1.69-.14-.24-.02-.38.1-.5.11-.11.25-.29.37-.43.12-.15.16-.25.24-.41.08-.17.04-.31-.02-.43-.06-.12-.54-1.32-.75-1.8-.19-.46-.38-.4-.53-.41z" />
        </svg>
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em]">
          Reservar
        </span>
      </a>
    </div>
  );
}
