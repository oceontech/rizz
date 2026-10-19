"use client";

import { Calendar as IconeCalendario, Link as IconeLink, Plus } from "@gravity-ui/icons";
import { Button, Card, Chip, EmptyState, Modal, SearchField, Table, Tabs } from "@heroui/react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { avisar, CampoData, Confirmar } from "@/components/admin/campos";
import { Cabecalho } from "@/components/admin/ui";
import type { Reserva } from "@/lib/admin/consultas";
import { formatarData, mascaraTelefone } from "@/lib/admin/formato";
import { excluirReserva } from "@/lib/admin/reservas-actions";
import { rotuloOcasiao, type Bloqueio, type ReservasConfig } from "@/lib/reservas/regras";

import AjustesReservas from "./AjustesReservas";
import { AcaoRapida, copiarTexto, FormReserva, MenuReserva, STATUS } from "./compartilhado";
import VisaoDia from "./VisaoDia";

type Aba = "dia" | "lista" | "ajustes";
type Visao = "hoje" | "proximas" | "pendentes" | "anteriores";

function Lista({
  reservas,
  hoje,
  onEditar,
  onExcluir,
}: {
  reservas: Reserva[];
  hoje: string;
  onEditar: (r: Reserva) => void;
  onExcluir: (r: Reserva) => void;
}) {
  const [visao, setVisao] = useState<Visao>("proximas");
  const [dia, setDia] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

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
    if (termo)
      l = l.filter((r) => `${r.nome} ${r.telefone ?? ""} ${r.obs ?? ""} ${r.mesa ?? ""}`.toLowerCase().includes(termo));
    return l;
  }, [reservas, visao, dia, busca, hoje]);

  const pessoas = lista
    .filter((r) => r.status !== "cancelada" && r.status !== "nao_compareceu")
    .reduce((s, r) => s + r.pessoas, 0);

  const vazio = (
    <EmptyState className="flex flex-col items-center gap-2 py-12 text-center">
      <IconeCalendario className="size-6 text-muted" />
      <p className="font-medium">Nenhuma reserva aqui</p>
      <p className="text-sm text-muted">As reservas feitas pelo site aparecem automaticamente.</p>
    </EmptyState>
  );

  const detalhe = (r: Reserva) =>
    [rotuloOcasiao(r.ocasiao), r.mesa && `Mesa ${r.mesa}`, r.obs].filter(Boolean).join(" · ");

  return (
    <>
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
              <SearchField.Input placeholder="Nome, telefone, mesa…" className="w-full" />
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
                        {detalhe(r) ? ` · ${detalhe(r)}` : ""}
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
                      <div className="flex items-center justify-end gap-1">
                        <AcaoRapida r={r} hoje={hoje} />
                        <MenuReserva r={r} onEditar={() => onEditar(r)} onExcluir={() => onExcluir(r)} />
                      </div>
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
              {detalhe(r) && <p className="rounded-xl bg-default px-3 py-2 text-xs text-muted">{detalhe(r)}</p>}
              <div className="flex items-center justify-end gap-1">
                <AcaoRapida r={r} hoje={hoje} />
                <MenuReserva r={r} onEditar={() => onEditar(r)} onExcluir={() => onExcluir(r)} />
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}

export default function GestorReservas({
  reservas,
  config,
  bloqueios,
  hoje,
  abrirNova,
}: {
  reservas: Reserva[];
  config: ReservasConfig;
  bloqueios: Bloqueio[];
  hoje: string;
  abrirNova: boolean;
}) {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>("dia");
  const [editando, setEditando] = useState<Reserva | { nova: string } | null>(abrirNova ? { nova: hoje } : null);
  const [excluindo, setExcluindo] = useState<Reserva | null>(null);

  function fecharEditor() {
    setEditando(null);
    if (abrirNova) router.replace("/admin/reservas");
  }

  const nova = editando && "nova" in editando ? editando : null;

  return (
    <>
      <Cabecalho
        titulo="Reservas"
        descricao={
          config.ativo
            ? "O cliente reserva pelo site entre os horários livres. Envie o link para quem pedir uma mesa."
            : "As reservas pelo site estão pausadas: o site monta o pedido no WhatsApp da equipe."
        }
        acoes={
          <>
            <Button
              size="sm"
              variant="secondary"
              onPress={() => copiarTexto(`${window.location.origin}/reservas`, "Link de reservas copiado")}
            >
              <IconeLink /> Copiar link de reservas
            </Button>
            <Button size="sm" onPress={() => setEditando({ nova: hoje })}>
              <Plus /> Nova reserva
            </Button>
          </>
        }
      />

      <Tabs selectedKey={aba} onSelectionChange={(k) => setAba(k as Aba)} className="mb-6">
        <Tabs.ListContainer>
          <Tabs.List aria-label="Seções de reservas">
            <Tabs.Tab id="dia">
              Dia
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="lista">
              Todas
              <Tabs.Indicator />
            </Tabs.Tab>
            <Tabs.Tab id="ajustes">
              Ajustes
              <Tabs.Indicator />
            </Tabs.Tab>
          </Tabs.List>
        </Tabs.ListContainer>
      </Tabs>

      {aba === "dia" && (
        <VisaoDia
          reservas={reservas}
          config={config}
          bloqueios={bloqueios}
          hoje={hoje}
          onNova={(dia) => setEditando({ nova: dia })}
          onEditar={setEditando}
          onExcluir={setExcluindo}
        />
      )}
      {aba === "lista" && <Lista reservas={reservas} hoje={hoje} onEditar={setEditando} onExcluir={setExcluindo} />}
      {aba === "ajustes" && <AjustesReservas config={config} bloqueios={bloqueios} hoje={hoje} />}

      <Modal>
        <Modal.Backdrop isOpen={editando !== null} onOpenChange={(v) => !v && fecharEditor()}>
          <Modal.Container size="md" scroll="inside">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              {editando !== null && (
                <FormReserva
                  key={nova ? `nova-${nova.nova}` : (editando as Reserva).id}
                  reserva={nova ? null : (editando as Reserva)}
                  dataInicial={nova?.nova ?? hoje}
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
