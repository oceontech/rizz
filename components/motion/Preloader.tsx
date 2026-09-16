"use client";

import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import { useBoot } from "@/components/motion/Boot";
import LogoSvg from "@/components/brand/LogoSvg";

/** Prazo máximo que a cortina pode segurar a página, aconteça o que acontecer. */
const RESGATE_MS = 5000;

/**
 * Cortina de abertura. Toca a cada carregamento completo da página — ela
 * vive no layout raiz, então navegar pelo menu não a repete.
 *
 * ⚠️ O markup é SEMPRE o mesmo no servidor e no cliente — de propósito.
 *
 * Houve uma regra de "uma vez por sessão" (via `sessionStorage`). Ela fazia
 * quem recarregava ver só um clarão vinho sem logo, e foi retirada.
 *
 * Quatro saídas, da mais externa para a mais interna:
 *   1. `data-cortina` + animação CSS — funciona mesmo sem JS algum;
 *   2. movimento reduzido — a logo só acende e a cortina se dissolve;
 *   3. alvo ausente ou erro ao montar a timeline — desiste e libera;
 *   4. temporizador de resgate, caso a animação não termine.
 */
export default function Preloader() {
  const { liberar } = useBoot();
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const no = raiz.current;

      // O JS está vivo: ele assume a saída e dispensa o resgate do CSS.
      no?.removeAttribute("data-cortina");

      let solto = false;
      const soltar = () => {
        if (solto) return;
        solto = true;
        document.documentElement.style.overflow = "";
        liberar();
      };

      const semMovimento = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (!no) {
        soltar();
        return;
      }

      if (semMovimento) {
        // Sem deslocamento nenhum: a assinatura só acende e a cortina se
        // dissolve. Pular a cortina deixava um clarão vinho sem logo.
        document.documentElement.style.overflow = "hidden";
        const marcaParada = no.querySelector("[data-marca]");
        const tlParada = gsap.timeline({
          onComplete: () => {
            gsap.set(no, { autoAlpha: 0, pointerEvents: "none" });
            soltar();
          },
        });
        if (marcaParada) {
          tlParada.fromTo(marcaParada, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "none" });
        }
        tlParada.to(no, { autoAlpha: 0, duration: 0.4, ease: "none" }, "+=0.6");
        return () => {
          tlParada.kill();
          document.documentElement.style.overflow = "";
        };
      }

      const marca = no.querySelector<SVGSVGElement>("[data-marca]");
      const pano = no.querySelector<HTMLElement>("[data-pano]");
      const letras = marca?.querySelectorAll("[data-logo-letra]");
      const garfo = marca?.querySelector<SVGGElement>("[data-logo-garfo]");
      const sub = marca?.querySelectorAll("[data-logo-sub-letra]");

      // Faltando qualquer peça, não vale prender a página por um enfeite.
      if (!marca || !pano || !letras?.length || !garfo || !sub?.length) {
        gsap.set(no, { autoAlpha: 0, pointerEvents: "none" });
        soltar();
        return;
      }

      document.documentElement.style.overflow = "hidden";
      const resgate = window.setTimeout(() => {
        gsap.set(no, { autoAlpha: 0, pointerEvents: "none" });
        soltar();
      }, RESGATE_MS);

      try {
        const tl = gsap.timeline({
          onComplete: () => {
            window.clearTimeout(resgate);
            gsap.set(no, { autoAlpha: 0, pointerEvents: "none" });
            soltar();
          },
        });

        /**
         * O garfo é uma lança.
         *
         * O nome se monta sem ele — R, Z, Z e o "CUCINA & VINO". Aí o garfo
         * despenca do topo da tela, acelerando, e crava no lugar do "i". O
         * impacto sacode a assinatura, e a cortina inteira (fundo e logo)
         * cai junto, revelando o hero.
         */
        gsap.set(marca, { opacity: 1 });

        // Distância até o topo da tela, em unidades do viewBox: o `y` de um
        // <g> dentro do SVG é medido nelas, não em pixels.
        const queda = () => {
          const caixa = marca.getBoundingClientRect();
          const unidadesPorPx = marca.viewBox.baseVal.width / caixa.width;
          return -(caixa.bottom + 40) * unidadesPorPx;
        };

        const impacto = 1.75;

        tl.fromTo(
          letras,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.09 },
        )
          .fromTo(
            sub,
            { opacity: 0, y: 5 },
            { opacity: 1, y: 0, duration: 0.5, ease: "power2.out", stagger: 0.035 },
            0.45,
          )
          // A queda: acelera o tempo todo e chega esticada, como algo pesado.
          .fromTo(
            garfo,
            { y: queda, scaleY: 1.18, transformOrigin: "50% 100%" },
            { y: 0, scaleY: 1, duration: 0.5, ease: "power3.in" },
            impacto - 0.5,
          )
          // O baque: a assinatura afunda um tico e volta; as letras achatam.
          .fromTo(
            marca,
            { y: 0 },
            { y: 7, duration: 0.07, ease: "power2.out", yoyo: true, repeat: 1 },
            impacto,
          )
          .fromTo(
            letras,
            { scaleY: 1, transformOrigin: "50% 100%" },
            { scaleY: 0.94, duration: 0.07, ease: "power2.out", yoyo: true, repeat: 1 },
            impacto,
          )
          // Com o golpe, a cortina despenca e o hero começa a entrar.
          .call(soltar, undefined, impacto + 0.2)
          .fromTo(
            pano,
            { yPercent: 0 },
            { yPercent: 100, duration: 0.95, ease: "power3.in" },
            impacto + 0.2,
          );
      } catch {
        window.clearTimeout(resgate);
        gsap.set(no, { autoAlpha: 0, pointerEvents: "none" });
        soltar();
      }

      return () => {
        window.clearTimeout(resgate);
        document.documentElement.style.overflow = "";
      };
    },
    { scope: raiz },
  );

  return (
    <div
      ref={raiz}
      data-cortina
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100]"
    >
      {/* Fundo e logo num pano só: é ele que despenca no fim. */}
      <div data-pano className="absolute inset-0 bg-noite will-change-transform">
        <div className="absolute inset-0 flex items-center justify-center px-6">
          {/* Começa apagada: quem a acende é a timeline. Sem JS, a cortina
              sai sozinha pelo resgate em CSS. */}
          <LogoSvg
            data-marca
            className="h-auto w-[min(38vw,11rem)] overflow-visible text-white opacity-0"
          />
        </div>
      </div>
    </div>
  );
}
