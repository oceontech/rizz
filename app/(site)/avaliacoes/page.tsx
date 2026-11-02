import type { Metadata } from "next";

import CartaoGoogle, { LogoGoogle } from "@/components/avaliacoes/CartaoGoogle";
import VideoB from "@/components/home-b/VideoB";
import CenasHome from "@/components/motion/CenasHome";
import { BotaoLink } from "@/components/ui/Botao";
import { Estrelas } from "@/components/ui/Estrelas";
import { resumoAvaliacoes } from "@/data/reviews";
import { buscarAvaliacoesGoogle } from "@/lib/google-reviews";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Avaliações",
  description: `Já visitou o ${site.nome}? Conte como foi no Google: leva menos de um minuto.`,
  alternates: { canonical: "/avaliacoes" },
};

const passos = [
  { titulo: "Toque em avaliar", texto: "O botão abre a janela de avaliação do Rizz direto no Google." },
  { titulo: "Escolha as estrelas", texto: "De uma a cinco, do jeito que foi a sua visita." },
  { titulo: "Conte o que pediu", texto: "Uma frase basta. O prato, o vinho, o atendimento." },
];

/**
 * Sugestões de assunto para quem não sabe o que escrever. São temas da casa
 * (o que o Rizz serve e oferece), não avaliações: nada aqui é atribuído a
 * cliente.
 */
const temas = [
  "O risoto que você pediu",
  "O rodízio de risotos",
  "O vinho da taça",
  "O atendimento",
  "O almoço executivo",
  "A sobremesa",
  "O camarão empanado",
  "Uma data especial",
  "O ambiente do salão",
  "A harmonização",
];

/**
 * Avaliações: a página existe para levar a pessoa a avaliar no Google.
 *
 * Topo com o salão em vídeo e o cartão no estilo do Google (as estrelas já
 * abrem a janela de avaliação), depois os três passos, as sugestões do que
 * escrever e o fecho com a nota real.
 *
 * Depoimentos só entram se vierem da API do Google e forem de 5 estrelas,
 * no mínimo três. Sem a chave, a página não mostra texto de cliente nenhum:
 * publicar avaliação inventada seria propaganda enganosa.
 */
