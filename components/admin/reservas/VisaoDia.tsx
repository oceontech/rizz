"use client";

import { format, parse } from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight, Plus, Users } from "lucide-react";
import { useMemo, useState } from "react";

import { avisar } from "@/components/admin/campos";
import { Selo } from "@/components/admin/ui";
import { EstadoVazio } from "@/components/sistema/estados/estado-vazio";
import { ItemEscalonado, ListaEscalonada } from "@/components/sistema/movimento";
import { Calendario } from "@/components/sistema/pickers/calendario";
import { PainelAdaptavel } from "@/components/sistema/pickers/painel-adaptavel";
import { Button } from "@/components/sistema/ui/button";
import { Card } from "@/components/sistema/ui/card";
import type { Reserva } from "@/lib/admin/consultas";
import { formatarData, mascaraTelefone } from "@/lib/admin/formato";
import { definirMesa } from "@/lib/admin/reservas-actions";
import {
  diaDaSemana,
  lotacaoDoTurno,
  NOME_TURNO,
  picoDoTurno,
  rotuloOcasiao,
  somarDias,
  STATUS_ATIVOS,
  turnoDaHora,
  turnosDoDia,
  type Bloqueio,
  type ReservasConfig,
  type Turno,
} from "@/lib/reservas/regras";
import { cn } from "@/lib/utils";

import { AcaoRapida, MenuReserva, STATUS } from "./compartilhado";

const ativa = (r: Reserva) => (STATUS_ATIVOS as readonly string[]).includes(r.status);
const NOMES_DIA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

/** Campo de mesa que salva ao sair (ou no Enter), sem abrir o editor. */
function CampoMesa({ r }: { r: Reserva }) {
  const [valor, setValor] = useState(r.mesa ?? "");
  const [salvo, setSalvo] = useState(r.mesa ?? "");

  async function salvar() {
    if (valor.trim() === salvo) return;
    const res = await definirMesa(r.id, valor);
    if (avisar(res, valor.trim() ? `Mesa ${valor.trim()}` : "Mesa removida")) setSalvo(valor.trim());
  }

  return (
    <label className="flex h-9 w-28 items-center gap-1.5 rounded-full bg-muted px-3 text-sm transition-[box-shadow] focus-within:ring-3 focus-within:ring-primary-suave">
      <span className="shrink-0 text-xs font-medium text-muted-foreground">Mesa</span>
      <input
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        onBlur={salvar}
        onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
        aria-label={`Mesa de ${r.nome}`}
        placeholder="—"
        className="numeros w-full min-w-0 bg-transparent font-medium outline-none placeholder:text-texto-terciario"
      />
    </label>
  );
}

