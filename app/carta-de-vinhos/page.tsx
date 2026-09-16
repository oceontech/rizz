import type { Metadata } from "next";

import Filete from "@/components/motion/Filete";
import Reveal from "@/components/motion/Reveal";
import RevealScrub from "@/components/motion/RevealScrub";
import { BotaoLink } from "@/components/ui/Botao";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Carta de vinhos",
  description: `A carta de vinhos do ${site.nome}.`,
  alternates: { canonical: "/carta-de-vinhos" },
};

export default function CartaDeVinhosPage() {
  const carta = site.cartaVinhosUrl;

  return (
    <section className="wrap pb-24 pt-28 md:pb-32 md:pt-44">
      <p className="eyebrow text-ambar">Adega</p>

      <RevealScrub as="h1" className="mt-5 max-w-3xl text-display text-creme">
        Carta de vinhos
      </RevealScrub>

      <Filete className="mt-10 max-w-md" />

      {carta ? (
        <>
          <Reveal delay={0.1}>
            <p className="mt-9 max-w-prose leading-relaxed text-creme/70">
              Rótulos nacionais e importados selecionados para acompanhar os
              risotos e os cortes da casa.
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="mt-10">
              <BotaoLink href={carta} tamanho="lg">
                Abrir a carta completa
              </BotaoLink>
            </div>
          </Reveal>
        </>
      ) : (
        <>
          <Reveal delay={0.1}>
            <p className="mt-9 max-w-prose leading-relaxed text-creme/70">
              A carta completa está no QR Code das mesas e com a equipe do
              salão — ela muda com frequência, conforme a adega gira. Em breve
              publicamos a versão digital aqui.
            </p>
          </Reveal>

          <Reveal delay={0.14}>
            <div className="mt-10 flex flex-wrap gap-3">
              <BotaoLink href="/reservas" tamanho="lg">
                Reservar uma mesa
              </BotaoLink>
              <BotaoLink href="/cardapio" variante="contorno" tamanho="lg">
                Ver o cardápio
              </BotaoLink>
            </div>
          </Reveal>

          <Reveal delay={0.18}>
            <p className="mt-14 max-w-prose border border-creme/10 p-6 text-sm leading-relaxed text-creme/50">
              <strong className="font-medium text-creme/80">
                Para a equipe:
              </strong>{" "}
              basta preencher <code className="text-ambar">cartaVinhosUrl</code>{" "}
              em <code className="text-ambar">lib/site.ts</code> com o link ou o
              PDF da carta — esta página passa a exibir o botão de download
              automaticamente.
            </p>
          </Reveal>
        </>
      )}
    </section>
  );
}
