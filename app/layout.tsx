import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";

import "./globals.css";

import { BootProvider } from "@/components/motion/Boot";
import Preloader from "@/components/motion/Preloader";
import ScrollProgress from "@/components/motion/ScrollProgress";
import ScrollRefresh from "@/components/motion/ScrollRefresh";
import SmoothAnchors from "@/components/motion/SmoothAnchors";
import SmoothScroll from "@/components/motion/SmoothScroll";
import BottomNav from "@/components/layout/BottomNav";
import FloatingCta from "@/components/layout/FloatingCta";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { openingHoursSpecification } from "@/lib/hours";
import { site } from "@/lib/site";

/**
 * Serifada de traço fino e itálico muito desenhado — os títulos do site são
 * em itálico, e é aí que ela brilha. Não compete com a Didone do logo: fica
 * um grau mais delicada, o que é o tom que a marca pede.
 */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

/** Geométrica, como a usada nas peças impressas do cardápio. */
const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.nome} — Cozinha italiana contemporânea`,
    template: `%s · ${site.nomeCurto}`,
  },
  description: site.descricao,
  applicationName: site.nome,
  keywords: [
    "restaurante italiano",
    "risoto",
    "massas",
    "Red Angus",
    "almoço executivo",
    site.endereco.cidade,
  ],
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: site.nome,
    title: `${site.nome} — Cozinha italiana contemporânea`,
    description: site.descricao,
    url: site.url,
  },
  twitter: { card: "summary_large_image" },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#2b0710",
  colorScheme: "light",
};

/**
 * Dados estruturados do restaurante.
 *
 * `aggregateRating` está propositalmente fora: os depoimentos ainda são
 * placeholder, e publicar nota agregada inventada é desinformação na busca.
 */
const dadosEstruturados = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: site.nome,
  description: site.descricao,
  url: site.url,
  telephone: site.telefone,
  servesCuisine: ["Italiana", "Contemporânea"],
  priceRange: "$$$",
  acceptsReservations: true,
  hasMenu: `${site.url}/cardapio`,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.endereco.rua,
    addressLocality: site.endereco.cidade,
    addressRegion: site.endereco.uf,
    postalCode: site.endereco.cep,
    addressCountry: "BR",
  },
  sameAs: [site.redes.instagram],
  openingHoursSpecification: openingHoursSpecification(),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${cormorant.variable} ${jost.variable} h-full`}
    >
      <body className="min-h-full">
        <BootProvider>
          <SmoothScroll />
          <ScrollRefresh />
          <SmoothAnchors />
          <ScrollProgress />
          <Preloader />

          <a
            href="#conteudo"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-full focus:bg-ambar focus:px-5 focus:py-3 focus:text-sm focus:font-medium focus:text-noite"
          >
            Pular para o conteúdo
          </a>

          <Header />

          <main id="conteudo">{children}</main>

          <Footer />
          <BottomNav />
          <FloatingCta />
        </BootProvider>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(dadosEstruturados),
          }}
        />
      </body>
    </html>
  );
}
