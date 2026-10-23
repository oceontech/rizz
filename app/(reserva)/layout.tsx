import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Geist } from "next/font/google";

import "./reserva.css";

import Logo from "@/components/brand/Logo";
import { ProvedorMovimento } from "@/components/sistema/movimento/provedor-movimento";
import { site } from "@/lib/site";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

/** Só para a prévia do pop-up e detalhes de marca. */
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["500"],
  style: ["italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `Reservas · ${site.nomeCurto}`, template: `%s · ${site.nomeCurto}` },
  applicationName: site.nome,
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
  viewportFit: "cover",
};

/**
 * Root layout próprio da reserva: página branca e focada, sem o cabeçalho,
 * o rodapé e as animações do site. Quem chega aqui veio para reservar.
 */
export default function ReservaLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} ${cormorant.variable} h-full`}>
      <body className="min-h-full">
        <ProvedorMovimento>
          <header className="sticky top-0 z-30 border-b border-border/70 bg-white/80 backdrop-blur-xl backdrop-saturate-150">
            <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 pt-[env(safe-area-inset-top)] sm:h-16 sm:px-6">
              {/* <a> de propósito: o site é outro root layout, a navegação é completa. */}
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a href="/" aria-label={`${site.nome}, página inicial`} className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-primary-suave">
                <Logo variante="vinho" decorativo className="h-auto w-[68px] sm:w-[76px]" sizes="76px" priority />
              </a>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a
                href="/"
                className="rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-superficie hover:text-foreground"
              >
                Voltar ao site
              </a>
            </div>
          </header>
          {children}
        </ProvedorMovimento>
      </body>
    </html>
  );
}
