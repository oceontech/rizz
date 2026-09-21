import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";

import "./admin.css";

import Providers from "@/components/admin/Providers";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["500", "600"],
  style: ["italic"],
});

const jost = Jost({
  subsets: ["latin"],
  variable: "--font-jost",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Painel · Rizz", template: "%s · Painel Rizz" },
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#70012a",
  colorScheme: "light",
};

/**
 * Root layout próprio do painel: outro <html>, outra folha de estilo.
 * O CSS do HeroUI redefine variáveis e bordas globais — isolado aqui, o site
 * público continua exatamente como era.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="pt-BR"
      data-theme="rizz"
      className={`${cormorant.variable} ${jost.variable} light`}
    >
      <body className="min-h-dvh bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
