"use client";

import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

/**
 * Entradas da home, coordenadas num lugar só e ligadas por atributo, sem
 * transformar as seções (que são do servidor) em componentes de cliente.
 *
 *   data-anima="letreiro"   título-assinatura: cursiva + serifada alta (+ linha)
 *   data-anima="midia"      foto ou vídeo que se abre como uma cortina
 *   data-anima="cascata"    filhos diretos entram um depois do outro
 *   data-anima-contar       no letreiro: o número do título conta até o valor
 *   data-anima-magnetico    botão que acompanha o cursor (só desktop)
 *   data-anima-so="desktop" só no desktop (ex.: lista que no celular vira faixa lateral)
 *
 * Desktop e celular têm coreografias diferentes, porque o layout muda:
 *
 * Tudo é SUTIL de propósito (pedido do cliente, depois de uma primeira
 * versão mais cenográfica): deslocamentos curtos, sem desfoque, durações
 * abaixo de 1s.
 *
 * - DESKTOP (tela larga, cursor): a cursiva se escreve da esquerda para a
 *   direita e a serifada sobe letra a letra, pouco. As fotos se abrem um
 *   pouco das bordas para dentro, com o zoom assentando. Botões principais
 *   acompanham levemente o cursor.
 * - CELULAR: mais curto e leve, porque a rolagem é rápida e o processador é
 *   menor. A cursiva também se escreve; a serifada entra inteira.
 * - Faixas que deslizam de lado (pratos, avaliações no celular) NÃO animam:
 *   mover os cards dentro de um scroll com encaixe (scroll-snap) faz o
 *   navegador recalcular o encaixe a cada quadro, e a faixa tremia.
 *
 * Regras que valem para os dois:
 * - Tudo roda uma vez só (`once`): voltar a rolagem não repete a entrada.
 * - O que já está à vista quando o script chega (rede lenta, página já
 *   rolada) fica como está: esconder algo que a pessoa está lendo para
 *   animar de novo é pior do que não animar.
 * - Ao terminar, os estilos inline saem (`clearProps`), devolvendo os
 *   efeitos de hover em CSS e evitando camadas presas na GPU.
 * - Movimento reduzido: nada anima, nada fica escondido.
 */
