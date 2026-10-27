import type { Metadata } from "next";
import Image from "next/image";

import Reveal from "@/components/motion/Reveal";
import { BotaoLink } from "@/components/ui/Botao";
import Textura from "@/components/home-b/Textura";
import CartaVinhos from "@/components/vinhos/CartaVinhos";
import garrafa from "@/assets/img/vinho-rizz-syrah.webp";
import { cartaDeVinhos } from "@/data/vinhos";
import { site, whatsappLink } from "@/lib/site";

const total = cartaDeVinhos.reduce((n, s) => n + s.itens.length, 0);

export const metadata: Metadata = {
  title: "Carta de vinhos",
  description: `A carta de vinhos do ${site.nome}: vinhos em taça, tintos, brancos, rosés, espumantes e de sobremesa.`,
  alternates: { canonical: "/carta-de-vinhos" },
};

export default function CartaDeVinhosPage() {
  return (
    <div className="pb-24 md:pb-32">
      <header className="wrap pt-28 md:pt-40">
        <div className="grid items-end gap-10 md:grid-cols-12">
          <div className="md:col-span-7">
            <p className="eyebrow text-ambar">Para acompanhar</p>
            <h1 className="mt-4 flex flex-col items-start text-creme not-italic">
              <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[clamp(2.75rem,8vw,5rem)] leading-none text-ambar">
                Carta de
              </span>
              <span className="font-[family-name:var(--font-instrument)] text-[clamp(5rem,20vw,10.5rem)] leading-[0.86] tracking-[0.01em] uppercase">
                vinhos
              </span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-creme/80">
              {total} rótulos, de vinhos em taça aos de sobremesa. Toque em um vinho para ler as notas do rótulo.
            </p>
          </div>

          {/* O vinho com o nome da casa: cartaz amarelo com textura de papel,
              a garrafa saindo pelo topo do cartão e a sombra dela (a mesma
              imagem, preta e desfocada) projetada no papel. */}
          <Reveal className="mt-10 md:col-span-5 md:mt-0">
            <div className="relative isolate grid grid-cols-[7.5rem_1fr] items-end gap-5 rounded-[2rem] bg-ouro-claro px-5 pt-6 pb-6 text-vinho shadow-[0_30px_60px_rgb(0_0_0/0.45)] md:grid-cols-[9rem_1fr] md:px-7 md:pb-7">
              <Textura />
              <div className="relative -mt-20 h-60 md:-mt-24 md:h-72">
                <Image
                  src={garrafa}
                  alt=""
                  aria-hidden
                  sizes="120px"
                  className="absolute inset-y-0 left-1/2 h-full w-auto translate-x-[-20%] translate-y-[3%] rotate-[6deg] opacity-45 blur-[6px] brightness-0"
                />
                <Image
                  src={garrafa}
                  alt="Garrafa do vinho Rizz Syrah"
                  sizes="120px"
                  className="absolute inset-y-0 left-1/2 h-full w-auto -translate-x-1/2"
                />
              </div>
              <div className="min-w-0 pb-1">
                <p className="eyebrow text-vinho/75">O vinho da casa</p>
                <p className="mt-2 flex flex-col items-start leading-none">
                  <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[2.6rem] md:text-5xl">Rizz</span>
                  <span className="font-[family-name:var(--font-instrument)] text-[3.4rem] leading-[0.88] tracking-[0.01em] uppercase md:text-[4.25rem]">Syrah</span>
                </p>
                <p className="mt-3 text-[0.6875rem] font-medium tracking-[0.28em] text-vinho/80 uppercase">
                  Colheita de inverno · 2023
                </p>
                <div className="mt-5">
                  <BotaoLink href={whatsappLink("Olá! Gostaria de saber sobre o vinho Rizz Syrah.")} variante="vinho">
                    Perguntar<span className="hidden sm:inline">&nbsp;pelo WhatsApp</span>
                  </BotaoLink>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </header>

      <div className="wrap mt-12 md:mt-16">
        <CartaVinhos secoes={cartaDeVinhos} />

        <div className="mt-20 flex flex-col items-start gap-5 border-t border-creme/10 pt-10 md:flex-row md:items-center md:justify-between">
          <p className="max-w-md text-creme/75">
            A disponibilidade dos rótulos pode variar. Na dúvida, pergunte à equipe.
          </p>
          <div className="flex flex-wrap gap-3">
            <BotaoLink href={whatsappLink("Olá! Gostaria de consultar a disponibilidade de um vinho no Rizz.")} tamanho="lg">
              Consultar pelo WhatsApp
            </BotaoLink>
            <BotaoLink href="/cardapio" variante="contorno" tamanho="lg">
              Ver cardápio
            </BotaoLink>
          </div>
        </div>
      </div>
    </div>
  );
}
