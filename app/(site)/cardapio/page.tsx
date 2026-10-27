import type { Metadata } from "next";
import Link from "next/link";

import MenuClient from "@/components/menu/MenuClient";
import VideoB from "@/components/home-b/VideoB";
import { CartaoRodizio } from "@/components/rodizio/AvisoRodizio";
import Reveal from "@/components/motion/Reveal";
import BadgeExecutivo from "@/components/ui/BadgeExecutivo";
import { BotaoLink } from "@/components/ui/Botao";
import { EtiquetaSelo, Legenda } from "@/components/ui/Selos";
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

        <h2 className="mt-5 flex flex-col items-start text-vinho not-italic">
          <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[clamp(2.4rem,6vw,4rem)] leading-none">Menu</span>
          <span className="font-[family-name:var(--font-instrument)] tracking-[0.01em] uppercase text-[clamp(3.75rem,11vw,7rem)] leading-[0.9]">executivo</span>
        </h2>

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
        {!executivo.condicoesConfirmadas && (
          <div className="mt-7">
            <BotaoLink href={whatsappLink("Olá! Gostaria de consultar os dias, as opções e os valores do almoço executivo do Rizz.")} variante="vinho">
              Consultar executivo pelo WhatsApp
            </BotaoLink>
          </div>
        )}

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
                      {item.selo && <EtiquetaSelo id={item.selo} />}
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

        <h1 className="mt-4 flex flex-col items-start text-vinho not-italic">
          <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[clamp(2.75rem,7vw,4.5rem)] leading-none">Nosso</span>
          <span className="font-[family-name:var(--font-instrument)] tracking-[0.01em] uppercase text-[clamp(4.5rem,15vw,9rem)] leading-[0.88]">Cardápio</span>
        </h1>

        <p className="mt-6 max-w-prose text-lg leading-relaxed text-tinta/80">
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

        {/* Rodízio de risotos: muda sozinho para "hoje", "amanhã" ou o próximo dia. */}
        <Reveal delay={0.14}>
          <CartaoRodizio className="mt-10 md:mt-12" />
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

      {/* Fecho com o salão em vídeo, escurecido, e o letreiro por cima. */}
      <section className="relative isolate flex min-h-[80svh] items-center overflow-hidden bg-noite py-24 text-center text-creme md:py-32">
        <VideoB nome="salao-ambiente" rotulo="O salão do Rizz por dentro" className="absolute inset-0 -z-20 hidden size-full object-cover md:block" />
        <VideoB nome="salao-ambiente-v" rotulo="O salão do Rizz por dentro" className="absolute inset-0 -z-20 size-full object-cover md:hidden" />
        <div className="absolute inset-0 -z-10 bg-noite/65" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-noite to-transparent" />

        <div className="wrap flex flex-col items-center">
          <Reveal>
            <h2 className="flex flex-col items-center not-italic">
              <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[clamp(2.75rem,8vw,5.5rem)] leading-none">Gostou de algum prato?</span>
              <span className="font-[family-name:var(--font-instrument)] tracking-[0.01em] uppercase text-[clamp(4rem,14vw,10rem)] leading-[0.9] text-ouro-claro">Venha provar</span>
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mx-auto mt-6 max-w-md text-lg leading-relaxed text-creme/80">
              Almoço e jantar em {site.endereco.cidade}. Reserve sua mesa pelo site.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <BotaoLink href="/reservas" tamanho="lg">
                Reservar mesa
              </BotaoLink>
              <BotaoLink href="/#visite" variante="contorno" tamanho="lg">
                Horários e endereço
              </BotaoLink>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
