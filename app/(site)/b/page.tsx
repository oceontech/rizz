import type { Metadata } from "next";

import AvaliacoesResumo from "@/components/home/AvaliacoesResumo";
import Destaques from "@/components/home/Destaques";
import Executivo from "@/components/home/Executivo";
import Galeria from "@/components/home/Galeria";
import Hero from "@/components/home/Hero";
import IntroCamarao from "@/components/home/IntroCamarao";
import Marquee from "@/components/home/Marquee";
import Mosaico from "@/components/home/Mosaico";
import PratoAssinatura from "@/components/home/PratoAssinatura";
import Visite from "@/components/home/Visite";
import ConviteReserva from "@/components/home-b/ConviteReserva";
import CozinhaB from "@/components/home-b/CozinhaB";
import GaleriaB from "@/components/home-b/GaleriaB";
import VinhoDaCasa from "@/components/home-b/VinhoDaCasa";
import { executivoDoSite, homeDoSite } from "@/lib/dados";

/**
 * Versão B da página inicial, para comparar com a atual antes de decidir.
 * Fora dos buscadores e do sitemap: o endereço é só para quem recebe o link.
 *
 * Muda em relação à A: "Nossa cozinha" em papel creme com fotos inteiras,
 * galeria em trilho horizontal, o vinho Rizz Syrah e o convite de reserva.
 */
export const metadata: Metadata = {
  title: "Versão B",
  robots: { index: false, follow: false },
};

export default async function HomeB() {
  const [executivo, home] = await Promise.all([executivoDoSite(), homeDoSite()]);
  const { maisPedido } = home;

  return (
    <>
      <Hero />
      <Galeria />
      <Marquee />
      <CozinhaB />
      {maisPedido?.id === "camarao-empanado" ? (
        <IntroCamarao nome={maisPedido.nome}>
          <PratoAssinatura prato={maisPedido} entradaPeloVideo />
        </IntroCamarao>
      ) : (
        maisPedido && <PratoAssinatura prato={maisPedido} />
      )}
      {home.destaques.length > 0 && <Destaques pratos={home.destaques} />}
      <GaleriaB />
      <VinhoDaCasa />
      {executivo.ativo && <Executivo executivo={executivo} />}
      <Mosaico />
      <AvaliacoesResumo />
      <ConviteReserva />
      <Visite />
    </>
  );
}
