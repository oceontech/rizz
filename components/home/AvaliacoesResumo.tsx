import Counter from "@/components/motion/Counter";
import Filete from "@/components/motion/Filete";
import Reveal from "@/components/motion/Reveal";
import RevealScrub from "@/components/motion/RevealScrub";
import { BotaoLink } from "@/components/ui/Botao";
import { resumoAvaliacoes } from "@/data/reviews";
import { buscarAvaliacoesGoogle } from "@/lib/google-reviews";
import { site } from "@/lib/site";

export function Estrelas({
  nota,
  className = "",
}: {
  nota: number;
  className?: string;
}) {
  return (
    <span className={`inline-flex gap-1 ${className}`} aria-hidden>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          className={`size-3.5 ${i <= Math.round(nota) ? "text-ouro" : "text-creme/15"}`}
          fill="currentColor"
        >
          <path d="m12 3.5 2.6 5.5 5.9.8-4.3 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6L3.5 9.8l5.9-.8z" />
        </svg>
      ))}
    </span>
  );
}

/**
 * Resumo das avaliações na home.
 *
 * A nota e o total vêm do Google quando a chave está configurada; caso
 * contrário usa o retrato real conferido no perfil. Os depoimentos só
 * aparecem se forem reais — sem chave, o bloco convida a ler no Google em
 * vez de encher a tela com texto inventado.
 */
export default async function AvaliacoesResumo() {
  const google = await buscarAvaliacoesGoogle();

  const media = google.media ?? resumoAvaliacoes.media;
  const total = google.total ?? resumoAvaliacoes.total;
  const destaques = google.avaliacoes.slice(0, 3);

  return (
    <section className="bg-noite py-24 md:py-32">
      <div className="wrap">
        <div className="flex flex-wrap items-end justify-between gap-10">
          <div>
            <p className="eyebrow text-ambar">Quem já veio</p>
            <RevealScrub className="mt-5 text-titulo text-creme">
              O que dizem por aí
            </RevealScrub>
          </div>

          <Reveal delay={0.08}>
            <div className="flex items-center gap-6">
              <p className="font-display text-[5rem] leading-[0.9] text-ambar md:text-[6.5rem]">
                <Counter para={media} decimais={1} />
              </p>
              <div>
                <Estrelas nota={media} />
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-creme/50">
                  <Counter para={total} /> avaliações no Google
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        <Filete className="mt-10" />

        {destaques.length > 0 ? (
          <Reveal stagger className="mt-12 grid gap-5 md:grid-cols-3 md:gap-8">
            {destaques.map((r) => (
              <figure key={r.id} className="flex h-full flex-col">
                <Estrelas nota={r.nota} />
                <blockquote className="mt-5 grow font-display text-lg italic leading-relaxed text-creme/80">
                  “{r.texto}”
                </blockquote>
                <figcaption className="mt-6 text-[0.6875rem] uppercase tracking-[0.16em] text-creme/40">
                  {r.autor}
                  {r.quando && <span className="ml-2 opacity-70">{r.quando}</span>}
                </figcaption>
              </figure>
            ))}
          </Reveal>
        ) : (
          <Reveal>
            <p className="mt-12 max-w-prose font-display text-xl italic leading-relaxed text-creme/70">
              São {total} avaliações no Google, com média {media.toFixed(1).replace(".", ",")}.
              Vale ler o que escreveram por lá.
            </p>
          </Reveal>
        )}

        <Reveal delay={0.1}>
          <div className="mt-12 flex flex-wrap gap-3">
            <BotaoLink href="/avaliacoes" variante="contorno">
              Ver todas as avaliações
            </BotaoLink>
            <BotaoLink href={site.googleReviewsUrl} variante="contorno">
              Ler no Google
            </BotaoLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
