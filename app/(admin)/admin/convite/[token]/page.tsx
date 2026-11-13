import { ArrowLeft, Link2Off } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import FormConvite from "@/components/admin/equipe/FormConvite";
import Logo from "@/components/brand/Logo";
import foto from "@/assets/img/salao-noite-vinho.webp";
import { lerLink } from "@/lib/admin/equipe";
import { papelInfo } from "@/lib/permissoes";

export const metadata: Metadata = { title: "Acesso ao painel", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function ConvitePage({ params }: PageProps<"/admin/convite/[token]">) {
  const { token } = await params;
  const link = await lerLink(token);
  const papel = link ? papelInfo(link.papel) : null;

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.05fr_1fr]">
      <section className="hidden p-3 lg:block">
        <div className="relative h-full overflow-hidden rounded-[28px] bg-sidebar">
          <Image src={foto} alt="" fill priority placeholder="blur" sizes="55vw" className="object-cover opacity-80" />
          <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/10" />
          <div className="relative flex h-full flex-col justify-between p-12 text-white">
            <Logo variante="branca" className="h-auto w-36" sizes="144px" />
            <div className="max-w-md">
              <p className="text-[0.7rem] font-semibold tracking-[0.12em] text-white/60 uppercase">Painel do restaurante</p>
              <h1 className="mt-3 text-4xl leading-[1.1] font-semibold tracking-tight text-balance">
                {!link ? "Acesso ao painel." : link.tipo === "senha" ? "Crie uma senha nova." : "Bem-vindo à equipe."}
              </h1>
              <p className="mt-4 text-[15px] leading-relaxed text-white/70">
                Reservas, cardápio e o site do restaurante num só lugar, no computador ou no celular.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <Logo variante="vinho" className="mb-8 h-auto w-28 lg:hidden dark:hidden" sizes="112px" />
            <Logo variante="branca" className="mb-8 hidden h-auto w-28 dark:block lg:dark:hidden" sizes="112px" />
            {link ? (
              <>
                <h2 className="text-2xl leading-8 font-semibold tracking-tight">
                  {link.tipo === "senha" ? "Nova senha" : `Olá${link.nome ? `, ${link.nome.split(" ")[0]}` : ""}!`}
                </h2>
                <p className="mt-1.5 text-sm text-pretty text-muted-foreground">
                  {link.tipo === "senha"
                    ? "Escolha a senha que você vai usar para entrar no painel."
                    : `${link.convidadoPor ?? "A equipe do Rizz"} convidou você para o painel como ${papel!.rotulo.toLowerCase()}. Confirme seu nome e crie uma senha.`}
                </p>
              </>
            ) : (
              <>
                <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-muted text-muted-foreground">
                  <Link2Off className="size-5" />
                </span>
                <h2 className="text-2xl leading-8 font-semibold tracking-tight">Link indisponível</h2>
                <p className="mt-1.5 text-sm text-pretty text-muted-foreground">
                  Este link venceu, já foi usado ou foi cancelado. Peça um novo a quem administra o painel.
                </p>
              </>
            )}
          </div>
          {link ? (
            <div className="rounded-3xl bg-card p-6 shadow-suave sm:p-7">
              <FormConvite token={token} tipo={link.tipo} nome={link.nome} email={link.email} />
            </div>
          ) : (
            <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-4 hover:underline">
              <ArrowLeft className="size-4" /> Ir para o login
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
