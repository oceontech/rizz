import { ShieldOff } from "lucide-react";
import type { Metadata } from "next";

import { BotaoLink } from "@/components/admin/ui";
import { exigirSessao } from "@/lib/auth";
import { AREAS } from "@/lib/permissoes";

export const metadata: Metadata = { title: "Sem acesso" };

export default async function SemAcessoPage({ searchParams }: PageProps<"/admin/sem-acesso">) {
  await exigirSessao();
  const { area } = await searchParams;
  const nome = AREAS.find((a) => a.id === area)?.rotulo;
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
        <ShieldOff className="size-6" strokeWidth={1.75} />
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">Sem acesso{nome ? ` a ${nome}` : ""}</h1>
      <p className="mt-2 text-sm text-pretty text-muted-foreground">
        Seu acesso ao painel não inclui esta área. Se precisar dela, peça a quem administra a equipe em Configurações → Equipe.
      </p>
      <BotaoLink href="/admin" variant="secondary" className="mt-6">
        Voltar ao início
      </BotaoLink>
    </div>
  );
}
