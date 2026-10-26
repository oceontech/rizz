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
import { executivoDoSite, homeDoSite } from "@/lib/dados";

export default async function HomePage() {
  const [executivo, home] = await Promise.all([executivoDoSite(), homeDoSite()]);
  const { maisPedido } = home;

  return (
    <>
      <Hero />
      <Galeria />
      <Marquee />
      <Manifesto />
      {/* O vídeo de abertura é do camarão: com outro prato, a dobra entra sozinha. */}
      {maisPedido?.id === "camarao-empanado" ? (
        <IntroCamarao nome={maisPedido.nome}>
          <PratoAssinatura prato={maisPedido} entradaPeloVideo />
        </IntroCamarao>
      ) : (
        maisPedido && <PratoAssinatura prato={maisPedido} />
      )}
      {home.destaques.length > 0 && <Destaques pratos={home.destaques} />}
      <Mosaico />
      {executivo.ativo && <Executivo executivo={executivo} />}
      <AvaliacoesResumo />
      <Visite />
    </>
  );
}
