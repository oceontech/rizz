"use client";

import {
  CalendarPlus,
  Check,
  ChevronRight,
  CircleX,
  Clock,
  Heart,
  Loader2,
  MapPin,
  MessageCircle,
  Navigation,
  Pencil,
  Phone,
  UserX,
} from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import ReservaOnline from "@/components/reservas/ReservaOnline";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/sistema/ui/alert-dialog";
import { dataPorExtenso } from "@/lib/reservas/regras";
import { enderecoLinha, site, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

type Status = "confirmada" | "pendente" | "cancelada" | "concluida" | "nao_compareceu";

export type DadosReserva = {
  codigo: string;
  status: Status;
  nome: string;
  pessoas: number;
  data: string;
  hora: string;
  ocasiao: string | null;
  obs: string | null;
};

const TEXTOS: Record<Status, { eyebrow: string; titulo: string; Icone: typeof Check; tom: string }> = {
  confirmada: { eyebrow: "Reserva confirmada", titulo: "Sua mesa está reservada", Icone: Check, tom: "bg-primary text-white" },
  pendente: { eyebrow: "Pedido recebido", titulo: "Estamos conferindo sua mesa", Icone: Clock, tom: "bg-ambar text-white" },
  cancelada: { eyebrow: "Reserva cancelada", titulo: "Reserva cancelada", Icone: CircleX, tom: "bg-superficie text-muted-foreground" },
  concluida: { eyebrow: "Obrigado pela visita", titulo: "Foi um prazer receber você", Icone: Heart, tom: "bg-primary text-white" },
  nao_compareceu: { eyebrow: "Reserva encerrada", titulo: "Sentimos sua falta", Icone: UserX, tom: "bg-superficie text-muted-foreground" },
};

function pluralPessoas(n: number) {
  return `${n} ${n === 1 ? "pessoa" : "pessoas"}`;
}

/** Linha de lista no estilo dos Ajustes do iPhone. */
function Linha({
  icone: Icone,
  children,
  perigo,
  ...props
}: React.ComponentProps<"button"> & { icone: typeof Check; perigo?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      className="flex w-full items-center gap-3.5 px-5 py-4 text-left text-[17px] transition-colors outline-none hover:bg-superficie-hover focus-visible:bg-superficie-hover"
    >
      <Icone className={cn("size-5 shrink-0", perigo ? "text-negativo" : "text-primary-texto")} strokeWidth={1.75} />
      <span className={cn("grow", perigo && "text-negativo")}>{children}</span>
      <ChevronRight className="size-4 text-texto-terciario" />
    </button>
  );
}

/**
 * Link pessoal da reserva: confirmação logo depois de reservar e, depois,
 * onde o cliente salva na agenda, vê como chegar, altera ou cancela.
 */
export default function GerenciarReserva({
  reserva: r,
  editavel,
  nova,
  ocasiao,
}: {
  reserva: DadosReserva;
  editavel: boolean;
  nova: boolean;
  ocasiao: string | null;
}) {
  const router = useRouter();
  const reduzir = useReducedMotion();
  const [modo, setModo] = useState<"ver" | "alterar">("ver");
  const [cancelando, setCancelando] = useState(false);
  const [pendente, setPendente] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const ativa = r.status === "confirmada" || r.status === "pendente";
  const t = TEXTOS[r.status];
  const primeiroNome = r.nome.split(" ")[0];

  async function cancelar() {
    setPendente(true);
    setErro(null);
    try {
      const resposta = await fetch(`/api/reservas/${r.codigo}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ acao: "cancelar" }),
      });
      const j = (await resposta.json()) as { ok: boolean; erro?: string };
      if (!j.ok) return setErro(j.erro ?? "Não foi possível cancelar.");
      setCancelando(false);
      router.refresh();
    } catch {
      setErro("Sem conexão. Tente de novo.");
    } finally {
      setPendente(false);
    }
  }

  if (modo === "alterar") {
    return (
      <ReservaOnline
        alterando={{ codigo: r.codigo, pessoas: r.pessoas, data: r.data, hora: r.hora, nome: r.nome }}
        onCancelar={() => setModo("ver")}
        onAlterada={() => {
          setModo("ver");
          window.scrollTo({ top: 0 });
          router.refresh();
        }}
      />
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 pt-10 pb-20 sm:px-6 sm:pt-16">
      <div className="flex flex-col items-center text-center">
        <motion.span
          initial={reduzir ? false : { scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 380, damping: 18, delay: 0.05 }}
          className={cn("grid size-16 place-items-center rounded-full shadow-elevado", t.tom)}
        >
          <t.Icone className="size-8" strokeWidth={2.25} />
        </motion.span>
        <p className="mt-6 text-[13px] font-semibold text-primary-texto">{t.eyebrow}</p>
        <h1 className="mt-1.5 text-[1.875rem] leading-[1.15] font-semibold tracking-[-0.02em] text-balance sm:text-[2.25rem]">
          {nova && r.status === "confirmada" ? `Tudo certo, ${primeiroNome}!` : t.titulo}
        </h1>
        {r.status === "pendente" && (
          <p className="mt-3 max-w-md text-[17px] leading-relaxed text-muted-foreground">
            A equipe confirma pelo WhatsApp em breve. Seu horário já está guardado.
          </p>
        )}
        {nova && r.status === "confirmada" && (
          <p className="mt-3 max-w-md text-[17px] leading-relaxed text-muted-foreground">
            Guarde este link: é por ele que você altera ou cancela a reserva, se precisar.
          </p>
        )}
      </div>

      {/* Bilhete da reserva */}
      <motion.div
        initial={reduzir ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className={cn("mt-10 overflow-hidden rounded-3xl bg-superficie", r.status === "cancelada" && "opacity-60")}
      >
        <div className="flex items-center gap-4 p-5 sm:p-6">
          <div className="grid w-16 shrink-0 place-items-center rounded-2xl bg-white py-2 text-center shadow-suave">
            <span className="text-[11px] font-semibold text-primary-texto uppercase">
              {new Date(`${r.data}T12:00`).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
            </span>
            <span className="numeros text-[26px] leading-tight font-semibold">{Number(r.data.slice(8, 10))}</span>
          </div>
          <div className="min-w-0">
            <p className={cn("text-[19px] leading-snug font-semibold tracking-tight first-letter:uppercase", r.status === "cancelada" && "line-through")}>
              {dataPorExtenso(r.data)}
            </p>
            <p className="numeros mt-0.5 text-[15px] text-muted-foreground">
              {r.hora} · {pluralPessoas(r.pessoas)}
            </p>
          </div>
        </div>
        <dl className="divide-y divide-black/[0.06] border-t border-black/[0.06] px-5 sm:px-6">
          {[
            ["Em nome de", r.nome],
            ...(ocasiao ? [["Ocasião", ocasiao]] : []),
            ...(r.obs ? [["Observações", r.obs]] : []),
          ].map(([rotulo, valor]) => (
            <div key={rotulo} className="flex justify-between gap-4 py-3.5 text-[15px]">
              <dt className="shrink-0 text-muted-foreground">{rotulo}</dt>
              <dd className="min-w-0 text-right font-medium">{valor}</dd>
            </div>
          ))}
        </dl>
      </motion.div>

      {ativa ? (
        <>
          <div className="mt-6 grid gap-2.5 sm:grid-cols-2">
            {/* <a> comum: é um arquivo, não uma página para o roteador do Next. */}
            <a
              href={`/api/reservas/${r.codigo}/ics`}
              download
              className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-primary px-6 text-[17px] font-semibold text-white transition-[background-color,transform] hover:bg-primary-hover active:scale-[0.98]"
            >
              <CalendarPlus className="size-5" /> Salvar na agenda
            </a>
            <a
              href={site.mapaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-[52px] items-center justify-center gap-2 rounded-full bg-superficie px-6 text-[17px] font-semibold transition-[background-color,transform] hover:bg-superficie-hover active:scale-[0.98]"
            >
              <Navigation className="size-5" /> Como chegar
            </a>
          </div>

          {editavel ? (
            <div className="mt-8 divide-y divide-black/[0.06] overflow-hidden rounded-3xl bg-superficie">
              <Linha icone={Pencil} onClick={() => setModo("alterar")}>
                Alterar dia, horário ou pessoas
              </Linha>
              <Linha icone={CircleX} perigo onClick={() => setCancelando(true)}>
                Cancelar reserva
              </Linha>
            </div>
          ) : (
            <p className="mt-8 rounded-3xl bg-superficie px-5 py-4 text-[15px] leading-relaxed text-muted-foreground">
              Precisa mudar algo?{" "}
              <a
                href={whatsappLink("Olá! Preciso falar sobre a minha reserva no Rizz.")}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary-texto underline-offset-4 hover:underline"
              >
                Fale com a gente no WhatsApp
              </a>
              .
            </p>
          )}
        </>
      ) : (
        <div className="mt-8 flex justify-center">
          <Link
            href="/reservas"
            className="flex h-[52px] items-center justify-center rounded-full bg-primary px-8 text-[17px] font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            Fazer nova reserva
          </Link>
        </div>
      )}

      <div className="mt-12 flex flex-col gap-3 border-t border-border pt-8 text-[15px]">
        <a
          href={site.mapaLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-start gap-3 text-muted-foreground transition-colors hover:text-foreground"
        >
          <MapPin className="mt-0.5 size-[18px] shrink-0" strokeWidth={1.75} /> {enderecoLinha}
        </a>
        <a href={`tel:${site.telefoneLink}`} className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground">
          <Phone className="size-[18px] shrink-0" strokeWidth={1.75} /> {site.telefone}
        </a>
        <a
          href={whatsappLink("Olá! Tenho uma dúvida sobre a minha reserva no Rizz.")}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 text-muted-foreground transition-colors hover:text-foreground"
        >
          <MessageCircle className="size-[18px] shrink-0" strokeWidth={1.75} /> WhatsApp
        </a>
        <p className="mt-2 text-[13px] leading-relaxed text-texto-terciario">
          Se for se atrasar ou mudar de planos, avise a gente: a mesa pode receber outra pessoa.
        </p>
      </div>

      <AlertDialog open={cancelando} onOpenChange={(v) => !pendente && setCancelando(v)}>
        <AlertDialogContent className="rounded-[28px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[19px] font-semibold">Cancelar esta reserva?</AlertDialogTitle>
            <AlertDialogDescription className="text-[15px]">
              {dataPorExtenso(r.data)} às {r.hora}. O horário fica livre para outra pessoa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {erro && (
            <p role="alert" className="text-[15px] text-negativo-texto">
              {erro}
            </p>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel className="h-11 rounded-full" disabled={pendente}>
              Manter reserva
            </AlertDialogCancel>
            <button
              type="button"
              onClick={cancelar}
              disabled={pendente}
              className="flex h-11 items-center justify-center gap-2 rounded-full bg-negativo px-5 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {pendente && <Loader2 className="size-4 animate-spin" />}
              Sim, cancelar
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
