"use client";

import {
  Calendar as IconeCalendario,
  Check,
  CircleCheck,
  CircleXmark,
  Clock,
  Copy,
  Ellipsis,
  Handset,
  Pencil,
  PersonXmark,
  TrashBin,
} from "@gravity-ui/icons";
import { Button, Dropdown, Label, Modal, toast } from "@heroui/react";
import { useEffect, useState, useTransition } from "react";

import {
  avisar,
  CampoData,
  CampoHora,
  CampoNumero,
  CampoSelect,
  CampoTexto,
} from "@/components/admin/campos";
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
import { OCASIOES } from "@/lib/reservas/regras";

export const STATUS: Record<
  StatusReserva,
  { rotulo: string; cor: "warning" | "success" | "default" | "danger" | "accent" }
> = {
  pendente: { rotulo: "Pendente", cor: "warning" },
  confirmada: { rotulo: "Confirmada", cor: "success" },
  concluida: { rotulo: "Chegou", cor: "accent" },
  cancelada: { rotulo: "Cancelada", cor: "danger" },
  nao_compareceu: { rotulo: "Não veio", cor: "danger" },
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
    toast.danger("Não foi possível copiar.");
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
    <Dropdown>
      <Button isIconOnly size="sm" variant="ghost" aria-label={`Ações da reserva de ${r.nome}`}>
        <Ellipsis />
      </Button>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu
          disabledKeys={[r.status]}
          onAction={(k) => {
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
        >
          <Dropdown.Item id="editar" textValue="Editar">
            <Pencil className="size-4" />
            <Label>Editar</Label>
          </Dropdown.Item>
          {temWhats ? (
            <Dropdown.Item id="whats" textValue="WhatsApp">
              <Handset className="size-4" />
              <Label>Abrir WhatsApp</Label>
            </Dropdown.Item>
          ) : null}
          {temWhats ? (
            <Dropdown.Item id="mensagem" textValue="Enviar confirmação">
              <CircleCheck className="size-4" />
              <Label>Enviar confirmação</Label>
            </Dropdown.Item>
          ) : null}
          <Dropdown.Item id="link" textValue="Copiar link">
            <Copy className="size-4" />
            <Label>Copiar link do cliente</Label>
          </Dropdown.Item>
          <Dropdown.Item id="confirmada" textValue="Confirmar">
            <CircleCheck className="size-4" />
            <Label>Marcar confirmada</Label>
          </Dropdown.Item>
          <Dropdown.Item id="pendente" textValue="Pendente">
            <Clock className="size-4" />
            <Label>Voltar para pendente</Label>
          </Dropdown.Item>
          <Dropdown.Item id="concluida" textValue="Chegou">
            <Check className="size-4" />
            <Label>Cliente chegou</Label>
          </Dropdown.Item>
          <Dropdown.Item id="nao_compareceu" textValue="Não veio">
            <PersonXmark className="size-4" />
            <Label>Não compareceu</Label>
          </Dropdown.Item>
          <Dropdown.Item id="cancelada" textValue="Cancelar">
            <CircleXmark className="size-4" />
            <Label>Cancelar reserva</Label>
          </Dropdown.Item>
          <Dropdown.Item id="excluir" textValue="Excluir" variant="danger">
            <TrashBin className="size-4" />
            <Label>Excluir</Label>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

/** Ação principal do momento: confirmar o pedido ou registrar a chegada. */
export function AcaoRapida({ r, hoje }: { r: Reserva; hoje: string }) {
  const { pendente, mudar } = useStatus(r);

  if (r.status === "pendente") {
    return (
      <Button
        size="sm"
        variant="secondary"
        isPending={pendente}
        onPress={() => {
          mudar("confirmada");
          void abrirWhatsComMensagem({ ...r, status: "confirmada" });
        }}
      >
        <Check /> Confirmar
      </Button>
    );
  }
  if (r.status === "confirmada" && r.data !== null && r.data <= hoje) {
    return (
      <div className="flex gap-1">
        <Button size="sm" variant="secondary" isPending={pendente} onPress={() => mudar("concluida")}>
          <Check /> Chegou
        </Button>
        <Button size="sm" variant="ghost" isDisabled={pendente} onPress={() => mudar("nao_compareceu")}>
          Não veio
        </Button>
      </div>
    );
  }
  return null;
}

type Pista = { nome: string; visitas: number | null; reservas: number; faltas: number };

export function FormReserva({
  reserva,
  dataInicial,
  onFechar,
}: {
  reserva: Reserva | null;
  dataInicial: string;
  onFechar: () => void;
}) {
  const [telefone, setTelefone] = useState(reserva?.telefone ? mascaraTelefone(reserva.telefone) : "");
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
  const digitos = telefone.replace(/\D/g, "");
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
    <>
      <Modal.Header>
        <Modal.Icon className="bg-accent/10 text-accent">
          <IconeCalendario className="size-5" />
        </Modal.Icon>
        <Modal.Heading>{reserva ? "Editar reserva" : "Nova reserva"}</Modal.Heading>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <CampoTexto
              label="Telefone / WhatsApp"
              tipo="tel"
              value={telefone}
              onChange={(v) => setTelefone(mascaraTelefone(v))}
              placeholder="(19) 99999-9999"
              autoFocus={!reserva}
            />
            {pista && (
              <p className="text-xs text-muted">
                {pista.visitas !== null ? `Fidelidade · ${pista.visitas} visitas` : "Já reservou antes"}
                {pista.reservas > 0 && ` · ${pista.reservas} ${pista.reservas === 1 ? "reserva" : "reservas"}`}
                {pista.faltas > 0 && (
                  <span className="text-danger"> · {pista.faltas} {pista.faltas === 1 ? "falta" : "faltas"}</span>
                )}
              </p>
            )}
          </div>
          <CampoTexto label="Nome do cliente" value={nome} onChange={setNome} obrigatorio />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <CampoNumero label="Pessoas" value={pessoas} onChange={setPessoas} min={1} max={200} />
          <CampoData label="Data" value={data} onChange={setData} obrigatorio />
          <CampoHora label="Horário" value={hora} onChange={setHora} obrigatorio />
        </div>
        {lotacao && (
          <p className={`-mt-1 text-xs ${passou ? "text-danger" : "text-muted"}`}>
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
      </Modal.Body>
      <Modal.Footer>
        <Button variant="tertiary" onPress={onFechar} isDisabled={salvando}>
          Cancelar
        </Button>
        <Button onPress={salvar} isPending={salvando}>
          Salvar reserva
        </Button>
      </Modal.Footer>
    </>
  );
}
