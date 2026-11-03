"use client";

import { CalendarDays, CalendarX2, Clock, Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";

import { avisar, BotaoSalvar, CampoData, CampoHora, CampoTexto, Confirmar } from "@/components/admin/campos";
import { Janela, MenuAcoes, Secao, useUltimo } from "@/components/admin/ui";
import { Button } from "@/components/sistema/ui/button";
import { Switch } from "@/components/sistema/ui/switch";
import { salvarDatasEspeciais } from "@/lib/admin/funcionamento-actions";
import { diaDaSemanaISO, faixa, hojeNoRestaurante, somarDiasISO, type DataEspecial, type DiaOperacao, type Servico } from "@/lib/hours";
import { cn } from "@/lib/utils";

const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const SEMANA = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const MOTIVOS = ["Feriado", "Véspera de feriado", "Evento fechado", "Manutenção", "Horário de fim de ano"];

/** Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher). */
function pascoa(ano: number) {
  const a = ano % 19, b = Math.floor(ano / 100), c = ano % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31), dia = ((h + l - 7 * m + 114) % 31) + 1;
  return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
}

/** N-ésimo domingo do mês (Dia das Mães: 2º de maio; dos Pais: 2º de agosto). */
function domingo(ano: number, mes: number, n: number) {
  const primeiro = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const ate = (7 - diaDaSemanaISO(primeiro)) % 7;
  return somarDiasISO(primeiro, ate + (n - 1) * 7);
}

/** Feriados nacionais e datas que mexem com restaurante, nos próximos meses. */
function datasComemorativas(hoje: string, dias = 150) {
  const ano = Number(hoje.slice(0, 4));
  const lista: { data: string; motivo: string }[] = [];
  for (const a of [ano, ano + 1]) {
    const p = pascoa(a);
    lista.push(
      { data: `${a}-01-01`, motivo: "Ano-Novo" },
      { data: somarDiasISO(p, -48), motivo: "Carnaval (segunda)" },
      { data: somarDiasISO(p, -47), motivo: "Carnaval (terça)" },
      { data: somarDiasISO(p, -2), motivo: "Sexta-feira Santa" },
      { data: p, motivo: "Páscoa" },
      { data: `${a}-04-21`, motivo: "Tiradentes" },
      { data: `${a}-05-01`, motivo: "Dia do Trabalho" },
      { data: domingo(a, 5, 2), motivo: "Dia das Mães" },
      { data: `${a}-06-12`, motivo: "Dia dos Namorados" },
      { data: somarDiasISO(p, 60), motivo: "Corpus Christi" },
      { data: `${a}-07-09`, motivo: "Revolução Constitucionalista (SP)" },
      { data: domingo(a, 8, 2), motivo: "Dia dos Pais" },
      { data: `${a}-09-07`, motivo: "Independência" },
      { data: `${a}-10-12`, motivo: "Nossa Senhora Aparecida" },
      { data: `${a}-11-02`, motivo: "Finados" },
      { data: `${a}-11-15`, motivo: "Proclamação da República" },
      { data: `${a}-11-20`, motivo: "Consciência Negra" },
      { data: `${a}-12-24`, motivo: "Véspera de Natal" },
      { data: `${a}-12-25`, motivo: "Natal" },
      { data: `${a}-12-31`, motivo: "Véspera de Ano-Novo" },
    );
  }
  const ate = somarDiasISO(hoje, dias);
  return lista.filter((d) => d.data >= hoje && d.data <= ate).sort((a, b) => a.data.localeCompare(b.data));
}

const curta = (iso: string) => `${Number(iso.slice(8))} ${MESES[Number(iso.slice(5, 7)) - 1]}`;
const horarioTexto = (d: Pick<DiaOperacao, "fechado" | "almoco" | "jantar">) =>
  d.fechado ? "Fechado" : [faixa(d.almoco), faixa(d.jantar)].filter(Boolean).join(" · ") || "Fechado";

