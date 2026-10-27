import Reveal from "@/components/motion/Reveal";
import { BotaoLink } from "@/components/ui/Botao";
import IndicadorAbertura from "@/components/ui/StatusAbertura";
import { faixa, horarios } from "@/lib/hours";
import { enderecoLinha, site, whatsappLink } from "@/lib/site";

/**
 * Horários e endereço da versão B.
 *
 * Duas colunas no desktop: à esquerda o letreiro, o status e a tabela de
 * horários; à direita um mapa grande em tom escuro com um marcador próprio.
 *
 * O mapa é o embed do Google sem marcador (`ll`, sem `q`) passado por um
 * filtro que o deixa escuro, combinando com o site. O marcador vinho fica
 * fixo no centro, que é a coordenada do restaurante; por isso o mapa não
 * recebe clique (arrastá-lo descolaria o marcador) e quem quer navegar usa
 * o botão "Como chegar".
 */
export default function VisiteB() {
  const { lat, lng } = site.coordenadas;
  const mapa = `https://maps.google.com/maps?ll=${lat},${lng}&z=16&t=m&hl=pt-BR&output=embed`;

  return (
    <section id="visite" aria-labelledby="visite-b" className="scroll-mt-24 bg-noite py-24 md:py-32">
      <div className="wrap grid gap-14 md:grid-cols-12 md:gap-12">
        <div className="md:col-span-5">
          <h2 id="visite-b" className="flex flex-col items-start not-italic">
            <span className="relative z-10 -mb-[0.1em] font-[family-name:var(--font-pinyon)] text-[clamp(2.75rem,6vw,4.5rem)] leading-none text-creme">
              Planeje
            </span>
            <span className="font-[family-name:var(--font-instrument)] text-[clamp(4rem,10vw,7.5rem)] leading-[0.9] tracking-[0.01em] text-ouro-claro uppercase">
              sua visita
            </span>
          </h2>

          <div className="mt-8">
            <IndicadorAbertura />
          </div>

          <Reveal delay={0.08}>
            <table className="mt-8 w-full text-[0.9375rem]">
              <caption className="sr-only">Horário de funcionamento por dia da semana</caption>
              <tbody>
                {horarios.map((d) => (
                  <tr key={d.dia} className="border-b border-creme/10 last:border-0">
                    <th scope="row" className="py-3.5 pr-4 text-left font-normal text-creme/60">
                      {d.nome}
                    </th>
                    {d.fechado ? (
                      <td colSpan={2} className="py-3.5 text-right text-creme/35">
                        Fechado
                      </td>
                    ) : (
                      <>
                        <td className="py-3.5 text-right whitespace-nowrap text-creme/90 tabular-nums">{faixa(d.almoco)}</td>
                        <td className="py-3.5 pl-5 text-right whitespace-nowrap text-creme/90 tabular-nums">{faixa(d.jantar)}</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>

          <dl className="mt-10 grid gap-6 sm:grid-cols-2">
            <div>
              <dt className="eyebrow text-creme/45">Endereço</dt>
              <dd className="mt-2 leading-relaxed text-creme/85">{enderecoLinha}</dd>
            </div>
            <div>
              <dt className="eyebrow text-creme/45">Telefone e WhatsApp</dt>
              <dd className="mt-2">
                <a href={`tel:${site.telefone.replace(/\s/g, "")}`} className="text-creme/85 transition-colors hover:text-ambar">
                  {site.telefone}
                </a>
              </dd>
            </div>
          </dl>

          <div className="mt-10 flex flex-wrap gap-3">
            <BotaoLink href={whatsappLink(`Olá! Gostaria de reservar uma mesa no ${site.nome}.`)} tamanho="lg">
              Reservar pelo WhatsApp
            </BotaoLink>
          </div>
        </div>

        <Reveal className="md:col-span-7" delay={0.1}>
          <div className="relative isolate h-[26rem] bg-noite [clip-path:inset(0_round_1.75rem)] md:h-full md:min-h-[38rem]">
            <iframe
              src={mapa}
              title={`Localização do ${site.nome}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              tabIndex={-1}
              className="pointer-events-none absolute inset-0 size-full border-0 [filter:invert(0.92)_hue-rotate(180deg)_saturate(0.35)_brightness(0.85)_sepia(0.25)]"
            />

            {/* Marcador no centro = coordenada do restaurante. */}
            <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
              <span className="absolute bottom-0 left-1/2 size-16 -translate-x-1/2 translate-y-1/2 animate-ping rounded-full bg-ambar/30" />
              <span className="relative flex flex-col items-center">
                <span className="grid size-12 place-items-center rounded-full bg-vinho font-[family-name:var(--font-instrument)] text-xl text-creme shadow-[0_10px_30px_rgb(0_0_0/0.5)] ring-4 ring-ambar">
                  R
                </span>
                <span className="-mt-1 size-3 rotate-45 bg-ambar" />
              </span>
            </div>

            {/* Cartão flutuante com o endereço e a rota. */}
            <div className="absolute inset-x-4 bottom-4 flex flex-col gap-4 rounded-2xl bg-creme p-5 text-tinta shadow-[0_20px_50px_rgb(0_0_0/0.45)] sm:flex-row sm:items-center sm:justify-between md:inset-x-6 md:bottom-6 md:p-6">
              <div>
                <p className="font-display text-xl italic">{site.nome}</p>
                <p className="mt-1 text-sm text-tinta/70">{enderecoLinha}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <BotaoLink href={site.mapaLink} variante="vinho">
                  Como chegar
                </BotaoLink>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
