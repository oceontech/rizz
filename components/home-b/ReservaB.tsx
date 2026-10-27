import Reveal from "@/components/motion/Reveal";
import { BotaoLink } from "@/components/ui/Botao";
import { site } from "@/lib/site";

import Letreiro from "./Letreiro";
import VideoB from "./VideoB";

/**
 * Chamada de reserva da versão B: vídeo do molho sendo servido em tela cheia,
 * escurecido, com o letreiro por cima. Substitui o ingresso da primeira
 * versão.
 */
export default function ReservaB() {
  return (
    <section aria-labelledby="reserva-b" className="relative isolate flex min-h-[92svh] items-center overflow-hidden bg-noite py-24">
      <VideoB nome="molho" className="absolute inset-0 -z-20 size-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-noite/70" />
      <div className="absolute inset-x-0 top-0 -z-10 h-1/3 bg-gradient-to-b from-noite to-transparent" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-1/3 bg-gradient-to-t from-noite to-transparent" />

      <div className="wrap flex flex-col items-center">
        <Reveal>
          <Letreiro id="reserva-b" cursiva="Reserve" titulo="sua mesa" linha={`Almoço e jantar · ${site.endereco.cidade}`} />
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-8 max-w-sm text-center text-lg leading-relaxed text-creme/80">
            Escolha o dia, o horário e quantas pessoas.
          </p>
          <div className="mt-8 flex justify-center">
            <BotaoLink href="/reservas" tamanho="lg">
              Reservar pelo site
            </BotaoLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
