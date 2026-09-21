import type { Metadata } from "next";
import { Cormorant_Garamond, Jost } from "next/font/google";
import Link from "next/link";

import "./globals.css";

import Logo from "@/components/brand/Logo";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["400"],
  style: ["italic"],
});
const jost = Jost({ subsets: ["latin"], variable: "--font-jost" });

export const metadata: Metadata = {
  title: "Página não encontrada · Rizz",
  robots: { index: false },
};

/**
 * 404 de rotas inexistentes. Site e painel têm root layouts separados, então
 * este arquivo monta o próprio <html> (flag `experimental.globalNotFound`).
 */
export default function GlobalNotFound() {
  return (
    <html lang="pt-BR" className={`${cormorant.variable} ${jost.variable}`}>
      <body className="grid min-h-dvh place-items-center bg-noite px-6 text-center text-creme">
        <main className="flex flex-col items-center">
          <Logo variante="branca" decorativo className="h-auto w-28" sizes="112px" />
          <p className="eyebrow mt-12 text-ambar">Erro 404</p>
          <h1 className="mt-4 text-titulo text-creme">Esta página saiu do cardápio</h1>
          <p className="mt-5 max-w-sm text-creme/65">O endereço pode ter mudado. Que tal voltar ao início?</p>
          <Link
            href="/"
            className="mt-10 inline-flex h-12 items-center rounded-full bg-ambar px-7 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-noite transition-colors hover:bg-ouro-claro"
          >
            Voltar ao início
          </Link>
        </main>
      </body>
    </html>
  );
}
