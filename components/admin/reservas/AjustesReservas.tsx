"use client";

import { CalendarOff, Clock, Globe, Trash2, Users } from "lucide-react";
import { useState } from "react";

import {
  avisar,
  BarraSalvar,
  BotaoSalvar,
  CampoData,
  CampoNumero,
  CampoOpcoes,
  CampoSelect,
  CampoSwitch,
  CampoTexto,
} from "@/components/admin/campos";
import { Secao, Selo } from "@/components/admin/ui";
import { Button } from "@/components/sistema/ui/button";
import { formatarData } from "@/lib/admin/formato";
import { criarBloqueio, excluirBloqueio, salvarConfigReservas } from "@/lib/admin/reservas-actions";
import { NOME_TURNO, type Bloqueio, type ReservasConfig, type Turno } from "@/lib/reservas/regras";

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
  const alterado = JSON.stringify(c) !== JSON.stringify(config);

  async function salvar() {
    setSalvando(true);
    avisar(await salvarConfigReservas(c), "Regras de reserva salvas");
    setSalvando(false);
  }

  return (
    <>
      <Secao
        icone={Globe}
        titulo="Reservas pelo site"
        descricao="Desligado, o site volta a montar o pedido no WhatsApp da equipe."
      >
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
        icone={Users}
        titulo="Lotação"
        descricao="Quantas pessoas cabem no salão ao mesmo tempo. Cada reserva ocupa lugares pela permanência média."
      >
        <div className="grid gap-4 @md:grid-cols-2">
          <CampoNumero label="Lugares no almoço" value={c.lotacaoAlmoco} onChange={(v) => mudar("lotacaoAlmoco", v ?? 0)} min={0} />
          <CampoNumero label="Lugares no jantar" value={c.lotacaoJantar} onChange={(v) => mudar("lotacaoJantar", v ?? 0)} min={0} />
          <CampoNumero
            label="Permanência média"
            unidade="min"
            value={c.permanencia}
            onChange={(v) => mudar("permanencia", v ?? 105)}
            min={30}
            max={360}
            passo={15}
            descricao="Depois disso, os lugares voltam a ficar livres."
          />
          <CampoNumero
            label="Grupo grande: acima de"
            value={c.maxPessoasOnline}
            onChange={(v) => mudar("maxPessoasOnline", v ?? 8)}
            min={1}
            max={60}
            unidade="pessoas"
            descricao="Grupos maiores reservam pelo site normalmente, mas chegam pendentes para a equipe confirmar e preparar o espaço."
          />
        </div>
      </Secao>

      <Secao icone={Clock} titulo="Horários oferecidos" descricao="Os horários seguem o expediente de cada dia da semana.">
        <div className="grid gap-4 @md:grid-cols-2">
          <CampoSelect
            label="Intervalo entre horários"
            value={String(c.intervalo)}
            onChange={(v) => mudar("intervalo", Number(v))}
            opcoes={INTERVALOS}
          />
          <CampoNumero
            label="Último horário"
            unidade="min"
            value={c.ultimoAntesDoFim}
            onChange={(v) => mudar("ultimoAntesDoFim", v ?? 60)}
            min={0}
            max={240}
            passo={15}
            descricao="Tempo antes do fechamento. Ex.: jantar até 23h e 60 min → último às 22h."
          />
          <CampoSelect
            label="Antecedência mínima"
            value={String(c.antecedenciaMinima)}
            onChange={(v) => mudar("antecedenciaMinima", Number(v))}
            opcoes={ANTECEDENCIAS}
          />
          <CampoNumero
            label="Antecedência máxima"
            unidade="dias"
            value={c.diasAFrente}
            onChange={(v) => mudar("diasAFrente", v ?? 60)}
            min={1}
            max={180}
            descricao="Até quantos dias à frente o site aceita."
          />
        </div>
      </Secao>

      <BarraSalvar alterado={alterado} salvando={salvando} aoSalvar={salvar} aoDescartar={() => setC(config)} rotulo="Salvar regras" />
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
      icone={CalendarOff}
      titulo="Feriados, eventos e bloqueios"
      descricao="Feche um dia ou turno para reservas pelo site, ou reduza a lotação (ex.: salão parcialmente reservado)."
    >
      <div className="grid gap-4 @xl:grid-cols-2">
        <CampoData label="Data" value={data} onChange={setData} minimo={hoje} />
        <CampoOpcoes
          label="Turno"
          value={turno}
          onChange={setTurno}
          opcoes={[
            { id: "dia", rotulo: "Dia inteiro" },
            { id: "almoco", rotulo: "Almoço" },
            { id: "jantar", rotulo: "Jantar" },
          ]}
        />
        <CampoOpcoes
          label="O que fazer"
          value={tipo}
          onChange={setTipo}
          opcoes={[
            { id: "fechar", rotulo: "Fechar" },
            { id: "reduzir", rotulo: "Reduzir lotação" },
          ]}
        />
        {tipo === "reduzir" ? (
          <CampoNumero label="Lugares disponíveis" value={lotacao} onChange={setLotacao} min={0} />
        ) : (
          <div className="hidden @xl:block" />
        )}
        <CampoTexto
          label="Motivo (só a equipe vê)"
          value={motivo}
          onChange={setMotivo}
          placeholder="Ex.: Feriado, evento fechado"
          className="@xl:col-span-2"
        />
      </div>
      <BotaoSalvar pendente={salvando} onClick={adicionar} disabled={!data} className="self-start">
        Adicionar bloqueio
      </BotaoSalvar>

      {proximos.length > 0 ? (
        <ul className="-mx-2 flex flex-col">
          {proximos.map((b) => (
            <li key={b.id} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-muted">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid w-11 shrink-0 place-items-center rounded-xl bg-muted py-1 text-center">
                  <span className="text-[0.6rem] font-medium text-muted-foreground uppercase">
                    {formatarData(b.data, { month: "short" }).replace(".", "")}
                  </span>
                  <span className="numeros text-base leading-none font-semibold">{b.data.slice(8, 10)}</span>
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <span className="first-letter:uppercase">{formatarData(b.data, { weekday: "long" })}</span>
                    <Selo tom={b.lotacao === null ? "negativo" : "atencao"}>
                      {b.turno ? NOME_TURNO[b.turno] : "Dia inteiro"}
                    </Selo>
                  </p>
                  <p className="truncate text-[13px] text-muted-foreground">
                    {b.lotacao === null ? "Fechado para reservas" : `Lotação reduzida para ${b.lotacao} lugares`}
                    {b.motivo ? ` · ${b.motivo}` : ""}
                  </p>
                </div>
              </div>
              <Button
                size="icon-sm"
                variant="ghost-destructive"
                className="rounded-full"
                aria-label="Remover bloqueio"
                onClick={async () => avisar(await excluirBloqueio(b.id), "Bloqueio removido")}
              >
                <Trash2 />
              </Button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">Nenhum bloqueio programado.</p>
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
    <div className="grid items-start gap-4 xl:grid-cols-2">
      <div className="flex flex-col gap-4">
        <Regras config={config} />
      </div>
      <Bloqueios bloqueios={bloqueios} hoje={hoje} />
    </div>
  );
}
