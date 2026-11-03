"use client";

import { Clock, MapPin, Pencil, Plus, Trash2, UtensilsCrossed } from "lucide-react";
import { useState } from "react";

import { avisar, BotaoSalvar, CampoHora, CampoOpcoes, CampoTelefone, CampoTexto } from "@/components/admin/campos";
import { Cabecalho, Janela, Secao, useUltimo } from "@/components/admin/ui";
import { Button } from "@/components/sistema/ui/button";
import { Switch } from "@/components/sistema/ui/switch";
import { salvarContato, salvarHorarios, salvarRodizio } from "@/lib/admin/funcionamento-actions";
import type { ConteudoSiteConfig } from "@/lib/conteudo";
import { diaDaSemanaISO, hojeNoRestaurante, type DiaOperacao, type Servico } from "@/lib/hours";
import { cn } from "@/lib/utils";

import DatasEspeciais from "./DatasEspeciais";

const PADRAO = { almoco: { inicio: "11:00", fim: "15:00" }, jantar: { inicio: "18:30", fim: "22:30" } };
/** Domingo por último, como a semana é lida no restaurante. */
const ORDEM = [2, 3, 4, 5, 6, 0, 1];
const igual = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
const min = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));
const duracao = (s?: Servico) => (s ? min(s.fim) - min(s.inicio) : 0);
const horasTexto = (m: number) => `${Math.floor(m / 60)}h${m % 60 ? String(m % 60).padStart(2, "0") : ""}`;

/** Janela da grade: das 10h à meia-noite, ou mais cedo se algum dia abrir antes. */
function escala(dias: DiaOperacao[]) {
  const inicios = dias.flatMap((d) => (d.fechado ? [] : [d.almoco, d.jantar].filter(Boolean).map((s) => min(s!.inicio))));
  const inicio = Math.min(10 * 60, ...inicios.map((m) => Math.floor(m / 60) * 60));
  return { inicio, total: 24 * 60 - inicio };
}

function Barra({ s, tipo, e }: { s?: Servico; tipo: "almoco" | "jantar"; e: { inicio: number; total: number } }) {
  if (!s) return null;
  const esquerda = ((min(s.inicio) - e.inicio) / e.total) * 100;
  const largura = Math.max(3, ((min(s.fim) - min(s.inicio)) / e.total) * 100);
  return (
    <span
      className={cn(
        "absolute inset-y-1 flex items-center justify-center overflow-hidden rounded-full px-2 text-[11px] font-semibold whitespace-nowrap tabular-nums",
        tipo === "almoco" ? "bg-amber-400/90 text-amber-950" : "bg-indigo-500 text-white",
      )}
      style={{ left: `${esquerda}%`, width: `${largura}%` }}
    >
      <span className="hidden truncate @2xl:inline">
        {s.inicio}–{s.fim}
      </span>
    </span>
  );
}

/** Régua de horas acima da grade. */
function Regua({ e }: { e: { inicio: number; total: number } }) {
  const marcas = [];
  for (let m = Math.ceil(e.inicio / 120) * 120; m <= 24 * 60; m += 120) marcas.push(m);
  return (
    <div className="relative h-4 text-[11px] text-muted-foreground tabular-nums" aria-hidden>
      {marcas.map((m) => (
        <span key={m} className="absolute -translate-x-1/2" style={{ left: `${((m - e.inicio) / e.total) * 100}%` }}>
          {m === 24 * 60 ? "0h" : `${m / 60}h`}
        </span>
      ))}
    </div>
  );
}

