import AvaliacoesResumo from "@/components/home/AvaliacoesResumo";
import Destaques from "@/components/home/Destaques";
import Executivo from "@/components/home/Executivo";
import Galeria from "@/components/home/Galeria";
import Hero from "@/components/home/Hero";
import IntroCamarao from "@/components/home/IntroCamarao";
import Manifesto from "@/components/home/Manifesto";
import Marquee from "@/components/home/Marquee";
import Mosaico from "@/components/home/Mosaico";
import PratoAssinatura from "@/components/home/PratoAssinatura";
import Visite from "@/components/home/Visite";
import { executivoDoSite } from "@/lib/dados";

export default async function HomePage() {
  const executivo = await executivoDoSite();

  return (
    <>
      <Hero />
      <Galeria />
      <Marquee />
      <Manifesto />
      <IntroCamarao>
        <PratoAssinatura entradaPeloVideo />
      </IntroCamarao>
      <Destaques />
      <Mosaico />
      {executivo.ativo && <Executivo executivo={executivo} />}
      <AvaliacoesResumo />
      <Visite />
    </>
  );
}