function FolhaCalendario({ iso, fechado }: { iso: string; fechado: boolean }) {
  return (
    <div className={cn("flex w-16 shrink-0 flex-col items-center overflow-hidden rounded-2xl border bg-card text-center shadow-suave", fechado && "opacity-80")}>
      <span className={cn("w-full py-1 text-[0.65rem] font-semibold tracking-[0.12em] text-white uppercase", fechado ? "bg-negativo" : "bg-[var(--secao)]")}>
        {MESES[Number(iso.slice(5, 7)) - 1]}
      </span>
      <span className="numeros pt-1 text-2xl leading-none font-semibold">{Number(iso.slice(8))}</span>
      <span className="pb-1.5 text-[0.65rem] text-muted-foreground">{SEMANA[diaDaSemanaISO(iso)].slice(0, 3)}</span>
    </div>
  );
}

function CampoServico({ rotulo, cor, valor, padrao, aoMudar }: { rotulo: string; cor: string; valor: Servico | undefined; padrao: Servico; aoMudar: (s: Servico | undefined) => void }) {
  return (
    <div className={cn("rounded-2xl border p-3", !valor && "border-dashed bg-muted/40")}>
      <label className="flex cursor-pointer items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <span className={cn("size-2.5 rounded-full", cor)} aria-hidden />
          {rotulo}
        </span>
        <Switch checked={Boolean(valor)} onCheckedChange={(v) => aoMudar(v ? padrao : undefined)} aria-label={`${rotulo} nesta data`} />
      </label>
      {valor ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <CampoHora label="Abre" value={valor.inicio} onChange={(v) => v && aoMudar({ ...valor, inicio: v })} />
          <CampoHora label="Fecha" value={valor.fim} onChange={(v) => v && aoMudar({ ...valor, fim: v })} />
        </div>
      ) : (
        <p className="mt-1.5 text-[13px] text-muted-foreground">Sem {rotulo.toLowerCase()} nesta data.</p>
      )}
    </div>
  );
}

type Rascunho = DataEspecial & { original?: string };

