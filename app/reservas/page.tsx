import type { Metadata } from "next";

import FormReserva from "@/components/reservas/FormReserva";
import Filete from "@/components/motion/Filete";
import Reveal from "@/components/motion/Reveal";
import RevealScrub from "@/components/motion/RevealScrub";
import IndicadorAbertura from "@/components/ui/StatusAbertura";
import { faixa, horarios } from "@/lib/hours";
import { enderecoLinha, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Reservas",
  description: `Reserve sua mesa no ${site.nome}. Confira horários, endereço e fale direto com a equipe pelo WhatsApp.`,
  alternates: { canonical: "/reservas" },
};

export default function ReservasPage() {
  return (
    <>
      <header className="wrap pt-28 md:pt-44">
        <p className="eyebrow text-ambar">Reservas</p>

        <RevealScrub as="h1" className="mt-5 text-display text-creme">
          Guarde sua mesa
        </RevealScrub>

        <Reveal delay={0.1}>
          <div className="mt-8">
            <IndicadorAbertura />
          </div>
        </Reveal>

        <Filete className="mt-10" />
      </header>

      <div className="wrap grid gap-16 pb-24 pt-14 md:grid-cols-[1.15fr_1fr] md:gap-24 md:pb-32">
        <FormReserva />

        <aside>
          <Reveal>
            <h2 className="eyebrow text-ambar">Horários</h2>
            <ul className="mt-6 space-y-3 text-sm">
              {horarios.map((d) => (
                <li
                  key={d.dia}
                  className="flex items-baseline justify-between gap-4 border-b border-creme/8 pb-3 last:border-0"
                >
                  <span className="text-creme/55">{d.nome}</span>
                  <span className="text-right tabular-nums text-creme/85">
                    {d.fechado ? (
                      <span className="text-creme/35">Fechado</span>
                    ) : (
                      <>
                        {faixa(d.almoco)}
                        <span className="mx-2 text-creme/20">·</span>
                        {faixa(d.jantar)}
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="eyebrow mt-12 text-ambar">Onde estamos</h2>
            <p className="mt-6 text-sm leading-relaxed">
              <a
                href={site.mapaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-creme/75 transition-colors hover:text-ambar"
              >
                {enderecoLinha}
              </a>
            </p>
            <p className="mt-3 text-sm">
              <a
                href={`tel:${site.telefone.replace(/\s/g, "")}`}
                className="text-creme/75 transition-colors hover:text-ambar"
              >
                {site.telefone}
              </a>
            </p>
          </Reveal>
        </aside>
      </div>
    </>
  );
}
