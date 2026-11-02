import { cookies } from "next/headers";

import { COOKIE_SIDEBAR } from "@/components/admin/nav";
import Shell from "@/components/admin/Shell";
import ConteudoSite from "@/components/ConteudoSite";
import { exigirSessao } from "@/lib/auth";
import { carregarConteudo } from "@/lib/conteudo-servidor";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const sessao = await exigirSessao();
  const [loja, [{ n }], conteudo] = await Promise.all([
    cookies(),
    sql`select count(*)::int as n from reservas where status = 'pendente'`,
    carregarConteudo(),
  ]);

  return (
    <Shell
      usuario={{ nome: sessao.nome, email: sessao.email }}
      pendentes={Number(n)}
      recolhidaInicial={loja.get(COOKIE_SIDEBAR)?.value === "recolhida"}
    >
      <ConteudoSite valor={conteudo}>{children}</ConteudoSite>
    </Shell>
  );
}
