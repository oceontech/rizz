"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import ReservaOnline from "@/components/reservas/ReservaOnline";
import { BotaoLink } from "@/components/ui/Botao";
import { site, whatsappLink } from "@/lib/site";

const acao =
  "text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-creme/60 underline-offset-[6px] transition-colors hover:text-ambar hover:underline disabled:opacity-50";

/** Ações do link pessoal: agenda, rota, alterar e cancelar (com confirmação em duas etapas). */
export default function GerenciarReserva({
  codigo,
  editavel,
  ativa,
  atual,
}: {
  codigo: string;
  editavel: boolean;
  ativa: boolean;
  atual: { pessoas: number; data: string; hora: string };
}) {
  const router = useRouter();
  const [modo, setModo] = useState<"ver" | "alterar" | "cancelar">("ver");
  const [pendente, setPendente] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function cancelar() {
    setPendente(true);
    setErro(null);
    try {
      const r = await fetch(`/api/reservas/${codigo}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ acao: "cancelar" }),
      });
      const j = (await r.json()) as { ok: boolean; erro?: string };
      if (!j.ok) return setErro(j.erro ?? "Não foi possível cancelar.");
      setModo("ver");
      router.refresh();
    } catch {
      setErro("Sem conexão. Tente de novo.");
    } finally {
      setPendente(false);
    }
  }

  if (!ativa) {
    return (
      <div className="mt-12">
        <BotaoLink href="/reservas" tamanho="lg">
          Fazer nova reserva
        </BotaoLink>
      </div>
    );
  }

  if (modo === "alterar") {
    return (
      <div className="mt-12 border-t border-creme/10 pt-10">
        <div className="mb-8 flex items-baseline justify-between gap-4">
          <p className="eyebrow text-ambar">Alterar reserva</p>
          <button type="button" className={acao} onClick={() => setModo("ver")}>
            Voltar
          </button>
        </div>
        <ReservaOnline
          alterando={{ codigo, ...atual }}
          onAlterada={() => {
            setModo("ver");
            router.refresh();
          }}
        />
      </div>
    );
  }

  return (
    <div className="mt-12">
      <div className="flex flex-wrap gap-3">
        {/* <a> comum: é um arquivo, não uma página para o roteador do Next. */}
        <a
          href={`/api/reservas/${codigo}/ics`}
          download
          className="inline-flex h-14 items-center justify-center rounded-full bg-ambar px-8 text-xs font-medium uppercase tracking-[0.08em] text-noite transition-colors duration-500 hover:bg-ouro-claro"
        >
          Salvar na agenda
        </a>
        <BotaoLink href={site.mapaLink} variante="contorno" tamanho="lg">
          Como chegar
        </BotaoLink>
      </div>

      {editavel ? (
        modo === "cancelar" ? (
          <div className="mt-10 rounded-2xl border border-creme/10 p-6">
            <p className="font-display text-xl italic text-creme">Cancelar esta reserva?</p>
            <p className="mt-2 text-sm text-creme/60">O horário fica livre para outra pessoa.</p>
            {erro && (
              <p role="alert" className="mt-4 text-sm text-ambar">
                {erro}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <button
                type="button"
                onClick={cancelar}
                disabled={pendente}
                className="inline-flex h-11 items-center rounded-full border border-creme/30 px-6 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-creme transition-colors hover:border-ambar hover:text-ambar disabled:opacity-50"
              >
                {pendente ? "Cancelando…" : "Sim, cancelar"}
              </button>
              <button type="button" className={acao} onClick={() => setModo("ver")} disabled={pendente}>
                Manter reserva
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4">
            <button type="button" className={acao} onClick={() => setModo("alterar")}>
              Alterar dia, horário ou pessoas
            </button>
            <button type="button" className={acao} onClick={() => setModo("cancelar")}>
              Cancelar reserva
            </button>
          </div>
        )
      ) : (
        <p className="mt-10 text-sm text-creme/55">
          Precisa mudar algo?{" "}
          <a
            href={whatsappLink("Olá! Preciso falar sobre a minha reserva no Rizz.")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ambar underline-offset-4 hover:underline"
          >
            Fale com a gente no WhatsApp
          </a>
          .
        </p>
      )}
    </div>
  );
}
