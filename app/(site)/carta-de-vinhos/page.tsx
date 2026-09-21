import type { Metadata } from "next";

import Filete from "@/components/motion/Filete";
import Reveal from "@/components/motion/Reveal";
import RevealScrub from "@/components/motion/RevealScrub";
import { BotaoLink } from "@/components/ui/Botao";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: site.cartaVinhosUrl ? "Carta de vinhos" : "Vinhos",
  description: site.cartaVinhosUrl
    ? `Consulte a carta de vinhos do ${site.nome}.`
    : `Fale com a equipe do ${site.nome} para conhecer os vinhos e valores disponíveis.`,
  alternates: { canonical: "/carta-de-vinhos" },
};

export default function CartaDeVinhosPage() {
  const carta = site.cartaVinhosUrl;

  return (
    <section className="wrap pb-24 pt-28 md:pb-32 md:pt-44">
      <p className="eyebrow text-ambar">Para acompanhar</p>
      <RevealScrub as="h1" className="mt-5 max-w-3xl text-display text-creme">
        {carta ? "Carta de vinhos" : "Vinhos"}
      </RevealScrub>
      <Filete className="mt-10 max-w-md" />
      <Reveal delay={0.1}>
        <p className="mt-9 max-w-prose leading-relaxed text-creme/70">
          {carta
            ? "Consulte os rótulos e valores na nossa carta de vinhos."
            : "Para conhecer os rótulos e valores disponíveis, fale com a equipe do Rizz."}
        </p>
      </Reveal>
      <Reveal delay={0.14}>
        <div className="mt-10 flex flex-wrap gap-3">
          <BotaoLink
            href={carta ?? whatsappLink("Olá! Gostaria de consultar os vinhos disponíveis no Rizz.")}
            tamanho="lg"
          >
            {carta ? "Abrir carta de vinhos" : "Consultar vinhos pelo WhatsApp"}
          </BotaoLink>
          <BotaoLink href="/cardapio" variante="contorno" tamanho="lg">
            Ver cardápio
          </BotaoLink>
        </div>
      </Reveal>
    </section>
  );
}
