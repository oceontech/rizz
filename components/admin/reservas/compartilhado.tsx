"use client";

import {
  CalendarDays,
  Check,
  CircleCheck,
  CircleX,
  Clock,
  Copy,
  MessageCircle,
  Pencil,
  Phone,
  Trash2,
  UserX,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
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
import { MenuAcoes, PainelLateral, useUltimo, type Tom } from "@/components/admin/ui";
import { Button } from "@/components/sistema/ui/button";
import type { Reserva } from "@/lib/admin/consultas";
import { formatarData, telefoneWhats } from "@/lib/admin/formato";
import {
  clientePorTelefone,
  codigoDaReserva,
  lotacaoNoHorario,
  mudarStatusReserva,
  salvarReserva,
  type StatusReserva,
} from "@/lib/admin/reservas-actions";
import { OCASIOES } from "@/lib/reservas/regras";
import { cn } from "@/lib/utils";

export const STATUS: Record<StatusReserva, { rotulo: string; tom: Tom }> = {
  pendente: { rotulo: "Pendente", tom: "atencao" },
  confirmada: { rotulo: "Confirmada", tom: "positivo" },
  concluida: { rotulo: "Chegou", tom: "marca" },
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
export function AcaoRapida({ r, hoje }: { r: Reserva; hoje: string }) {
  const { pendente, mudar } = useStatus(r);

  if (r.status === "pendente") {
    return (
      <BotaoSalvar
        size="sm"
        pendente={pendente}
        onClick={() => {
          mudar("confirmada");
          void abrirWhatsComMensagem({ ...r, status: "confirmada" });
        }}
      >
        <Check /> Confirmar
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

function Formulario({
  aberto,
  reserva,
  dataInicial,
  onFechar,
}: {
  aberto: boolean;
  reserva: Reserva | null;
  dataInicial: string;
  onFechar: () => void;
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
  const [salvando, setSalvando] = useState(false);
  // As respostas guardam a chave da consulta: valem só enquanto ela for a atual.
  const [achado, setAchado] = useState<{ chave: string; pista: Pista | null } | null>(null);
  const [vagas, setVagas] = useState<{ chave: string; livres: number; lotacao: number } | null>(null);

  // Telefone completo: procura o cliente na fidelidade e nas reservas anteriores.
  const digitos = telefone.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  useEffect(() => {
    if (digitos.length < 10) return;
    let vivo = true;
    clientePorTelefone(digitos).then((r) => {
      if (!vivo || !r.ok) return;
      setAchado({ chave: digitos, pista: r.dados ?? null });
      if (r.dados) setNome((n) => n || r.dados!.nome);
    });
    return () => {
      vivo = false;
    };
  }, [digitos]);
  const pista = achado?.chave === digitos ? achado.pista : null;

  const chaveVagas = `${data}|${hora}`;
  useEffect(() => {
    if (!data || !hora) return;
    let vivo = true;
    const t = setTimeout(() => {
      lotacaoNoHorario(data, hora, reserva?.id).then((r) => {
        if (vivo && r.ok && r.dados?.turno) setVagas({ chave: `${data}|${hora}`, ...r.dados });
      });
    }, 250);
    return () => {
      vivo = false;
      clearTimeout(t);
    };
  }, [data, hora, reserva?.id]);
  const lotacao = vagas?.chave === chaveVagas ? vagas : null;

  async function salvar() {
    setSalvando(true);
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
    });
    setSalvando(false);
    if (avisar(r, reserva ? "Reserva atualizada" : "Reserva registrada")) onFechar();
  }

  const passou = lotacao && pessoas !== null && pessoas > lotacao.livres;

  return (
    <PainelLateral
      aberto={aberto}
      aoFechar={onFechar}
      icone={CalendarDays}
      titulo={reserva ? "Editar reserva" : "Nova reserva"}
      descricao={reserva ? reserva.nome : "Pedidos por telefone, WhatsApp ou balcão"}
      rodape={
        <>
          <Button variant="secondary" className="rounded-full" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <BotaoSalvar className="flex-1" pendente={salvando} onClick={salvar}>
            Salvar reserva
          </BotaoSalvar>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <CampoTelefone label="WhatsApp" value={telefone} onChange={setTelefone} autoFocus={!reserva} />
          {pista && (
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl bg-muted px-3 py-2 text-[13px] text-muted-foreground">
              <span className="font-medium text-foreground">
                {pista.visitas !== null ? `Fidelidade · ${pista.visitas} visitas` : "Já reservou antes"}
              </span>
              {pista.reservas > 0 && <span>{pista.reservas} {pista.reservas === 1 ? "reserva" : "reservas"}</span>}
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
      </div>
    </PainelLateral>
  );
}

/** Painel lateral para criar ou editar uma reserva. */
export function EditorReserva({
  editando,
  hoje,
  onFechar,
}: {
  editando: Reserva | { nova: string } | null;
  hoje: string;
  onFechar: () => void;
}) {
  const atual = useUltimo(editando);
  if (!atual) return null;
  const nova = "nova" in atual ? atual : null;
  return (
    <Formulario
      key={nova ? `nova-${nova.nova}` : (atual as Reserva).id}
      aberto={editando !== null}
      reserva={nova ? null : (atual as Reserva)}
      dataInicial={nova?.nova ?? hoje}
      onFechar={onFechar}
    />
  );
}
