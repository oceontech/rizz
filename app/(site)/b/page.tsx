import type { Metadata } from "next";

import Destaques from "@/components/home/Destaques";
import IntroCamarao from "@/components/home/IntroCamarao";
import Marquee from "@/components/home/Marquee";
import AvaliacoesB from "@/components/home-b/AvaliacoesB";
import CozinhaB from "@/components/home-b/CozinhaB";
import { instrument, pinyon } from "@/components/home-b/fontes";
import ExecutivoB from "@/components/home-b/ExecutivoB";
import GaleriaB from "@/components/home-b/GaleriaB";
import GaleriaCasaB from "@/components/home-b/GaleriaCasaB";
import HeroB from "@/components/home-b/HeroB";
import MosaicoB from "@/components/home-b/MosaicoB";
import MuralB from "@/components/home-b/MuralB";
import PratoAssinaturaB from "@/components/home-b/PratoAssinaturaB";
import ReservaB from "@/components/home-b/ReservaB";
import RodizioB from "@/components/home-b/RodizioB";
import VinhoDaCasa from "@/components/home-b/VinhoDaCasa";
import VisiteB from "@/components/home-b/VisiteB";
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
    // As fontes da B entram por variável CSS só nesta página.
    <div className={`${instrument.variable} ${pinyon.variable}`}>
      <HeroB />
      <GaleriaCasaB />
      <Marquee amarela />
      <CozinhaB />
      {maisPedido?.id === "camarao-empanado" ? (
        <IntroCamarao nome={maisPedido.nome} fadeTopo="var(--color-creme)" letreiro>
          <PratoAssinaturaB prato={maisPedido} entradaPeloVideo />
        </IntroCamarao>
      ) : (
        maisPedido && <PratoAssinaturaB prato={maisPedido} />
      )}
      {home.destaques.length > 0 && <Destaques pratos={home.destaques} letreiro />}
      <RodizioB />
      <GaleriaB />
      <VinhoDaCasa />
      <MosaicoB />
      {executivo.ativo && <ExecutivoB executivo={executivo} />}
      <MuralB />
      <AvaliacoesB />
      <ReservaB />
      <VisiteB />
    </div>
  );
}
