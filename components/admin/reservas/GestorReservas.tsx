"use client";

import {
  Calendar as IconeCalendario,
  CircleCheck,
  CircleXmark,
  Ellipsis,
  Handset,
  Pencil,
  Plus,
  TrashBin,
  Check,
  Clock,
} from "@gravity-ui/icons";
import {
  Button,
  Card,
  Chip,
  Dropdown,
  EmptyState,
  Label,
  Modal,
  SearchField,
  Table,
  Tabs,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  avisar,
  CampoData,
  CampoHora,
  CampoNumero,
  CampoSelect,
  CampoTexto,
  Confirmar,
} from "@/components/admin/campos";
import { Cabecalho } from "@/components/admin/ui";
import type { Reserva } from "@/lib/admin/consultas";
import { formatarData, mascaraTelefone, telefoneWhats } from "@/lib/admin/formato";
import {
  excluirReserva,
  mudarStatusReserva,
  salvarReserva,
  type StatusReserva,
} from "@/lib/admin/reservas-actions";

const STATUS: Record<StatusReserva, { rotulo: string; cor: "warning" | "success" | "default" | "danger" }> = {
  pendente: { rotulo: "Pendente", cor: "warning" },
  confirmada: { rotulo: "Confirmada", cor: "success" },
  concluida: { rotulo: "Concluída", cor: "default" },
  cancelada: { rotulo: "Cancelada", cor: "danger" },
};

type Visao = "hoje" | "proximas" | "pendentes" | "anteriores";

function linkConfirmacao(r: Reserva) {
  const whats = telefoneWhats(r.telefone);
  if (!whats) return null;
  const quando = r.data ? formatarData(r.data, { weekday: "long", day: "2-digit", month: "long" }) : "";
  const texto = `Olá, ${r.nome.split(" ")[0]}! Sua reserva no Rizz Cucina & Vino está confirmada para ${quando}${
    r.hora ? ` às ${r.hora}` : ""
  }, ${r.pessoas} ${r.pessoas === 1 ? "pessoa" : "pessoas"}. Até lá!`;
  return `https://wa.me/${whats}?text=${encodeURIComponent(texto)}`;
}

function Acoes({
  r,
  onEditar,
  onExcluir,
}: {
  r: Reserva;
  onEditar: () => void;
  onExcluir: () => void;
}) {
  const [, iniciar] = useTransition();

  function status(s: StatusReserva) {
    iniciar(async () => {
      const res = await mudarStatusReserva(r.id, s);
      if (avisar(res, `Reserva ${STATUS[s].rotulo.toLowerCase()}`) && s === "confirmada") {
        const link = linkConfirmacao(r);
        if (link) window.open(link, "_blank", "noopener");
      }
    });
  }

  return (
    <div className="flex items-center justify-end gap-1">
      {r.status === "pendente" && (
        <Button size="sm" variant="secondary" onPress={() => status("confirmada")}>
          <Check /> Confirmar
        </Button>
      )}
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
              if (k === "whats") {
                const w = telefoneWhats(r.telefone);
                if (w) window.open(`https://wa.me/${w}`, "_blank", "noopener");
                return;
              }
              status(k as StatusReserva);
            }}
          >
            <Dropdown.Item id="editar" textValue="Editar">
              <Pencil className="size-4" />
              <Label>Editar</Label>
            </Dropdown.Item>
            {telefoneWhats(r.telefone) ? (
              <Dropdown.Item id="whats" textValue="WhatsApp">
                <Handset className="size-4" />
                <Label>Abrir WhatsApp</Label>
              </Dropdown.Item>
            ) : null}
            <Dropdown.Item id="confirmada" textValue="Confirmar">
              <CircleCheck className="size-4" />
              <Label>Marcar confirmada</Label>
            </Dropdown.Item>
            <Dropdown.Item id="pendente" textValue="Pendente">
              <Clock className="size-4" />
              <Label>Voltar para pendente</Label>
            </Dropdown.Item>
            <Dropdown.Item id="concluida" textValue="Concluída">
              <Check className="size-4" />
              <Label>Cliente compareceu</Label>
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
    </div>
  );
}