function EditorServico({
  rotulo,
  cor,
  valor,
  padrao,
  aoMudar,
}: {
  rotulo: string;
  cor: string;
  valor: Servico | undefined;
  padrao: Servico;
  aoMudar: (s: Servico | undefined) => void;
}) {
  return (
    <div className={cn("rounded-2xl border p-3.5 transition-colors", !valor && "border-dashed bg-muted/40")}>
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className={cn("size-2.5 rounded-full", cor)} aria-hidden />
          {rotulo}
          {valor && <span className="font-normal text-muted-foreground">· {horasTexto(duracao(valor))}</span>}
        </span>
        <Switch checked={Boolean(valor)} onCheckedChange={(v) => aoMudar(v ? padrao : undefined)} aria-label={`${rotulo} neste dia`} />
      </label>
      {valor ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <CampoHora label="Abre" value={valor.inicio} onChange={(v) => v && aoMudar({ ...valor, inicio: v })} />
          <CampoHora label="Fecha" value={valor.fim} onChange={(v) => v && aoMudar({ ...valor, fim: v })} />
        </div>
      ) : (
        <p className="mt-1 text-[13px] text-muted-foreground">Sem {rotulo.toLowerCase()} neste dia.</p>
      )}
    </div>
  );
}

/** Problema do dia, para avisar antes de salvar (o servidor confere de novo). */
function problemaDo(d: DiaOperacao) {
  if (d.fechado) return null;
  if (!d.almoco && !d.jantar) return "Marque almoço, jantar ou feche o dia.";
  if (d.almoco && min(d.almoco.inicio) >= min(d.almoco.fim)) return "O almoço precisa terminar depois de começar.";
  if (d.jantar && min(d.jantar.inicio) >= min(d.jantar.fim)) return "O jantar precisa terminar depois de começar.";
  if (d.almoco && d.jantar && min(d.almoco.fim) > min(d.jantar.inicio)) return "O almoço termina depois de o jantar começar.";
  return null;
}

