import Image from "next/image";

import Reveal from "@/components/motion/Reveal";
import BadgeExecutivo from "@/components/ui/BadgeExecutivo";
import { BotaoLink } from "@/components/ui/Botao";
import Preco from "@/components/ui/Preco";
import type { ExecutivoDados } from "@/lib/dados";
import { img } from "@/lib/images";
import { whatsappLink } from "@/lib/site";

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
      <div className="mx-auto grid max-w-[90rem] overflow-hidden rounded-[2rem] bg-ouro-claro text-vinho md:grid-cols-2 md:rounded-[2.5rem]">
        <div className="flex flex-col px-6 py-12 md:px-14 md:py-16">
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
            <ul className="grid grid-cols-3">
              {fotos.map((p) => (
                <li key={p.id} className="relative aspect-[3/4]">
                  <Image src={img(p.img!)} alt={p.nome} fill sizes="(min-width: 768px) 15vw, 33vw" className="object-cover" />
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-noite/85 to-transparent p-2.5 pt-10 text-[0.75rem] leading-snug text-creme md:p-3.5 md:text-[0.8125rem]">
                    {p.nome}
                    {confirmado && (
                      <span className="mt-1 block">
                        <Preco valor={p.preco} className="text-sm text-ouro-claro" />
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
