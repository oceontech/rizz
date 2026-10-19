import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Filete from "@/components/motion/Filete";
import GerenciarReserva from "@/components/reservas/GerenciarReserva";
import { dataPorExtenso, rotuloOcasiao } from "@/lib/reservas/regras";
import { podeMexer, reservaPorCodigo } from "@/lib/reservas/servidor";
import { enderecoLinha, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Sua reserva",
  robots: { index: false, follow: false },
};

const TITULOS = {
  confirmada: { eyebrow: "Reserva confirmada", titulo: "Sua mesa está reservada" },
  pendente: { eyebrow: "Pedido recebido", titulo: "Estamos conferindo sua mesa" },
  cancelada: { eyebrow: "Reserva cancelada", titulo: "Reserva cancelada" },
  concluida: { eyebrow: "Obrigado pela visita", titulo: "Foi um prazer receber você" },
  nao_compareceu: { eyebrow: "Reserva encerrada", titulo: "Sentimos sua falta" },
} as const;

/** Link pessoal da reserva: confirmação logo depois de reservar e, depois, onde o cliente altera ou cancela. */
export default async function MinhaReservaPage({ params, searchParams }: PageProps<"/reservas/[codigo]">) {
  const [{ codigo }, { nova }] = await Promise.all([params, searchParams]);
  const r = await reservaPorCodigo(codigo);
  if (!r) notFound();

  const t = TITULOS[r.status];
  const ocasiao = rotuloOcasiao(r.ocasiao);
  const editavel = podeMexer(r);
  const primeiroNome = r.nome.split(" ")[0];

  return (
    <div className="wrap pb-24 pt-28 md:pb-32 md:pt-44">
      <p className="eyebrow text-ambar">{t.eyebrow}</p>
      <h1 className="mt-5 max-w-3xl font-display text-titulo italic text-creme">
        {nova === "1" && r.status === "confirmada" ? `Tudo certo, ${primeiroNome}!` : t.titulo}
      </h1>
      {r.status === "pendente" && (
        <p className="mt-6 max-w-prose leading-relaxed text-creme/70">
          A equipe confirma pelo WhatsApp em breve. Seu horário já está guardado.
        </p>
      )}
      {nova === "1" && r.status === "confirmada" && (
        <p className="mt-6 max-w-prose leading-relaxed text-creme/70">
          Guarde este link: é por ele que você altera ou cancela a reserva, se precisar.
        </p>
      )}

      <Filete className="mt-10" />

      <div className="mt-12 grid gap-14 md:grid-cols-[1.15fr_1fr] md:gap-24">
        <div>
          <dl className={`grid gap-x-10 gap-y-8 sm:grid-cols-2 ${r.status === "cancelada" ? "opacity-50" : ""}`}>
            <div className="sm:col-span-2">
              <dt className="eyebrow text-creme/45">Quando</dt>
              <dd className="mt-2 font-display text-[1.75rem] italic leading-tight text-creme first-letter:uppercase sm:text-[2.25rem]">
                {dataPorExtenso(r.data)} · {r.hora}
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-creme/45">Pessoas</dt>
              <dd className="mt-2 text-lg text-creme">{r.pessoas}</dd>
            </div>
            <div>
              <dt className="eyebrow text-creme/45">Em nome de</dt>
              <dd className="mt-2 text-lg text-creme">{r.nome}</dd>
            </div>
            {ocasiao && (
              <div>
                <dt className="eyebrow text-creme/45">Ocasião</dt>
                <dd className="mt-2 text-lg text-creme">{ocasiao}</dd>
              </div>
            )}
            {r.obs && (
              <div className="sm:col-span-2">
                <dt className="eyebrow text-creme/45">Observações</dt>
                <dd className="mt-2 leading-relaxed text-creme/75">{r.obs}</dd>
              </div>
            )}
          </dl>

          <GerenciarReserva
            codigo={r.codigo}
            editavel={editavel}
            ativa={r.status === "confirmada" || r.status === "pendente"}
            atual={{ pessoas: r.pessoas, data: r.data, hora: r.hora }}
          />
        </div>

        <aside>
          <h2 className="eyebrow text-ambar">Onde estamos</h2>
          <p className="mt-6 text-sm leading-relaxed">
            <a
              href={site.mapaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-creme/75 transition-colors hover:text-ambar"
            >
              {enderecoLinha}
            </a>
          </p>
          <p className="mt-3 text-sm">
            <a
              href={`tel:${site.telefone.replace(/\s/g, "")}`}
              className="text-creme/75 transition-colors hover:text-ambar"
            >
              {site.telefone}
            </a>
          </p>
          <p className="mt-8 text-xs leading-relaxed text-creme/45">
            Se for se atrasar ou mudar de planos, avise a gente: a mesa pode receber outra pessoa.
          </p>
        </aside>
      </div>
    </div>
  );
}
