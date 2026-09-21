import type { Metadata } from "next";
import Link from "next/link";

import MenuClient from "@/components/menu/MenuClient";
import Reveal from "@/components/motion/Reveal";
import RevealScrub from "@/components/motion/RevealScrub";
import BadgeExecutivo from "@/components/ui/BadgeExecutivo";
import { BotaoLink } from "@/components/ui/Botao";
import { Legenda, SeloOrigem } from "@/components/ui/Selos";
import IndicadorAbertura from "@/components/ui/StatusAbertura";
import Preco from "@/components/ui/Preco";
import { cardapioDoSite, executivoDoSite, type ExecutivoDados } from "@/lib/dados";
import { preco } from "@/lib/format";
import { site, whatsappLink } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cardápio",
  description:
    "Conheça os pratos e bebidas do Rizz Cucina & Vino em Espírito Santo do Pinhal e consulte as opções do almoço executivo.",
  alternates: { canonical: "/cardapio" },
};

function BlocoExecutivo({ executivo }: { executivo: ExecutivoDados }) {
  const colunas = [
    { titulo: "Entradas", itens: executivo.entradas },
    { titulo: "Pratos principais", itens: executivo.pratos },
    { titulo: "Sobremesas", itens: executivo.sobremesas },
  ];

  return (
    <section
      id="executivo"
      className="scroll-mt-36 border-t border-tinta/12 bg-creme-2 py-20 md:py-28"
    >
      <div className="wrap">
        <div className="flex flex-wrap items-center gap-4">
          <p className="eyebrow text-vinho">Almoço executivo</p>
          <BadgeExecutivo claro executivo={executivo} />
        </div>

        <RevealScrub className="mt-5 text-display text-vinho">
          Menu executivo
        </RevealScrub>

        {executivo.condicoesConfirmadas ? (
          <div className="mt-7 flex flex-wrap items-end gap-x-12 gap-y-4">
            <Preco
              valor={executivo.precoCompleto}
              className="text-[3rem] leading-none text-vinho md:text-[4rem]"
            />
            <p className="max-w-sm text-sm italic text-tinta/70">
              {executivo.chamada}. Valor do menu completo por pessoa.
              Pratos principais a partir de{" "}
              <strong className="font-medium not-italic text-vinho">
                R$ {preco(executivo.precoAvulsoMin)}
              </strong>
              . {executivo.dias}, {executivo.horario}.
            </p>
          </div>
        ) : (
          <p className="mt-7 max-w-prose leading-relaxed text-tinta/70">
            {executivo.chamada}. Consulte os dias e os valores com a equipe.
          </p>
        )}
        <div className="mt-7">
          <BotaoLink href={whatsappLink("Olá! Gostaria de consultar os dias, as opções e os valores do almoço executivo do Rizz.")} variante="vinho">
            Consultar executivo pelo WhatsApp
          </BotaoLink>
        </div>

        <div className="mt-8 h-px bg-ouro/60" />

        <div className="mt-12 grid gap-12 md:grid-cols-3">
          {colunas.map((coluna) => (
            <div key={coluna.titulo}>
              <h3 className="text-center text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-vinho/70">
                {coluna.titulo}
              </h3>
              <ul className="mt-5">
                {coluna.itens.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-baseline gap-3 border-b border-tinta/10 py-3 last:border-0"
                  >
                    <span className="flex min-w-0 grow flex-wrap items-center gap-x-2 text-[0.9375rem] leading-snug text-vinho md:text-base">
                      {item.nome}
                      {item.selo && <SeloOrigem tipo={item.selo} />}
                    </span>
                    {executivo.condicoesConfirmadas && (
                      <Preco
                        valor={item.preco}
                        className="shrink-0 text-base text-vinho md:text-[1.0625rem]"
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 text-xs italic text-tinta/50">
          Consulte a equipe sobre as opções disponíveis no dia.
        </p>
      </div>
    </section>
  );
}

export default async function CardapioPage() {
  // Publicado pelo painel; cai nos dados de `data/` se o banco falhar.
  const [cardapio, executivo] = await Promise.all([cardapioDoSite(), executivoDoSite()]);

  return (
    <div className="on-creme">
      <header className="wrap pt-28 md:pt-44">
        <p className="eyebrow text-vinho">À mesa</p>

        <RevealScrub as="h1" className="mt-5 text-display text-vinho">
          Cardápio
        </RevealScrub>

        <p className="mt-6 max-w-prose leading-relaxed text-tinta/70">
          Conheça os pratos, acompanhamentos e bebidas do Rizz.
        </p>

        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <IndicadorAbertura claro />
            <Link
              href="/carta-de-vinhos"
              className="text-[0.6875rem] uppercase tracking-[0.14em] text-vinho underline-offset-4 transition-colors hover:text-ambar hover:underline"
            >
              {site.cartaVinhosUrl ? "Carta de vinhos" : "Consultar vinhos"} →
            </Link>
          </div>
        </Reveal>
      </header>

      <div className="wrap mt-12 md:mt-16">
        <MenuClient cardapio={cardapio} />

        <div className="mt-20 border-t border-tinta/12 pt-10">
          <h2 className="eyebrow mb-6 text-vinho">Legenda</h2>
          <Legenda className="text-tinta/70" />
        </div>
      </div>

      <div className="mt-24 md:mt-32">
        {executivo.ativo && <BlocoExecutivo executivo={executivo} />}
      </div>

      <section className="border-t border-tinta/12 py-20 text-center md:py-28">
        <div className="wrap">
          <RevealScrub className="mx-auto max-w-3xl text-titulo text-vinho">
            Gostou de algum prato? Planeje sua visita.
          </RevealScrub>

          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <BotaoLink href="/reservas" variante="vinho" tamanho="lg">
                Reservar mesa
              </BotaoLink>
              <BotaoLink href="/#visite" variante="contorno-tinta" tamanho="lg">
                Horários e endereço
              </BotaoLink>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
