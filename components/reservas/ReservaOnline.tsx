"use client";

import {
  CalendarDays,
  Check,
  ChevronLeft,
  CircleAlert,
  Clock,
  Loader2,
  MapPin,
  MessageCircle,
  Minus,
  Plus,
  Sparkles,
  UserRound,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import foto from "@/assets/img/salao-claraboia-vinho.webp";
import CalendarioReserva from "@/components/reservas/CalendarioReserva";
import { Campo } from "@/components/sistema/formulario/campo";
import { InputTelefone } from "@/components/sistema/inputs/input-telefone";
import { AreaTexto, InputTexto } from "@/components/sistema/inputs/input-texto";
import { TrocaDeEtapa } from "@/components/sistema/movimento";
import { diaDe, horarios as expediente } from "@/lib/hours";
import {
  dataPorExtenso,
  deMinutos,
  diaDaSemana,
  NOME_TURNO,
  OCASIOES,
  paraMinutos,
  rotuloOcasiao,
  somarDias,
  type Turno,
} from "@/lib/reservas/regras";
import { enderecoLinha, site, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";

type Agenda = { ativo: boolean; maxPessoas: number; hoje: string; ate: string; fechados: string[] };
type HorarioSite = { hora: string; turno: Turno; livres: number; poucos: boolean };
type Etapa = "pessoas" | "dia" | "horario" | "dados" | "revisao";

const NOMES_DIA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

/** Acima disto, nem o contador de grupo: a conversa é com a equipe. */
const GRUPO_MAXIMO = 40;

/** Classe dos campos grandes, no estilo dos formulários da Apple. */
const CAIXA = "h-13 rounded-xl border-transparent bg-superficie text-[17px] hover:border-transparent md:h-13 md:text-[17px]";

function hojeSP() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
}

function buscarHorarios(dia: string, ignorar?: string) {
  const q = new URLSearchParams({ data: dia });
  if (ignorar) q.set("ignorar", ignorar);
  return fetch(`/api/reservas/disponibilidade?${q}`)
    .then((r) => r.json())
    .then((j: { horarios?: HorarioSite[] }) => j.horarios ?? [])
    .catch(() => [] as HorarioSite[]);
}

/**
 * Sem reserva online (pausada no painel ou banco fora do ar): os dias e
 * horários saem do expediente, sem lotação, e o pedido vai para o WhatsApp.
 */
function agendaLocal(): Agenda {
  const hoje = hojeSP();
  const ate = somarDias(hoje, 60);
  const fechados: string[] = [];
  for (let d = hoje; d <= ate; d = somarDias(d, 1)) if (diaDe(diaDaSemana(d)).fechado) fechados.push(d);
  return { ativo: false, maxPessoas: 12, hoje, ate, fechados };
}

function horariosLocais(dia: string): HorarioSite[] {
  const d = diaDe(diaDaSemana(dia));
  if (d.fechado) return [];
  const lista: HorarioSite[] = [];
  for (const turno of ["almoco", "jantar"] as const) {
    const faixa = d[turno];
    if (!faixa) continue;
    for (let m = paraMinutos(faixa.inicio); m <= paraMinutos(faixa.fim) - 60; m += 30) {
      lista.push({ hora: deMinutos(m), turno, livres: 99, poucos: false });
    }
  }
  return lista;
}

function pluralPessoas(n: number) {
  return `${n} ${n === 1 ? "pessoa" : "pessoas"}`;
}

function diaCurto(dia: string) {
  const [a, m, d] = dia.split("-").map(Number);
  return new Date(a, m - 1, d)
    .toLocaleDateString("pt-BR", { weekday: "short", day: "numeric", month: "short" })
    .replace(/\./g, "");
}

// ─── Peças da tela ─────────────────────────────────────────────

function Titulo({ etapa, total, titulo, texto }: { etapa: number; total: number; titulo: string; texto?: string }) {
  return (
    <div className="mb-7 sm:mb-8">
      <p className="numeros text-[13px] font-semibold text-primary-texto">
        Etapa {etapa} de {total}
      </p>
      <h1 className="mt-1.5 text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.02em] text-balance sm:text-[2.125rem]">
        {titulo}
      </h1>
      {texto && <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground sm:text-[17px]">{texto}</p>}
    </div>
  );
}

function BotaoPrincipal({
  children,
  carregando,
  className,
  ...props
}: React.ComponentProps<"button"> & { carregando?: boolean }) {
  return (
    <button
      {...props}
      disabled={carregando || props.disabled}
      className={cn(
        "flex h-[52px] w-full items-center justify-center gap-2 rounded-full bg-primary px-7 text-[17px] font-semibold text-white transition-[background-color,transform,opacity] duration-150 outline-none hover:bg-primary-hover focus-visible:ring-4 focus-visible:ring-primary/25 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 sm:w-auto sm:min-w-56",
        className,
      )}
    >
      {carregando && <Loader2 className="size-5 animate-spin" />}
      {children}
    </button>
  );
}

/** Ação fixa no rodapé no celular; no computador, fica no fluxo. */
function Rodape({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-border/70 bg-white/85 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl sm:static sm:mt-10 sm:border-0 sm:bg-transparent sm:p-0 sm:backdrop-blur-none">
      {children}
    </div>
  );
}

function Opcao({
  ativo,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { ativo: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={ativo}
      {...props}
      className={cn(
        "relative flex items-center justify-center rounded-2xl text-[17px] font-medium transition-[background-color,color,box-shadow,transform] duration-150 outline-none focus-visible:ring-3 focus-visible:ring-primary/30 active:scale-[0.97] disabled:pointer-events-none",
        ativo ? "bg-primary text-white shadow-[0_8px_24px_-10px] shadow-primary/70" : "bg-superficie hover:bg-superficie-hover",
        className,
      )}
    >
      {children}
    </button>
  );
}

function BotaoContador({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      {...props}
      className={cn(
        "grid size-12 place-items-center rounded-full bg-white text-primary-texto shadow-suave transition-[background-color,transform,opacity] outline-none hover:bg-primary-suave focus-visible:ring-3 focus-visible:ring-primary/30 active:scale-95 disabled:pointer-events-none disabled:opacity-35",
        className,
      )}
    />
  );
}

/** Resumo do que já foi escolhido: cartão ao lado no computador. */
function Resumo({
  pessoas,
  data,
  hora,
  nome,
  aoIrPara,
  liberadas,
}: {
  pessoas: number;
  data: string | null;
  hora: string | null;
  nome: string;
  aoIrPara: (e: Etapa) => void;
  liberadas: Set<Etapa>;
}) {
  const linhas: { etapa: Etapa; Icone: typeof Users; rotulo: string; valor: string | null }[] = [
    { etapa: "pessoas", Icone: Users, rotulo: "Pessoas", valor: pluralPessoas(pessoas) },
    { etapa: "dia", Icone: CalendarDays, rotulo: "Dia", valor: data ? dataPorExtenso(data) : null },
    { etapa: "horario", Icone: Clock, rotulo: "Horário", valor: hora },
    { etapa: "dados", Icone: UserRound, rotulo: "Em nome de", valor: nome.trim() || null },
  ];
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-elevado ring-1 ring-black/[0.04]">
      <div className="relative aspect-[16/10]">
        <Image src={foto} alt="Salão do Rizz com a claraboia" fill sizes="360px" placeholder="blur" className="object-cover" />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white">
          <p className="font-display text-2xl italic">{site.nome}</p>
          <p className="mt-0.5 flex items-center gap-1 text-[13px] text-white/80">
            <MapPin className="size-3.5" /> {site.endereco.cidade}/{site.endereco.uf}
          </p>
        </div>
      </div>
      <dl className="divide-y divide-border px-5">
        {linhas.map(({ etapa, Icone, rotulo, valor }) => (
          <div key={etapa} className="flex items-center gap-3 py-3.5">
            <Icone className="size-[18px] shrink-0 text-muted-foreground" strokeWidth={1.75} />
            <div className="min-w-0 grow">
              <dt className="text-[12px] text-muted-foreground">{rotulo}</dt>
              <dd className={cn("truncate text-[15px] first-letter:uppercase", valor ? "font-medium" : "text-texto-terciario")}>
                {valor ?? "—"}
              </dd>
            </div>
            {valor && liberadas.has(etapa) && (
              <button
                type="button"
                onClick={() => aoIrPara(etapa)}
                className="shrink-0 rounded-full px-2.5 py-1 text-[13px] font-medium text-primary-texto transition-colors hover:bg-primary-suave"
              >
                Alterar
              </button>
            )}
          </div>
        ))}
      </dl>
    </div>
  );
}

// ─── Fluxo ─────────────────────────────────────────────────────

/**
 * Reserva em etapas: pessoas → dia → horário → dados → revisão. Uma pergunta
 * por tela, com a escolha avançando sozinha; o resumo acompanha ao lado.
 *
 * Com `alterando`, o mesmo fluxo muda uma reserva existente (sem pedir os
 * dados de novo) e devolve o controle para a página do link pessoal. Com as
 * reservas online pausadas, o fluxo é o mesmo e termina no WhatsApp.
 */
export default function ReservaOnline({
  alterando,
  onAlterada,
  onCancelar,
}: {
  alterando?: { codigo: string; pessoas: number; data: string; hora: string; nome: string };
  onAlterada?: () => void;
  onCancelar?: () => void;
}) {
  const router = useRouter();
  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [falhou, setFalhou] = useState(false);

  const [pessoas, setPessoas] = useState(alterando?.pessoas ?? 2);
  const [data, setData] = useState<string | null>(alterando?.data ?? null);
  const [hora, setHora] = useState<string | null>(alterando?.hora ?? null);
  // Guardados com o dia a que se referem: trocar de dia já mostra o carregando.
  const [carregados, setCarregados] = useState<{ data: string; lista: HorarioSite[] } | null>(null);

  const [nome, setNome] = useState(alterando?.nome ?? "");
  const [telefone, setTelefone] = useState("");
  const [ocasiao, setOcasiao] = useState<string | null>(null);
  const [obs, setObs] = useState("");
  const [isca, setIsca] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [tocou, setTocou] = useState(false);

  const [etapa, setEtapa] = useState<Etapa>("pessoas");
  const [sentido, setSentido] = useState<1 | -1>(1);

  useEffect(() => {
    fetch("/api/reservas/disponibilidade")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((a: Agenda) => setAgenda(a.ativo ? a : agendaLocal()))
      .catch(() => {
        setFalhou(true);
        setAgenda(agendaLocal());
      });
  }, []);

  const online = Boolean(agenda?.ativo) && !falhou;

  useEffect(() => {
    if (!data || !online) return;
    let vivo = true;
    buscarHorarios(data, alterando?.codigo).then((lista) => vivo && setCarregados({ data, lista }));
    return () => {
      vivo = false;
    };
  }, [data, online, alterando?.codigo]);

  const horariosDoDia = !online
    ? data
      ? horariosLocais(data)
      : null
    : carregados && carregados.data === data
      ? carregados.lista
      : null;
  const fechados = useMemo(() => new Set(agenda?.fechados ?? []), [agenda]);

  const etapas: Etapa[] = alterando ? ["pessoas", "dia", "horario", "revisao"] : ["pessoas", "dia", "horario", "dados", "revisao"];
  const indice = etapas.indexOf(etapa);

  // Escolhido o horário, ele precisa continuar cabendo se o número de pessoas mudar.
  const escolhido = horariosDoDia?.find((h) => h.hora === hora) ?? null;
  const horaValida = Boolean(escolhido && escolhido.livres >= pessoas);

  const digitos = telefone.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  const nomeOk = nome.trim().length >= 2;
  const telefoneOk = /^\d{10,11}$/.test(digitos);

  // Até onde o cliente já pode voltar pelo resumo.
  const liberadas = new Set<Etapa>(etapas.slice(0, indice + 1));
  if (data) liberadas.add("horario");
  if (horaValida && !alterando) liberadas.add("dados");

  function ir(proxima: Etapa) {
    setSentido(etapas.indexOf(proxima) >= indice ? 1 : -1);
    setEtapa(proxima);
    setErro(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function avancarDepois(proxima: Etapa) {
    // Um respiro para o toque ser visto antes de a tela mudar.
    setTimeout(() => ir(proxima), 220);
  }

  function voltar() {
    if (indice === 0) return onCancelar?.();
    ir(etapas[indice - 1]);
  }

  if (!agenda) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-busy>
        <div className="max-w-xl">
          <div className="h-4 w-24 animate-pulse rounded-full bg-superficie" />
          <div className="mt-3 h-9 w-72 animate-pulse rounded-xl bg-superficie" />
          <div className="mt-10 grid grid-cols-4 gap-3">
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-superficie" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const max = agenda.maxPessoas;
  const grupoGrande = pessoas > max;
  const linkGrupo = whatsappLink(`Olá! Gostaria de reservar uma mesa para um grupo de mais de ${GRUPO_MAXIMO} pessoas no Rizz.`);

  const porTurno = (["almoco", "jantar"] as const)
    .map((t) => ({ turno: t, lista: (horariosDoDia ?? []).filter((h) => h.turno === t) }))
    .filter((g) => g.lista.length > 0);

  const proximosDias = (() => {
    const lista: string[] = [];
    for (let d = agenda.hoje; d <= agenda.ate && lista.length < 4; d = somarDias(d, 1)) if (!fechados.has(d)) lista.push(d);
    return lista;
  })();

  function mensagemWhats() {
    return [
      `Olá! Gostaria de reservar uma mesa no ${site.nome}.`,
      `Nome: ${nome.trim()}`,
      `Pessoas: ${pessoas}`,
      data && `Dia: ${dataPorExtenso(data)}`,
      hora && `Horário: ${hora}`,
      ocasiao && `Ocasião: ${rotuloOcasiao(ocasiao)}`,
      obs.trim() && `Observações: ${obs.trim()}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  async function confirmar() {
    if (!data || !hora) return;
    if (!online) {
      window.open(whatsappLink(mensagemWhats()), "_blank", "noopener");
      return;
    }
    setErro(null);
    setEnviando(true);
    try {
      const resposta = alterando
        ? await fetch(`/api/reservas/${alterando.codigo}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ acao: "alterar", pessoas, data, hora }),
          })
        : await fetch("/api/reservas", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ nome, telefone: digitos, pessoas, data, hora, ocasiao, obs, site: isca }),
          });
      const j = (await resposta.json()) as { ok: boolean; erro?: string; codigo?: string };
      if (!j.ok) {
        setErro(j.erro ?? "Não foi possível concluir. Tente novamente.");
        // Pode ter lotado enquanto o cliente preenchia: atualiza os horários.
        if (resposta.status === 409) {
          const dia = data;
          void buscarHorarios(dia, alterando?.codigo).then((lista) => setCarregados({ data: dia, lista }));
        }
        return;
      }
      if (alterando) onAlterada?.();
      else router.push(`/reservas/${j.codigo}?nova=1`);
    } catch {
      setErro("Sem conexão. Confira a internet e tente de novo.");
    } finally {
      setEnviando(false);
    }
  }

  const total = etapas.length;
  const n = indice + 1;

  return (
    <div className={cn("mx-auto max-w-6xl px-4 pt-5 pb-36 sm:px-6 sm:pt-8 sm:pb-20", indice > 0 && "max-lg:pt-14")}>
      {/* Progresso e voltar */}
      <div className="mb-8 flex items-center gap-4 sm:mb-10">
        <button
          type="button"
          onClick={voltar}
          disabled={indice === 0 && !onCancelar}
          className="-ml-2 flex h-10 items-center gap-0.5 rounded-full pr-3 pl-1.5 text-[15px] font-medium text-primary-texto transition-[background-color,opacity] outline-none hover:bg-primary-suave focus-visible:ring-3 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:opacity-0"
        >
          <ChevronLeft className="size-5" /> Voltar
        </button>
        <div className="flex grow gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={n} aria-label="Progresso da reserva">
          {etapas.map((e, i) => (
            <span key={e} className="h-1 grow overflow-hidden rounded-full bg-superficie">
              <span
                className="block h-full rounded-full bg-primary transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{ width: i < n ? "100%" : "0%" }}
              />
            </span>
          ))}
        </div>
      </div>

      {!online && (
        <p className="mb-8 flex max-w-xl items-start gap-2.5 rounded-2xl bg-superficie px-4 py-3 text-[14px] leading-relaxed text-muted-foreground">
          <MessageCircle className="mt-0.5 size-4 shrink-0 text-primary-texto" />
          {falhou
            ? "A reserva online está fora do ar agora. Monte seu pedido e envie pelo WhatsApp: a equipe confirma com você."
            : "Monte seu pedido e envie pelo WhatsApp: a equipe confirma a mesa com você."}
        </p>
      )}

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-16">
        <div className="min-w-0 max-w-xl">
          <TrocaDeEtapa chave={etapa} sentido={sentido}>
            {etapa === "pessoas" && (
              <section>
                <Titulo
                  etapa={n}
                  total={total}
                  titulo={alterando ? "Para quantas pessoas?" : "Para quantas pessoas é a mesa?"}
                  texto="Conte com você também."
                />
                <div className="grid grid-cols-4 gap-2.5 sm:gap-3" role="radiogroup" aria-label="Número de pessoas">
                  {Array.from({ length: max }, (_, i) => i + 1).map((q) => (
                    <Opcao
                      key={q}
                      role="radio"
                      aria-checked={pessoas === q}
                      ativo={pessoas === q}
                      onClick={() => {
                        setPessoas(q);
                        avancarDepois("dia");
                      }}
                      className="aspect-square text-[22px] font-semibold"
                    >
                      <span className="numeros">{q}</span>
                    </Opcao>
                  ))}
                </div>
                <Opcao
                  role="radio"
                  aria-checked={grupoGrande}
                  ativo={grupoGrande}
                  onClick={() => setPessoas((p) => Math.max(p, max + 1))}
                  className="mt-3 h-14 w-full"
                >
                  Mais de {max} pessoas
                </Opcao>

                {grupoGrande ? (
                  <div className="mt-6 rounded-3xl bg-superficie p-6">
                    <p className="text-[19px] font-semibold tracking-tight">Quantas pessoas no total?</p>
                    <div className="mt-4 flex items-center gap-3">
                      <BotaoContador
                        aria-label="Menos uma pessoa"
                        disabled={pessoas <= max + 1}
                        onClick={() => setPessoas((p) => Math.max(max + 1, p - 1))}
                      >
                        <Minus className="size-5" />
                      </BotaoContador>
                      <output aria-live="polite" className="numeros min-w-16 text-center text-[32px] font-semibold tracking-tight">
                        {pessoas}
                      </output>
                      <BotaoContador
                        aria-label="Mais uma pessoa"
                        disabled={pessoas >= GRUPO_MAXIMO}
                        onClick={() => setPessoas((p) => Math.min(GRUPO_MAXIMO, p + 1))}
                      >
                        <Plus className="size-5" />
                      </BotaoContador>
                    </div>
                    <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
                      {online
                        ? "Grupos grandes ficam pendentes até a equipe confirmar e preparar o espaço. A confirmação chega pelo WhatsApp."
                        : "A equipe confirma o espaço com você pelo WhatsApp."}
                    </p>
                    <p className="mt-2 text-[14px] text-muted-foreground">
                      Mais de {GRUPO_MAXIMO} pessoas?{" "}
                      <a href={linkGrupo} target="_blank" rel="noopener noreferrer" className="font-medium text-primary-texto underline underline-offset-4">
                        Fale com a gente
                      </a>
                      .
                    </p>
                    <Rodape>
                      <BotaoPrincipal onClick={() => ir("dia")}>Continuar</BotaoPrincipal>
                    </Rodape>
                  </div>
                ) : (
                  alterando && (
                    <Rodape>
                      <BotaoPrincipal onClick={() => ir("dia")}>Continuar</BotaoPrincipal>
                    </Rodape>
                  )
                )}
              </section>
            )}

            {etapa === "dia" && (
              <section>
                <Titulo etapa={n} total={total} titulo="Qual dia?" texto={`Mesa para ${pluralPessoas(pessoas)}.`} />
                <div className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
                  {proximosDias.map((d, i) => (
                    <Opcao
                      key={d}
                      ativo={data === d}
                      onClick={() => {
                        if (d !== data) setHora(null);
                        setData(d);
                        avancarDepois("horario");
                      }}
                      className="h-16 min-w-[5.25rem] shrink-0 flex-col gap-0 rounded-2xl px-4 text-[15px]"
                    >
                      <span className={cn("text-[12px] font-medium", data === d ? "text-white/80" : "text-muted-foreground")}>
                        {d === agenda.hoje ? "Hoje" : d === somarDias(agenda.hoje, 1) ? "Amanhã" : NOMES_DIA[diaDaSemana(d)]}
                      </span>
                      <span className="numeros text-[17px] font-semibold">{diaCurto(d).replace(/^\S+\s/, "")}</span>
                      {i === 0 && <span className="sr-only">primeiro dia disponível</span>}
                    </Opcao>
                  ))}
                </div>
                <div className="rounded-3xl bg-white p-4 shadow-suave ring-1 ring-black/[0.04] sm:p-6">
                  <CalendarioReserva
                    hoje={agenda.hoje}
                    ate={agenda.ate}
                    fechados={fechados}
                    valor={data}
                    aoEscolher={(d) => {
                      if (d !== data) setHora(null);
                      setData(d);
                      avancarDepois("horario");
                    }}
                  />
                </div>
                <p className="mt-4 text-[13px] text-muted-foreground">
                  Dias apagados não têm reserva online.{" "}
                  {expediente.some((d) => d.fechado) &&
                    `Não abrimos ${expediente
                      .filter((d) => d.fechado)
                      .map((d) => d.nome.toLowerCase())
                      .join(" e ")}.`}
                </p>
              </section>
            )}

            {etapa === "horario" && data && (
              <section>
                <Titulo
                  etapa={n}
                  total={total}
                  titulo="Que horas?"
                  texto={`${dataPorExtenso(data).replace(/^./, (c) => c.toUpperCase())} · ${pluralPessoas(pessoas)}.`}
                />
                {horariosDoDia === null ? (
                  <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4" aria-busy>
                    {Array.from({ length: 8 }, (_, i) => (
                      <span key={i} className="h-14 animate-pulse rounded-2xl bg-superficie" />
                    ))}
                  </div>
                ) : porTurno.length === 0 ? (
                  <div className="rounded-3xl bg-superficie p-6">
                    <p className="text-[17px] font-semibold">Não há horários livres neste dia.</p>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
                      Escolha outro dia ou{" "}
                      <a
                        href={whatsappLink("Olá! Gostaria de verificar disponibilidade de mesa no Rizz.")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-primary-texto underline-offset-4 hover:underline"
                      >
                        fale com a gente no WhatsApp
                      </a>
                      .
                    </p>
                    <button
                      type="button"
                      onClick={() => ir("dia")}
                      className="mt-5 inline-flex h-11 items-center rounded-full bg-white px-5 text-[15px] font-semibold shadow-suave transition-colors hover:bg-superficie-hover"
                    >
                      Escolher outro dia
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-8">
                    {porTurno.map(({ turno, lista }) => (
                      <div key={turno}>
                        <p className="mb-3 text-[13px] font-semibold text-muted-foreground">{NOME_TURNO[turno]}</p>
                        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4" role="radiogroup" aria-label={NOME_TURNO[turno]}>
                          {lista.map((h) => {
                            const cabe = h.livres >= pessoas;
                            const ativo = h.hora === hora && cabe;
                            return (
                              <Opcao
                                key={h.hora}
                                role="radio"
                                aria-checked={ativo}
                                aria-label={`${h.hora}${cabe ? (h.poucos ? ", últimos lugares" : "") : ", lotado"}`}
                                ativo={ativo}
                                disabled={!cabe}
                                onClick={() => {
                                  setHora(h.hora);
                                  setErro(null);
                                  avancarDepois(alterando ? "revisao" : "dados");
                                }}
                                className={cn("h-14 flex-col gap-0", !cabe && "bg-transparent text-texto-terciario ring-1 ring-border ring-inset")}
                              >
                                <span className={cn("numeros text-[17px] font-semibold", !cabe && "line-through")}>{h.hora}</span>
                                {cabe && h.poucos && (
                                  <span className={cn("text-[11px] font-medium", ativo ? "text-white/80" : "text-ambar")}>últimos lugares</span>
                                )}
                                {!cabe && <span className="text-[11px]">lotado</span>}
                              </Opcao>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}

            {etapa === "dados" && (
              <section>
                <Titulo
                  etapa={n}
                  total={total}
                  titulo="Seus dados"
                  texto={online ? "Para a equipe falar com você sobre a reserva." : "Vão na mensagem do WhatsApp."}
                />
                <div className="flex flex-col gap-5">
                  <Campo id="nome" rotulo="Nome" erro={tocou && !nomeOk ? "Informe seu nome." : undefined}>
                    <InputTexto
                      autoComplete="name"
                      autoCapitalize="words"
                      enterKeyHint="next"
                      value={nome}
                      onChange={(e) => setNome(e.currentTarget.value)}
                      placeholder="Seu nome"
                      maxLength={120}
                      classeCaixa={CAIXA}
                    />
                  </Campo>
                  <Campo
                    id="telefone"
                    rotulo="WhatsApp"
                    erro={tocou && !telefoneOk ? "Informe o WhatsApp com DDD." : undefined}
                    ajuda="Usamos só para falar sobre a sua reserva."
                  >
                    <InputTelefone valor={telefone} aoMudar={(v) => setTelefone(v ?? "")} classeCaixa={CAIXA} enterKeyHint="done" />
                  </Campo>

                  <fieldset>
                    <legend className="mb-2.5 text-sm font-medium">
                      É uma ocasião especial? <span className="font-normal text-muted-foreground">(opcional)</span>
                    </legend>
                    <div className="flex flex-wrap gap-2">
                      {OCASIOES.map((o) => (
                        <Opcao
                          key={o.id}
                          ativo={ocasiao === o.id}
                          onClick={() => setOcasiao(ocasiao === o.id ? null : o.id)}
                          className="h-11 rounded-full px-4 text-[15px]"
                        >
                          {ocasiao === o.id && <Check className="mr-1.5 size-4" />}
                          {o.rotulo}
                        </Opcao>
                      ))}
                    </div>
                  </fieldset>

                  <Campo id="obs" rotulo="Observações (opcional)">
                    <AreaTexto
                      rows={2}
                      maxLength={500}
                      value={obs}
                      onChange={(e) => setObs(e.currentTarget.value)}
                      placeholder="Cadeirão, restrição alimentar, preferência de lugar…"
                      className="min-h-24 rounded-xl border-transparent bg-superficie px-4 py-3.5 text-[17px] hover:border-transparent md:text-[17px]"
                    />
                  </Campo>

                  {/* Armadilha para robôs: fora da tela e fora da navegação por teclado. */}
                  <input
                    type="text"
                    name="site"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden
                    value={isca}
                    onChange={(e) => setIsca(e.target.value)}
                    className="absolute -left-[9999px] size-px opacity-0"
                  />
                </div>
                <Rodape>
                  <BotaoPrincipal
                    onClick={() => {
                      setTocou(true);
                      if (nomeOk && telefoneOk) ir("revisao");
                    }}
                  >
                    Revisar reserva
                  </BotaoPrincipal>
                </Rodape>
              </section>
            )}

            {etapa === "revisao" && data && hora && (
              <section>
                <Titulo
                  etapa={n}
                  total={total}
                  titulo={alterando ? "Confira a alteração" : "Tudo certo?"}
                  texto={
                    alterando
                      ? "A reserva passa para o novo dia e horário."
                      : online
                        ? "Confira os detalhes antes de confirmar."
                        : "Confira os detalhes e envie pelo WhatsApp."
                  }
                />

                <div className="overflow-hidden rounded-3xl bg-superficie">
                  <div className="flex items-center gap-4 p-5 sm:p-6">
                    <div className="grid w-16 shrink-0 place-items-center rounded-2xl bg-white py-2 text-center shadow-suave">
                      <span className="text-[11px] font-semibold text-primary-texto uppercase">
                        {new Date(`${data}T12:00`).toLocaleDateString("pt-BR", { month: "short" }).replace(".", "")}
                      </span>
                      <span className="numeros text-[26px] leading-tight font-semibold">{Number(data.slice(8, 10))}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[19px] leading-snug font-semibold tracking-tight first-letter:uppercase">
                        {dataPorExtenso(data)}
                      </p>
                      <p className="numeros mt-0.5 text-[15px] text-muted-foreground">
                        {hora} · {pluralPessoas(pessoas)}
                      </p>
                    </div>
                  </div>
                  <dl className="divide-y divide-black/[0.06] border-t border-black/[0.06] px-5 sm:px-6">
                    {[
                      { rotulo: "Pessoas", valor: pluralPessoas(pessoas), etapa: "pessoas" as Etapa },
                      { rotulo: "Dia", valor: diaCurto(data), etapa: "dia" as Etapa },
                      { rotulo: "Horário", valor: hora, etapa: "horario" as Etapa },
                      ...(alterando
                        ? []
                        : [
                            { rotulo: "Nome", valor: nome.trim(), etapa: "dados" as Etapa },
                            { rotulo: "WhatsApp", valor: telefone ? `(${digitos.slice(0, 2)}) ${digitos.slice(2, -4)}-${digitos.slice(-4)}` : "", etapa: "dados" as Etapa },
                            ...(ocasiao ? [{ rotulo: "Ocasião", valor: rotuloOcasiao(ocasiao) ?? "", etapa: "dados" as Etapa }] : []),
                            ...(obs.trim() ? [{ rotulo: "Observações", valor: obs.trim(), etapa: "dados" as Etapa }] : []),
                          ]),
                    ].map((l) => (
                      <div key={l.rotulo} className="flex items-center justify-between gap-4 py-3.5">
                        <dt className="shrink-0 text-[15px] text-muted-foreground">{l.rotulo}</dt>
                        <dd className="flex min-w-0 items-center gap-2">
                          <span className="numeros truncate text-right text-[15px] font-medium first-letter:uppercase">{l.valor}</span>
                          <button
                            type="button"
                            onClick={() => ir(l.etapa)}
                            className="shrink-0 rounded-full px-2 py-1 text-[13px] font-medium text-primary-texto transition-colors hover:bg-primary-suave"
                          >
                            Alterar
                          </button>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                {online && !alterando && (
                  <p className="mt-5 flex items-start gap-2.5 text-[13px] leading-relaxed text-muted-foreground">
                    <Sparkles className="mt-0.5 size-4 shrink-0 text-primary-texto" />
                    Você recebe um link para alterar ou cancelar quando quiser. Se for se atrasar, avise a gente: a
                    mesa pode receber outra pessoa.
                  </p>
                )}

                {erro && (
                  <p role="alert" className="mt-5 flex items-start gap-2.5 rounded-2xl bg-negativo/8 px-4 py-3 text-[15px] text-negativo-texto">
                    <CircleAlert className="mt-0.5 size-[18px] shrink-0" />
                    {erro}
                  </p>
                )}

                <Rodape>
                  <BotaoPrincipal carregando={enviando} onClick={confirmar}>
                    {enviando
                      ? alterando
                        ? "Salvando…"
                        : "Reservando…"
                      : alterando
                        ? "Salvar alteração"
                        : online
                          ? "Confirmar reserva"
                          : (
                            <>
                              <MessageCircle className="size-5" /> Enviar pelo WhatsApp
                            </>
                          )}
                  </BotaoPrincipal>
                </Rodape>
              </section>
            )}
          </TrocaDeEtapa>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-24 flex flex-col gap-4">
            <Resumo
              pessoas={pessoas}
              data={data}
              hora={horaValida ? hora : null}
              nome={alterando ? alterando.nome : nome}
              liberadas={liberadas}
              aoIrPara={(e) => !alterando || e !== "dados" ? ir(e) : undefined}
            />
            <p className="px-2 text-[13px] leading-relaxed text-muted-foreground">
              {enderecoLinha}
              <br />
              <a href={`tel:${site.telefoneLink}`} className="font-medium text-primary-texto hover:underline">
                {site.telefone}
              </a>
            </p>
          </div>
        </aside>
      </div>

      {/* Resumo compacto no celular */}
      {indice > 0 && (
        <div className="fixed inset-x-0 top-14 z-20 border-b border-border/70 bg-white/85 backdrop-blur-xl sm:top-16 lg:hidden">
          <p className="numeros mx-auto flex max-w-6xl items-center gap-1.5 overflow-x-auto px-4 py-2 text-[13px] whitespace-nowrap text-muted-foreground [scrollbar-width:none] sm:px-6">
            <Users className="size-3.5 shrink-0" /> {pluralPessoas(pessoas)}
            {data && (
              <>
                <span className="text-texto-terciario">·</span>
                <span className="first-letter:uppercase">{diaCurto(data)}</span>
              </>
            )}
            {horaValida && hora && (
              <>
                <span className="text-texto-terciario">·</span> {hora}
              </>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
