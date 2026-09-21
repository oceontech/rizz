"use client";

import {
  CircleCheck,
  Ellipsis,
  Gear,
  Gift,
  Handset,
  Heart,
  Pencil,
  PersonPlus,
  Plus,
  TrashBin,
  Clock,
} from "@gravity-ui/icons";
import {
  Avatar,
  Button,
  Card,
  Chip,
  Disclosure,
  Dropdown,
  EmptyState,
  Label,
  Modal,
  ProgressBar,
  SearchField,
  Spinner,
  Table,
  Tabs,
  toast,
} from "@heroui/react";
import { useEffect, useMemo, useState, useTransition } from "react";

import {
  avisar,
  CampoData,
  CampoNumero,
  CampoSwitch,
  CampoTexto,
  Confirmar,
} from "@/components/admin/campos";
import { Cabecalho, Kpi } from "@/components/admin/ui";
import type { Cliente } from "@/lib/admin/consultas";
import {
  ajustarSelos,
  excluirCliente,
  historicoCliente,
  registrarVisita,
  resgatarRecompensa,
  salvarCliente,
  salvarConfigFidelidade,
} from "@/lib/admin/fidelidade-actions";
import { formatarData, mascaraTelefone, telefoneWhats } from "@/lib/admin/formato";
import type { FidelidadeConfig } from "@/lib/dados";

type Filtro = "todos" | "premio" | "aniversario" | "inativos";

function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Cartela visual de selos. */
function Cartela({ selos, meta, compacta }: { selos: number; meta: number; compacta?: boolean }) {
  const cheios = Math.min(selos, meta);
  return (
    <div className={`flex flex-wrap ${compacta ? "gap-1" : "gap-1.5"}`} aria-label={`${cheios} de ${meta} selos`}>
      {Array.from({ length: meta }, (_, i) => (
        <span
          key={i}
          className={`grid place-items-center rounded-full ${compacta ? "size-2.5" : "size-7"} ${
            i < cheios ? "bg-accent text-accent-foreground" : "border border-dashed border-border bg-surface-secondary"
          }`}
        >
          {!compacta && i < cheios && <Heart className="size-3.5" />}
        </span>
      ))}
    </div>
  );
}

// ─── Cadastro ──────────────────────────────────────────────────

function FormCliente({ cliente, onFechar }: { cliente: Cliente | null; onFechar: () => void }) {
  const [nome, setNome] = useState(cliente?.nome ?? "");
  const [telefone, setTelefone] = useState(cliente ? mascaraTelefone(cliente.telefone) : "");
  const [email, setEmail] = useState(cliente?.email ?? "");
  const [aniversario, setAniversario] = useState<string | null>(cliente?.aniversario ?? null);
  const [aceita, setAceita] = useState(cliente?.aceitaContato ?? true);
  const [obs, setObs] = useState(cliente?.obs ?? "");
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    const r = await salvarCliente({
      id: cliente?.id,
      nome,
      telefone,
      email: email || null,
      aniversario,
      aceitaContato: aceita,
      obs: obs || null,
    });
    setSalvando(false);
    if (avisar(r, cliente ? "Cliente atualizado" : "Cliente cadastrado")) onFechar();
  }

  return (
    <>
      <Modal.Header>
        <Modal.Icon className="bg-accent/10 text-accent">
          <PersonPlus className="size-5" />
        </Modal.Icon>
        <Modal.Heading>{cliente ? "Editar cliente" : "Novo cliente"}</Modal.Heading>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        <CampoTexto label="Nome" value={nome} onChange={setNome} obrigatorio autoFocus />
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto
            label="Celular / WhatsApp"
            tipo="tel"
            value={telefone}
            onChange={(v) => setTelefone(mascaraTelefone(v))}
            placeholder="(19) 99999-9999"
            obrigatorio
            descricao="É a chave do cartão fidelidade."
          />
          <CampoData label="Aniversário" value={aniversario} onChange={setAniversario} />
        </div>
        <CampoTexto label="E-mail (opcional)" tipo="email" value={email} onChange={setEmail} />
        <CampoTexto label="Observações" value={obs} onChange={setObs} multilinha linhas={2} placeholder="Prefere mesa no salão, alergia a camarão…" />
        <CampoSwitch
          label="Aceita receber mensagens"
          descricao="Promoções e parabéns de aniversário pelo WhatsApp (LGPD)."
          value={aceita}
          onChange={setAceita}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="tertiary" onPress={onFechar} isDisabled={salvando}>
          Cancelar
        </Button>
        <Button onPress={salvar} isPending={salvando}>
          Salvar
        </Button>
      </Modal.Footer>
    </>
  );
}