export default function CenasHome() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        celular: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
      },
      (contexto) => {
        const desktop = Boolean(contexto.conditions?.desktop);
        const splits: SplitText[] = [];

        /** Já visível no momento da montagem: não esconde. */
        const jaVisto = (el: Element) => window.scrollY > 0 && el.getBoundingClientRect().top < window.innerHeight * 0.92;
        const valeAqui = (el: Element) => {
          const so = el.getAttribute("data-anima-so");
          return !so || (so === "mobile" ? !desktop : desktop);
        };
        const alvos = (tipo: string) =>
          // `getClientRects`: fora o que está oculto neste layout (as fotos do
          // rodízio que só existem no celular, por exemplo).
          gsap.utils
            .toArray<HTMLElement>(`[data-anima="${tipo}"]`)
            .filter((el) => valeAqui(el) && el.getClientRects().length > 0 && !jaVisto(el));

        // ---------------------------------------------------------------- letreiros
        for (const h of alvos("letreiro")) {
          const [cursiva, titulo, linha] = Array.from(h.children).filter(
            (c): c is HTMLElement => c instanceof HTMLElement && !c.classList.contains("sr-only"),
          );
          if (!cursiva || !titulo) continue;

          const tl = gsap.timeline({
            paused: true,
            defaults: { ease: "power3.out" },
            onComplete: () => {
              gsap.set([cursiva, titulo, linha].filter(Boolean), { clearProps: "all" });
            },
          });

          // Cursiva: se escreve da esquerda para a direita. As folgas negativas
          // do recorte final guardam os floreios da Pinyon, que saem da caixa.
          tl.fromTo(
            cursiva,
            { clipPath: "inset(-30% 100% -40% -12%)" },
            { clipPath: "inset(-30% -12% -40% -12%)", duration: desktop ? 0.95 : 0.75, ease: "power2.inOut" },
            0,
          );

          // Com número que conta, o título não é dividido em letras.
          const contar = h.hasAttribute("data-anima-contar");
          if (desktop && !contar) {
            // Letra a letra, sem máscara (a máscara cortaria acentos e o "Ç").
            const split = SplitText.create(titulo, { type: "chars", charsClass: "letra-split" });
            splits.push(split);
            tl.fromTo(
              split.chars,
              { yPercent: 28, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 0.6, stagger: 0.022 },
              0.3,
            ).add(() => split.revert());
          } else {
            tl.fromTo(
              titulo,
              { opacity: 0, y: 14 },
              { opacity: 1, y: 0, duration: 0.6 },
              0.25,
            );
          }

          if (linha) tl.fromTo(linha, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6 }, desktop ? 0.6 : 0.5);

          // Número que conta (nota das avaliações): o valor final já está no HTML.
          if (contar) {
            const final = Number((titulo.textContent ?? "").replace(",", "."));
            if (Number.isFinite(final)) {
              const casas = (titulo.textContent ?? "").split(",")[1]?.length ?? 0;
              const original = titulo.textContent;
              const n = { v: 0 };
              tl.to(
                n,
                {
                  v: final,
                  duration: 1.4,
                  ease: "power2.out",
                  onUpdate: () => {
                    titulo.textContent = n.v.toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
                  },
                  onComplete: () => {
                    titulo.textContent = original;
                  },
                },
                0.2,
              );
            }
          }

          // Estado inicial já aplicado (sem piscar), toca ao entrar.
          tl.progress(0);
          ScrollTrigger.create({ trigger: h, start: "top 86%", once: true, onEnter: () => tl.play() });
        }

        // ---------------------------------------------------------------- mídias
        const midias = alvos("midia");
        const recorte = desktop ? "inset(5% 4% 5% 4%)" : "inset(4% 3% 4% 3%)";
        const abrir = (lote: HTMLElement[]) => {
          lote.forEach((el, i) => {
            const dentro = el.querySelector<HTMLElement>("img:not([aria-hidden]), video");
            const atraso = i * (desktop ? 0.08 : 0.06);
            gsap.fromTo(
              el,
              { clipPath: recorte, opacity: 0 },
              {
                clipPath: "inset(0% 0% 0% 0%)",
                opacity: 1,
                duration: desktop ? 0.95 : 0.75,
                delay: atraso,
                ease: "power2.out",
                clearProps: "clipPath,opacity",
              },
            );
            if (dentro) {
              gsap.fromTo(
                dentro,
                { scale: desktop ? 1.08 : 1.05 },
                { scale: 1, duration: desktop ? 1.2 : 0.9, delay: atraso, ease: "power2.out", clearProps: "transform" },
              );
            }
          });
        };
        gsap.set(midias, { clipPath: recorte, opacity: 0 });
        // Em lote: fotos que entram juntas (mural, colunas) abrem em sequência.
        ScrollTrigger.batch(midias, { start: "top 90%", once: true, onEnter: (lote) => abrir(lote as HTMLElement[]) });

        // ---------------------------------------------------------------- cascatas
        for (const lista of alvos("cascata")) {
          const filhos = Array.from(lista.children) as HTMLElement[];
          if (!filhos.length) continue;
          // Faixa com rolagem lateral: não anima (ver o cabeçalho).
          if (getComputedStyle(lista).overflowX !== "visible") continue;
          gsap.fromTo(
            filhos,
            { opacity: 0, y: desktop ? 18 : 12 },
            {
              opacity: 1,
              y: 0,
              duration: desktop ? 0.7 : 0.6,
              ease: "power2.out",
              stagger: desktop ? 0.07 : 0.05,
              clearProps: "opacity,transform",
              scrollTrigger: { trigger: lista, start: "top 88%", once: true },
            },
          );
        }

        // ---------------------------------------------------------------- magnéticos
        const limpezas: (() => void)[] = [];
        if (desktop && window.matchMedia("(pointer: fine)").matches) {
          for (const el of gsap.utils.toArray<HTMLElement>("[data-anima-magnetico]")) {
            const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
            const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
            const mover = (e: PointerEvent) => {
              const r = el.getBoundingClientRect();
              x((e.clientX - (r.left + r.width / 2)) * 0.18);
              y((e.clientY - (r.top + r.height / 2)) * 0.22);
            };
            const soltar = () => {
              x(0);
              y(0);
            };
            el.addEventListener("pointermove", mover);
            el.addEventListener("pointerleave", soltar);
            limpezas.push(() => {
              el.removeEventListener("pointermove", mover);
              el.removeEventListener("pointerleave", soltar);
            });
          }
        }

        return () => {
          limpezas.forEach((f) => f());
          splits.forEach((s) => s.revert());
        };
      },
    );

    return () => mm.revert();
  });

  return null;
}