export default async function AvaliacoesPage() {
  const google = await buscarAvaliacoesGoogle();
  const media = google.media ?? resumoAvaliacoes.media;
  const total = google.total ?? resumoAvaliacoes.total;
  const cincoEstrelas = google.avaliacoes.filter((a) => a.nota === 5 && a.texto.trim().length > 20);
  const depoimentos = cincoEstrelas.length >= 3 ? cincoEstrelas.slice(0, 4) : [];
  const notaTexto = media.toLocaleString("pt-BR", { minimumFractionDigits: 1 });

  return (
    <>
      {/* Topo: salão em vídeo, letreiro e o cartão do Google. */}
      <section className="relative isolate overflow-hidden bg-noite pt-28 pb-20 md:flex md:min-h-[100svh] md:items-center md:pt-32 md:pb-24">
        <VideoB nome="salao-ambiente" rotulo="O salão do Rizz por dentro" className="absolute inset-0 -z-20 hidden size-full object-cover md:block" />
        <VideoB nome="salao-ambiente-v" rotulo="O salão do Rizz por dentro" className="absolute inset-0 -z-20 size-full object-cover md:hidden" />
        <div className="absolute inset-0 -z-10 bg-noite/75" />
        <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-noite to-transparent" />
        {/* Brilho atrás do cartão, puxando o olhar para as estrelas. */}
        <div aria-hidden className="pointer-events-none absolute top-1/2 right-[8%] -z-10 hidden size-[36rem] -translate-y-1/2 rounded-full bg-ambar opacity-15 blur-[140px] md:block" />

        <div className="wrap grid w-full items-center gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-6 lg:col-span-7">
            <p className="eyebrow text-ambar">Avaliações</p>
            <h1 data-anima="letreiro" className="mt-5 flex flex-col items-start text-creme not-italic">
              <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[clamp(2.75rem,7vw,5.25rem)] leading-none">Conte como foi</span>
              <span className="font-[family-name:var(--font-instrument)] text-[clamp(4.75rem,15vw,10rem)] leading-[0.88] tracking-[0.01em] text-ouro-claro uppercase">
                sua visita
              </span>
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-creme/80">
              Leva menos de um minuto e ajuda quem procura onde comer em {site.endereco.cidade} a encontrar a nossa mesa.
            </p>
          </div>

          <div className="mx-auto w-full max-w-md md:col-span-6 md:max-w-none lg:col-span-5">
            <CartaoGoogle media={media} total={total} />
          </div>
        </div>
      </section>

      {/* Três passos. */}
      <section aria-labelledby="passos" className="bg-noite py-20 md:py-28">
        <div className="wrap">
          <h2 id="passos" data-anima="letreiro" className="flex flex-col items-start text-creme not-italic">
            <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[clamp(2.5rem,6vw,4.25rem)] leading-none">Em três</span>
            <span className="font-[family-name:var(--font-instrument)] text-[clamp(4rem,11vw,7.5rem)] leading-[0.9] tracking-[0.01em] uppercase">passos</span>
          </h2>
          <ol data-anima="cascata" className="mt-12 grid border-t border-creme/12 md:mt-16 md:grid-cols-3 md:border-t-0">
            {passos.map((p, i) => (
              <li
                key={p.titulo}
                className="grid grid-cols-[4.5rem_1fr] items-baseline gap-4 border-b border-creme/12 py-6 md:block md:border-b-0 md:border-l md:px-8 md:py-2 md:first:border-l-0 md:first:pl-0"
              >
                <span className="font-[family-name:var(--font-instrument)] text-5xl leading-none text-ambar md:text-7xl">0{i + 1}</span>
                <div className="md:mt-6">
                  <p className="font-[family-name:var(--font-instrument)] text-2xl tracking-[0.01em] text-creme uppercase md:text-3xl">{p.titulo}</p>
                  <p className="mt-1.5 leading-relaxed text-creme/70">{p.texto}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* O que escrever: os temas deslizam em duas faixas, em sentidos opostos. */}
      <section aria-labelledby="ideias" className="on-creme relative overflow-hidden py-20 md:py-28">
        <div className="wrap">
          <h2 id="ideias" data-anima="letreiro" className="flex flex-col items-start text-vinho not-italic">
            <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[clamp(2.5rem,6vw,4.25rem)] leading-none text-ambar">Não sabe o que</span>
            <span className="font-[family-name:var(--font-instrument)] text-[clamp(4rem,11vw,7.5rem)] leading-[0.9] tracking-[0.01em] uppercase">escrever?</span>
          </h2>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-tinta/75">Fale de um destes. Uma frase sobre o que marcou a sua visita já ajuda muito.</p>
        </div>

        <div aria-hidden className="mt-12 flex flex-col gap-3 md:mt-16 md:gap-4">
          {[temas, [...temas].reverse()].map((faixa, f) => (
            <div key={f} className="flex overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              <div
                className="flex shrink-0 gap-3 pr-3 motion-reduce:animate-none md:gap-4 md:pr-4"
                style={{ animation: `correr ${f ? 46 : 40}s linear infinite${f ? " reverse" : ""}` }}
              >
                {[...faixa, ...faixa].map((t, i) => (
                  <span
                    key={i}
                    className={`flex h-12 shrink-0 items-center gap-2.5 rounded-full px-5 text-[0.9375rem] whitespace-nowrap md:h-14 md:px-6 md:text-base ${i % 3 === 0 ? "bg-vinho text-creme" : "border border-vinho/25 text-vinho"}`}
                  >
                    <svg viewBox="0 0 24 24" className="size-3.5 fill-current opacity-70">
                      <path d="m12 2.8 2.8 5.9 6.4.9-4.7 4.5 1.2 6.4L12 17.4l-5.7 3.1 1.2-6.4-4.7-4.5 6.4-.9z" />
                    </svg>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* A lista real, para leitores de tela (as faixas são decorativas). */}
        <ul className="sr-only">
          {temas.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </section>

      {/* Depoimentos reais (só com a API do Google e 5 estrelas). */}
      {depoimentos.length > 0 && (
        <section aria-labelledby="depoimentos" className="bg-noite py-20 md:py-28">
          <div className="wrap">
            <h2 id="depoimentos" data-anima="letreiro" className="flex flex-col items-start text-creme not-italic">
              <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[clamp(2.5rem,6vw,4.25rem)] leading-none">Quem já</span>
              <span className="font-[family-name:var(--font-instrument)] text-[clamp(4rem,11vw,7.5rem)] leading-[0.9] tracking-[0.01em] text-ouro-claro uppercase">avaliou</span>
            </h2>
            <ul data-anima="cascata" className="mt-12 grid gap-4 md:mt-16 md:grid-cols-2 md:gap-5">
              {depoimentos.map((r) => (
                <li key={r.id} className="flex flex-col rounded-3xl bg-creme p-7 text-tinta md:p-9">
                  <div className="flex items-center justify-between">
                    <Estrelas nota={r.nota} className="[&_svg]:size-4" />
                    <LogoGoogle className="size-5" />
                  </div>
                  <blockquote className="mt-5 grow font-display text-[1.375rem] leading-snug italic">“{r.texto}”</blockquote>
                  <p className="mt-6 text-sm font-medium">
                    {r.autor}
                    {r.quando && <span className="font-normal text-tinta/55"> · {r.quando}</span>}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Fecho: a nota real e o convite final. */}
      <section className="relative isolate overflow-hidden bg-noite py-24 text-center md:py-32">
        <div aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 -z-10 size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-vinho opacity-40 blur-[140px]" />
        <div className="wrap flex flex-col items-center">
          <h2 data-anima="letreiro" data-anima-contar className="flex flex-col items-center text-creme not-italic">
            <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[clamp(2.5rem,6vw,4.25rem)] leading-none">Nota no Google</span>
            <span className="font-[family-name:var(--font-instrument)] text-[clamp(6rem,22vw,12rem)] leading-[0.88] tracking-[0.01em] text-ouro-claro uppercase">{notaTexto}</span>
            <span className="mt-4 font-sans text-[0.7rem] font-medium tracking-[0.42em] text-creme/80 uppercase md:text-xs">
              {total.toLocaleString("pt-BR")} avaliações
            </span>
          </h2>
          <Estrelas nota={media} className="mt-5 [&_svg]:size-6" />
          <p className="mx-auto mt-8 max-w-sm text-lg leading-relaxed text-creme/80">Falta a sua.</p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <BotaoLink href={site.googleAvaliarUrl} tamanho="lg" data-anima-magnetico>
              Avaliar no Google
            </BotaoLink>
            <BotaoLink href={site.googleReviewsUrl} variante="contorno" tamanho="lg">
              Ler as avaliações
            </BotaoLink>
          </div>
          <p className="mt-6 text-xs text-creme/45">
            {google.media === null ? `Nota e total conferidos no Google em ${resumoAvaliacoes.conferidoEm.split("-").reverse().join("/")}.` : "Nota e total atualizados pelo Google."}
          </p>
        </div>
      </section>

      <CenasHome />
    </>
  );
}
