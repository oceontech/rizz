"use client";

import { Clock, Copy, MapPin, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { useState } from "react";

import { avisar, BotaoSalvar, CampoHora, CampoTelefone, CampoTexto } from "@/components/admin/campos";
import { Cabecalho, Secao } from "@/components/admin/ui";
import { Button } from "@/components/sistema/ui/button";
import { Switch } from "@/components/sistema/ui/switch";
import { salvarContato, salvarHorarios, salvarRodizio } from "@/lib/admin/funcionamento-actions";
import type { ConteudoSiteConfig } from "@/lib/conteudo";
import type { DiaOperacao, Servico } from "@/lib/hours";
import { cn } from "@/lib/utils";

const PADRAO = { almoco: { inicio: "11:00", fim: "15:00" }, jantar: { inicio: "18:30", fim: "22:30" } };
/** Domingo por último, como a semana é lida no restaurante. */
const ORDEM = [2, 3, 4, 5, 6, 0, 1];
const igual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const min = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));

/** Faixa do dia (10h às 24h) com almoço e jantar desenhados: dá para ver a semana de relance. */
function FaixaDoDia({ dia }: { dia: DiaOperacao }) {
  const inicio = 10 * 60;
  const total = 14 * 60;
  const barra = (s: Servico | undefined, cor: string) =>
    s && (
      <span
        className={cn("absolute inset-y-0 rounded-full", cor)}
        style={{ left: `${Math.max(0, ((min(s.inicio) - inicio) / total) * 100)}%`, width: `${Math.max(2, ((min(s.fim) - min(s.inicio)) / total) * 100)}%` }}
      />
    );
  return (
    <div className="relative h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
      {!dia.fechado && barra(dia.almoco, "bg-amber-400")}
      {!dia.fechado && barra(dia.jantar, "bg-indigo-500")}
    </div>
  );
}

function BlocoServico({
  rotulo,
  valor,
  aoMudar,
}: {
  rotulo: string;
  valor: Servico | undefined;
  aoMudar: (s: Servico | undefined) => void;
}) {
  const padrao = rotulo === "Almoço" ? PADRAO.almoco : PADRAO.jantar;
  return (
    <div className={cn("rounded-2xl border p-3", !valor && "border-dashed bg-muted/40")}>
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className={cn("size-2.5 rounded-full", rotulo === "Almoço" ? "bg-amber-400" : "bg-indigo-500")} aria-hidden />
          {rotulo}
        </span>
        <Switch checked={Boolean(valor)} onCheckedChange={(v) => aoMudar(v ? padrao : undefined)} aria-label={`${rotulo} neste dia`} />
      </label>
      {valor ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <CampoHora label="Abre" value={valor.inicio} onChange={(v) => v && aoMudar({ ...valor, inicio: v })} />
          <CampoHora label="Fecha" value={valor.fim} onChange={(v) => v && aoMudar({ ...valor, fim: v })} />
        </div>
      ) : (
        <p className="mt-1.5 text-[13px] text-muted-foreground">Sem {rotulo.toLowerCase()} neste dia.</p>
      )}
    </div>
  );
}

