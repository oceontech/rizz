import type { Metadata } from "next";

import CartaoFidelidade from "@/components/fidelidade/CartaoFidelidade";
import Filete from "@/components/motion/Filete";
import Reveal from "@/components/motion/Reveal";
import RevealScrub from "@/components/motion/RevealScrub";
import { BotaoLink } from "@/components/ui/Botao";
import { fidelidadeDoSite } from "@/lib/dados";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Fidelidade",
  description: `Cartão fidelidade digital do ${site.nome}: junte selos a cada visita e ganhe um presente da casa.`,
  alternates: { canonical: "/fidelidade" },
};

export default async function FidelidadePage() {
  const config = await fidelidadeDoSite();

  return (
    <>
      <header className="wrap pt-28 md:pt-44">
        <p className="eyebrow text-ambar">Clube Rizz</p>

        <RevealScrub as="h1" className="mt-5 text-display text-creme">
          Cartão fidelidade
        </RevealScrub>

        <p className="mt-6 max-w-prose leading-relaxed text-creme/70">
          A cada visita, um selo no seu cartão. Com {config.meta} selos, você ganha{" "}
          <strong className="font-medium text-creme">{config.recompensa.toLowerCase()}</strong>. Sem
          aplicativo e sem cartão de papel: é só informar seu celular no caixa.
        </p>

        <Filete className="mt-10" />
      </header>

      <div className="wrap grid gap-16 pb-24 pt-14 md:grid-cols-[1.15fr_1fr] md:gap-24 md:pb-32">
        {config.ativo ? (
          <CartaoFidelidade meta={config.meta} recompensa={config.recompensa} />
        ) : (
          <div>
            <p className="leading-relaxed text-creme/70">
              O programa está em pausa no momento. Fale com a equipe na sua próxima visita.
            </p>
            <BotaoLink href="/reservas" className="mt-8">
              Reservar mesa
            </BotaoLink>
          </div>
        )}

        <aside>
          <Reveal>
            <h2 className="eyebrow text-ambar">Como funciona</h2>
            <ol className="mt-6 space-y-5 text-sm leading-relaxed text-creme/75">
              {[
                "Cadastre-se aqui ou no caixa, com seu celular.",
                "A cada visita, a equipe carimba um selo no seu cartão digital.",
                `Completou ${config.meta} selos? O próximo pedido vem com ${config.recompensa.toLowerCase()}.`,
              ].map((passo, i) => (
                <li key={i} className="flex gap-4">
                  <span className="font-display text-2xl italic leading-none text-ambar">{i + 1}</span>
                  <span>{passo}</span>
                </li>
              ))}
            </ol>
            {config.regras && (
              <p className="mt-10 border-t border-creme/10 pt-6 text-xs leading-relaxed text-creme/45">
                {config.regras}
              </p>
            )}
          </Reveal>
        </aside>
      </div>
    </>
  );
}
