import AvaliacoesResumo from "@/components/home/AvaliacoesResumo";
import Destaques from "@/components/home/Destaques";
import Executivo from "@/components/home/Executivo";
import Hero from "@/components/home/Hero";
import IntroCamarao from "@/components/home/IntroCamarao";
import Manifesto from "@/components/home/Manifesto";
import Marquee from "@/components/home/Marquee";
import Mosaico from "@/components/home/Mosaico";
import PratoAssinatura from "@/components/home/PratoAssinatura";
import Visite from "@/components/home/Visite";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Marquee />
      <Manifesto />
      <IntroCamarao>
        <PratoAssinatura entradaPeloVideo />
      </IntroCamarao>
      <Destaques />
      <Mosaico />
      <Executivo />
      <AvaliacoesResumo />
      <Visite />
    </>
  );
}
