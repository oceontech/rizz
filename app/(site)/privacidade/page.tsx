import type { Metadata } from "next";

import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacidade",
  description: `Informações sobre navegação, contato e serviços utilizados no site do ${site.nome}.`,
  alternates: { canonical: "/privacidade" },
  robots: { index: false, follow: true },
};

export default function PrivacidadePage() {
  return (
    <article className="wrap max-w-2xl pb-24 pt-28 md:pb-32 md:pt-44">
      <h1 className="text-titulo text-creme">Privacidade</h1>
      <div className="mt-12 space-y-6 leading-relaxed text-creme/70">
        <p>
          Você pode conhecer o {site.nome}, consultar o cardápio e encontrar
          informações para sua visita sem criar uma conta no site.
        </p>

        <h2 className="pt-6 font-display text-2xl text-creme">Reservas pelo WhatsApp</h2>
        <p>
          O formulário prepara uma mensagem com os dados que você preencher.
          Ao continuar, o site abre essa mensagem no WhatsApp para que você
          possa revisá-la e enviá-la. O atendimento à solicitação acontece
          na conversa com a equipe.
        </p>

        <h2 className="pt-6 font-display text-2xl text-creme">Serviços de terceiros</h2>
        <p>
          O mapa exibido no site é fornecido pelo Google Maps. Ao carregar o
          mapa, seu navegador se conecta ao serviço do Google. Os links para
          Google, Instagram, Facebook e WhatsApp levam a serviços externos,
          sujeitos às políticas de privacidade de seus responsáveis.
        </p>

        <h2 className="pt-6 font-display text-2xl text-creme">Contato</h2>
        <p>
          Para dúvidas sobre o uso de informações no site ou no atendimento
          de reservas, fale com a equipe pelo telefone{" "}
          <a
            href={`tel:${site.telefoneLink}`}
            className="text-ambar underline-offset-4 hover:underline"
          >
            {site.telefone}
          </a>
          .
        </p>
      </div>
    </article>
  );
}
