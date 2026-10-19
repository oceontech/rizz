"use client";

import { TrashBin } from "@gravity-ui/icons";
import { Button, Card } from "@heroui/react";
import { useState } from "react";

import { avisar, CampoData, CampoNumero, CampoSelect, CampoSwitch, CampoTexto } from "@/components/admin/campos";
import { formatarData } from "@/lib/admin/formato";
import { criarBloqueio, excluirBloqueio, salvarConfigReservas } from "@/lib/admin/reservas-actions";
import { NOME_TURNO, type Bloqueio, type ReservasConfig, type Turno } from "@/lib/reservas/regras";

function Secao({ titulo, descricao, children }: { titulo: string; descricao: string; children: React.ReactNode }) {
  return (
    <Card className="gap-5 p-5 sm:p-6">
      <div>
        <h2 className="text-base font-medium">{titulo}</h2>
        <p className="mt-1 text-sm text-muted">{descricao}</p>
      </div>
      {children}
    </Card>
  );
}

const ANTECEDENCIAS = [
  { id: "0", rotulo: "Sem antecedência" },
  { id: "30", rotulo: "30 minutos" },
  { id: "60", rotulo: "1 hora" },
  { id: "120", rotulo: "2 horas" },
  { id: "240", rotulo: "4 horas" },
  { id: "1440", rotulo: "1 dia" },
];

const INTERVALOS = [
  { id: "15", rotulo: "A cada 15 minutos" },
  { id: "30", rotulo: "A cada 30 minutos" },
  { id: "60", rotulo: "A cada 1 hora" },
];

function Regras({ config }: { config: ReservasConfig }) {
  const [c, setC] = useState(config);
  const [salvando, setSalvando] = useState(false);
  const mudar = <K extends keyof ReservasConfig>(k: K, v: ReservasConfig[K]) => setC((x) => ({ ...x, [k]: v }));

  async function salvar() {
    setSalvando(true);
    avisar(await salvarConfigReservas(c), "Regras de reserva salvas");
    setSalvando(false);
  }

  return (
    <>
      <Secao titulo="Reservas pelo site" descricao="Desligado, o site volta a montar o pedido no WhatsApp da equipe.">
        <CampoSwitch
          label="Aceitar reservas pelo site"
          descricao="O cliente escolhe dia e horário entre os livres."
          value={c.ativo}
          onChange={(v) => mudar("ativo", v)}
        />
        <CampoSwitch
          label="Confirmar automaticamente"
          descricao="Dentro da lotação, a reserva já nasce confirmada. Desligado, todas chegam como pendentes."
          value={c.confirmacaoAutomatica}
          onChange={(v) => mudar("confirmacaoAutomatica", v)}
        />
      </Secao>

      <Secao
        titulo="Lotação"
        descricao="Quantas pessoas cabem no salão ao mesmo tempo. Cada reserva ocupa lugares pela permanência média."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoNumero label="Lugares no almoço" value={c.lotacaoAlmoco} onChange={(v) => mudar("lotacaoAlmoco", v ?? 0)} min={0} />
          <CampoNumero label="Lugares no jantar" value={c.lotacaoJantar} onChange={(v) => mudar("lotacaoJantar", v ?? 0)} min={0} />
          <CampoNumero
            label="Permanência média (min)"
            value={c.permanencia}
            onChange={(v) => mudar("permanencia", v ?? 105)}
            min={30}
            max={360}
            passo={15}
            descricao="Depois disso, os lugares voltam a ficar livres."
          />
          <CampoNumero
            label="Máximo de pessoas pelo site"
            value={c.maxPessoasOnline}
            onChange={(v) => mudar("maxPessoasOnline", v ?? 8)}
            min={1}
            max={30}
            descricao="Grupos maiores falam com a equipe pelo WhatsApp."
          />
        </div>
      </Secao>

      <Secao titulo="Horários oferecidos" descricao="Os horários seguem o expediente de cada dia da semana.">
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoSelect
            label="Intervalo entre horários"
            value={String(c.intervalo)}
            onChange={(v) => mudar("intervalo", Number(v))}
            opcoes={INTERVALOS}
          />
          <CampoNumero
            label="Último horário antes do fechamento (min)"
            value={c.ultimoAntesDoFim}
            onChange={(v) => mudar("ultimoAntesDoFim", v ?? 60)}
            min={0}
            max={240}
            passo={15}
            descricao="Ex.: jantar até 23h e 60 min → último horário às 22h."
          />
          <CampoSelect
            label="Antecedência mínima"
            value={String(c.antecedenciaMinima)}
            onChange={(v) => mudar("antecedenciaMinima", Number(v))}
            opcoes={ANTECEDENCIAS}
          />
          <CampoNumero
            label="Aceitar até quantos dias à frente"
            value={c.diasAFrente}
            onChange={(v) => mudar("diasAFrente", v ?? 60)}
            min={1}
            max={180}
          />
        </div>
      </Secao>

      <div className="flex justify-end">
        <Button onPress={salvar} isPending={salvando}>
          Salvar regras
        </Button>
      </div>
    </>
  );
}

