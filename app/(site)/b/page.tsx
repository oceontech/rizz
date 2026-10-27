import type { Metadata } from "next";

import AvaliacoesResumo from "@/components/home/AvaliacoesResumo";
import Destaques from "@/components/home/Destaques";
import IntroCamarao from "@/components/home/IntroCamarao";
import Marquee from "@/components/home/Marquee";
import PratoAssinatura from "@/components/home/PratoAssinatura";
import Visite from "@/components/home/Visite";
import ConviteReserva from "@/components/home-b/ConviteReserva";
import CozinhaB from "@/components/home-b/CozinhaB";
import ExecutivoB from "@/components/home-b/ExecutivoB";
import GaleriaB from "@/components/home-b/GaleriaB";
import GaleriaCasaB from "@/components/home-b/GaleriaCasaB";
import HeroB from "@/components/home-b/HeroB";
import MosaicoB from "@/components/home-b/MosaicoB";
import MuralB from "@/components/home-b/MuralB";
import VinhoDaCasa from "@/components/home-b/VinhoDaCasa";
import { executivoDoSite, homeDoSite } from "@/lib/dados";

/**
 * Versão B da página inicial, para comparar com a atual antes de decidir.
 * Fora dos buscadores e do sitemap: o endereço é só para quem recebe o link.
 *
 * Muda em relação à A: um só tom escuro de fundo, o amarelo com letras
 * misturadas (itálico + caixa alta), hero do celular com o vídeo em arco,
 * "Nossa cozinha" em papel creme, galerias de fotos coladas, o vinho Rizz
 * Syrah, executivo em cartaz e o convite de reserva.
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
      <HeroB />
      <GaleriaCasaB />
      <Marquee amarela />
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
      <MosaicoB />
      {executivo.ativo && <ExecutivoB executivo={executivo} />}
      <MuralB />
      <AvaliacoesResumo />
      <ConviteReserva />
      <Visite fundo="bg-noite" />
    </>
  );
}
