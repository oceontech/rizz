import Destaques from "@/components/home/Destaques";
import IntroCamarao from "@/components/home/IntroCamarao";
import Marquee from "@/components/home/Marquee";
import AvaliacoesB from "@/components/home-b/AvaliacoesB";
import CozinhaB from "@/components/home-b/CozinhaB";
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
import CenasHome from "@/components/motion/CenasHome";
import { executivoDoSite, homeDoSite } from "@/lib/dados";

/**
 * Página inicial (antiga "versão B", promovida em nov/2026; a home anterior
 * foi apagada). Um só tom escuro de fundo, o amarelo com letras misturadas
 * (itálico + caixa alta), hero do celular com o vídeo em arco, "Nossa
 * cozinha" em papel creme, galerias de fotos coladas, o vinho Rizz Syrah,
 * executivo em cartaz e o convite de reserva.
 */
export default async function HomePage() {
  const [executivo, home] = await Promise.all([executivoDoSite(), homeDoSite()]);
  const { maisPedido } = home;

  return (
    <>
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
      {/* Depois de todas as seções: as entradas por atributo (data-anima). */}
      <CenasHome />
    </>
  );
}
