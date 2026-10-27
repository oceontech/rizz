import Image from "next/image";

import Reveal from "@/components/motion/Reveal";
import BadgeExecutivo from "@/components/ui/BadgeExecutivo";
import { BotaoLink } from "@/components/ui/Botao";
import Preco from "@/components/ui/Preco";
import type { ExecutivoDados } from "@/lib/dados";
import { img } from "@/lib/images";
import { whatsappLink } from "@/lib/site";

import Textura from "./Textura";

/**
 * Executivo da versão B: cartaz amarelo, como o do vinho.
 *
 * Os preços ficam numa tabela de duas colunas (rótulo à esquerda, valor à
 * direita), que no celular não quebra; na A eram blocos lado a lado que se
 * desencontravam em telas estreitas. As fotos dos pratos vêm coladas, sem
 * vão nem moldura.
 */
export default function ExecutivoB({ executivo }: { executivo: ExecutivoDados }) {
  const fotos = executivo.pratos.filter((p) => p.img).slice(0, 3);
  const confirmado = executivo.condicoesConfirmadas;

  return (
    <section id="executivo" aria-labelledby="executivo-b" className="scroll-mt-24 bg-noite px-3 py-6 md:px-6 md:py-10">
      {/* Canto arredondado por clip-path, não por overflow + border-radius: com
          foto encostada na borda, o recorte por raio deixava um fio claro de
          antisserrilhado no canto. */}
      <div className="mx-auto grid max-w-[90rem] bg-ouro-claro text-vinho [clip-path:inset(0_round_2rem)] md:grid-cols-2 md:[clip-path:inset(0_round_2.5rem)]">
        <div className="relative isolate flex flex-col px-6 py-12 md:px-14 md:py-16">
          <Textura />
          <div className="flex flex-wrap items-center gap-3">
            <p className="eyebrow text-vinho">Almoço executivo</p>
            <BadgeExecutivo claro executivo={executivo} />
          </div>

          <Reveal>
            <h2 id="executivo-b" className="mt-8 flex flex-col leading-[0.95] not-italic">
              <span className="font-display text-[clamp(2.75rem,7vw,5rem)] italic">Entrada,</span>
              <span className="font-sans text-[clamp(2.6rem,6.6vw,4.75rem)] font-semibold tracking-[-0.03em] uppercase">
                prato
              </span>
              <span className="font-display text-[clamp(2.75rem,7vw,5rem)] italic">e sobremesa</span>
            </h2>
          </Reveal>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-vinho/80">{executivo.chamada}.</p>

          {confirmado ? (
            <dl className="mt-10 max-w-md divide-y divide-vinho/20 border-y border-vinho/20">
              <div className="flex items-end justify-between gap-4 py-4">
                <dt className="text-sm leading-snug">
                  Menu completo
                  <span className="block text-vinho/60">por pessoa</span>
                </dt>
                <dd>
                  <Preco valor={executivo.precoCompleto} className="text-[2.75rem] leading-none md:text-[3.25rem]" />
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-4">
                <dt className="text-sm">Pratos principais</dt>
                <dd className="flex items-baseline gap-2">
                  <span className="text-sm text-vinho/60">a partir de</span>
                  <Preco valor={executivo.precoAvulsoMin} className="text-2xl" />
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-4 text-sm">
                <dt>Dias</dt>
                <dd className="font-medium">{executivo.dias}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-4 py-4 text-sm">
                <dt>Horário</dt>
                <dd className="font-medium">{executivo.horario}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-8 max-w-md text-sm leading-relaxed text-vinho/75">
              Consulte os dias, as opções e os valores do executivo com a equipe.
            </p>
          )}

          <div className="mt-10 flex flex-wrap gap-3">
            <BotaoLink href="/cardapio#executivo" variante="vinho" tamanho="lg">
              Ver menu executivo
            </BotaoLink>
            {!confirmado && (
              <BotaoLink
                href={whatsappLink("Olá! Gostaria de consultar os dias, as opções e os valores do almoço executivo do Rizz.")}
                variante="contorno-vinho"
              >
                Consultar pelo WhatsApp
              </BotaoLink>
            )}
          </div>
        </div>

        <div className="flex flex-col">
          <div className="relative min-h-[22rem] grow">
            <Image
              src={img("mesa-executivo")}
              alt="Mesa vista de cima com os pratos do menu executivo: parmegiana com arroz e fritas, risoto de funghi, massa, salada, arancini e sobremesas"
              placeholder="blur"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
          {fotos.length > 0 && (
            // Celular: linhas em papel creme, com foto grande e texto ao lado.
            // Desktop: três quadros colados, com o texto por cima da foto.
            <ul className="grid divide-y divide-tinta/10 bg-creme md:divide-y-0 md:bg-vinho md:grid-cols-3 md:[&>li+li]:-ml-px">
              {fotos.map((p) => (
                <li key={p.id} className="relative flex items-center gap-4 md:block md:aspect-[3/4]">
                  <div className="relative size-40 shrink-0 md:absolute md:inset-0 md:size-auto">
                    <Image src={img(p.img!)} alt={p.nome} fill sizes="(min-width: 768px) 15vw, 160px" className="object-cover" />
                  </div>
                  <div className="py-3 pr-5 md:absolute md:inset-x-0 md:bottom-0 md:bg-gradient-to-t md:from-black/85 md:via-black/45 md:to-transparent md:p-5 md:pt-20">
                    <p className="text-[1.0625rem] leading-snug text-tinta md:text-lg md:text-white">{p.nome}</p>
                    {confirmado && <Preco valor={p.preco} className="mt-1.5 text-2xl text-vinho md:text-[1.75rem] md:text-ouro-claro" />}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
