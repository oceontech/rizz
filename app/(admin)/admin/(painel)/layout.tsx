import { cookies } from "next/headers";

import { COOKIE_SIDEBAR } from "@/components/admin/nav";
import Shell from "@/components/admin/Shell";
import { exigirSessao } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const sessao = await exigirSessao();
  const [loja, [{ n }]] = await Promise.all([
    cookies(),
    sql`select count(*)::int as n from reservas where status = 'pendente'`,
  ]);

  return (
    <Shell
      usuario={{ nome: sessao.nome, email: sessao.email }}
      pendentes={Number(n)}
      recolhidaInicial={loja.get(COOKIE_SIDEBAR)?.value === "recolhida"}
    >
      {children}
    </Shell>
  );
}
