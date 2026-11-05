"use client";

import {
  CalendarDays,
  Check,
  CircleCheck,
  CircleX,
  Clock,
  Copy,
  MessageCircle,
  MessageSquareText,
  PartyPopper,
  Pencil,
  Phone,
  Sparkles,
  Trash2,
  UserX,
  Users,
} from "lucide-react";
import { createContext, useContext, useEffect, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  avisar,
  BotaoSalvar,
  CampoData,
  CampoHora,
  CampoNumero,
  CampoSelect,
  CampoTelefone,
  CampoTexto,
} from "@/components/admin/campos";
import { Janela, MenuAcoes, Selo, useUltimo, type Tom } from "@/components/admin/ui";
import { Button } from "@/components/sistema/ui/button";
import type { Reserva } from "@/lib/admin/consultas";
import { formatarData, mascaraTelefone, telefoneWhats } from "@/lib/admin/formato";
import {
  clientePorTelefone,
  codigoDaReserva,
  lotacaoNoHorario,
  mudarStatusReserva,
  salvarReserva,
  type StatusReserva,
} from "@/lib/admin/reservas-actions";
import { OCASIOES, rotuloOcasiao } from "@/lib/reservas/regras";
import { cn } from "@/lib/utils";

export const STATUS: Record<StatusReserva, { rotulo: string; tom: Tom }> = {
  pendente: { rotulo: "Pendente", tom: "atencao" },
  confirmada: { rotulo: "Confirmada", tom: "positivo" },
  concluida: { rotulo: "Chegou", tom: "info" },
  cancelada: { rotulo: "Cancelada", tom: "negativo" },
  nao_compareceu: { rotulo: "Não veio", tom: "negativo" },
};

/** Link pessoal do cliente; as reservas antigas ganham código na hora. */
async function linkDoCliente(r: Reserva) {
  const codigo = r.codigo ?? (await codigoDaReserva(r.id).then((x) => (x.ok ? x.dados : null)));
  return codigo ? `${window.location.origin}/reservas/${codigo}` : null;
}