function Bloqueios({ bloqueios, hoje }: { bloqueios: Bloqueio[]; hoje: string }) {
  const [data, setData] = useState<string | null>(null);
  const [turno, setTurno] = useState<"dia" | Turno>("dia");
  const [tipo, setTipo] = useState<"fechar" | "reduzir">("fechar");
  const [lotacao, setLotacao] = useState<number | null>(30);
  const [motivo, setMotivo] = useState("");
  const [salvando, setSalvando] = useState(false);

  const proximos = bloqueios.filter((b) => b.data >= hoje);

  async function adicionar() {
    setSalvando(true);
    const ok = avisar(
      await criarBloqueio({
        data: data ?? "",
        turno: turno === "dia" ? null : turno,
        lotacao: tipo === "fechar" ? null : (lotacao ?? 0),
        motivo: motivo || null,
      }),
      "Bloqueio criado",
    );
    setSalvando(false);
    if (ok) {
      setData(null);
      setMotivo("");
    }
  }

  return (
    <Secao
      titulo="Feriados, eventos e bloqueios"
      descricao="Feche um dia ou turno para reservas pelo site, ou reduza a lotação (ex.: salão parcialmente reservado)."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <CampoData label="Data" value={data} onChange={setData} minimo={hoje} />
        <CampoSelect
          label="Turno"
          value={turno}
          onChange={(v) => setTurno(v as "dia" | Turno)}
          opcoes={[
            { id: "dia", rotulo: "Dia inteiro" },
            { id: "almoco", rotulo: "Almoço" },
            { id: "jantar", rotulo: "Jantar" },
          ]}
        />
        <CampoSelect
          label="O que fazer"
          value={tipo}
          onChange={(v) => setTipo(v as "fechar" | "reduzir")}
          opcoes={[
            { id: "fechar", rotulo: "Fechar para reservas" },
            { id: "reduzir", rotulo: "Reduzir lotação" },
          ]}
        />
        {tipo === "reduzir" ? (
          <CampoNumero label="Lugares disponíveis" value={lotacao} onChange={setLotacao} min={0} />
        ) : (
          <div className="hidden lg:block" />
        )}
        <CampoTexto
          label="Motivo (só a equipe vê)"
          value={motivo}
          onChange={setMotivo}
          placeholder="Ex.: Feriado, evento fechado"
          className="sm:col-span-2 lg:col-span-3"
        />
        <div className="flex items-end">
          <Button onPress={adicionar} isPending={salvando} isDisabled={!data} className="w-full">
            Adicionar bloqueio
          </Button>
        </div>
      </div>

      {proximos.length > 0 ? (
        <ul className="divide-y divide-separator rounded-2xl border border-border">
          {proximos.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="text-sm font-medium first-letter:uppercase">
                  {formatarData(b.data, { weekday: "short", day: "2-digit", month: "short" })} ·{" "}
                  {b.turno ? NOME_TURNO[b.turno] : "Dia inteiro"}
                </p>
                <p className="text-xs text-muted">
                  {b.lotacao === null ? "Fechado para reservas" : `Lotação reduzida para ${b.lotacao} lugares`}
                  {b.motivo ? ` · ${b.motivo}` : ""}
                </p>
              </div>
              <Button
                isIconOnly
                size="sm"
                variant="ghost"
                aria-label="Remover bloqueio"
                onPress={async () => avisar(await excluirBloqueio(b.id), "Bloqueio removido")}
              >
                <TrashBin />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">Nenhum bloqueio programado.</p>
      )}
    </Secao>
  );
}

export default function AjustesReservas({
  config,
  bloqueios,
  hoje,
}: {
  config: ReservasConfig;
  bloqueios: Bloqueio[];
  hoje: string;
}) {
  return (
    <div className="flex max-w-3xl flex-col gap-4">
      <Regras config={config} />
      <Bloqueios bloqueios={bloqueios} hoje={hoje} />
    </div>
  );
}
