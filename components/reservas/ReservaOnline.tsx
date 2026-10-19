"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import FormReservaWhatsApp from "@/components/reservas/FormReservaWhatsApp";
import { Botao } from "@/components/ui/Botao";
import { mascaraTelefone } from "@/lib/admin/formato";
import { dataPorExtenso, diaDaSemana, NOME_TURNO, OCASIOES, type Turno } from "@/lib/reservas/regras";
import { scrollToTarget } from "@/lib/scroll";
import { whatsappLink } from "@/lib/site";

type Agenda = { ativo: boolean; maxPessoas: number; hoje: string; ate: string; fechados: string[] };
type HorarioSite = { hora: string; turno: Turno; livres: number; poucos: boolean };

const campo =
  "h-12 w-full border-b border-creme/20 bg-transparent text-[0.9375rem] text-creme placeholder:text-creme/30 focus:border-ambar focus:outline-none";

const rotulo = "mb-2 block text-[0.625rem] uppercase tracking-[0.18em] text-creme/45";

const NOMES_DIA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

function buscarHorarios(dia: string, ignorar?: string) {
  const q = new URLSearchParams({ data: dia });
  if (ignorar) q.set("ignorar", ignorar);
  return fetch(`/api/reservas/disponibilidade?${q}`)
    .then((r) => r.json())
    .then((j: { horarios?: HorarioSite[] }) => j.horarios ?? [])
    .catch(() => [] as HorarioSite[]);
}

function diasEntre(de: string, ate: string) {
  const lista: string[] = [];
  const [a, m, d] = de.split("-").map(Number);
  for (let i = 0; ; i++) {
    const dia = new Date(Date.UTC(a, m - 1, d + i)).toISOString().slice(0, 10);
    if (dia > ate) return lista;
    lista.push(dia);
  }
}

/** Cabeçalho numerado de cada etapa, com o resumo do que já foi escolhido. */
function Etapa({
  id,
  n,
  titulo,
  resumo,
  children,
}: {
  id: string;
  n: string;
  titulo: string;
  resumo?: string | null;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="border-t border-creme/10 pt-8 first:border-0 first:pt-0">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="flex items-baseline gap-3">
          <span className="font-display text-sm italic text-ambar">{n}</span>
          <span className="font-display text-2xl italic text-creme sm:text-[1.75rem]">{titulo}</span>
        </h2>
        {resumo && <span className="text-right text-xs text-creme/50">{resumo}</span>}
      </div>
      {children}
    </section>
  );
}

const chip =
  "rounded-full border text-sm tabular-nums transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ambar disabled:cursor-not-allowed";
const chipLivre = "border-creme/20 text-creme/85 hover:border-ambar hover:text-ambar";
const chipAtivo = "border-ambar bg-ambar text-noite";

/**
 * Reserva em quatro passos: pessoas → dia → horário → dados. Cada escolha
 * revela a próxima e rola até ela, para o cliente nunca procurar o que fazer.
 *
 * Com `alterando`, o mesmo fluxo muda uma reserva existente (sem pedir os
 * dados de novo) e devolve o controle para a página do link pessoal.
 */
