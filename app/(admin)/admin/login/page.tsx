import type { Metadata } from "next";
import Image from "next/image";

import LoginForm from "@/components/admin/LoginForm";
import Logo from "@/components/brand/Logo";
import foto from "@/assets/img/salao-claraboia-vinho.webp";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { de } = await searchParams;

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      {/* Lado da marca — só no desktop */}
      <section className="relative hidden overflow-hidden bg-noite lg:block">
        <Image
          src={foto}
          alt=""
          fill
          priority
          placeholder="blur"
          sizes="55vw"
          className="object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-noite via-noite/60 to-noite/20" />
        <div className="relative flex h-full flex-col justify-between p-12 text-creme">
          <Logo variante="branca" className="h-auto w-44" sizes="176px" />
          <div className="max-w-md">
            <p className="text-xs uppercase tracking-[0.24em] text-ambar">Painel do restaurante</p>
            <h1 className="titulo-display mt-4 text-5xl leading-[1.05]">
              Cardápio, reservas e clientes num só lugar.
            </h1>
            <p className="mt-5 text-sm leading-relaxed text-creme/70">
              Altere preços, marque pratos esgotados, publique promoções e acompanhe o
              programa de fidelidade — tudo reflete no site na hora.
            </p>
          </div>
        </div>
      </section>

      {/* Formulário */}
      <section className="flex items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <Logo variante="vinho" className="h-auto w-32 lg:hidden" sizes="128px" />
            <h2 className="titulo-display mt-6 text-4xl text-accent lg:mt-0">Bem-vindo de volta</h2>
            <p className="mt-2 text-sm text-muted">Entre com o e-mail e a senha do painel.</p>
          </div>
          <LoginForm de={typeof de === "string" ? de : undefined} />
          <p className="mt-8 text-center text-xs text-muted lg:text-left">
            {/* <a> de propósito: o site é outro root layout, a navegação é completa. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/" className="underline-offset-4 hover:text-foreground hover:underline">
              ← Voltar para o site
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
