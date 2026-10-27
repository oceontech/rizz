import { Estrelas } from "@/components/home/AvaliacoesResumo";
import Reveal from "@/components/motion/Reveal";
import { BotaoLink } from "@/components/ui/Botao";
import { resumoAvaliacoes } from "@/data/reviews";
import { buscarAvaliacoesGoogle } from "@/lib/google-reviews";
import { site } from "@/lib/site";

import Letreiro from "./Letreiro";

/**
 * ⚠️ TEXTOS DE EXEMPLO, pedidos pelo dono só para montar o layout da versão B.
 * Não são avaliações de clientes, e cada cartão diz isso na tela. Antes de
 * esta seção ir para a home de verdade, troque por avaliações reais (a API
 * do Google, ou `data/reviews.ts` com `fonte: "manual"` e texto real):
 * avaliação inventada de restaurante real é propaganda enganosa.
 */
const EXEMPLOS = [
  { autor: "Mariana S.", texto: "O risoto de açafrão com ragu de costela é perfeito. Atendimento atencioso do começo ao fim." },
  { autor: "Rafael T.", texto: "Ambiente aconchegante, ótimo para um jantar a dois. A carta de vinhos ajudou na escolha." },
  { autor: "Juliana P.", texto: "Fomos no almoço executivo e voltamos no fim de semana. Entrada, prato e sobremesa impecáveis." },
  { autor: "Carlos M.", texto: "O camarão empanado com risoto é de outro nível. Já virou nosso lugar das comemorações." },
  { autor: "Fernanda L.", texto: "Burrata com cogumelos trufados, risoto de alho negro e um Syrah. Noite perfeita." },
  { autor: "Pedro A.", texto: "Equipe simpática, pratos bem servidos e o salão é lindo. Recomendo reservar antes." },
];

export default async function AvaliacoesB() {
  const google = await buscarAvaliacoesGoogle();
  const media = google.media ?? resumoAvaliacoes.media;
  const total = google.total ?? resumoAvaliacoes.total;
  // Com avaliações reais disponíveis, elas substituem os exemplos.
  const reais = google.avaliacoes.slice(0, 6).map((a) => ({ autor: a.autor, texto: a.texto, exemplo: false }));
  const cartoes = reais.length >= 3 ? reais : EXEMPLOS.map((e) => ({ ...e, exemplo: true }));

  return (
    <section aria-labelledby="avaliacoes-b" className="bg-noite py-24 md:py-32">
      <div className="wrap">
        <Reveal>
          <Letreiro
            id="avaliacoes-b"
            cursiva="Avaliações"
            titulo={media.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}
            linha={`${total.toLocaleString("pt-BR")} avaliações no Google`}
          />
          <div className="mt-4 flex justify-center">
            <Estrelas nota={media} className="[&_svg]:size-5" />
          </div>
        </Reveal>
      </div>

      {/* Celular: faixa com rolagem lateral; desktop: grade de três. */}
      <ul className="no-scrollbar mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto px-[1.375rem] md:mx-auto md:grid md:max-w-[82rem] md:grid-cols-3 md:gap-5 md:overflow-visible md:px-12">
        {cartoes.map((c) => (
          <li key={c.autor} className="flex w-[82vw] shrink-0 snap-center flex-col rounded-3xl bg-creme p-7 text-tinta md:w-auto">
            <Estrelas nota={5} className="[&_svg]:size-4" />
            <p className="mt-5 grow font-display text-[1.375rem] leading-snug italic">“{c.texto}”</p>
            <div className="mt-6 flex items-center justify-between gap-3 text-sm">
              <span className="font-medium">{c.autor}</span>
              {c.exemplo && (
                <span className="rounded-full bg-vinho/10 px-2.5 py-1 text-[0.6875rem] tracking-[0.08em] text-vinho uppercase">Exemplo</span>
              )}
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-12 flex justify-center">
        <BotaoLink href={site.googleReviewsUrl} variante="contorno" tamanho="lg">
          Ver todas no Google
        </BotaoLink>
      </div>
    </section>
  );
}
