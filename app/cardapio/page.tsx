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
import { executivo } from "@/data/executivo";
import { preco } from "@/lib/format";

export const metadata: Metadata = {
  title: "Cardápio",
  description:
    "Risotos, massas, Red Angus, cordeiro, peixes e sobremesas. Cardápio completo com preços do Rizz Cucina & Vino.",
  alternates: { canonical: "/cardapio" },
};

function BlocoExecutivo() {
  const colunas = [
    { titulo: "Entradas", itens: executivo.entradas },
    { titulo: "Pratos", itens: executivo.pratos },
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
          <BadgeExecutivo claro />
        </div>

        <RevealScrub className="mt-5 text-display text-vinho">
          Menu executivo
        </RevealScrub>

        <div className="mt-7 flex flex-wrap items-end gap-x-12 gap-y-4">
          <p className="font-display text-[3rem] leading-none text-vinho md:text-[4rem]">
            <span className="align-super text-base text-tinta/45">R$</span>{" "}
            {preco(executivo.precoCompleto)}
          </p>

          <p className="max-w-sm text-sm italic text-tinta/70">
            {executivo.chamada}. Avulsos a partir de{" "}
            <strong className="font-medium not-italic text-vinho">
              R$ {preco(executivo.precoAvulsoMin)}
            </strong>
            . {executivo.dias}, {executivo.horario}.
          </p>
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
                    <Preco
                      valor={item.preco}
                      className="shrink-0 text-base text-vinho md:text-[1.0625rem]"
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 text-xs italic text-tinta/50">
          Valores sujeitos a alteração. Consulte a equipe sobre as opções do dia.
        </p>
      </div>
    </section>
  );
}

export default function CardapioPage() {
  return (
    <div className="on-creme">
      <header className="wrap pt-28 md:pt-44">
        <p className="eyebrow text-vinho">O cardápio</p>

        <RevealScrub as="h1" className="mt-5 text-display text-vinho">
          Tudo o que sai da cozinha
        </RevealScrub>

        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <IndicadorAbertura claro />
            <Link
              href="/carta-de-vinhos"
              className="text-[0.6875rem] uppercase tracking-[0.14em] text-vinho underline-offset-4 transition-colors hover:text-ambar hover:underline"
            >
              Carta de vinhos →
            </Link>
          </div>
        </Reveal>
      </header>

      <div className="wrap mt-12 md:mt-16">
        <MenuClient />

        <div className="mt-20 border-t border-tinta/12 pt-10">
          <h2 className="eyebrow mb-6 text-vinho">Legenda</h2>
          <Legenda className="text-tinta/70" />
        </div>
      </div>

      <div className="mt-24 md:mt-32">
        <BlocoExecutivo />
      </div>

      <section className="border-t border-tinta/12 py-20 text-center md:py-28">
        <div className="wrap">
          <RevealScrub className="mx-auto max-w-3xl text-titulo text-vinho">
            Reserve sua mesa e deixe o resto com a gente
          </RevealScrub>

          <Reveal delay={0.1}>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <BotaoLink href="/reservas" variante="vinho" tamanho="lg">
                Fazer uma reserva
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