function mensagemConfirmacao(r: Reserva, link: string | null) {
  const quando = r.data ? formatarData(r.data, { weekday: "long", day: "2-digit", month: "long" }) : "";
  return [
    `Olá, ${r.nome.split(" ")[0]}! Sua reserva no Rizz Cucina & Vino está confirmada para ${quando}${
      r.hora ? ` às ${r.hora}` : ""
    }, ${r.pessoas} ${r.pessoas === 1 ? "pessoa" : "pessoas"}.`,
    link && `Se precisar alterar ou cancelar: ${link}`,
    "Até lá!",
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * O WhatsApp abre numa aba aberta já no clique: depois de um `await` o
 * navegador do celular trata como pop-up e bloqueia.
 */
async function abrirWhatsComMensagem(r: Reserva) {
  const whats = telefoneWhats(r.telefone);
  if (!whats) return;
  const aba = window.open("about:blank", "_blank");
  const link = await linkDoCliente(r);
  const url = `https://wa.me/${whats}?text=${encodeURIComponent(mensagemConfirmacao(r, link))}`;
  if (aba) aba.location.href = url;
  else window.location.href = url;
}

export async function copiarTexto(texto: string, aviso = "Link copiado") {
  try {
    await navigator.clipboard.writeText(texto);
    toast.success(aviso);
  } catch {
    toast.error("Não foi possível copiar.");
  }
}

export function useStatus(r: Reserva) {
  const [pendente, iniciar] = useTransition();
  function mudar(s: StatusReserva) {
    iniciar(async () => {
      const res = await mudarStatusReserva(r.id, s);
      avisar(res, `Reserva: ${STATUS[s].rotulo.toLowerCase()}`);
    });
  }
  return { pendente, mudar };
}

export function MenuReserva({
  r,
  onEditar,
  onExcluir,
}: {
  r: Reserva;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const { mudar } = useStatus(r);
  const temWhats = Boolean(telefoneWhats(r.telefone));

  return (
    <MenuAcoes
      rotulo={`Ações da reserva de ${r.nome}`}
      acoes={[
        { id: "editar", rotulo: "Editar", icone: Pencil },
        temWhats && { id: "whats", rotulo: "Abrir WhatsApp", icone: Phone },
        temWhats && { id: "mensagem", rotulo: "Enviar confirmação", icone: MessageCircle },
        { id: "link", rotulo: "Copiar link do cliente", icone: Copy },
        { id: "confirmada", rotulo: "Marcar confirmada", icone: CircleCheck, separar: true, desabilitada: r.status === "confirmada" },
        { id: "pendente", rotulo: "Voltar para pendente", icone: Clock, desabilitada: r.status === "pendente" },
        { id: "concluida", rotulo: "Cliente chegou", icone: Check, desabilitada: r.status === "concluida" },
        { id: "nao_compareceu", rotulo: "Não compareceu", icone: UserX, desabilitada: r.status === "nao_compareceu" },
        { id: "cancelada", rotulo: "Cancelar reserva", icone: CircleX, desabilitada: r.status === "cancelada" },
        { id: "excluir", rotulo: "Excluir", icone: Trash2, perigo: true, separar: true },
      ]}
      aoEscolher={(k) => {
        if (k === "editar") return onEditar();
        if (k === "excluir") return onExcluir();
        if (k === "mensagem") return void abrirWhatsComMensagem(r);
        if (k === "link") return void linkDoCliente(r).then((l) => (l ? copiarTexto(l) : undefined));
        if (k === "whats") {
          const w = telefoneWhats(r.telefone);
          if (w) window.open(`https://wa.me/${w}`, "_blank", "noopener");
          return;
        }
        mudar(k as StatusReserva);
      }}
    />
  );
}

/** Ação principal do momento: confirmar o pedido ou registrar a chegada. */
/** O WhatsApp automático (Evolution) está ligado? Dado pela página de reservas. */
export const WhatsAutomatico = createContext(false);

export function AcaoRapida({ r, hoje }: { r: Reserva; hoje: string }) {
  const { pendente, mudar } = useStatus(r);
  const whatsAutomatico = useContext(WhatsAutomatico);

  if (r.status === "pendente") {
    return (
      <BotaoSalvar
        size="sm"
        pendente={pendente}
        className="botao-confirmar bg-[#15803d]! font-semibold text-white! hover:bg-[#166534]!"
        onClick={() => {
          mudar("confirmada");
          // Com o WhatsApp automático ligado, a confirmação já sai pela
          // instância; abrir o WhatsApp manual mandaria a mensagem duas vezes.
          if (!whatsAutomatico) void abrirWhatsComMensagem({ ...r, status: "confirmada" });
        }}
      >
        <Check strokeWidth={2.5} /> Confirmar
      </BotaoSalvar>
    );
  }
  if (r.status === "confirmada" && r.data !== null && r.data <= hoje) {
    return (
      <div className="flex gap-1">
        <BotaoSalvar size="sm" variant="secondary" pendente={pendente} onClick={() => mudar("concluida")}>
          <Check /> Chegou
        </BotaoSalvar>
        <Button size="sm" variant="ghost" className="rounded-full" disabled={pendente} onClick={() => mudar("nao_compareceu")}>
          Não veio
        </Button>
      </div>
    );
  }
  return null;
}

type Pista = { nome: string; visitas: number | null; reservas: number; faltas: number };

/** "1ª vez", "3ª reserva" e faltas anteriores, pelo histórico do mesmo telefone. */
function historico(r: Reserva) {
  if (r.anteriores === undefined || !r.telefone) return null;
  return r.anteriores === 0 ? "Primeira reserva" : `${r.anteriores + 1}ª reserva`;
}

/**
 * Selos da reserva, iguais na lista, nos cards do dia e na ficha: primeira vez
 * (ou quantas já fez), faltas anteriores, ocasião e mesa.
 */
export function TagsReserva({ r, className }: { r: Reserva; className?: string }) {
  const ocasiao = rotuloOcasiao(r.ocasiao);
  const faltas = r.faltasAntes ?? 0;
  const tags = [
    r.anteriores === 0 && r.telefone && (
      <Selo key="nova" tom="info">
        <Sparkles /> 1ª vez
      </Selo>
    ),
    r.anteriores !== undefined && r.anteriores > 0 && (
      <Selo key="volta" tom="neutro">
        {r.anteriores + 1}ª reserva
      </Selo>
    ),
    faltas > 0 && (
      <Selo key="faltas" tom="negativo">
        <UserX /> {faltas} {faltas === 1 ? "falta" : "faltas"}
      </Selo>
    ),
    ocasiao && (
      <Selo key="ocasiao" tom="atencao">
        <PartyPopper /> {ocasiao}
      </Selo>
    ),
    r.mesa && (
      <Selo key="mesa" tom="neutro">
        Mesa {r.mesa}
      </Selo>
    ),
  ].filter(Boolean);
  if (!tags.length) return null;
  return <div className={cn("flex flex-wrap items-center gap-1.5", className)}>{tags}</div>;
}

/** Observação numa linha só, com reticências; a inteira fica na ficha. */
export function ObsResumo({ obs, className }: { obs: string | null; className?: string }) {
  if (!obs) return null;
  return (
    <p className={cn("flex min-w-0 items-center gap-1.5 text-[13px] text-muted-foreground", className)} title={obs}>
      <MessageSquareText className="size-3.5 shrink-0" />
      <span className="truncate">{obs}</span>
    </p>
  );
}

/** A ficha: tudo da reserva para ler de relance, e as ações do momento no rodapé. */
function Ficha({ r }: { r: Reserva }) {
  const whats = telefoneWhats(r.telefone);
  const hist = historico(r);
  const faltas = r.faltasAntes ?? 0;
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-4 rounded-2xl bg-muted/70 p-4">
        <span className="grid w-14 shrink-0 place-items-center rounded-xl bg-card py-1.5 text-center shadow-suave">
          <span className="text-[0.65rem] font-semibold text-muted-foreground uppercase">
            {r.data ? formatarData(r.data, { month: "short" }).replace(".", "") : "—"}
          </span>
          <span className="numeros text-2xl leading-none font-semibold">{r.data?.slice(8, 10) ?? "?"}</span>
        </span>
        <div className="min-w-0 grow">
          <p className="text-[17px] leading-snug font-semibold first-letter:uppercase">
            {r.data ? formatarData(r.data, { weekday: "long", day: "2-digit", month: "long" }) : "Sem data"}
          </p>
          <p className="numeros mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[15px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Clock className="size-4" /> {r.hora ?? "sem horário"}
            </span>
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <Users className="size-4" /> {r.pessoas} {r.pessoas === 1 ? "pessoa" : "pessoas"}
            </span>
          </p>
        </div>
      </div>

      {/* Situação na frente dos selos: no celular, ao lado da data, ela espremia o texto. */}
      <div className="flex flex-wrap items-center gap-1.5">
        <Selo tom={STATUS[r.status].tom} ponto>
          {STATUS[r.status].rotulo}
        </Selo>
        <TagsReserva r={r} className="contents" />
      </div>

      {r.obs && (
        <div className="rounded-2xl border px-4 py-3">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MessageSquareText className="size-3.5" /> Observações
          </p>
          <p className="text-[15px] whitespace-pre-line">{r.obs}</p>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-2xl border px-4 py-3">
        <div className="min-w-0 grow">
          <p className="truncate font-medium">{r.nome}</p>
          <p className="numeros text-[13px] text-muted-foreground">{r.telefone ? mascaraTelefone(r.telefone) : "sem telefone"}</p>
          {hist && (
            <p className="mt-0.5 text-xs text-muted-foreground">
              {hist}
              {faltas > 0 && <span className="text-negativo-texto"> · faltou {faltas} {faltas === 1 ? "vez" : "vezes"}</span>}
            </p>
          )}
        </div>
        {whats && (
          <>
            <Button asChild variant="secondary" size="icon" className="rounded-full" aria-label={`WhatsApp de ${r.nome}`}>
              <a href={`https://wa.me/${whats}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle />
              </a>
            </Button>
            <Button asChild variant="secondary" size="icon" className="rounded-full" aria-label={`Ligar para ${r.nome}`}>
              <a href={`tel:+${whats}`}>
                <Phone />
              </a>
            </Button>
          </>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {r.origem === "site" ? "Feita pelo site" : "Registrada no painel"} em{" "}
        {new Date(r.criadoEm).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" })}
      </p>
    </div>
  );
}

const FORM_RESERVA = "form-reserva";

function Formulario({
  reserva,
  dataInicial,
  onSalvando,
  onSalvo,
}: {
  reserva: Reserva | null;
  dataInicial: string;
  onSalvando: (v: boolean) => void;
  onSalvo: () => void;
}) {
  const [telefone, setTelefone] = useState(reserva?.telefone ?? "");
  const [nome, setNome] = useState(reserva?.nome ?? "");
  const [pessoas, setPessoas] = useState<number | null>(reserva?.pessoas ?? 2);
  const [data, setData] = useState<string | null>(reserva?.data ?? dataInicial);
  const [hora, setHora] = useState<string | null>(reserva?.hora ?? "20:00");
  const [ocasiao, setOcasiao] = useState<string>(reserva?.ocasiao ?? "nenhuma");
  const [mesa, setMesa] = useState(reserva?.mesa ?? "");
  const [obs, setObs] = useState(reserva?.obs ?? "");
  const [status, setStatus] = useState<StatusReserva>(reserva?.status ?? "confirmada");
  // As respostas guardam a chave da consulta: valem só enquanto ela for a atual.
  const [achado, setAchado] = useState<{ chave: string; pista: Pista | null } | null>(null);
  const [vagas, setVagas] = useState<{ chave: string; livres: number; lotacao: number } | null>(null);

  // Telefone completo: procura o cliente nas reservas anteriores (sem contar esta).
  const digitos = telefone.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  useEffect(() => {
    if (digitos.length < 10) return;
    let vivo = true;
    clientePorTelefone(digitos, reserva?.id)
      .then((r) => {
        if (!vivo || !r.ok) return;
        setAchado({ chave: digitos, pista: r.dados ?? null });
        if (r.dados) setNome((n) => n || r.dados!.nome);
      })
      .catch(() => {}); // sem rede: só fica sem a pista
    return () => {
      vivo = false;
    };
  }, [digitos, reserva?.id]);
  const pista = achado?.chave === digitos ? achado.pista : null;

  const chaveVagas = `${data}|${hora}`;
  useEffect(() => {
    if (!data || !hora) return;
    let vivo = true;
    const t = setTimeout(() => {
      lotacaoNoHorario(data, hora, reserva?.id)
        .then((r) => {
          if (vivo && r.ok && r.dados?.turno) setVagas({ chave: `${data}|${hora}`, ...r.dados });
        })
        .catch(() => {}); // sem rede: só fica sem o aviso de lotação
    }, 250);
    return () => {
      vivo = false;
      clearTimeout(t);
    };
  }, [data, hora, reserva?.id]);
  const lotacao = vagas?.chave === chaveVagas ? vagas : null;

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    onSalvando(true);
    const r = await salvarReserva({
      id: reserva?.id,
      nome,
      telefone: telefone || null,
      pessoas: pessoas ?? 1,
      data: data ?? "",
      hora: hora ?? "",
      obs: obs || null,
      ocasiao: ocasiao === "nenhuma" ? null : ocasiao,
      mesa: mesa || null,
      status,
    }).catch(() => ({ ok: false as const, erro: "Sem conexão. Confira a internet e tente de novo." }));
    onSalvando(false);
    if (avisar(r, reserva ? "Reserva atualizada" : "Reserva registrada")) onSalvo();
  }

  const passou = lotacao && pessoas !== null && pessoas > lotacao.livres;

  return (
    <form id={FORM_RESERVA} onSubmit={salvar} className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <CampoTelefone label="WhatsApp" value={telefone} onChange={setTelefone} autoFocus={!reserva} />
        {pista && pista.reservas > 0 && (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-muted px-3 py-2 text-[13px] text-muted-foreground">
            <span className="font-medium text-foreground">Já reservou antes</span>
            <span>
              {pista.reservas} {pista.reservas === 1 ? "reserva" : "reservas"}
            </span>
            {pista.faltas > 0 && (
              <span className="text-negativo-texto">
                {pista.faltas} {pista.faltas === 1 ? "falta" : "faltas"}
              </span>
            )}
          </p>
        )}
      </div>
      <CampoTexto label="Nome do cliente" value={nome} onChange={setNome} obrigatorio />

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoData label="Data" value={data} onChange={setData} />
        <CampoHora label="Horário" value={hora} onChange={setHora} />
      </div>
      <CampoNumero label="Pessoas" value={pessoas} onChange={setPessoas} min={1} max={200} />
      {lotacao && (
        <p
          className={cn(
            "-mt-2 rounded-xl px-3 py-2 text-[13px]",
            passou ? "bg-negativo/10 text-negativo-texto" : "bg-muted text-muted-foreground",
          )}
        >
          {passou
            ? `Acima da lotação: só ${lotacao.livres} de ${lotacao.lotacao} lugares livres nesse horário. Dá para salvar mesmo assim.`
            : `${lotacao.livres} de ${lotacao.lotacao} lugares livres nesse horário.`}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <CampoSelect
          label="Ocasião"
          value={ocasiao}
          onChange={setOcasiao}
          opcoes={[{ id: "nenhuma", rotulo: "Nenhuma" }, ...OCASIOES.map((o) => ({ id: o.id, rotulo: o.rotulo }))]}
        />
        <CampoTexto label="Mesa" value={mesa} onChange={setMesa} placeholder="Ex.: 12, 12+13, varanda" />
      </div>
      <CampoSelect
        label="Situação"
        value={status}
        onChange={(v) => setStatus(v as StatusReserva)}
        opcoes={(Object.keys(STATUS) as StatusReserva[]).map((s) => ({ id: s, rotulo: STATUS[s].rotulo }))}
      />
      <CampoTexto
        label="Observações"
        value={obs}
        onChange={setObs}
        multilinha
        linhas={2}
        placeholder="Cadeirão, restrição alimentar, bolo…"
      />
    </form>
  );
}

/** O que está aberto: a ficha de uma reserva (ou direto a edição) ou uma reserva nova. */
export type ReservaAberta = { id: number; editar?: boolean } | { nova: string };

/**
 * Janela da reserva. Uma reserva existente abre na ficha (leitura, com as
 * ações do momento); "Editar" troca para o formulário na mesma janela. Uma
 * reserva nova abre direto no formulário. Os dados vêm sempre da lista atual,
 * então a ficha acompanha uma confirmação ou mudança feita por aqui.
 */
export function EditorReserva({
  aberta,
  reservas,
  hoje,
  onFechar,
  onExcluir,
}: {
  aberta: ReservaAberta | null;
  reservas: Reserva[];
  hoje: string;
  onFechar: () => void;
  onExcluir: (r: Reserva) => void;
}) {
  const atual = useUltimo(aberta);
  const encontrada = atual && "id" in atual ? (reservas.find((x) => x.id === atual.id) ?? null) : null;
  const reserva = useUltimo(encontrada);
  if (!atual) return null;
  const nova = "nova" in atual ? atual.nova : null;
  return (
    <JanelaReserva
      key={nova ? `nova-${nova}` : `r-${atual && "id" in atual ? atual.id : 0}-${atual && "editar" in atual && atual.editar ? "e" : "f"}`}
      aberta={aberta !== null}
      reserva={nova ? null : reserva}
      editarDireto={Boolean(atual && "editar" in atual && atual.editar)}
      dataInicial={nova ?? hoje}
      hoje={hoje}
      onFechar={onFechar}
      onExcluir={onExcluir}
    />
  );
}

function JanelaReserva({
  aberta,
  reserva,
  editarDireto,
  dataInicial,
  hoje,
  onFechar,
  onExcluir,
}: {
  aberta: boolean;
  reserva: Reserva | null;
  editarDireto: boolean;
  dataInicial: string;
  hoje: string;
  onFechar: () => void;
  onExcluir: (r: Reserva) => void;
}) {
  const [modo, setModo] = useState<"ficha" | "editar">(reserva && !editarDireto ? "ficha" : "editar");
  const [salvando, setSalvando] = useState(false);
  const editando = modo === "editar" || !reserva;

  return (
    <Janela
      aberta={aberta}
      aoFechar={onFechar}
      icone={CalendarDays}
      titulo={!reserva ? "Nova reserva" : editando ? "Editar reserva" : reserva.nome}
      descricao={!reserva ? "Pedidos por telefone, WhatsApp ou balcão" : editando ? reserva.nome : undefined}
      largura="sm:max-w-xl"
      rodape={
        editando ? (
          <>
            <Button
              variant="secondary"
              className="rounded-full"
              disabled={salvando}
              onClick={() => (reserva && !editarDireto ? setModo("ficha") : onFechar())}
            >
              {reserva && !editarDireto ? "Voltar" : "Cancelar"}
            </Button>
            <BotaoSalvar type="submit" form={FORM_RESERVA} pendente={salvando}>
              Salvar reserva
            </BotaoSalvar>
          </>
        ) : (
          <div className="flex w-full items-center gap-2">
            <MenuReserva r={reserva!} onEditar={() => setModo("editar")} onExcluir={() => onExcluir(reserva!)} />
            <span className="grow" />
            <AcaoRapida r={reserva!} hoje={hoje} />
            <Button variant="secondary" className="rounded-full" onClick={() => setModo("editar")}>
              <Pencil /> Editar
            </Button>
          </div>
        )
      }
    >
      {editando ? (
        <Formulario
          reserva={reserva}
          dataInicial={dataInicial}
          onSalvando={setSalvando}
          onSalvo={() => (reserva && !editarDireto ? setModo("ficha") : onFechar())}
        />
      ) : (
        <Ficha r={reserva!} />
      )}
    </Janela>
  );
}