function CartaoReserva({
  r,
  hoje,
  onEditar,
  onExcluir,
}: {
  r: Reserva;
  hoje: string;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const ocasiao = rotuloOcasiao(r.ocasiao);
  const apagada = r.status === "cancelada" || r.status === "nao_compareceu";
  return (
    <Card className={cn("gap-3 transition-shadow hover:shadow-elevado", apagada && "opacity-60")} size="sm">
      <div className="flex items-start justify-between gap-3 px-(--card-spacing)">
        <button type="button" onClick={onEditar} className="min-w-0 text-left outline-none">
          <p className="truncate text-[15px] font-semibold hover:underline">{r.nome}</p>
          <p className="numeros text-[13px] text-muted-foreground">
            {r.telefone ? mascaraTelefone(r.telefone) : "sem telefone"}
            {r.origem === "site" ? " · pelo site" : ""}
          </p>
        </button>
        <div className="flex shrink-0 items-center gap-1.5">
          <span className="numeros inline-flex h-6 items-center gap-1 rounded-full bg-muted px-2.5 text-xs font-semibold">
            <Users className="size-3 text-muted-foreground" />
            {r.pessoas}
          </span>
          <Selo tom={STATUS[r.status].tom} ponto>
            {STATUS[r.status].rotulo}
          </Selo>
        </div>
      </div>
      {(ocasiao || r.obs) && (
        <div className="flex flex-wrap items-center gap-2 px-(--card-spacing) text-[13px]">
          {ocasiao && <Selo tom="atencao">{ocasiao}</Selo>}
          {r.obs && <span className="text-muted-foreground">{r.obs}</span>}
        </div>
      )}
      <div className="flex items-center justify-between gap-2 px-(--card-spacing)">
        <CampoMesa r={r} />
        <div className="flex items-center gap-1">
          <AcaoRapida r={r} hoje={hoje} />
          <MenuReserva r={r} onEditar={onEditar} onExcluir={onExcluir} />
        </div>
      </div>
    </Card>
  );
}

function ResumoTurno({
  turno,
  reservas,
  config,
  bloqueios,
  dia,
}: {
  turno: Turno;
  reservas: Reserva[];
  config: ReservasConfig;
  bloqueios: Bloqueio[];
  dia: string;
}) {
  const lotacao = lotacaoDoTurno(config, bloqueios, dia, turno);
  const ocupantes = reservas.map((r) => ({ id: r.id, hora: r.hora!, pessoas: r.pessoas }));
  const pico = picoDoTurno(config, ocupantes);
  const pessoas = reservas.reduce((s, r) => s + r.pessoas, 0);
  const pct = lotacao > 0 ? Math.min(100, (pico / lotacao) * 100) : 100;
  const bloqueio = bloqueios.find((b) => b.data === dia && (b.turno === null || b.turno === turno));

  return (
    <Card className="gap-3">
      <div className="flex items-baseline justify-between gap-3 px-(--card-spacing)">
        <p className="text-[13px] font-medium text-muted-foreground">{NOME_TURNO[turno]}</p>
        <p className="numeros text-[13px] text-muted-foreground">
          {reservas.length} {reservas.length === 1 ? "reserva" : "reservas"}
        </p>
      </div>
      <p className="numeros px-(--card-spacing) text-[2rem] leading-none font-semibold tracking-tight">
        {pessoas} <span className="text-base font-medium text-muted-foreground">pessoas</span>
      </p>
      <div className="px-(--card-spacing)">
        <div
          className="h-2 overflow-hidden rounded-full bg-muted"
          role="meter"
          aria-valuenow={pico}
          aria-valuemin={0}
          aria-valuemax={lotacao}
          aria-label={`Pico de ocupação no ${NOME_TURNO[turno].toLowerCase()}`}
        >
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-500",
              pct >= 90 ? "bg-negativo" : pct >= 70 ? "bg-atencao" : "bg-primary",
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="numeros mt-2 text-[13px] text-muted-foreground">
          {lotacao > 0 ? `Pico de ${pico} de ${lotacao} lugares` : "Fechado para reservas"}
          {bloqueio?.motivo ? ` · ${bloqueio.motivo}` : ""}
        </p>
      </div>
    </Card>
  );
}

/** Semana do dia escolhido, de segunda a domingo, com as pessoas reservadas em cada dia. */
function FaixaSemana({
  dia,
  hoje,
  reservas,
  aoEscolher,
}: {
  dia: string;
  hoje: string;
  reservas: Reserva[];
  aoEscolher: (d: string) => void;
}) {
  const inicio = somarDias(dia, -((diaDaSemana(dia) + 6) % 7));
  const dias = Array.from({ length: 7 }, (_, i) => somarDias(inicio, i));
  return (
    <div role="radiogroup" aria-label="Dias da semana" className="grid grid-cols-7 gap-1.5 rounded-2xl bg-card p-1.5 shadow-suave">
      {dias.map((d) => {
        const pessoas = reservas
          .filter((r) => r.data === d && ativa(r))
          .reduce((s, r) => s + r.pessoas, 0);
        const escolhido = d === dia;
        const fechado = turnosDoDia(d).length === 0;
        return (
          <button
            key={d}
            type="button"
            role="radio"
            aria-checked={escolhido}
            onClick={() => aoEscolher(d)}
            className={cn(
              "flex flex-col items-center gap-0.5 rounded-xl py-2 text-center transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-primary-suave",
              escolhido ? "bg-primary text-primary-foreground" : "hover:bg-muted",
            )}
          >
            <span className={cn("text-[0.68rem] font-medium uppercase", !escolhido && "text-muted-foreground")}>
              {NOMES_DIA[diaDaSemana(d)]}
            </span>
            <span
              className={cn(
                "numeros text-lg leading-tight font-semibold",
                d === hoje && !escolhido && "text-primary-texto",
              )}
            >
              {d.slice(8, 10)}
            </span>
            <span
              className={cn(
                "numeros text-[0.68rem]",
                escolhido ? "text-primary-foreground/80" : fechado ? "text-texto-terciario" : "text-muted-foreground",
              )}
            >
              {fechado ? "fechado" : pessoas ? `${pessoas} pess.` : "—"}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * A tela da recepção: um dia por vez, resumo por turno e as reservas em
 * ordem de chegada, com as ações do momento a um toque.
 */
export default function VisaoDia({
  reservas,
  config,
  bloqueios,
  hoje,
  onNova,
  onEditar,
  onExcluir,
}: {
  reservas: Reserva[];
  config: ReservasConfig;
  bloqueios: Bloqueio[];
  hoje: string;
  onNova: (dia: string) => void;
  onEditar: (r: Reserva) => void;
  onExcluir: (r: Reserva) => void;
}) {
  const [dia, setDia] = useState(hoje);
  const [calendario, setCalendario] = useState(false);

  const doDia = useMemo(
    () => reservas.filter((r) => r.data === dia).sort((a, b) => (a.hora ?? "99").localeCompare(b.hora ?? "99")),
    [reservas, dia],
  );
  const ativas = doDia.filter(ativa);
  const encerradas = doDia.filter((r) => !ativa(r));

  const turnos = turnosDoDia(dia).map((t) => t.turno);
  const porTurno = (t: Turno) => ativas.filter((r) => r.hora && turnoDaHora(dia, r.hora) === t);

  const mapa = new Map<string, Reserva[]>();
  for (const r of ativas) {
    const chave = r.hora ?? "Sem horário";
    mapa.set(chave, [...(mapa.get(chave) ?? []), r]);
  }
  const grupos = [...mapa.entries()];

  const rotuloDia =
    dia === hoje ? "Hoje" : dia === somarDias(hoje, 1) ? "Amanhã" : dia === somarDias(hoje, -1) ? "Ontem" : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5">
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-card shadow-suave hover:bg-accent"
            aria-label="Dia anterior"
            onClick={() => setDia(somarDias(dia, -1))}
          >
            <ChevronLeft />
          </Button>
          <PainelAdaptavel
            aberto={calendario}
            aoMudar={setCalendario}
            titulo="Ir para o dia"
            gatilho={
              <button
                type="button"
                className="flex h-10 min-w-0 items-center gap-2.5 rounded-full px-3 text-left outline-none transition-colors hover:bg-card focus-visible:ring-3 focus-visible:ring-primary-suave aria-expanded:bg-card"
              >
                <CalendarDays className="size-4 shrink-0 text-primary-texto" />
                <span className="min-w-0">
                  <span className="block text-[15px] leading-tight font-semibold first-letter:uppercase">
                    {rotuloDia ?? formatarData(dia, { weekday: "long" })}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {formatarData(dia, { day: "2-digit", month: "long", year: "numeric" })}
                  </span>
                </span>
              </button>
            }
          >
            <Calendario
              mode="single"
              selected={parse(dia, "yyyy-MM-dd", new Date())}
              defaultMonth={parse(dia, "yyyy-MM-dd", new Date())}
              onSelect={(d) => {
                if (d) setDia(format(d, "yyyy-MM-dd"));
                setCalendario(false);
              }}
              className="mx-auto"
            />
          </PainelAdaptavel>
          <Button
            size="icon"
            variant="secondary"
            className="rounded-full bg-card shadow-suave hover:bg-accent"
            aria-label="Próximo dia"
            onClick={() => setDia(somarDias(dia, 1))}
          >
            <ChevronRight />
          </Button>
          {dia !== hoje && (
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setDia(hoje)}>
              Hoje
            </Button>
          )}
        </div>
        <Button variant="secondary" className="rounded-full bg-card shadow-suave hover:bg-accent" onClick={() => onNova(dia)}>
          <Plus /> Reserva neste dia
        </Button>
      </div>

      <FaixaSemana dia={dia} hoje={hoje} reservas={reservas} aoEscolher={setDia} />

      {turnos.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 md:gap-4">
          {turnos.map((t) => (
            <ResumoTurno key={t} turno={t} reservas={porTurno(t)} config={config} bloqueios={bloqueios} dia={dia} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl bg-card px-5 py-4 text-sm text-muted-foreground shadow-suave">
          O restaurante não abre neste dia da semana.
        </p>
      )}

      {grupos.length === 0 ? (
        <Card>
          <EstadoVazio
            icone={CalendarDays}
            titulo="Nenhuma reserva para este dia"
            descricao="As reservas do site aparecem aqui sozinhas. Pedidos por telefone entram pelo botão abaixo."
            acao={
              <Button className="rounded-full" onClick={() => onNova(dia)}>
                <Plus /> Registrar reserva
              </Button>
            }
          />
        </Card>
      ) : (
        <ListaEscalonada key={dia} className="mt-2 flex flex-col gap-5">
          {grupos.map(([hora, lista]) => (
            <ItemEscalonado key={hora} className="grid gap-3 md:grid-cols-[5.5rem_1fr]">
              <div className="flex items-baseline gap-2 md:flex-col md:gap-0.5 md:pt-4">
                <p className="numeros text-xl font-semibold tracking-tight">{hora}</p>
                <p className="numeros text-[13px] text-muted-foreground">
                  {lista.reduce((s, r) => s + r.pessoas, 0)} pessoas
                </p>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {lista.map((r) => (
                  <CartaoReserva
                    key={`${r.id}-${r.mesa ?? ""}`}
                    r={r}
                    hoje={hoje}
                    onEditar={() => onEditar(r)}
                    onExcluir={() => onExcluir(r)}
                  />
                ))}
              </div>
            </ItemEscalonado>
          ))}
        </ListaEscalonada>
      )}

      {encerradas.length > 0 && (
        <details className="group mt-2">
          <summary className="flex w-fit cursor-pointer list-none items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground">
            <ChevronRight className="size-4 transition-transform group-open:rotate-90" />
            Canceladas e faltas ({encerradas.length})
          </summary>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {encerradas.map((r) => (
              <CartaoReserva key={r.id} r={r} hoje={hoje} onEditar={() => onEditar(r)} onExcluir={() => onExcluir(r)} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
