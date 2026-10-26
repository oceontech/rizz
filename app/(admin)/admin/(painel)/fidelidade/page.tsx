import { Heart, Lock } from "lucide-react";
import type { Metadata } from "next";

import { BotaoLink, Cabecalho } from "@/components/admin/ui";
import { Card } from "@/components/sistema/ui/card";
import { exigirSessao } from "@/lib/auth";

export const metadata: Metadata = { title: "Fidelidade" };

/**
 * Trancada até o programa de fidelidade ser lançado. O gestor completo
 * (`components/admin/fidelidade/GestorFidelidade.tsx`) continua no código;
 * para liberar, volte a renderizá-lo aqui e tire `emBreve` do item em nav.ts.
 */
export default async function FidelidadeAdminPage() {
  await exigirSessao();
  return (
    <>
      <Cabecalho titulo="Fidelidade" descricao="Cartão de selos dos clientes, visitas e prêmios." />
      <Card className="items-center px-6 py-14 text-center">
        <span className="relative grid size-16 place-items-center rounded-3xl bg-secao/12 text-secao-texto">
          <Heart className="size-7" strokeWidth={1.75} />
          <span className="absolute -right-1.5 -bottom-1.5 grid size-7 place-items-center rounded-full bg-foreground text-background ring-4 ring-card">
            <Lock className="size-3.5" strokeWidth={2.25} />
          </span>
        </span>
        <div className="max-w-md">
          <p className="text-[0.7rem] font-semibold tracking-[0.1em] text-secao-texto uppercase">Em breve</p>
          <h2 className="mt-2 text-lg font-semibold">O programa de fidelidade ainda não foi lançado</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Quando estiver pronto, esta área libera o cadastro de clientes, o registro de visitas e o resgate de
            prêmios.
          </p>
        </div>
        <BotaoLink href="/admin" variant="secondary">
          Voltar para a visão geral
        </BotaoLink>
      </Card>
    </>
  );
}