/** Janela de edição de um dia, com "aplicar também a" outros dias. */
function EditorDia({
  dia,
  dias,
  aoFechar,
  aoAplicar,
}: {
  dia: DiaOperacao | null;
  dias: DiaOperacao[];
  aoFechar: () => void;
  aoAplicar: (d: DiaOperacao, tambem: number[]) => void;
}) {
  const visivel = useUltimo(dia);
  const [rascunho, setRascunho] = useState<DiaOperacao | null>(dia);
  const [tambem, setTambem] = useState<number[]>([]);
  const [de, setDe] = useState(dia);
  // Abriu outro dia: recomeça o rascunho.
  if (dia !== de) {
    setDe(dia);
    setRascunho(dia);
    setTambem([]);
  }
  const d = rascunho ?? visivel;
  if (!d) return null;
  const problema = problemaDo(d);
  const mudar = (p: Partial<DiaOperacao>) => setRascunho({ ...d, ...p });

  return (
    <Janela
      aberta={Boolean(dia)}
      aoFechar={aoFechar}
      icone={Clock}
      titulo={d.nome}
      descricao="Horário de toda semana. Para um feriado, use as datas especiais."
      rodape={
        <>
          <Button variant="secondary" className="rounded-full" onClick={aoFechar}>
            Cancelar
          </Button>
          <Button className="rounded-full" disabled={Boolean(problema)} onClick={() => aoAplicar(d, tambem)}>
            {tambem.length ? `Aplicar a ${tambem.length + 1} dias` : "Aplicar"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <CampoOpcoes
          label="Neste dia o restaurante"
          value={d.fechado ? "fechado" : "aberto"}
          onChange={(v) => mudar(v === "fechado" ? { fechado: true } : { fechado: false, almoco: d.almoco ?? PADRAO.almoco, jantar: d.jantar ?? PADRAO.jantar })}
          opcoes={[
            { id: "aberto", rotulo: "Abre" },
            { id: "fechado", rotulo: "Fica fechado" },
          ]}
        />
        {!d.fechado && (
          <>
            <EditorServico rotulo="Almoço" cor="bg-amber-400" valor={d.almoco} padrao={PADRAO.almoco} aoMudar={(s) => mudar({ almoco: s })} />
            <EditorServico rotulo="Jantar" cor="bg-indigo-500" valor={d.jantar} padrao={PADRAO.jantar} aoMudar={(s) => mudar({ jantar: s })} />
          </>
        )}
        {problema && <p className="rounded-xl bg-atencao/14 px-3.5 py-2.5 text-[13px] text-atencao-texto">{problema}</p>}

        <div className="flex flex-col gap-2 border-t pt-4">
          <span className="text-sm font-medium">Aplicar também a</span>
          <div className="flex flex-wrap gap-1.5">
            {ORDEM.filter((n) => n !== d.dia).map((n) => {
              const outro = dias.find((x) => x.dia === n)!;
              const ativo = tambem.includes(n);
              return (
                <button
                  key={n}
                  type="button"
                  aria-pressed={ativo}
                  onClick={() => setTambem(ativo ? tambem.filter((x) => x !== n) : [...tambem, n])}
                  className={cn(
                    "h-9 rounded-full border px-3.5 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                    ativo ? "border-foreground bg-foreground text-background" : "bg-background hover:bg-muted",
                  )}
                >
                  {outro.nomeCurto}
                </button>
              );
            })}
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
            {(
              [
                ["Dias úteis", [2, 3, 4, 5]],
                ["Fim de semana", [6, 0]],
                ["Todos os abertos", ORDEM.filter((n) => !dias.find((x) => x.dia === n)!.fechado)],
              ] as const
            ).map(([rotulo, lista]) => (
              <button
                key={rotulo}
                type="button"
                className="font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                onClick={() => setTambem([...new Set([...tambem, ...lista])].filter((n) => n !== d.dia))}
              >
                + {rotulo}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Janela>
  );
}

function Semana({ inicial, podeEditar }: { inicial: DiaOperacao[]; podeEditar: boolean }) {
  const [dias, setDias] = useState(inicial);
  const [editando, setEditando] = useState<DiaOperacao | null>(null);
  const [salvando, setSalvando] = useState(false);
  const alterado = !igual(dias, inicial);
  const hoje = diaDaSemanaISO(hojeNoRestaurante());
  const e = escala(dias);
  const abertos = dias.filter((d) => !d.fechado);
  const horasSemana = abertos.reduce((t, d) => t + duracao(d.almoco) + duracao(d.jantar), 0);

  function aplicar(base: DiaOperacao, tambem: number[]) {
    const { fechado, almoco, jantar } = base;
    const novo = (x: DiaOperacao): DiaOperacao => (fechado ? { dia: x.dia, nome: x.nome, nomeCurto: x.nomeCurto, fechado: true } : { dia: x.dia, nome: x.nome, nomeCurto: x.nomeCurto, fechado: false, almoco, jantar });
    setDias((ds) => ds.map((x) => (x.dia === base.dia || tambem.includes(x.dia) ? novo(x) : x)));
    setEditando(null);
  }

  async function salvar() {
    setSalvando(true);
    const r = await salvarHorarios(dias);
    setSalvando(false);
    avisar(r, "Horários atualizados no site");
  }

  return (
    <Secao
      icone={Clock}
      titulo="Semana padrão"
      descricao="Vale para o “aberto agora”, a tabela de horários do site, os turnos da reserva online e o rodízio."
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
      <div className="grid grid-cols-3 gap-2 text-center sm:max-w-md">
        {[
          [String(abertos.length), abertos.length === 1 ? "dia aberto" : "dias abertos"],
          [horasTexto(horasSemana), "por semana"],
          [String(abertos.filter((d) => d.almoco && d.jantar).length), "com 2 turnos"],
        ].map(([n, r]) => (
          <div key={r} className="rounded-2xl bg-muted/60 px-2 py-2.5">
            <p className="numeros text-lg leading-6 font-semibold">{n}</p>
            <p className="text-xs text-muted-foreground">{r}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col">
        {/* Régua alinhada com a coluna das barras */}
        <div className="hidden grid-cols-[8.5rem_1fr_2.5rem] gap-4 px-3 pb-1.5 @xl:grid">
          <span />
          <Regua e={e} />
          <span />
        </div>
        <ul className="flex flex-col gap-1.5">
          {ORDEM.map((n) => dias.find((d) => d.dia === n)!).map((d) => {
            const mudou = !igual(d, inicial.find((x) => x.dia === d.dia));
            const texto = d.fechado ? "Fechado" : [d.almoco && `${d.almoco.inicio}–${d.almoco.fim}`, d.jantar && `${d.jantar.inicio}–${d.jantar.fim}`].filter(Boolean).join(" · ");
            return (
              <li key={d.dia}>
                <button
                  type="button"
                  disabled={!podeEditar}
                  onClick={() => setEditando(d)}
                  aria-label={`${d.nome}: ${texto}. ${podeEditar ? "Editar" : ""}`}
                  className={cn(
                    "group grid w-full grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 rounded-2xl border bg-card px-3 py-2.5 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30 @xl:grid-cols-[8.5rem_1fr_2.5rem]",
                    podeEditar && "hover:border-foreground/25 hover:bg-muted/40",
                    d.dia === hoje && "border-[var(--secao)]/40",
                  )}
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2 font-semibold">
                      {d.nome.replace("-feira", "")}
                      {d.dia === hoje && <span className="rounded-full bg-secao/12 px-1.5 py-px text-[10px] font-semibold tracking-wide text-secao-texto uppercase">Hoje</span>}
                      {mudou && <span className="size-1.5 rounded-full bg-atencao" title="Alterado, falta salvar" />}
                    </span>
                    <span className={cn("block text-[13px] tabular-nums @2xl:hidden", d.fechado ? "text-muted-foreground" : "text-foreground/80")}>{texto}</span>
                  </span>
                  <span className="relative col-span-2 row-start-2 block h-8 rounded-full bg-muted @xl:col-span-1 @xl:col-start-2 @xl:row-start-1">
                    {d.fechado ? (
                      <span className="absolute inset-0 grid place-items-center text-xs font-medium text-muted-foreground">Fechado</span>
                    ) : (
                      <>
                        <Barra s={d.almoco} tipo="almoco" e={e} />
                        <Barra s={d.jantar} tipo="jantar" e={e} />
                      </>
                    )}
                  </span>
                  {podeEditar && (
                    <span className="col-start-2 row-start-1 grid size-9 place-items-center justify-self-end rounded-full text-muted-foreground transition-colors group-hover:bg-background group-hover:text-foreground @xl:col-start-3">
                      <Pencil className="size-4" />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {podeEditar && (
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
      )}

      <EditorDia dia={editando} dias={dias} aoFechar={() => setEditando(null)} aoAplicar={aplicar} />
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

/** Aba Horários: semana padrão, feriados e datas especiais, e o rodízio. */
export function PaginaHorarios({ conteudo, podeEditar }: { conteudo: ConteudoSiteConfig; podeEditar: boolean }) {
  return (
    <>
      <Cabecalho titulo="Horários" descricao="O que mudar aqui vale para o site inteiro assim que salvar." />
      <div className="flex flex-col gap-5">
        <Semana inicial={conteudo.horarios} podeEditar={podeEditar} />
        <DatasEspeciais inicial={conteudo.datasEspeciais} horarios={conteudo.horarios} />
        <Rodizio inicial={conteudo.rodizio} horarios={conteudo.horarios} />
      </div>
    </>
  );
}

/** Aba Contato: telefone, WhatsApp, endereço e redes. */
export function PaginaContato({ conteudo }: { conteudo: ConteudoSiteConfig }) {
  return (
    <>
      <Cabecalho titulo="Contato e endereço" descricao="Como os clientes encontram e falam com o restaurante." />
      <Contato inicial={conteudo.contato} />
    </>
  );
}
