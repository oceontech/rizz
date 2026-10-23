import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import LoginForm from "@/components/admin/LoginForm";
import Logo from "@/components/brand/Logo";
import foto from "@/assets/img/salao-claraboia-vinho.webp";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { de } = await searchParams;

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      {/* Lado da marca — só no desktop, flutuante como a sidebar */}
      <section className="hidden p-3 lg:block">
        <div className="relative h-full overflow-hidden rounded-[28px] bg-sidebar">
          <Image
            src={foto}
            alt=""
            fill
            priority
            placeholder="blur"
            sizes="55vw"
            className="object-cover opacity-55"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/10" />
          <div className="relative flex h-full flex-col justify-between p-12 text-white">
            <Logo variante="branca" className="h-auto w-36" sizes="144px" />
            <div className="max-w-md">
              <p className="text-[0.7rem] font-semibold tracking-[0.12em] text-white/60 uppercase">Painel do restaurante</p>
              <h1 className="mt-3 text-4xl leading-[1.1] font-semibold tracking-tight text-balance">
                Cardápio, reservas e clientes num só lugar.
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-white/70">
                Altere preços, marque pratos esgotados, publique promoções e acompanhe a fidelidade. Tudo
                reflete no site na hora.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Formulário */}
      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <Logo variante="vinho" className="mb-8 h-auto w-28 lg:hidden dark:hidden" sizes="112px" />
            <Logo variante="branca" className="mb-8 hidden h-auto w-28 dark:block lg:dark:hidden" sizes="112px" />
            <h2 className="text-2xl leading-8 font-semibold tracking-tight">Bem-vindo de volta</h2>
            <p className="mt-1.5 text-sm text-muted-foreground">Entre com o e-mail e a senha do painel.</p>
          </div>
          <div className="rounded-3xl bg-card p-6 shadow-suave sm:p-7">
            <LoginForm de={typeof de === "string" ? de : undefined} />
          </div>
          <p className="mt-6 text-center lg:text-left">
            {/* <a> de propósito: o site é outro root layout, a navegação é completa. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/"
              className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" /> Voltar para o site
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
