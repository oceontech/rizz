import type { Metadata } from "next";
import Image from "next/image";

import Reveal from "@/components/motion/Reveal";
import { BotaoLink } from "@/components/ui/Botao";
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

          {/* O vinho com o nome da casa, em destaque. */}
          <Reveal className="md:col-span-5">
            <div className="relative flex items-center gap-5 overflow-hidden rounded-3xl bg-ouro-claro p-5 text-vinho md:p-7">
              <Image src={garrafa} alt="Garrafa do vinho Rizz Syrah" sizes="96px" className="h-40 w-auto shrink-0 drop-shadow-[0_12px_20px_rgb(0_0_0/0.35)] md:h-48" />
              <div>
                <p className="eyebrow text-vinho/80">O vinho da casa</p>
                <p className="mt-1 font-[family-name:var(--font-instrument)] text-4xl leading-none uppercase">Rizz Syrah</p>
                <p className="mt-1 text-sm">Colheita de inverno · safra 2023</p>
                <div className="mt-4">
                  <BotaoLink href={whatsappLink("Olá! Gostaria de saber sobre o vinho Rizz Syrah.")} variante="vinho">
                    Perguntar
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
