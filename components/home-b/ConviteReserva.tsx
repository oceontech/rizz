import Reveal from "@/components/motion/Reveal";
import { BotaoLink } from "@/components/ui/Botao";
import { site } from "@/lib/site";

/**
 * Chamada de reserva em forma de ingresso: corpo vinho, canhoto picotado e
 * código de barras decorativo. Os dois recortes nas pontas do picote são
 * círculos na cor do fundo.
 */
export default function ConviteReserva() {
  return (
    <section aria-labelledby="convite-reserva" className="on-creme overflow-hidden py-24 md:py-32">
      <div className="wrap">
        <Reveal y={50}>
          <div className="mx-auto flex max-w-5xl rotate-[-1.5deg] flex-col text-creme shadow-[0_40px_80px_rgb(58_18_25/0.28)] md:flex-row">
            <div className="flex grow flex-col justify-between gap-10 rounded-t-3xl bg-vinho p-8 md:rounded-l-3xl md:rounded-tr-none md:p-12">
              <p className="eyebrow text-ambar">{site.nome}</p>
              <div>
                <h2 id="convite-reserva" className="text-display text-creme">
                  Solicite sua reserva.
                </h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-creme/75">
                  Escolha o dia, o horário e quantas pessoas. Almoço e jantar, em {site.endereco.cidade}.
                </p>
              </div>
              <div>
                <BotaoLink href="/reservas" tamanho="lg">
                  Reservar pelo site
                </BotaoLink>
              </div>
            </div>

            {/* Canhoto */}
            <div
              className="relative flex flex-row items-center justify-between gap-6 rounded-b-3xl border-t-2 border-dashed border-creme/30 bg-vinho-fundo p-8 md:w-64 md:flex-col md:items-start md:rounded-r-3xl md:rounded-bl-none md:border-t-0 md:border-l-2 md:p-10"
            >
              <span aria-hidden className="absolute -top-3.5 -left-3.5 size-7 rounded-full bg-creme md:-top-3.5 md:-left-[15px]" />
              <span aria-hidden className="absolute -top-3.5 -right-3.5 size-7 rounded-full bg-creme md:top-auto md:right-auto md:-bottom-3.5 md:-left-[15px]" />
              <div>
                <p className="eyebrow text-creme/50">Mesa para</p>
                <p className="mt-2 font-display text-5xl italic">você</p>
              </div>
              <div
                aria-hidden
                className="h-16 w-28 opacity-70 md:h-20 md:w-full"
                style={{
                  background:
                    "repeating-linear-gradient(90deg, var(--color-creme) 0 2px, transparent 2px 5px, var(--color-creme) 5px 6px, transparent 6px 10px, var(--color-creme) 10px 13px, transparent 13px 15px)",
                }}
              />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