function Horarios({ inicial }: { inicial: DiaOperacao[] }) {
  const [dias, setDias] = useState(inicial);
  const [salvando, setSalvando] = useState(false);
  const alterado = !igual(dias, inicial);

  const mudar = (dia: number, f: (d: DiaOperacao) => DiaOperacao) => setDias((ds) => ds.map((d) => (d.dia === dia ? f(d) : d)));

  /** Copia almoço e jantar deste dia para todos os outros dias abertos. */
  const copiarParaTodos = (base: DiaOperacao) =>
    setDias((ds) => ds.map((d) => (d.fechado || d.dia === base.dia ? d : { ...d, almoco: base.almoco, jantar: base.jantar })));

  async function salvar() {
    setSalvando(true);
    const r = await salvarHorarios(dias);
    setSalvando(false);
    avisar(r, "Horários atualizados no site");
  }

  return (
    <Secao
      icone={Clock}
      titulo="Horários de funcionamento"
      descricao="Valem para o “aberto agora”, a tabela de horários do site, os turnos da reserva online e o rodízio."
      acoes={
        <div className="hidden items-center gap-3 text-xs text-muted-foreground sm:flex">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-amber-400" /> Almoço
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-indigo-500" /> Jantar
          </span>
        </div>
      }
    >
      <ul className="flex flex-col divide-y rounded-2xl border">
        {ORDEM.map((n) => dias.find((d) => d.dia === n)!).map((d) => (
          <li key={d.dia} className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-3">
              <p className="w-24 shrink-0 font-semibold">{d.nome}</p>
              <div className="min-w-0 grow">
                <FaixaDoDia dia={d} />
              </div>
              <label className="flex shrink-0 cursor-pointer items-center gap-2 text-sm">
                <span className={cn("font-medium", d.fechado ? "text-muted-foreground" : "text-positivo-texto")}>{d.fechado ? "Fechado" : "Aberto"}</span>
                <Switch
                  checked={!d.fechado}
                  onCheckedChange={(aberto) =>
                    mudar(d.dia, (x) => (aberto ? { ...x, fechado: false, almoco: x.almoco ?? PADRAO.almoco, jantar: x.jantar ?? PADRAO.jantar } : { ...x, fechado: true }))
                  }
                  aria-label={`${d.nome} aberto`}
                />
              </label>
            </div>
            {!d.fechado && (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <BlocoServico rotulo="Almoço" valor={d.almoco} aoMudar={(s) => mudar(d.dia, (x) => ({ ...x, almoco: s }))} />
                  <BlocoServico rotulo="Jantar" valor={d.jantar} aoMudar={(s) => mudar(d.dia, (x) => ({ ...x, jantar: s }))} />
                </div>
                <button
                  type="button"
                  onClick={() => copiarParaTodos(d)}
                  className="flex w-fit items-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Copy className="size-3.5" /> Usar estes horários nos outros dias abertos
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-end gap-3">
        {alterado && <span className="text-sm text-atencao-texto">Alterações não salvas</span>}
        {alterado && (
          <Button variant="secondary" className="rounded-full" onClick={() => setDias(inicial)} disabled={salvando}>
            Descartar
          </Button>
        )}
        <BotaoSalvar pendente={salvando} onClick={salvar} disabled={!alterado}>
          Salvar horários
        </BotaoSalvar>
      </div>
    </Secao>
  );
}

const DIAS = [
  { dia: 0, curto: "Dom" },
  { dia: 1, curto: "Seg" },
  { dia: 2, curto: "Ter" },
  { dia: 3, curto: "Qua" },
  { dia: 4, curto: "Qui" },
  { dia: 5, curto: "Sex" },
  { dia: 6, curto: "Sáb" },
];

function Rodizio({ inicial, horarios }: { inicial: ConteudoSiteConfig["rodizio"]; horarios: DiaOperacao[] }) {
  const [dias, setDias] = useState(inicial.dias);
  const [etapas, setEtapas] = useState(inicial.etapas);
  const [salvando, setSalvando] = useState(false);
  const alterado = !igual({ dias: [...dias].sort(), etapas }, { dias: [...inicial.dias].sort(), etapas: inicial.etapas });
  const semJantar = dias.filter((d) => !horarios.find((h) => h.dia === d)?.jantar || horarios.find((h) => h.dia === d)?.fechado);

  async function salvar() {
    setSalvando(true);
    const r = await salvarRodizio({ dias, etapas });
    setSalvando(false);
    avisar(r, "Rodízio atualizado no site");
  }

  return (
    <Secao icone={UtensilsCrossed} titulo="Rodízio de risotos" descricao="Os dias aparecem na home com “hoje tem rodízio” e o horário vem do jantar do dia.">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Dias do rodízio</span>
        <div className="flex flex-wrap gap-2">
          {DIAS.map(({ dia, curto }) => {
            const ativo = dias.includes(dia);
            return (
              <button
                key={dia}
                type="button"
                aria-pressed={ativo}
                onClick={() => setDias(ativo ? dias.filter((x) => x !== dia) : [...dias, dia])}
                className={cn(
                  "h-11 w-14 rounded-2xl border text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                  ativo ? "border-foreground bg-foreground text-background" : "bg-background hover:bg-muted",
                )}
              >
                {curto}
              </button>
            );
          })}
        </div>
        {semJantar.length > 0 && (
          <p className="text-[13px] text-atencao-texto">
            {semJantar.map((d) => DIAS[d].curto).join(", ")}: sem jantar nos horários. O rodízio não aparece nesse dia.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <span className="text-sm font-medium">Etapas (aparecem numeradas na home)</span>
        {etapas.map((e, i) => (
          <div key={i} className="grid items-start gap-2 rounded-2xl border p-3 sm:grid-cols-[2.5rem_14rem_1fr_auto]">
            <span className="numeros pt-2 text-xl font-semibold text-muted-foreground">0{i + 1}</span>
            <CampoTexto label="Etapa" value={e.titulo} onChange={(v) => setEtapas(etapas.map((x, j) => (j === i ? { ...x, titulo: v } : x)))} maxLength={40} />
            <CampoTexto label="Descrição" value={e.texto} onChange={(v) => setEtapas(etapas.map((x, j) => (j === i ? { ...x, texto: v } : x)))} maxLength={200} />
            <Button variant="ghost" size="icon" className="mt-6 rounded-full" aria-label={`Tirar a etapa ${i + 1}`} disabled={etapas.length === 1} onClick={() => setEtapas(etapas.filter((_, j) => j !== i))}>
              <Trash2 />
            </Button>
          </div>
        ))}
        {etapas.length < 6 && (
          <Button variant="secondary" className="w-fit rounded-full" onClick={() => setEtapas([...etapas, { titulo: "", texto: "" }])}>
            <Plus /> Etapa
          </Button>
        )}
      </div>

      <div className="flex justify-end">
        <BotaoSalvar pendente={salvando} onClick={salvar} disabled={!alterado}>
          Salvar rodízio
        </BotaoSalvar>
      </div>
    </Secao>
  );
}

function Contato({ inicial }: { inicial: ConteudoSiteConfig["contato"] }) {
  const [c, setC] = useState(inicial);
  const [salvando, setSalvando] = useState(false);
  const mudar = (k: keyof typeof c) => (v: string) => setC({ ...c, [k]: v });
  const alterado = !igual(c, inicial);

  async function salvar() {
    setSalvando(true);
    const r = await salvarContato(c);
    setSalvando(false);
    avisar(r, "Contato atualizado no site");
  }

  return (
    <Secao icone={MapPin} titulo="Contato e endereço" descricao="Aparecem no rodapé, na seção de visita, nas reservas e nos botões de WhatsApp do site.">
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoTexto label="Telefone" value={c.telefone} onChange={mudar("telefone")} placeholder="(19) 3661-5503" maxLength={20} />
        <CampoTelefone label="WhatsApp" value={c.whatsapp} onChange={mudar("whatsapp")} descricao="Número que recebe os botões “Reservar pelo WhatsApp”." />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <CampoTexto label="Rua e número" value={c.rua} onChange={mudar("rua")} maxLength={120} />
        <CampoTexto label="Bairro" value={c.bairro} onChange={mudar("bairro")} maxLength={60} />
      </div>
      <div className="grid gap-4 sm:grid-cols-[1fr_6rem_9rem]">
        <CampoTexto label="Cidade" value={c.cidade} onChange={mudar("cidade")} maxLength={60} />
        <CampoTexto label="UF" value={c.uf} onChange={mudar("uf")} maxLength={2} />
        <CampoTexto label="CEP" value={c.cep} onChange={mudar("cep")} maxLength={10} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <CampoTexto label="Instagram" tipo="url" value={c.instagram} onChange={mudar("instagram")} maxLength={300} />
        <CampoTexto label="Facebook" tipo="url" value={c.facebook} onChange={mudar("facebook")} maxLength={300} />
      </div>
      <p className="text-[13px] text-muted-foreground">O ponto no mapa do site não muda com o endereço: se o restaurante se mudar, avise a equipe técnica.</p>
      <div className="flex justify-end">
        <BotaoSalvar pendente={salvando} onClick={salvar} disabled={!alterado}>
          Salvar contato
        </BotaoSalvar>
      </div>
    </Secao>
  );
}

/** Funcionamento: horários da semana, rodízio e contato, que o site inteiro usa. */
export default function GestorFuncionamento({ conteudo }: { conteudo: ConteudoSiteConfig }) {
  return (
    <>
      <Cabecalho titulo="Horários e contato" descricao="O que mudar aqui vale para o site inteiro assim que salvar." />
      <div className="flex flex-col gap-5">
        <Horarios inicial={conteudo.horarios} />
        <Rodizio inicial={conteudo.rodizio} horarios={conteudo.horarios} />
        <Contato inicial={conteudo.contato} />
      </div>
    </>
  );
}
