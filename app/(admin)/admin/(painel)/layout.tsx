import Shell from "@/components/admin/Shell";
import { exigirSessao } from "@/lib/auth";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const sessao = await exigirSessao();
  const [{ n }] = await sql`select count(*)::int as n from reservas where status = 'pendente'`;

  return (
    <Shell usuario={{ nome: sessao.nome, email: sessao.email }} pendentes={Number(n)}>
      {children}
    </Shell>
  );
}
