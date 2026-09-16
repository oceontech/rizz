"use client";

import Image from "next/image";
import { useRef } from "react";

import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import Filete from "@/components/motion/Filete";
import Parallax from "@/components/motion/Parallax";
import RevealScrub from "@/components/motion/RevealScrub";
import BadgeExecutivo from "@/components/ui/BadgeExecutivo";
import { BotaoLink } from "@/components/ui/Botao";
import Preco from "@/components/ui/Preco";
import { executivo } from "@/data/executivo";
import { img } from "@/lib/images";

/**
 * Bloco em papel — inverte o site para o creme das peças impressas.
 * A folha entra subindo por cima do escuro, como uma página virando.
 *
 * O atributo é `data-folha-creme`, e não `data-folha`: o preloader usa
 * `data-folha` nas próprias cortinas, e o nome repetido já fez uma busca
 * global casar as duas coisas.
 */
export default function Executivo() {
  const raiz = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const no = raiz.current;
      const folha = no?.querySelector("[data-folha-creme]");
      if (!no || !folha) return;

      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) {
          gsap.set(folha, { clipPath: "inset(0% 0% 0% 0%)" });
          return;
        }

        gsap.fromTo(
          folha,
          { clipPath: "inset(100% 0% 0% 0%)" },
          {
            clipPath: "inset(0% 0% 0% 0%)",
            ease: "none",
            scrollTrigger: {
              trigger: no,
              start: "top 92%",
              end: "top 38%",
              scrub: 0.6,
            },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: raiz },
  );

  return (
    <div ref={raiz} id="executivo" className="scroll-mt-24 bg-noite">
      <section
        data-folha-creme
        className="on-creme py-24 will-change-[clip-path] md:py-32"
      >
        <div className="wrap">
          <div className="grid gap-14 md:grid-cols-[1.05fr_1fr] md:gap-20">
            <div>
              <div className="flex flex-wrap items-center gap-4">
                <p className="eyebrow text-vinho">Almoço executivo</p>
                <BadgeExecutivo claro />
              </div>

              <RevealScrub className="mt-6 text-display text-vinho">
                Mais de {executivo.totalOpcoes} opções, todo dia útil
              </RevealScrub>

              <Filete className="mt-8 w-full max-w-md bg-ouro/70" />

              <p className="mt-8 max-w-prose leading-relaxed text-tinta/75">
                {executivo.chamada}, com pratos que não são versão reduzida de
                nada — o mesmo Red Angus, os mesmos risotos.
              </p>

              {/* Rótulos no topo, valores alinhados pela base: com `items-end`
                  no grupo, o rótulo do valor menor descia e os dois ficavam
                  desencontrados. */}
              <div className="mt-12 flex flex-wrap gap-x-14 gap-y-8">
                <div>
                  <p className="eyebrow text-tinta/50">Menu completo</p>
                  <div className="mt-3 flex h-14 items-end md:h-[4.25rem]">
                    <Preco
                      valor={executivo.precoCompleto}
                      className="text-[3.25rem] leading-none text-vinho md:text-[4.25rem]"
                    />
                  </div>
                </div>

                <div>
                  <p className="eyebrow text-tinta/50">Pratos avulsos</p>
                  <div className="mt-3 flex h-14 items-end gap-2.5 md:h-[4.25rem]">
                    <span className="pb-1 text-base text-tinta/70 md:pb-1.5">a partir de</span>
                    <Preco
                      valor={executivo.precoAvulsoMin}
                      className="text-[2rem] leading-none text-tinta md:text-[2.5rem]"
                    />
                  </div>
                </div>
              </div>

              <dl className="mt-10 flex flex-wrap gap-x-12 gap-y-3 text-sm text-tinta/70">
                <div className="flex gap-2.5">
                  <dt className="text-tinta/45">Dias</dt>
                  <dd className="font-medium">{executivo.dias}</dd>
                </div>
                <div className="flex gap-2.5">
                  <dt className="text-tinta/45">Horário</dt>
                  <dd className="font-medium">{executivo.horario}</dd>
                </div>
              </dl>

              <div className="mt-11">
                <BotaoLink href="/cardapio#executivo" variante="vinho" tamanho="lg">
                  Ver o menu executivo
                </BotaoLink>
              </div>
            </div>

            <div>
              <Parallax className="aspect-[4/5]" forca={9}>
                <Image
                  src={img("mesa-executivo")}
                  alt="Mesa vista de cima com os pratos do menu executivo: parmegiana com arroz e fritas, risoto de funghi, massa, salada, arancini e sobremesas"
                  placeholder="blur"
                  sizes="(min-width: 860px) 44vw, 92vw"
                  className="size-full object-cover"
                />
              </Parallax>

              <div className="mt-10 grid grid-cols-3 gap-4">
                {executivo.pratos
                  .filter((p) => p.img)
                  .slice(0, 3)
                  .map((prato) => (
                    <figure key={prato.id} className="flex min-w-0 flex-col">
                      <Parallax className="aspect-[3/4]" forca={6}>
                        <Image
                          src={img(prato.img!)}
                          alt={prato.nome}
                          placeholder="blur"
                          sizes="(min-width: 860px) 13vw, 29vw"
                          className="size-full object-cover"
                        />
                      </Parallax>
                      {/* Nome em cima, preço no pé: com nomes de 2 e 3 linhas,
                          os preços ficam na mesma altura nos três cards. */}
                      <figcaption className="mt-3 flex grow flex-col text-[0.8125rem] leading-snug text-tinta/80 md:text-sm">
                        <span>{prato.nome}</span>
                        <span className="mt-auto block pt-2">
                          <Preco valor={prato.preco} className="text-base text-vinho md:text-lg" />
                        </span>
                      </figcaption>
                    </figure>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
