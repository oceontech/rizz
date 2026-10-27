"use client";

import Image from "next/image";
import { useRef } from "react";

import SeloRotativo from "@/components/brand/SeloRotativo";
import { BotaoLink } from "@/components/ui/Botao";
import Preco from "@/components/ui/Preco";
import { ListaSelos } from "@/components/ui/Selos";
import camaraoMesa from "@/assets/img/camarao-empanado-mesa.webp";
import camaraoRisoto from "@/assets/img/camarao-empanado-risoto.webp";
import type { HomeDoSite } from "@/lib/dados";
import { CONDICOES, gsap, useGSAP } from "@/lib/gsap";
import { fotoDoPrato } from "@/lib/images";

/**
 * Prato mais pedido da versão B.
 *
 * Sem o algarismo gigante de fundo da A. Com o camarão (o prato que o
 * restaurante destaca hoje), entram mais duas fotos dele, do álbum, num
 * conjunto: a principal grande, uma alta deslocada para cima e uma menor
 * para baixo. Com outro prato no painel, fica só a foto dele.
 *
 * `[data-entrada-prato]` é o gancho da entrada pelo vídeo (IntroCamarao).
 */
export default function PratoAssinaturaB({
  prato,
  entradaPeloVideo = false,
}: {
  prato: NonNullable<HomeDoSite["maisPedido"]>;
  entradaPeloVideo?: boolean;
}) {
  const raiz = useRef<HTMLElement>(null);
  const foto = fotoDoPrato(prato);
  const camarao = prato.id === "camarao-empanado";

  useGSAP(
    () => {
      const no = raiz.current;
      if (!no) return;
      const mm = gsap.matchMedia();

      mm.add(CONDICOES, (contexto) => {
        if (contexto.conditions?.parado) return;

        // As fotos de apoio andam em ritmos diferentes da principal.
        no.querySelectorAll<HTMLElement>("[data-apoio]").forEach((el, i) => {
          gsap.fromTo(
            el,
            { yPercent: i ? 14 : 8 },
            {
              yPercent: i ? -10 : -6,
              ease: "none",
              scrollTrigger: { trigger: no, start: "top bottom", end: "bottom top", scrub: true },
            },
          );
        });

        if (entradaPeloVideo) return;
        const janela = no.querySelector("[data-janela]");
        if (janela) {
          gsap.fromTo(
            janela,
            { clipPath: "inset(30% 0% 30% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              ease: "none",
              scrollTrigger: { trigger: no, start: "top 80%", end: "top 15%", scrub: 0.7 },
            },
          );
        }
      });

      return () => mm.revert();
    },
    { scope: raiz, dependencies: [entradaPeloVideo], revertOnUpdate: true },
  );

  return (
    <section ref={raiz} aria-labelledby="prato-b" className="relative overflow-hidden bg-white py-24 text-tinta md:py-32">
      <div className="wrap grid items-center gap-14 md:grid-cols-12 md:gap-8">
        {/* Fotos */}
        <div data-entrada-prato className={`relative ${camarao ? "md:col-span-7" : "md:col-span-6"}`}>
          <div className={camarao ? "grid grid-cols-[1.45fr_1fr] items-start gap-3 md:gap-4" : ""}>
            <div data-janela className="relative aspect-[4/5] overflow-hidden">
              {foto ? (
                <Image
                  src={foto}
                  alt={`${prato.titulo}. ${prato.texto}`}
                  placeholder={typeof foto === "string" ? "empty" : "blur"}
                  fill
                  sizes="(min-width: 860px) 34vw, 60vw"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="size-full bg-creme" />
              )}
            </div>

            {camarao && (
              <div className="flex flex-col gap-3 md:gap-4">
                <div data-apoio className="relative -mt-6 aspect-[3/5] overflow-hidden md:-mt-12">
                  <Image src={camaraoMesa} alt="Camarão rosa empanado com risoto e creme, servido à mesa" fill placeholder="blur" sizes="(min-width: 860px) 22vw, 38vw" className="object-cover" />
                </div>
                <div data-apoio className="relative aspect-square overflow-hidden">
                  <Image src={camaraoRisoto} alt="Camarões empanados sobre o risoto, com creme ao lado" fill placeholder="blur" sizes="(min-width: 860px) 22vw, 38vw" className="object-cover" />
                </div>
              </div>
            )}
          </div>

          <SeloRotativo
            texto="O MAIS PEDIDO · RIZZ CUCINA & VINO ·"
            className="absolute -top-8 -left-4 size-28 md:-top-12 md:-left-10 md:size-36"
          />
        </div>

        {/* Texto */}
        <div data-entrada-prato className={camarao ? "md:col-span-5 md:pl-6" : "md:col-span-5 md:col-start-8"}>
          <h2 id="prato-b" className="flex flex-col items-start not-italic">
            <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[clamp(2.4rem,5vw,3.75rem)] leading-none text-ambar">
              {prato.chamada}
            </span>
            <span className="font-[family-name:var(--font-instrument)] text-[clamp(3.5rem,6.4vw,6rem)] leading-[0.92] tracking-[0.01em] text-vinho uppercase">
              {prato.titulo}
            </span>
          </h2>

          <p className="mt-7 max-w-md text-lg leading-relaxed text-tinta/75">{prato.texto}</p>

          <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-4 border-t border-tinta/10 pt-8">
            <div>
              <p className="eyebrow text-tinta/50">Preço</p>
              <Preco valor={prato.preco} className="mt-2 text-5xl leading-none text-vinho md:text-6xl [&>span]:opacity-100" />
            </div>
            <ListaSelos badges={prato.badges} />
          </div>

          <div className="mt-9">
            <BotaoLink href={`/cardapio#${prato.categoriaSlug}`} variante="vinho" tamanho="lg">
              Ver no cardápio
            </BotaoLink>
          </div>
        </div>
      </div>
    </section>
  );
}
