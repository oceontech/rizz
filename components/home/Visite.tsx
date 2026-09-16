import Image from "next/image";

import Filete from "@/components/motion/Filete";
import Parallax from "@/components/motion/Parallax";
import Reveal from "@/components/motion/Reveal";
import RevealScrub from "@/components/motion/RevealScrub";
import { BotaoLink } from "@/components/ui/Botao";
import IndicadorAbertura from "@/components/ui/StatusAbertura";
import { faixa, horarios } from "@/lib/hours";
import { img } from "@/lib/images";
import { enderecoLinha, site, whatsappLink } from "@/lib/site";

export default function Visite() {
  return (
    <section id="visite" className="scroll-mt-24 bg-noite-2 py-24 md:py-32">
      <div className="wrap">
        <div className="grid gap-16 md:grid-cols-2 md:gap-20">
          <div>
            <p className="eyebrow text-ambar">Visite</p>

            <RevealScrub className="mt-6 text-titulo text-creme">
              Onde e quando
            </RevealScrub>

            <Filete className="mt-8" />

            <Reveal delay={0.06}>
              <div className="mt-7">
                <IndicadorAbertura />
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <table className="mt-9 w-full text-sm">
                <caption className="sr-only">
                  Horário de funcionamento por dia da semana
                </caption>
                <tbody>
                  {horarios.map((d) => (
                    <tr key={d.dia} className="border-b border-creme/8 last:border-0">
                      <th
                        scope="row"
                        className="py-3.5 text-left font-normal text-creme/55"
                      >
                        {d.nome}
                      </th>
                      <td className="py-3.5 text-right tabular-nums text-creme/85">
                        {d.fechado ? (
                          <span className="text-creme/35">Fechado</span>
                        ) : (
                          <span className="flex flex-col items-end gap-0.5 sm:flex-row sm:justify-end sm:gap-4">
                            <span>{faixa(d.almoco)}</span>
                            <span className="hidden text-creme/20 sm:inline">·</span>
                            <span>{faixa(d.jantar)}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Reveal>
          </div>

          <div>
            <Parallax className="aspect-[4/5]" forca={10}>
              <Image
                src={img("salao-claraboia")}
                alt="Salão do Rizz visto de uma mesa: parede de tijolo aparente com a placa Rizz Cucina & Vino, claraboia, lustres de ferro e parede vermelha ao fundo"
                placeholder="blur"
                sizes="(min-width: 860px) 45vw, 92vw"
                className="size-full object-cover"
              />
            </Parallax>

            <Reveal delay={0.08}>
              <div className="mt-8 aspect-[16/10] overflow-hidden border border-creme/10">
                <iframe
                  src={site.mapaEmbed}
                  title={`Mapa — ${site.nome}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="size-full border-0 grayscale-[0.5] contrast-[1.1]"
                />
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <dl className="mt-8 space-y-5 text-sm">
                <div>
                  <dt className="eyebrow text-creme/40">Endereço</dt>
                  <dd className="mt-2">
                    <a
                      href={site.mapaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-creme/85 transition-colors hover:text-ambar"
                    >
                      {enderecoLinha}
                    </a>
                  </dd>
                </div>

                <div>
                  <dt className="eyebrow text-creme/40">Contato</dt>
                  <dd className="mt-2">
                    <a
                      href={`tel:${site.telefone.replace(/\s/g, "")}`}
                      className="text-creme/85 transition-colors hover:text-ambar"
                    >
                      {site.telefone}
                    </a>
                  </dd>
                </div>
              </dl>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="mt-9 flex flex-wrap gap-3">
                <BotaoLink
                  href={whatsappLink(
                    `Olá! Gostaria de reservar uma mesa no ${site.nome}.`,
                  )}
                  tamanho="lg"
                >
                  Reservar no WhatsApp
                </BotaoLink>
                <BotaoLink href={site.mapaLink} variante="contorno" tamanho="lg">
                  Como chegar
                </BotaoLink>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
