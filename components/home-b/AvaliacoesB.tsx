import { Estrelas } from "@/components/ui/Estrelas";
import Reveal from "@/components/motion/Reveal";
import { BotaoLink } from "@/components/ui/Botao";
import { resumoAvaliacoes, reviews } from "@/data/reviews";
import { buscarAvaliacoesGoogle } from "@/lib/google-reviews";
import { site } from "@/lib/site";

import Letreiro from "./Letreiro";

/**
 * Avaliações na home. Só entram cartões com texto REAL: os da API do Google
 * (quando `GOOGLE_PLACES_API_KEY` e `GOOGLE_PLACE_ID` estiverem configurados)
 * ou os de `data/reviews.ts` com `fonte: "manual"`. Os textos de exemplo que
 * montaram o layout na versão B saíram ao ela virar a home: avaliação
 * inventada de restaurante real é propaganda enganosa. Sem ao menos três
 * textos reais, a seção mostra só a nota (verdadeira) e o link do Google.
 */

export default async function AvaliacoesB() {
  const google = await buscarAvaliacoesGoogle();
  const media = google.media ?? resumoAvaliacoes.media;
  const total = google.total ?? resumoAvaliacoes.total;
  const doGoogle = google.avaliacoes.map((a) => ({ id: a.id, autor: a.autor, nota: a.nota, texto: a.texto }));
  const manuais = reviews.map((r) => ({ id: r.id, autor: r.autor, nota: r.nota, texto: r.texto }));
  const reais = (doGoogle.length ? doGoogle : manuais).slice(0, 6);
  const cartoes = reais.length >= 3 ? reais : [];

  return (
    <section aria-labelledby="avaliacoes-b" className="bg-noite py-24 md:py-32">
      <div className="wrap">
        <Letreiro
            animar
            contar
            id="avaliacoes-b"
            cursiva="Avaliações"
            titulo={media.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}
            linha={`${total.toLocaleString("pt-BR")} avaliações no Google`}
          />
        <Reveal delay={0.5} y={12}>
          <div className="mt-4 flex justify-center">
            <Estrelas nota={media} className="[&_svg]:size-5" />
          </div>
        </Reveal>
      </div>

      {/* Celular: faixa com rolagem lateral; desktop: grade de três. */}
      {cartoes.length > 0 && (
      <ul data-anima="cascata" className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[1.375rem] md:mx-auto md:grid md:max-w-[82rem] md:grid-cols-3 md:gap-5 md:overflow-visible md:px-12">
        {cartoes.map((c) => (
          <li key={c.id} className="flex w-[82vw] shrink-0 snap-center flex-col rounded-3xl bg-creme p-7 text-tinta md:w-auto">
            <Estrelas nota={c.nota} className="[&_svg]:size-4" />
            <p className="mt-5 grow font-display text-[1.375rem] leading-snug italic">“{c.texto}”</p>
            <p className="mt-6 text-sm font-medium">{c.autor}</p>
          </li>
        ))}
      </ul>
      )}

      <div className={`flex justify-center ${cartoes.length > 0 ? "mt-12" : "mt-10"}`}>
        <BotaoLink href={site.googleReviewsUrl} variante="contorno" tamanho="lg" data-anima-magnetico>
          Ver todas no Google
        </BotaoLink>
      </div>
    </section>
  );
}
