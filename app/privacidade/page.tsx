import type { Metadata } from "next";

import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacidade",
  description: `Política de privacidade e uso de cookies do ${site.nome}.`,
  alternates: { canonical: "/privacidade" },
  robots: { index: false, follow: true },
};

export default function PrivacidadePage() {
  return (
    <article className="wrap max-w-2xl pb-24 pt-28 md:pb-32 md:pt-44">
      <h1 className="text-titulo text-creme">
        Privacidade e cookies
      </h1>

      <div className="mt-12 space-y-6 leading-relaxed text-creme/70">
        <p>
          Este site é a vitrine institucional do {site.nome}. Não pedimos
          cadastro nem criamos conta de usuário para navegar.
        </p>

        <h2 className="pt-6 font-display text-2xl text-creme">
          Dados que coletamos
        </h2>
        <p>
          Registramos métricas de navegação agregadas — páginas visitadas, tempo
          de permanência, tipo de dispositivo — para entender quais pratos
          despertam mais interesse e melhorar o site. Esses dados não
          identificam você individualmente.
        </p>

        <h2 className="pt-6 font-display text-2xl text-creme">Reservas</h2>
        <p>
          O formulário de reservas não envia nada para os nossos servidores: ele
          monta uma mensagem e abre o WhatsApp para que você mesmo envie. As
          informações que você digitar ficam no seu aparelho até esse envio, e a
          conversa passa a ser regida pela política do WhatsApp.
        </p>

        <h2 className="pt-6 font-display text-2xl text-creme">Cookies</h2>
        <p>
          Usamos apenas armazenamento local do navegador para lembrar que a
          animação de abertura já foi exibida nesta sessão. Nenhum cookie de
          publicidade é instalado por nós.
        </p>

        <h2 className="pt-6 font-display text-2xl text-creme">
          Conteúdo de terceiros
        </h2>
        <p>
          O mapa é incorporado do Google Maps, que segue a própria política de
          privacidade. Links para Instagram e WhatsApp levam a serviços
          externos.
        </p>

        <h2 className="pt-6 font-display text-2xl text-creme">Contato</h2>
        <p>
          Para dúvidas sobre seus dados, fale conosco pelo telefone{" "}
          <a
            href={`tel:${site.telefone.replace(/\s/g, "")}`}
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
