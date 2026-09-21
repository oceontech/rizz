import type { Metadata } from "next";

import { Estrelas } from "@/components/home/AvaliacoesResumo";
import Counter from "@/components/motion/Counter";
import Filete from "@/components/motion/Filete";
import Reveal from "@/components/motion/Reveal";
import RevealScrub from "@/components/motion/RevealScrub";
import { BotaoLink } from "@/components/ui/Botao";
import { resumoAvaliacoes } from "@/data/reviews";
import { buscarAvaliacoesGoogle } from "@/lib/google-reviews";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Avaliações",
  description: `Acesse as avaliações de clientes do ${site.nome} no Google.`,
  alternates: { canonical: "/avaliacoes" },
};

const formatador = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
});

export default async function AvaliacoesPage() {
  const google = await buscarAvaliacoesGoogle();

  const media = google.media ?? resumoAvaliacoes.media;
  const total = google.total ?? resumoAvaliacoes.total;
  const avaliacoes = google.avaliacoes;

  return (
    <>
      <header className="wrap pt-28 md:pt-44">
        <p className="eyebrow text-ambar">Avaliações</p>

        <RevealScrub as="h1" className="mt-5 text-display text-creme">
          Avaliações de clientes
        </RevealScrub>
      </header>

      <section className="wrap mt-16">
        <div className="flex flex-wrap items-center gap-x-16 gap-y-8">
          <div>
            <p className="font-display text-[6rem] leading-[0.9] text-ambar md:text-[8rem]">
              <Counter para={media} decimais={1} />
            </p>
            <div className="mt-4">
              <Estrelas nota={media} />
            </div>
            <p className="mt-3 text-[0.6875rem] uppercase tracking-[0.16em] text-creme/50">
              <Counter para={total} /> avaliações no Google
            </p>
          </div>

          <p className="max-w-sm font-display text-xl italic leading-relaxed text-creme/70">
            Veja o que os clientes contam sobre a visita ao Rizz.
          </p>
        </div>

        <Filete className="mt-14" />
        <p className="mt-4 text-xs leading-relaxed text-creme/50">
          {google.media === null || google.total === null
            ? `Dados do Google consultados em ${resumoAvaliacoes.conferidoEm.split("-").reverse().join("/")}.`
            : "Nota geral do restaurante no Google."}
        </p>
        <div className="mt-8">
          <BotaoLink href={site.googleReviewsUrl} variante="contorno">
            Ver todas as avaliações no Google
          </BotaoLink>
        </div>
      </section>

      {avaliacoes.length > 0 ? (
        <section className="wrap mt-16 md:mt-20">
          <h2 className="eyebrow text-ambar">Seleção de avaliações do Google</h2>

          <Reveal stagger className="mt-10 grid gap-12 md:grid-cols-2 md:gap-x-16">
            {avaliacoes.map((r) => (
              <figure key={r.id} className="flex h-full flex-col">
                <Estrelas nota={r.nota} />
                <blockquote className="mt-5 grow font-display text-xl italic leading-relaxed text-creme/85">
                  “{r.texto}”
                </blockquote>
                <figcaption className="mt-6 flex items-center justify-between gap-4 border-t border-creme/10 pt-4 text-[0.6875rem] uppercase tracking-[0.16em] text-creme/40">
                  <span className="text-creme/65">{r.autor}</span>
                  <time dateTime={r.data}>
                    {r.quando ?? formatador.format(new Date(r.data))}
                  </time>
                </figcaption>
              </figure>
            ))}
          </Reveal>

        </section>
      ) : (
        <section className="wrap mt-16 md:mt-20">
          <div className="max-w-prose border border-creme/10 p-7">
            <h2 className="font-display text-2xl text-creme">
              Leia os comentários dos clientes
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-creme/65">
              Você pode ler as avaliações no perfil do restaurante no Google.
            </p>
          </div>
        </section>
      )}

      <section className="wrap py-20 text-center md:py-28">
        <RevealScrub className="mx-auto max-w-2xl text-titulo text-creme">
          Já visitou o Rizz? Conte como foi.
        </RevealScrub>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <BotaoLink href={site.googleReviewsUrl} tamanho="lg">
              Abrir perfil no Google
            </BotaoLink>
            <BotaoLink href="/cardapio" variante="contorno" tamanho="lg">
              Ver o cardápio
            </BotaoLink>
          </div>
        </Reveal>
      </section>
    </>
  );
}
