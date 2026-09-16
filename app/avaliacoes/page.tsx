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
  description: `O que os clientes dizem sobre o ${site.nome}, direto do perfil do Google.`,
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
          O que dizem por aí
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
            Nota e total vêm do perfil do restaurante no Google — são o retrato
            de todas as avaliações, não de uma seleção.
          </p>
        </div>

        <Filete className="mt-14" />
      </section>

      {avaliacoes.length > 0 ? (
        <section className="wrap mt-16 md:mt-20">
          <h2 className="eyebrow text-ambar">Depoimentos recentes</h2>

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

          {google.aviso && (
            <p className="mt-12 max-w-prose text-xs leading-relaxed text-creme/40">
              {google.aviso}
            </p>
          )}
        </section>
      ) : (
        <section className="wrap mt-16 md:mt-20">
          <div className="max-w-prose border border-creme/10 p-7">
            <h2 className="font-display text-2xl text-creme">
              Os depoimentos ficam no Google
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-creme/65">
              Esta página mostra avaliações reais assim que a chave da API do
              Google for configurada. Enquanto isso, a nota acima é verdadeira e
              os textos podem ser lidos direto na listagem do restaurante — nada
              aqui é inventado.
            </p>
            <p className="mt-4 text-xs leading-relaxed text-creme/40">
              Para a equipe: defina <code className="text-ambar">GOOGLE_PLACES_API_KEY</code>{" "}
              e <code className="text-ambar">GOOGLE_PLACE_ID</code>. Ver{" "}
              <code className="text-ambar">.env.example</code>.
            </p>
          </div>
        </section>
      )}

      <section className="wrap py-20 text-center md:py-28">
        <RevealScrub className="mx-auto max-w-2xl text-titulo text-creme">
          Já veio ao Rizz? Conte como foi
        </RevealScrub>

        <Reveal delay={0.1}>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <BotaoLink href={site.googleReviewsUrl} tamanho="lg">
              Avaliar no Google
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
