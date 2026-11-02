"use client";

import { useRef, useState } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import { site } from "@/lib/site";

/** O "G" do Google nas quatro cores, como no botão de avaliar do próprio Google. */
export function LogoGoogle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

function Estrela({ cheia, className = "" }: { cheia: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path
        d="m12 2.8 2.8 5.9 6.4.9-4.7 4.5 1.2 6.4L12 17.4l-5.7 3.1 1.2-6.4-4.7-4.5 6.4-.9z"
        className={`transition-[fill,stroke] duration-200 ${cheia ? "fill-[#FBBC04] stroke-[#FBBC04]" : "fill-transparent stroke-[#dadce0]"}`}
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * Cartão de avaliação no estilo do Google: o "G", o nome da casa e cinco
 * estrelas grandes. É o centro da página: tocar em qualquer estrela (ou no
 * botão) abre direto a janela de escrever avaliação do Google.
 *
 * Movimento:
 * - ao aparecer, as estrelas acendem uma a uma até cinco e, de tempos em
 *   tempos, um brilho passa por elas, convidando ao toque;
 * - com o cursor (desktop), elas acendem até a que está sob ele, como no
 *   Google; o cartão inclina levemente na direção do cursor;
 * - no toque (celular), a estrela tocada pulsa antes de abrir o Google.
 *
 * O link abre numa aba nova: a pessoa volta para o site quando terminar.
 */
export default function CartaoGoogle({ media, total }: { media: number; total: number }) {
  const raiz = useRef<HTMLDivElement>(null);
  const [acesas, setAcesas] = useState(0);
  const [sobre, setSobre] = useState<number | null>(null);
  const mostrar = sobre ?? acesas;

  useGSAP(
    () => {
      const no = raiz.current;
      if (!no) return;
      const estrelas = no.querySelectorAll<HTMLElement>("[data-estrela]");
      const mm = gsap.matchMedia();

      mm.add({ ...CONDICOES, mouse: "(pointer: fine) and (min-width: 768px)" }, (contexto) => {
        if (contexto.conditions?.parado) {
          setAcesas(5);
          return;
        }

        // Entrada: o cartão sobe e as estrelas acendem uma a uma.
        const n = { v: 0 };
        const tl = gsap.timeline({ scrollTrigger: { trigger: no, start: "top 85%", once: true } });
        tl.fromTo(no, { y: 40, opacity: 0, rotateX: 8 }, { y: 0, opacity: 1, rotateX: 0, duration: 0.9, ease: "power3.out" })
          .fromTo(estrelas, { scale: 0.4, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.08, ease: "back.out(2.2)" }, 0.3)
          .to(n, { v: 5, duration: 0.9, ease: "none", onUpdate: () => setAcesas(Math.round(n.v)) }, 0.75);

        // Convite: de tempos em tempos as estrelas dão um pulinho em onda.
        const convite = gsap.timeline({ repeat: -1, repeatDelay: 3.2, delay: 2.4 });
        convite.to(estrelas, { y: -6, duration: 0.22, stagger: 0.07, ease: "power2.out", yoyo: true, repeat: 1 });

        // Desktop: o cartão inclina na direção do cursor.
        if (contexto.conditions?.mouse) {
          const rx = gsap.quickTo(no, "rotateX", { duration: 0.6, ease: "power3.out" });
          const ry = gsap.quickTo(no, "rotateY", { duration: 0.6, ease: "power3.out" });
          const mover = (e: PointerEvent) => {
            const r = no.getBoundingClientRect();
            ry(((e.clientX - r.left) / r.width - 0.5) * 8);
            rx(-((e.clientY - r.top) / r.height - 0.5) * 8);
          };
          const sair = () => {
            rx(0);
            ry(0);
          };
          no.addEventListener("pointermove", mover);
          no.addEventListener("pointerleave", sair);
          return () => {
            no.removeEventListener("pointermove", mover);
            no.removeEventListener("pointerleave", sair);
          };
        }
      });

      return () => mm.revert();
    },
    { scope: raiz },
  );

  function aoTocar(i: number, e: React.MouseEvent<HTMLAnchorElement>) {
    // Pulso na estrela tocada; o link abre normalmente (aba nova).
    gsap.fromTo(e.currentTarget, { scale: 1.35 }, { scale: 1, duration: 0.5, ease: "elastic.out(1, 0.4)" });
    setAcesas(i);
  }

  return (
    <div style={{ perspective: "1200px" }}>
      <div
        ref={raiz}
        className="relative rounded-[1.75rem] bg-white p-6 text-[#202124] shadow-[0_40px_90px_rgb(0_0_0/0.5)] will-change-transform sm:p-8"
      >
        <div className="flex items-center gap-3.5">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-white shadow-[0_2px_10px_rgb(0_0_0/0.12)]">
            <LogoGoogle className="size-7" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[1.0625rem] font-medium">{site.nome}</p>
            <p className="text-[0.8125rem] text-[#5f6368]">Avaliação pública no Google</p>
          </div>
        </div>

        <p className="mt-7 text-center text-[0.9375rem] text-[#3c4043]">Toque nas estrelas para avaliar</p>

        <div className="mt-3 flex justify-center gap-1 sm:gap-2" onPointerLeave={() => setSobre(null)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <a
              key={i}
              data-estrela
              href={site.googleAvaliarUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Avaliar com ${i} ${i === 1 ? "estrela" : "estrelas"} no Google`}
              onPointerEnter={(e) => e.pointerType === "mouse" && setSobre(i)}
              onClick={(e) => aoTocar(i, e)}
              className="grid size-12 place-items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-[#1a73e8]/40 sm:size-14"
            >
              <Estrela cheia={i <= mostrar} className="size-10 sm:size-12" />
            </a>
          ))}
        </div>

        <a
          href={site.googleAvaliarUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-7 flex h-14 w-full items-center justify-center gap-3 rounded-full bg-[#1a73e8] px-6 text-[0.9375rem] font-medium text-white shadow-[0_8px_24px_rgb(26_115_232/0.35)] transition-[background-color,transform] duration-200 hover:bg-[#1765cc] active:scale-[0.98]"
        >
          <span className="grid size-7 place-items-center rounded-full bg-white">
            <LogoGoogle className="size-[1.1rem]" />
          </span>
          Avaliar no Google
          <svg viewBox="0 0 24 24" aria-hidden className="size-4 transition-transform duration-300 group-hover:translate-x-1">
            <path d="M5 12h14m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>

        <p className="mt-5 flex items-center justify-center gap-2 text-[0.8125rem] text-[#5f6368]">
          <span className="font-medium text-[#202124]">{media.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}</span>
          <span className="flex" aria-hidden>
            {[1, 2, 3, 4, 5].map((i) => (
              <Estrela key={i} cheia={i <= Math.round(media)} className="size-3.5" />
            ))}
          </span>
          <span>{total.toLocaleString("pt-BR")} avaliações</span>
        </p>
      </div>
    </div>
  );
}