export default function ReservaOnline({
  alterando,
  onAlterada,
}: {
  alterando?: { codigo: string; pessoas: number; data: string; hora: string };
  onAlterada?: () => void;
}) {
  const router = useRouter();
  const [agenda, setAgenda] = useState<Agenda | null>(null);
  const [falhou, setFalhou] = useState(false);

  const [pessoas, setPessoas] = useState(alterando?.pessoas ?? 2);
  const [data, setData] = useState<string | null>(alterando?.data ?? null);
  const [hora, setHora] = useState<string | null>(alterando?.hora ?? null);
  // Guardados com o dia a que se referem: trocar de dia já mostra o carregando.
  const [carregados, setCarregados] = useState<{ data: string; lista: HorarioSite[] } | null>(null);
  const horarios = carregados && carregados.data === data ? carregados.lista : null;

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [ocasiao, setOcasiao] = useState<string | null>(null);
  const [obs, setObs] = useState("");
  const [isca, setIsca] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const trilho = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/reservas/disponibilidade")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setAgenda)
      .catch(() => setFalhou(true));
  }, []);

  useEffect(() => {
    if (!data) return;
    let vivo = true;
    buscarHorarios(data, alterando?.codigo).then((lista) => vivo && setCarregados({ data, lista }));
    return () => {
      vivo = false;
    };
  }, [data, alterando?.codigo]);

  // Alterando: o dia já escolhido aparece no trilho, não escondido à direita.
  useEffect(() => {
    trilho.current
      ?.querySelector<HTMLElement>('[aria-checked="true"]')
      ?.scrollIntoView({ inline: "center", block: "nearest" });
  }, [agenda]);

  const dias = useMemo(() => (agenda ? diasEntre(agenda.hoje, agenda.ate) : []), [agenda]);
  const fechados = useMemo(() => new Set(agenda?.fechados ?? []), [agenda]);

  // Escolhido o horário, ele precisa continuar cabendo se o número de pessoas mudar.
  const escolhido = horarios?.find((h) => h.hora === hora) ?? null;
  const horaValida = Boolean(escolhido && escolhido.livres >= pessoas);

  if (falhou || (agenda && !agenda.ativo)) return <FormReservaWhatsApp />;
  if (!agenda) return <div className="h-96 max-w-xl animate-pulse rounded-2xl bg-creme/[0.03]" aria-busy />;

  const grupoGrande = pessoas > agenda.maxPessoas;
  const linkGrupo = whatsappLink(
    `Olá! Gostaria de reservar uma mesa para um grupo de mais de ${agenda.maxPessoas} pessoas no Rizz.`,
  );

  function proxima(id: string) {
    // Espera a etapa seguinte aparecer antes de medir onde ela está.
    requestAnimationFrame(() => requestAnimationFrame(() => scrollToTarget(`#${id}`, 24)));
  }

  async function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    if (!data || !hora) return;
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
            body: JSON.stringify({ nome, telefone, pessoas, data, hora, ocasiao, obs, site: isca }),
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

  const porTurno = (["almoco", "jantar"] as const)
    .map((t) => ({ turno: t, lista: (horarios ?? []).filter((h) => h.turno === t) }))
    .filter((g) => g.lista.length > 0);

  return (
    <form onSubmit={enviar} className="flex max-w-xl flex-col gap-10">
      <Etapa id="etapa-pessoas" n="01" titulo="Quantas pessoas?" resumo={`${pessoas} ${pessoas === 1 ? "pessoa" : "pessoas"}`}>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Número de pessoas">
          {Array.from({ length: agenda.maxPessoas }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={pessoas === n}
              onClick={() => {
                setPessoas(n);
                if (!data) proxima("etapa-dia");
              }}
              className={`${chip} size-12 ${pessoas === n ? chipAtivo : chipLivre}`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            role="radio"
            aria-checked={grupoGrande}
            onClick={() => setPessoas(agenda.maxPessoas + 1)}
            className={`${chip} h-12 px-5 ${grupoGrande ? chipAtivo : chipLivre}`}
          >
            Mais de {agenda.maxPessoas}
          </button>
        </div>
      </Etapa>

      {grupoGrande ? (
        <div className="rounded-2xl border border-creme/10 p-6">
          <p className="font-display text-xl italic text-creme">Grupos grandes merecem atenção especial.</p>
          <p className="mt-2 text-sm leading-relaxed text-creme/60">
            Para mais de {agenda.maxPessoas} pessoas, a equipe monta o espaço com você. Fale com a gente pelo
            WhatsApp e combinamos tudo.
          </p>
          <a
            href={linkGrupo}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex h-11 items-center rounded-full bg-ambar px-6 text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-noite transition-colors hover:bg-ouro-claro"
          >
            Falar no WhatsApp
          </a>
        </div>
      ) : (
        <>
          <Etapa
            id="etapa-dia"
            n="02"
            titulo="Qual dia?"
            resumo={data ? dataPorExtenso(data) : null}
          >
            <div
              ref={trilho}
              data-lenis-prevent
              className="-mx-[1.375rem] flex snap-x gap-2 overflow-x-auto px-[1.375rem] pb-3 [scrollbar-width:thin] sm:mx-0 sm:px-0"
              role="radiogroup"
              aria-label="Dia da reserva"
            >
              {dias.map((d, i) => {
                const fechado = fechados.has(d);
                const ativo = d === data;
                const [, m, dd] = d.split("-").map(Number);
                const rotuloDia = i === 0 ? "Hoje" : i === 1 ? "Amanhã" : NOMES_DIA[diaDaSemana(d)];
                return (
                  <button
                    key={d}
                    type="button"
                    role="radio"
                    aria-checked={ativo}
                    aria-label={`${dataPorExtenso(d)}${fechado ? ", sem reservas" : ""}`}
                    disabled={fechado}
                    onClick={() => {
                      setData(d);
                      setHora(null);
                      proxima("etapa-horario");
                    }}
                    className={`flex h-[4.75rem] w-[4.25rem] shrink-0 snap-start flex-col items-center justify-center rounded-2xl border transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ambar ${
                      ativo
                        ? chipAtivo
                        : fechado
                          ? "border-creme/5 text-creme/20"
                          : "border-creme/15 text-creme/85 hover:border-ambar hover:text-ambar"
                    }`}
                  >
                    <span className="text-[0.625rem] uppercase tracking-[0.14em]">{rotuloDia}</span>
                    <span className="font-display text-2xl leading-none">{dd}</span>
                    <span className="text-[0.625rem] uppercase tracking-[0.14em] opacity-70">
                      {fechado ? "—" : MESES[m - 1]}
                    </span>
                  </button>
                );
              })}
            </div>
          </Etapa>

          {data && (
            <Etapa id="etapa-horario" n="03" titulo="Que horas?" resumo={horaValida ? hora : null}>
              {horarios === null ? (
                <div className="flex flex-wrap gap-2" aria-busy>
                  {Array.from({ length: 8 }, (_, i) => (
                    <span key={i} className="h-11 w-[4.5rem] animate-pulse rounded-full bg-creme/5" />
                  ))}
                </div>
              ) : porTurno.length === 0 ? (
                <p className="text-sm leading-relaxed text-creme/60">
                  Não há horários disponíveis neste dia. Escolha outra data ou{" "}
                  <a href={whatsappLink("Olá! Gostaria de verificar disponibilidade de mesa no Rizz.")} target="_blank" rel="noopener noreferrer" className="text-ambar underline-offset-4 hover:underline">
                    fale com a gente no WhatsApp
                  </a>
                  .
                </p>
              ) : (
                <div className="flex flex-col gap-6">
                  {porTurno.map(({ turno, lista }) => (
                    <div key={turno}>
                      <p className="eyebrow mb-3 text-creme/45">{NOME_TURNO[turno]}</p>
                      <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={NOME_TURNO[turno]}>
                        {lista.map((h) => {
                          const cabe = h.livres >= pessoas;
                          const ativo = h.hora === hora && cabe;
                          return (
                            <button
                              key={h.hora}
                              type="button"
                              role="radio"
                              aria-checked={ativo}
                              aria-label={`${h.hora}${cabe ? (h.poucos ? ", últimos lugares" : "") : ", lotado"}`}
                              disabled={!cabe}
                              onClick={() => {
                                setHora(h.hora);
                                setErro(null);
                                if (!alterando && !nome) proxima("etapa-dados");
                              }}
                              className={`${chip} relative h-11 w-[4.5rem] ${
                                ativo ? chipAtivo : cabe ? chipLivre : "border-creme/5 text-creme/20 line-through"
                              }`}
                            >
                              {h.hora}
                              {cabe && h.poucos && !ativo && (
                                <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-ambar" aria-hidden />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {porTurno.some((g) => g.lista.some((h) => h.poucos && h.livres >= pessoas)) && (
                    <p className="flex items-center gap-2 text-xs text-creme/45">
                      <span className="size-2 rounded-full bg-ambar" aria-hidden /> últimos lugares
                    </p>
                  )}
                </div>
              )}
            </Etapa>
          )}

          {horaValida && !alterando && (
            <Etapa id="etapa-dados" n="04" titulo="Seus dados">
              <div className="grid gap-7 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="nome" className={rotulo}>
                    Nome
                  </label>
                  <input
                    id="nome"
                    required
                    autoComplete="name"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className={campo}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="telefone" className={rotulo}>
                    WhatsApp
                  </label>
                  <input
                    id="telefone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                    placeholder="(19) 99999-9999"
                    className={campo}
                  />
                  <p className="mt-2 text-xs text-creme/40">Para a equipe falar com você sobre a reserva.</p>
                </div>

                <div className="sm:col-span-2">
                  <span className={rotulo}>
                    É uma ocasião especial? <span className="normal-case tracking-normal text-creme/30">(opcional)</span>
                  </span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {OCASIOES.map((o) => (
                      <button
                        key={o.id}
                        type="button"
                        aria-pressed={ocasiao === o.id}
                        onClick={() => setOcasiao(ocasiao === o.id ? null : o.id)}
                        className={`${chip} h-10 px-4 ${ocasiao === o.id ? chipAtivo : chipLivre}`}
                      >
                        {o.rotulo}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="obs" className={rotulo}>
                    Observações <span className="normal-case tracking-normal text-creme/30">(opcional)</span>
                  </label>
                  <textarea
                    id="obs"
                    rows={2}
                    maxLength={500}
                    value={obs}
                    onChange={(e) => setObs(e.target.value)}
                    placeholder="Cadeirão, restrição alimentar, preferência de lugar…"
                    className={`${campo} h-auto resize-y py-3`}
                  />
                </div>

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
            </Etapa>
          )}

          {horaValida && (
            <div>
              {erro && (
                <p role="alert" className="mb-5 rounded-xl border border-ambar/30 bg-ambar/10 px-4 py-3 text-sm text-creme">
                  {erro}
                </p>
              )}
              <Botao type="submit" tamanho="lg" disabled={enviando} className="w-full sm:w-auto disabled:opacity-60">
                {enviando ? "Reservando…" : alterando ? "Salvar alteração" : "Confirmar reserva"}
              </Botao>
              {!alterando && data && hora && (
                <p className="mt-4 text-xs leading-relaxed text-creme/45">
                  {pessoas} {pessoas === 1 ? "pessoa" : "pessoas"} · {dataPorExtenso(data)} às {hora}. Você recebe
                  um link para alterar ou cancelar quando quiser.
                </p>
              )}
            </div>
          )}
        </>
      )}
    </form>
  );
}