// ─── Ficha do cliente (visitas, resgate, histórico) ────────────

type Evento = { id: number; tipo: "visita" | "resgate" | "ajuste"; quantidade: number; nota: string | null; criadoEm: string };

function Ficha({
  cliente,
  config,
  onFechar,
  onEditar,
}: {
  cliente: Cliente;
  config: FidelidadeConfig;
  onFechar: () => void;
  onEditar: () => void;
}) {
  const [selos, setSelos] = useState(cliente.selos);
  const [visitas, setVisitas] = useState(cliente.totalVisitas);
  const [premios, setPremios] = useState(cliente.resgates);
  const [historico, setHistorico] = useState<Evento[] | null>(null);
  const [pendente, iniciar] = useTransition();
  const [ajuste, setAjuste] = useState<number | null>(null);
  const pronto = selos >= config.meta;

  useEffect(() => {
    let vivo = true;
    historicoCliente(cliente.id).then((r) => {
      if (vivo) setHistorico(r.ok ? (r.dados ?? []) : []);
    });
    return () => {
      vivo = false;
    };
  }, [cliente.id]);

  function recarregarHistorico() {
    iniciar(async () => {
      const r = await historicoCliente(cliente.id);
      if (r.ok) setHistorico(r.dados ?? []);
    });
  }

  function visita() {
    iniciar(async () => {
      const r = await registrarVisita(cliente.id, 1);
      if (r.ok && r.dados) {
        setSelos(r.dados.selos);
        setVisitas((v) => v + 1);
        if (r.dados.completou) toast.success(`${cliente.nome.split(" ")[0]} completou a cartela! 🎉`, { description: config.recompensa });
        else toast.success(`Visita registrada · ${r.dados.selos}/${r.dados.meta}`);
        recarregarHistorico();
      } else avisar(r, "");
    });
  }

  function resgatar() {
    iniciar(async () => {
      const r = await resgatarRecompensa(cliente.id);
      if (avisar(r, "Prêmio resgatado")) {
        setSelos((s) => s - config.meta);
        setPremios((n) => n + 1);
        recarregarHistorico();
      }
    });
  }

  function aplicarAjuste() {
    if (ajuste === null) return;
    iniciar(async () => {
      const r = await ajustarSelos(cliente.id, ajuste, "Ajuste manual");
      if (avisar(r, "Selos ajustados")) {
        setSelos(ajuste);
        setAjuste(null);
        recarregarHistorico();
      }
    });
  }

  const whats = telefoneWhats(cliente.telefone);

  return (
    <>
      <Modal.Header className="flex-row items-center gap-3">
        <Avatar color="accent">
          <Avatar.Fallback>{iniciais(cliente.nome)}</Avatar.Fallback>
        </Avatar>
        <div className="min-w-0">
          <Modal.Heading className="truncate">{cliente.nome}</Modal.Heading>
          <p className="text-xs text-muted">
            {mascaraTelefone(cliente.telefone)}
            {cliente.aniversario ? ` · aniversário ${formatarData(cliente.aniversario, { day: "2-digit", month: "long" })}` : ""}
          </p>
        </div>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-5">
        <div className="rounded-2xl bg-surface-secondary p-4">
          <div className="mb-3 flex items-baseline justify-between">
            <p className="text-sm font-medium">Cartela</p>
            <p className="text-sm tabular-nums">
              <span className="text-2xl font-medium">{selos}</span>
              <span className="text-muted"> / {config.meta}</span>
            </p>
          </div>
          <Cartela selos={selos} meta={config.meta} />
          {pronto && (
            <p className="mt-3 flex items-center gap-2 rounded-xl bg-warning/20 px-3 py-2 text-sm">
              <Gift className="size-4" /> Prêmio disponível: {config.recompensa}
            </p>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <Button size="lg" onPress={visita} isDisabled={pendente}>
            <Plus /> Registrar visita
          </Button>
          <Button size="lg" variant="secondary" onPress={resgatar} isDisabled={!pronto || pendente}>
            <Gift /> Resgatar prêmio
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-default p-3">
            <p className="text-[0.625rem] uppercase tracking-wider text-muted">Visitas</p>
            <p className="font-medium tabular-nums">{visitas}</p>
          </div>
          <div className="rounded-xl bg-default p-3">
            <p className="text-[0.625rem] uppercase tracking-wider text-muted">Prêmios</p>
            <p className="font-medium tabular-nums">{premios}</p>
          </div>
          <div className="rounded-xl bg-default p-3">
            <p className="text-[0.625rem] uppercase tracking-wider text-muted">Desde</p>
            <p className="font-medium tabular-nums">{formatarData(cliente.criadoEm.slice(0, 10), { month: "short", year: "2-digit" })}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Histórico</p>
          {historico === null ? (
            <div className="grid place-items-center py-6">
              <Spinner size="sm" />
            </div>
          ) : historico.length === 0 ? (
            <p className="text-sm text-muted">Nenhuma movimentação ainda.</p>
          ) : (
            <ul className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
              {historico.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    {e.tipo === "resgate" ? (
                      <Gift className="size-4 text-warning" />
                    ) : e.tipo === "visita" ? (
                      <CircleCheck className="size-4 text-success" />
                    ) : (
                      <Gear className="size-4 text-muted" />
                    )}
                    {e.tipo === "visita"
                      ? `Visita (+${e.quantidade})`
                      : e.tipo === "resgate"
                        ? `Resgate (−${e.quantidade})`
                        : `Ajuste (${e.quantidade > 0 ? "+" : ""}${e.quantidade})`}
                  </span>
                  <span className="text-xs text-muted tabular-nums">
                    {new Date(e.criadoEm).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Disclosure>
          <Disclosure.Heading>
            <Button slot="trigger" variant="ghost" size="sm" className="text-muted">
              <Gear /> Corrigir selos manualmente
              <Disclosure.Indicator />
            </Button>
          </Disclosure.Heading>
          <Disclosure.Content>
            <Disclosure.Body className="flex items-end gap-2 pt-3">
              <CampoNumero label="Selos atuais" value={ajuste ?? selos} onChange={setAjuste} min={0} max={999} />
              <Button variant="secondary" onPress={aplicarAjuste} isDisabled={ajuste === null || pendente} className="mb-0.5">
                Aplicar
              </Button>
            </Disclosure.Body>
          </Disclosure.Content>
        </Disclosure>
      </Modal.Body>
      <Modal.Footer className="flex-wrap">
        {whats && (
          <a
            href={`https://wa.me/${whats}`}
            target="_blank"
            rel="noopener"
            className="mr-auto flex items-center gap-1.5 text-sm text-accent hover:underline"
          >
            <Handset className="size-4" /> WhatsApp
          </a>
        )}
        <Button variant="tertiary" onPress={onEditar}>
          <Pencil /> Editar dados
        </Button>
        <Button variant="secondary" onPress={onFechar}>
          Fechar
        </Button>
      </Modal.Footer>
    </>
  );
}

// ─── Configuração do programa ──────────────────────────────────

function FormConfig({ config, onFechar }: { config: FidelidadeConfig; onFechar: () => void }) {
  const [ativo, setAtivo] = useState(config.ativo);
  const [meta, setMeta] = useState<number | null>(config.meta);
  const [recompensa, setRecompensa] = useState(config.recompensa);
  const [regras, setRegras] = useState(config.regras);
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    setSalvando(true);
    const r = await salvarConfigFidelidade({ ativo, meta: meta ?? 10, recompensa, regras });
    setSalvando(false);
    if (avisar(r, "Programa atualizado")) onFechar();
  }

  return (
    <>
      <Modal.Header>
        <Modal.Icon className="bg-accent/10 text-accent">
          <Gear className="size-5" />
        </Modal.Icon>
        <Modal.Heading>Regras do programa</Modal.Heading>
      </Modal.Header>
      <Modal.Body className="flex flex-col gap-4">
        <CampoSwitch
          label="Programa ativo no site"
          descricao="Mostra a página /fidelidade para cadastro e consulta de selos."
          value={ativo}
          onChange={setAtivo}
        />
        <CampoNumero label="Visitas para ganhar o prêmio" value={meta} onChange={setMeta} min={2} max={50} />
        <CampoTexto label="Prêmio" value={recompensa} onChange={setRecompensa} maxLength={120} />
        <CampoTexto label="Regras (aparecem no site)" value={regras} onChange={setRegras} multilinha linhas={3} maxLength={500} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="tertiary" onPress={onFechar} isDisabled={salvando}>
          Cancelar
        </Button>
        <Button onPress={salvar} isPending={salvando}>
          Salvar regras
        </Button>
      </Modal.Footer>
    </>
  );
}

// ─── Página ────────────────────────────────────────────────────

export default function GestorFidelidade({
  clientes,
  config,
  hoje,
}: {
  clientes: Cliente[];
  config: FidelidadeConfig;
  hoje: string;
}) {
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");
  const [modal, setModal] = useState<
    | { tipo: "ficha"; cliente: Cliente }
    | { tipo: "form"; cliente: Cliente | null }
    | { tipo: "config" }
    | null
  >(null);
  const [excluindo, setExcluindo] = useState<Cliente | null>(null);
  const [, iniciar] = useTransition();

  const mesAtual = hoje.slice(5, 7);
  // 60 dias antes de hoje (a data vem do servidor, no fuso do restaurante).
  const limiteInativo = new Date(new Date(`${hoje}T12:00:00-03:00`).getTime() - 60 * 864e5).toISOString();

  const contagem = {
    premio: clientes.filter((c) => c.selos >= config.meta).length,
    aniversario: clientes.filter((c) => c.aniversario?.slice(5, 7) === mesAtual).length,
    inativos: clientes.filter((c) => !c.ultimaVisita || c.ultimaVisita < limiteInativo).length,
  };

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const digitos = termo.replace(/\D/g, "");
    return clientes.filter((c) => {
      if (filtro === "premio" && c.selos < config.meta) return false;
      if (filtro === "aniversario" && c.aniversario?.slice(5, 7) !== mesAtual) return false;
      if (filtro === "inativos" && c.ultimaVisita && c.ultimaVisita >= limiteInativo) return false;
      if (!termo) return true;
      return c.nome.toLowerCase().includes(termo) || (digitos.length >= 3 && c.telefone.includes(digitos));
    });
  }, [clientes, busca, filtro, config.meta, mesAtual, limiteInativo]);

  const visitasTotais = clientes.reduce((s, c) => s + c.totalVisitas, 0);
  const resgates = clientes.reduce((s, c) => s + c.resgates, 0);

  function visitaRapida(c: Cliente) {
    iniciar(async () => {
      const r = await registrarVisita(c.id, 1);
      if (r.ok && r.dados) {
        if (r.dados.completou) toast.success(`${c.nome.split(" ")[0]} completou a cartela! 🎉`, { description: config.recompensa });
        else toast.success(`+1 selo para ${c.nome.split(" ")[0]} · ${r.dados.selos}/${r.dados.meta}`);
      } else avisar(r, "");
    });
  }

  const vazio = (
    <EmptyState className="flex flex-col items-center gap-2 py-12 text-center">
      <Heart className="size-6 text-muted" />
      <p className="font-medium">{clientes.length ? "Ninguém encontrado" : "Nenhum cliente no programa"}</p>
      <p className="text-sm text-muted">
        {clientes.length ? "Busque pelo nome ou pelos números do celular." : "Cadastre no caixa ou divulgue a página /fidelidade do site."}
      </p>
    </EmptyState>
  );

  return (
    <>
      <Cabecalho
        titulo="Fidelidade"
        descricao={`Cartão digital: a cada ${config.meta} visitas, o cliente ganha ${config.recompensa.toLowerCase()}.`}
        acoes={
          <>
            <Button size="sm" variant="secondary" onPress={() => setModal({ tipo: "config" })}>
              <Gear /> Regras
            </Button>
            <Button size="sm" onPress={() => setModal({ tipo: "form", cliente: null })}>
              <PersonPlus /> Novo cliente
            </Button>
          </>
        }
      />

      {!config.ativo && (
        <p className="mb-4 rounded-xl bg-warning/15 px-4 py-3 text-sm">
          O programa está desativado no site. Os clientes não conseguem se cadastrar nem consultar selos.
        </p>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi rotulo="Clientes" valor={clientes.length} icone={<Heart className="size-4" />} tom="accent" />
        <Kpi rotulo="Com prêmio" valor={contagem.premio} detalhe="Prontos para resgatar" icone={<Gift className="size-4" />} tom="warning" />
        <Kpi rotulo="Visitas" valor={visitasTotais} detalhe={`${resgates} prêmios entregues`} icone={<CircleCheck className="size-4" />} tom="success" />
        <Kpi rotulo="Sumidos" valor={contagem.inativos} detalhe="Sem visita há 60 dias" icone={<Clock className="size-4" />} />
      </div>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchField value={busca} onChange={setBusca} aria-label="Buscar cliente" className="w-full lg:max-w-sm">
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder="Nome ou celular…" className="w-full" />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <Tabs selectedKey={filtro} onSelectionChange={(k) => setFiltro(k as Filtro)}>
          <Tabs.ListContainer>
            <Tabs.List aria-label="Filtrar clientes">
              <Tabs.Tab id="todos" className="whitespace-nowrap">
                Todos
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="premio" className="whitespace-nowrap">
                Com prêmio <span className="ml-1 text-muted">{contagem.premio}</span>
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="aniversario" className="whitespace-nowrap">
                Aniversariantes <span className="ml-1 text-muted">{contagem.aniversario}</span>
                <Tabs.Indicator />
              </Tabs.Tab>
              <Tabs.Tab id="inativos" className="whitespace-nowrap">
                Sumidos <span className="ml-1 text-muted">{contagem.inativos}</span>
                <Tabs.Indicator />
              </Tabs.Tab>
            </Tabs.List>
          </Tabs.ListContainer>
        </Tabs>
      </div>

      {/* Desktop */}
      <div className="hidden md:block">
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Clientes do programa" className="min-w-[760px]">
              <Table.Header>
                <Table.Column isRowHeader>Cliente</Table.Column>
                <Table.Column>Selos</Table.Column>
                <Table.Column>Visitas</Table.Column>
                <Table.Column>Última visita</Table.Column>
                <Table.Column className="text-right">Ações</Table.Column>
              </Table.Header>
              <Table.Body items={lista} renderEmptyState={() => vazio}>
                {(c) => (
                  <Table.Row id={c.id}>
                    <Table.Cell>
                      <button type="button" className="flex items-center gap-3 text-left" onClick={() => setModal({ tipo: "ficha", cliente: c })}>
                        <Avatar size="sm" color={c.selos >= config.meta ? "warning" : "default"}>
                          <Avatar.Fallback>{iniciais(c.nome)}</Avatar.Fallback>
                        </Avatar>
                        <span>
                          <span className="block font-medium hover:underline">{c.nome}</span>
                          <span className="block text-xs text-muted">
                            {mascaraTelefone(c.telefone)}
                            {c.origem === "site" ? " · via site" : ""}
                          </span>
                        </span>
                      </button>
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex w-40 flex-col gap-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="tabular-nums">
                            {Math.min(c.selos, config.meta)}/{config.meta}
                          </span>
                          {c.selos >= config.meta && (
                            <Chip size="sm" color="warning" variant="soft">
                              Prêmio
                            </Chip>
                          )}
                        </div>
                        <ProgressBar
                          aria-label="Progresso da cartela"
                          value={Math.min(c.selos, config.meta)}
                          maxValue={config.meta}
                          size="sm"
                          color={c.selos >= config.meta ? "warning" : "accent"}
                        >
                          <ProgressBar.Track>
                            <ProgressBar.Fill />
                          </ProgressBar.Track>
                        </ProgressBar>
                      </div>
                    </Table.Cell>
                    <Table.Cell className="tabular-nums">{c.totalVisitas}</Table.Cell>
                    <Table.Cell className="text-sm text-muted">
                      {c.ultimaVisita ? formatarData(c.ultimaVisita.slice(0, 10), { day: "2-digit", month: "short", year: "2-digit" }) : "—"}
                    </Table.Cell>
                    <Table.Cell>
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="secondary" onPress={() => visitaRapida(c)}>
                          <Plus /> Visita
                        </Button>
                        <Dropdown>
                          <Button isIconOnly size="sm" variant="ghost" aria-label={`Ações de ${c.nome}`}>
                            <Ellipsis />
                          </Button>
                          <Dropdown.Popover placement="bottom end">
                            <Dropdown.Menu
                              onAction={(k) => {
                                if (k === "ficha") setModal({ tipo: "ficha", cliente: c });
                                if (k === "editar") setModal({ tipo: "form", cliente: c });
                                if (k === "excluir") setExcluindo(c);
                              }}
                            >
                              <Dropdown.Item id="ficha" textValue="Abrir ficha">
                                <Heart className="size-4" />
                                <Label>Abrir cartela</Label>
                              </Dropdown.Item>
                              <Dropdown.Item id="editar" textValue="Editar">
                                <Pencil className="size-4" />
                                <Label>Editar dados</Label>
                              </Dropdown.Item>
                              <Dropdown.Item id="excluir" textValue="Excluir" variant="danger">
                                <TrashBin className="size-4" />
                                <Label>Excluir cliente</Label>
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown.Popover>
                        </Dropdown>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>

      {/* Celular */}
      <div className="flex flex-col gap-3 md:hidden">
        {lista.length === 0 ? (
          <Card>{vazio}</Card>
        ) : (
          lista.map((c) => (
            <Card key={c.id} className="gap-3 p-4">
              <button type="button" className="flex items-center gap-3 text-left" onClick={() => setModal({ tipo: "ficha", cliente: c })}>
                <Avatar size="sm" color={c.selos >= config.meta ? "warning" : "default"}>
                  <Avatar.Fallback>{iniciais(c.nome)}</Avatar.Fallback>
                </Avatar>
                <span className="min-w-0 grow">
                  <span className="block truncate font-medium">{c.nome}</span>
                  <span className="block text-xs text-muted">{mascaraTelefone(c.telefone)}</span>
                </span>
                <span className="text-sm tabular-nums">
                  {Math.min(c.selos, config.meta)}/{config.meta}
                </span>
              </button>
              <Cartela selos={c.selos} meta={config.meta} compacta />
              <div className="flex gap-2">
                <Button size="sm" className="grow" onPress={() => visitaRapida(c)}>
                  <Plus /> Registrar visita
                </Button>
                <Button size="sm" variant="secondary" onPress={() => setModal({ tipo: "ficha", cliente: c })}>
                  Cartela
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal>
        <Modal.Backdrop isOpen={modal !== null} onOpenChange={(v) => !v && setModal(null)}>
          <Modal.Container size="md" scroll="inside">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              {modal?.tipo === "ficha" && (
                <Ficha
                  key={`ficha-${modal.cliente.id}`}
                  cliente={modal.cliente}
                  config={config}
                  onFechar={() => setModal(null)}
                  onEditar={() => setModal({ tipo: "form", cliente: modal.cliente })}
                />
              )}
              {modal?.tipo === "form" && (
                <FormCliente key={`form-${modal.cliente?.id ?? "novo"}`} cliente={modal.cliente} onFechar={() => setModal(null)} />
              )}
              {modal?.tipo === "config" && <FormConfig config={config} onFechar={() => setModal(null)} />}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

      <Confirmar
        aberto={excluindo !== null}
        onFechar={() => setExcluindo(null)}
        titulo="Excluir cliente?"
        texto={
          <>
            <strong>{excluindo?.nome}</strong> e todo o histórico de selos serão apagados.
          </>
        }
        onConfirmar={async () => {
          if (excluindo) avisar(await excluirCliente(excluindo.id), "Cliente excluído");
        }}
      />
    </>
  );
}
