"use client";

import { ChevronLeft, ChevronRight, Persons, Plus } from "@gravity-ui/icons";
import { Button, Card, Chip, EmptyState, Input, TextField } from "@heroui/react";
import { useMemo, useState } from "react";

import { avisar, CampoData } from "@/components/admin/campos";
import type { Reserva } from "@/lib/admin/consultas";
import { formatarData, mascaraTelefone } from "@/lib/admin/formato";
import { definirMesa } from "@/lib/admin/reservas-actions";
import {
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

import { AcaoRapida, MenuReserva, STATUS } from "./compartilhado";

const ativa = (r: Reserva) => (STATUS_ATIVOS as readonly string[]).includes(r.status);

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
    <TextField value={valor} onChange={setValor} aria-label={`Mesa de ${r.nome}`} className="w-24">
      <Input
        placeholder="Mesa"
        className="h-8 text-center text-sm"
        onBlur={salvar}
        onKeyDown={(e) => e.key === "Enter" && (e.currentTarget as HTMLInputElement).blur()}
      />
    </TextField>
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
    <Card className={`gap-3 p-4 ${apagada ? "opacity-60" : ""} ${r.status === "concluida" ? "bg-surface-secondary" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <button type="button" onClick={onEditar} className="min-w-0 text-left">
          <p className="truncate font-medium">{r.nome}</p>
          <p className="text-xs text-muted">{r.telefone ? mascaraTelefone(r.telefone) : "sem telefone"}</p>
        </button>
        <div className="flex shrink-0 items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-default px-2.5 py-1 text-sm font-medium tabular-nums">
            <Persons className="size-3.5 text-muted" />
            {r.pessoas}
          </span>
          <Chip size="sm" variant="soft" color={STATUS[r.status].cor}>
            {STATUS[r.status].rotulo}
          </Chip>
        </div>
      </div>
      {(ocasiao || r.obs) && (
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {ocasiao && (
            <Chip size="sm" variant="soft" color="warning">
              {ocasiao}
            </Chip>
          )}
          {r.obs && <span className="text-muted">{r.obs}</span>}
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
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
    <Card className="gap-3 p-4 sm:p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-muted">{NOME_TURNO[turno]}</p>
        <p className="text-xs text-muted">
          {reservas.length} {reservas.length === 1 ? "reserva" : "reservas"}
        </p>
      </div>
      <p className="text-3xl font-medium tabular-nums tracking-tight">
        {pessoas} <span className="text-base font-normal text-muted">pessoas</span>
      </p>
      <div>
        <div className="h-2 overflow-hidden rounded-full bg-default" role="meter" aria-valuenow={pico} aria-valuemax={lotacao} aria-label={`Pico de ocupação no ${NOME_TURNO[turno].toLowerCase()}`}>
          <div
            className={`h-full rounded-full ${pct >= 90 ? "bg-danger" : pct >= 70 ? "bg-warning" : "bg-accent"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted tabular-nums">
          {lotacao > 0 ? `Pico de ${pico} de ${lotacao} lugares` : "Fechado para reservas"}
          {bloqueio?.motivo ? ` · ${bloqueio.motivo}` : ""}
        </p>
      </div>
    </Card>
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
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button isIconOnly size="sm" variant="secondary" aria-label="Dia anterior" onPress={() => setDia(somarDias(dia, -1))}>
            <ChevronLeft />
          </Button>
          <div className="min-w-0 px-1">
            <p className="text-lg font-medium leading-tight first-letter:uppercase">
              {rotuloDia ?? formatarData(dia, { weekday: "long" })}
            </p>
            <p className="text-xs text-muted">{formatarData(dia, { day: "2-digit", month: "long", year: "numeric" })}</p>
          </div>
          <Button isIconOnly size="sm" variant="secondary" aria-label="Próximo dia" onPress={() => setDia(somarDias(dia, 1))}>
            <ChevronRight />
          </Button>
          {dia !== hoje && (
            <Button size="sm" variant="ghost" onPress={() => setDia(hoje)}>
              Hoje
            </Button>
          )}
        </div>
        <div className="flex items-end gap-2">
          <CampoData label="Ir para o dia" value={dia} onChange={(v) => v && setDia(v)} className="w-44" ocultarLabel />
          <Button size="sm" variant="secondary" onPress={() => onNova(dia)} className="mb-1">
            <Plus /> Reserva neste dia
          </Button>
        </div>
      </div>

      {turnos.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {turnos.map((t) => (
            <ResumoTurno key={t} turno={t} reservas={porTurno(t)} config={config} bloqueios={bloqueios} dia={dia} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">O restaurante não abre neste dia da semana.</p>
      )}

      {grupos.length === 0 ? (
        <Card>
          <EmptyState className="flex flex-col items-center gap-2 py-12 text-center">
            <p className="font-medium">Nenhuma reserva para este dia</p>
            <p className="text-sm text-muted">As reservas do site aparecem aqui automaticamente.</p>
          </EmptyState>
        </Card>
      ) : (
        <ol className="flex flex-col gap-6">
          {grupos.map(([hora, lista]) => (
            <li key={hora} className="grid gap-3 md:grid-cols-[5rem_1fr]">
              <div className="flex items-baseline gap-2 md:flex-col md:gap-0 md:pt-3">
                <p className="text-xl font-medium tabular-nums">{hora}</p>
                <p className="text-xs text-muted">
                  {lista.reduce((s, r) => s + r.pessoas, 0)} pessoas
                </p>
              </div>
              <div className="grid gap-3 lg:grid-cols-2">
                {lista.map((r) => (
                  <CartaoReserva key={`${r.id}-${r.mesa ?? ""}`} r={r} hoje={hoje} onEditar={() => onEditar(r)} onExcluir={() => onExcluir(r)} />
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}

      {encerradas.length > 0 && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-muted">
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