function FormReserva({
  reserva,
  hoje,
  onFechar,
}: {
  reserva: Reserva | null;
  hoje: string;
  onFechar: () => void;
}) {
  const [nome, setNome] = useState(reserva?.nome ?? "");
  const [telefone, setTelefone] = useState(reserva?.telefone ? mascaraTelefone(reserva.telefone) : "");
  const [pessoas, setPessoas] = useState<number | null>(reserva?.pessoas ?? 2);
  const [data, setData] = useState<string | null>(reserva?.data ?? hoje);
  const [hora, setHora] = useState<string | null>(reserva?.hora ?? "20:00");
  const [obs, setObs] = useState(reserva?.obs ?? "");
  const [status, setStatus] = useState<StatusReserva>(reserva?.status ?? "confirmada");
  const [salvando, setSalvando] = useState(false);

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
      status,
    });
    setSalvando(false);
    if (avisar(r, reserva ? "Reserva atualizada" : "Reserva registrada")) onFechar();
  }

  return (
    <>
      <Modal.Header>
        <Modal.Icon className="bg-accent/10 text-accent">
          <IconeCalendario className="size-5" />
        </Modal.Icon>
        <Modal.Heading>{reserva ? "Editar reserva" : "Nova reserva"}</Modal.Heading>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        <CampoTexto label="Nome do cliente" value={nome} onChange={setNome} obrigatorio autoFocus />
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto
            label="Telefone / WhatsApp"
            tipo="tel"
            value={telefone}
            onChange={(v) => setTelefone(mascaraTelefone(v))}
            placeholder="(19) 99999-9999"
          />
          <CampoNumero label="Pessoas" value={pessoas} onChange={setPessoas} min={1} max={200} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoData label="Data" value={data} onChange={setData} obrigatorio />
          <CampoHora label="Horário" value={hora} onChange={setHora} obrigatorio />
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
          placeholder="Aniversário, cadeirão, restrição alimentar…"
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

export default function GestorReservas({
  reservas,
  hoje,
  abrirNova,
}: {
  reservas: Reserva[];
  hoje: string;
  abrirNova: boolean;
}) {
  const router = useRouter();
  const [visao, setVisao] = useState<Visao>("proximas");
  const [dia, setDia] = useState<string | null>(null);
  const [busca, setBusca] = useState("");
  const [editando, setEditando] = useState<Reserva | "nova" | null>(abrirNova ? "nova" : null);
  const [excluindo, setExcluindo] = useState<Reserva | null>(null);

  const contagem = {
    hoje: reservas.filter((r) => r.data === hoje && r.status !== "cancelada").length,
    proximas: reservas.filter((r) => (r.data ?? "9999") >= hoje && ["pendente", "confirmada"].includes(r.status)).length,
    pendentes: reservas.filter((r) => r.status === "pendente").length,
  };

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    let l = reservas;
    if (dia) l = l.filter((r) => r.data === dia);
    else if (visao === "hoje") l = l.filter((r) => r.data === hoje);
    else if (visao === "proximas")
      l = l.filter((r) => (r.data ?? "9999") >= hoje && ["pendente", "confirmada"].includes(r.status));
    else if (visao === "pendentes") l = l.filter((r) => r.status === "pendente");
    else l = l.filter((r) => r.data !== null && r.data < hoje).reverse();
    if (termo) l = l.filter((r) => `${r.nome} ${r.telefone ?? ""} ${r.obs ?? ""}`.toLowerCase().includes(termo));
    return l;
  }, [reservas, visao, dia, busca, hoje]);

  const pessoas = lista.filter((r) => r.status !== "cancelada").reduce((s, r) => s + r.pessoas, 0);

  function fecharEditor() {
    setEditando(null);
    if (abrirNova) router.replace("/admin/reservas");
  }

  const vazio = (
    <EmptyState className="flex flex-col items-center gap-2 py-12 text-center">
      <IconeCalendario className="size-6 text-muted" />
      <p className="font-medium">Nenhuma reserva aqui</p>
      <p className="text-sm text-muted">Pedidos feitos pelo site aparecem automaticamente.</p>
    </EmptyState>
  );

  return (
    <>
      <Cabecalho
        titulo="Reservas"
        descricao="Pedidos do site chegam como pendentes. Confirme e o cliente recebe a mensagem pronta no WhatsApp."
        acoes={
          <Button size="sm" onPress={() => setEditando("nova")}>
            <Plus /> Nova reserva
          </Button>
        }
      />

      <div className="mb-5 flex flex-col gap-3 xl:flex-row xl:items-end xl:justify-between">
        <Tabs
          selectedKey={visao}
          onSelectionChange={(k) => {
            setDia(null);
            setVisao(k as Visao);
          }}
        >
          <Tabs.ListContainer>
            <Tabs.List aria-label="Filtrar reservas">
              <Tabs.Tab id="proximas" className="whitespace-nowrap">
                Próximas <span className="ml-1 text-muted tabular-nums">{contagem.proximas}</span>
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="hoje" className="whitespace-nowrap">
                Hoje <span className="ml-1 text-muted tabular-nums">{contagem.hoje}</span>
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="pendentes" className="whitespace-nowrap">
                Pendentes <span className="ml-1 text-muted tabular-nums">{contagem.pendentes}</span>
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="anteriores" className="whitespace-nowrap">
                Anteriores
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>

        <div className="grid gap-3 sm:grid-cols-[1fr_220px] xl:w-[520px]">
          <SearchField value={busca} onChange={setBusca} aria-label="Buscar reserva">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Nome, telefone…" className="w-full" />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
          <div className="flex items-center gap-1">
            <CampoData label="Ir para o dia" value={dia} onChange={setDia} className="w-full" ocultarLabel />
            {dia && (
              <Button size="sm" variant="ghost" onPress={() => setDia(null)} className="mb-1">
                Limpar
              </Button>
            )}
          </div>
        </div>
      </div>

      <p className="mb-3 text-sm text-muted">
        {dia ? `${formatarData(dia, { weekday: "long", day: "2-digit", month: "long" })} · ` : ""}
        {lista.length} {lista.length === 1 ? "reserva" : "reservas"} · {pessoas} pessoas
      </p>

      {/* Desktop: tabela */}
      <div className="hidden md:block">
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Reservas" className="min-w-[760px]">
              <Table.Header>
                <Table.Column isRowHeader>Cliente</Table.Column>
                <Table.Column>Quando</Table.Column>
                <Table.Column>Pessoas</Table.Column>
                <Table.Column>Situação</Table.Column>
                <Table.Column>Origem</Table.Column>
                <Table.Column className="text-right">Ações</Table.Column>
              </Table.Header>
              <Table.Body items={lista} renderEmptyState={() => vazio}>
                {(r) => (
                  <Table.Row id={r.id}>
                    <Table.Cell>
                      <p className="font-medium">{r.nome}</p>
                      <p className="text-xs text-muted">
                        {r.telefone ? mascaraTelefone(r.telefone) : "sem telefone"}
                        {r.obs ? ` · ${r.obs}` : ""}
                      </p>
                    </Table.Cell>
                    <Table.Cell>
                      <p className="tabular-nums">
                        {formatarData(r.data, { weekday: "short", day: "2-digit", month: "short" })}
                      </p>
                      <p className="text-xs text-muted tabular-nums">{r.hora ?? "sem horário"}</p>
                    </Table.Cell>
                    <Table.Cell className="tabular-nums">{r.pessoas}</Table.Cell>
                    <Table.Cell>
                      <Chip size="sm" variant="soft" color={STATUS[r.status].cor}>
                        {STATUS[r.status].rotulo}
                      </Chip>
                    </Table.Cell>
                    <Table.Cell>
                      <span className="text-xs text-muted">{r.origem === "site" ? "Site" : "Painel"}</span>
                    </Table.Cell>
                    <Table.Cell>
                      <Acoes r={r} onEditar={() => setEditando(r)} onExcluir={() => setExcluindo(r)} />
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>

      {/* Celular: cartões */}
      <div className="flex flex-col gap-3 md:hidden">
        {lista.length === 0 ? (
          <Card>{vazio}</Card>
        ) : (
          lista.map((r) => (
            <Card key={r.id} className="gap-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{r.nome}</p>
                  <p className="text-xs text-muted">{r.telefone ? mascaraTelefone(r.telefone) : "sem telefone"}</p>
                </div>
                <Chip size="sm" variant="soft" color={STATUS[r.status].cor}>
                  {STATUS[r.status].rotulo}
                </Chip>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                <span className="tabular-nums">
                  {formatarData(r.data, { weekday: "short", day: "2-digit", month: "short" })}
                </span>
                <span className="tabular-nums">{r.hora ?? "—"}</span>
                <span>
                  {r.pessoas} {r.pessoas === 1 ? "pessoa" : "pessoas"}
                </span>
              </div>
              {r.obs && <p className="rounded-xl bg-default px-3 py-2 text-xs text-muted">{r.obs}</p>}
              <Acoes r={r} onEditar={() => setEditando(r)} onExcluir={() => setExcluindo(r)} />
            </Card>
          ))
        )}
      </div>

      <Modal>
        <Modal.Backdrop isOpen={editando !== null} onOpenChange={(v) => !v && fecharEditor()}>
          <Modal.Container size="md" scroll="inside">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              {editando !== null && (
                <FormReserva
                  key={editando === "nova" ? "nova" : editando.id}
                  reserva={editando === "nova" ? null : editando}
                  hoje={hoje}
                  onFechar={fecharEditor}
                />
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Confirmar
        aberto={excluindo !== null}
        onFechar={() => setExcluindo(null)}
        titulo="Excluir reserva?"
        texto={
          <>
            A reserva de <strong>{excluindo?.nome}</strong> será apagada. Para manter o histórico, prefira
            cancelar.
          </>
        }
        onConfirmar={async () => {
          if (excluindo) avisar(await excluirReserva(excluindo.id), "Reserva excluída");
        }}
      />
    </>
  );
}