function Editor({
  aberto,
  inicial,
  horarios,
  ocupadas,
  aoSalvar,
  onFechar,
}: {
  aberto: boolean;
  inicial: Rascunho;
  horarios: DiaOperacao[];
  ocupadas: string[];
  aoSalvar: (d: Rascunho) => Promise<boolean>;
  onFechar: () => void;
}) {
  const [d, setD] = useState<Rascunho>(inicial);
  const [salvando, setSalvando] = useState(false);
  const normal = d.data ? horarios.find((h) => h.dia === diaDaSemanaISO(d.data)) : null;
  const repetida = d.data && d.data !== inicial.original && ocupadas.includes(d.data);

  /** Trocar a data num rascunho novo traz o horário normal daquele dia. */
  function mudarData(iso: string | null) {
    const n = iso ? horarios.find((h) => h.dia === diaDaSemanaISO(iso)) : null;
    setD((x) => ({ ...x, data: iso ?? "", ...(x.original || x.fechado ? {} : { almoco: n?.almoco, jantar: n?.jantar }) }));
  }

  async function salvar() {
    setSalvando(true);
    const ok = await aoSalvar(d);
    setSalvando(false);
    if (ok) onFechar();
  }

  return (
    <Janela
      aberta={aberto}
      aoFechar={onFechar}
      icone={CalendarDays}
      titulo={inicial.original ? "Editar data especial" : "Nova data especial"}
      descricao="Vale só para esta data e passa por cima do horário da semana."
      rodape={
        <>
          <Button variant="secondary" className="rounded-full" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <BotaoSalvar pendente={salvando} onClick={salvar} disabled={!d.data || Boolean(repetida)}>
            Salvar data
          </BotaoSalvar>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoData label="Data" value={d.data || null} onChange={mudarData} minimo={hojeNoRestaurante()} />
          <div className="flex flex-col justify-end pb-1 text-[13px] text-muted-foreground">
            {normal && (
              <p>
                {SEMANA[normal.dia]}: normalmente <span className="font-medium text-foreground">{horarioTexto(normal)}</span>
              </p>
            )}
            {repetida && <p className="text-negativo-texto">Esta data já tem um horário especial.</p>}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <CampoTexto label="Motivo (aparece no site)" value={d.motivo} onChange={(v) => setD({ ...d, motivo: v })} maxLength={60} placeholder="Ex.: Feriado de Natal" />
          <div className="flex flex-wrap gap-1.5">
            {MOTIVOS.map((m) => (
              <button key={m} type="button" onClick={() => setD({ ...d, motivo: m })} className="h-7 rounded-full border px-2.5 text-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">Nesta data o restaurante…</span>
          <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
            {[
              { fechado: true, Icone: CalendarX2, titulo: "Fica fechado", texto: "Não abre o dia todo. A reserva online não aceita esta data." },
              { fechado: false, Icone: Clock, titulo: "Abre em outro horário", texto: "Mais cedo, mais tarde, só almoço ou só jantar." },
            ].map((o) => (
              <button
                key={o.titulo}
                type="button"
                role="radio"
                aria-checked={d.fechado === o.fechado}
                onClick={() => setD({ ...d, fechado: o.fechado, almoco: d.almoco ?? normal?.almoco, jantar: d.jantar ?? normal?.jantar })}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                  d.fechado === o.fechado ? "border-foreground bg-foreground/[0.04] ring-1 ring-foreground" : "hover:bg-muted",
                )}
              >
                <o.Icone className={cn("mt-0.5 size-5 shrink-0", o.fechado ? "text-negativo" : "text-[var(--secao)]")} />
                <span>
                  <span className="block text-sm font-semibold">{o.titulo}</span>
                  <span className="mt-0.5 block text-[13px] leading-snug text-muted-foreground">{o.texto}</span>
                </span>
              </button>
            ))}
          </div>
        </div>

        {!d.fechado && (
          <div className="grid gap-3 sm:grid-cols-2">
            <CampoServico rotulo="Almoço" cor="bg-amber-400" valor={d.almoco} padrao={normal?.almoco ?? { inicio: "11:00", fim: "15:00" }} aoMudar={(s) => setD({ ...d, almoco: s })} />
            <CampoServico rotulo="Jantar" cor="bg-indigo-500" valor={d.jantar} padrao={normal?.jantar ?? { inicio: "18:30", fim: "22:30" }} aoMudar={(s) => setD({ ...d, jantar: s })} />
          </div>
        )}
      </div>
    </Janela>
  );
}

/**
 * Feriados e datas fora do padrão. Cada data é um cartão com a folhinha do
 * calendário, o motivo e o horário (comparado com o normal daquele dia);
 * as próximas datas comemorativas ficam a um toque para cadastrar.
 */
export default function DatasEspeciais({ inicial, horarios }: { inicial: DataEspecial[]; horarios: DiaOperacao[] }) {
  const hoje = hojeNoRestaurante();
  const [datas, setDatas] = useState(inicial.filter((d) => d.data >= hoje).sort((a, b) => a.data.localeCompare(b.data)));
  const [editando, setEditando] = useState<Rascunho | null>(null);
  const [sessao, setSessao] = useState(0);
  const [removendo, setRemovendo] = useState<DataEspecial | null>(null);
  const removida = useUltimo(removendo);
  const atual = useUltimo(editando);
  const sugestoes = datasComemorativas(hoje).filter((s) => !datas.some((d) => d.data === s.data)).slice(0, 8);

  async function gravar(lista: DataEspecial[], sucesso: string) {
    const r = await salvarDatasEspeciais(lista);
    if (avisar(r, sucesso)) {
      setDatas([...lista].sort((a, b) => a.data.localeCompare(b.data)));
      return true;
    }
    return false;
  }

  function abrir(r: Rascunho) {
    setSessao((n) => n + 1);
    setEditando(r);
  }

  const novo = (data = "", motivo = ""): Rascunho => {
    const n = data ? horarios.find((h) => h.dia === diaDaSemanaISO(data)) : null;
    return { data, motivo, fechado: true, almoco: n?.almoco, jantar: n?.jantar };
  };

  return (
    <Secao
      icone={CalendarDays}
      titulo="Feriados e datas especiais"
      descricao="Para um dia específico fora do padrão: fechar, abrir mais cedo, fechar mais tarde, só almoço… Vale para o site, a reserva online e o rodízio."
      acoes={
        <Button className="rounded-full" onClick={() => abrir(novo())}>
          <Plus /> Adicionar data
        </Button>
      }
    >
      {sugestoes.length > 0 && (
        <div className="rounded-2xl bg-muted/60 p-4">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold">
            <Sparkles className="size-3.5 text-[var(--secao)]" /> Próximas datas comemorativas
          </p>
          <p className="mt-0.5 text-[13px] text-muted-foreground">Toque para definir o horário de uma delas.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {sugestoes.map((s) => (
              <button
                key={s.data}
                type="button"
                onClick={() => abrir(novo(s.data, s.motivo))}
                className="flex h-9 items-center gap-2 rounded-full border bg-card px-3 text-[13px] shadow-suave transition-[transform,box-shadow] hover:-translate-y-0.5"
              >
                <span className="numeros font-semibold">{curta(s.data)}</span>
                <span className="text-muted-foreground">{s.motivo}</span>
                <Plus className="size-3.5 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      )}

      {datas.length === 0 ? (
        <button
          type="button"
          onClick={() => abrir(novo())}
          className="flex flex-col items-center gap-2 rounded-2xl border border-dashed px-6 py-8 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
        >
          <CalendarDays className="size-6" />
          Nenhuma data especial cadastrada. Os dias seguem o horário da semana.
          <span className="font-medium text-foreground">Adicionar a primeira</span>
        </button>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {datas.map((d) => {
            const normal = horarios.find((h) => h.dia === diaDaSemanaISO(d.data));
            return (
              <li key={d.data} className="flex items-center gap-4 rounded-2xl border p-3 sm:p-4">
                <FolhaCalendario iso={d.data} fechado={d.fechado} />
                <button type="button" onClick={() => abrir({ ...d, original: d.data })} className="min-w-0 grow text-left outline-none">
                  <p className="truncate font-semibold">{d.motivo}</p>
                  <p className={cn("mt-0.5 text-sm font-medium", d.fechado ? "text-negativo-texto" : "text-foreground")}>
                    {d.fechado ? "Fechado o dia todo" : horarioTexto(d)}
                  </p>
                  {normal && <p className="mt-0.5 truncate text-[12px] text-muted-foreground">Normal de {SEMANA[normal.dia].toLowerCase()}: {horarioTexto(normal)}</p>}
                </button>
                <MenuAcoes
                  rotulo={`Ações de ${d.motivo}`}
                  aoEscolher={(k) => (k === "editar" ? abrir({ ...d, original: d.data }) : setRemovendo(d))}
                  acoes={[
                    { id: "editar", rotulo: "Editar", icone: Pencil },
                    { id: "remover", rotulo: "Voltar ao horário normal", icone: Trash2, perigo: true, separar: true },
                  ]}
                />
              </li>
            );
          })}
        </ul>
      )}

      {atual && (
        <Editor
          key={sessao}
          aberto={editando !== null}
          inicial={atual}
          horarios={horarios}
          ocupadas={datas.map((d) => d.data)}
          onFechar={() => setEditando(null)}
          aoSalvar={async (r) => {
            const { original, ...limpa } = r;
            const outras = datas.filter((d) => d.data !== original);
            const item: DataEspecial = limpa.fechado ? { data: limpa.data, motivo: limpa.motivo, fechado: true } : limpa;
            return gravar([...outras, item], original ? "Data especial atualizada" : "Data especial adicionada");
          }}
        />
      )}

      <Confirmar
        aberto={removendo !== null}
        onFechar={() => setRemovendo(null)}
        titulo="Voltar ao horário normal?"
        texto={
          removida ? (
            <>
              <strong className="text-foreground">{curta(removida.data)} · {removida.motivo}</strong> deixa de ser data especial e segue o horário da semana.
            </>
          ) : null
        }
        onConfirmar={async () => {
          if (removendo) await gravar(datas.filter((d) => d.data !== removendo.data), "Data especial removida");
        }}
      />
    </Secao>
  );
}
