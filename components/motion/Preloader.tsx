"use client";

import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import { useBoot } from "@/components/motion/Boot";
import Logo from "@/components/brand/Logo";

const CHAVE_SESSAO = "rizz:visto";

/** Prazo máximo que a cortina pode segurar a página, aconteça o que acontecer. */
const RESGATE_MS = 3500;

/**
 * Cortina de abertura. Aparece uma vez por sessão.
 *
 * ⚠️ O markup é SEMPRE o mesmo no servidor e no cliente — de propósito.
 *
 * A versão anterior lia `sessionStorage` dentro de um `useState` e devolvia
 * `null` quando a sessão já tinha sido vista. Isso produz saídas diferentes
 * no servidor (sempre `false`) e no cliente (`true`), ou seja, incompatibi-
 * lidade de hidratação: o React não removia o nó vindo do servidor, e quem
 * voltava ao site ficava encarando a cortina até o resgate em CSS, 4s depois.
 *
 * Agora a decisão é tomada só no efeito: se a sessão já foi vista, a cortina
 * é apagada no primeiro quadro, sem nunca travar a rolagem.
 *
 * Quatro saídas, da mais externa para a mais interna:
 *   1. `data-cortina` + animação CSS — funciona mesmo sem JS algum;
 *   2. sessão já vista ou movimento reduzido — some no primeiro quadro;
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

      let jaViu = false;
      try {
        jaViu = sessionStorage.getItem(CHAVE_SESSAO) === "1";
        sessionStorage.setItem(CHAVE_SESSAO, "1");
      } catch {
        // Modo privado: segue sem memória de sessão.
      }

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

      if (jaViu || !no || semMovimento) {
        if (no) gsap.set(no, { autoAlpha: 0, pointerEvents: "none" });
        soltar();
        return;
      }

      const marca = no.querySelector("[data-marca]");
      const filete = no.querySelector("[data-filete]");
      const conteudo = no.querySelector("[data-conteudo]");
      const folhas = no.querySelectorAll("[data-folha]");

      // Faltando qualquer peça, não vale prender a página por um enfeite.
      if (!marca || !filete || !conteudo || !folhas.length) {
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

        tl.fromTo(
          marca,
          { opacity: 0, y: 18, x: 0, filter: "blur(16px)" },
          { opacity: 1, y: 0, x: 0, filter: "blur(0px)", duration: 1.1 },
        )
          .fromTo(
            filete,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.9, ease: "power2.inOut" },
            "-=0.5",
          )
          .to(conteudo, { opacity: 0, duration: 0.45, ease: "power2.in" })
          .to(
            folhas,
            { scaleY: 0, duration: 1, ease: "expo.inOut", stagger: 0.08 },
            "-=0.1",
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
      {/* Duas folhas que recolhem para cima, escalonadas. */}
      <div className="absolute inset-0 grid grid-cols-2">
        <div data-folha className="origin-top bg-noite" />
        <div data-folha className="origin-top bg-noite" />
      </div>

      <div
        data-conteudo
        className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6"
      >
        <Logo
          data-marca
          variante="branca"
          decorativo
          priority
          sizes="(min-width: 860px) 320px, 55vw"
          className="h-auto w-[min(55vw,20rem)]"
        />
        <span
          data-filete
          className="block h-px w-40 origin-center bg-ouro sm:w-56"
        />
      </div>
    </div>
  );
}
