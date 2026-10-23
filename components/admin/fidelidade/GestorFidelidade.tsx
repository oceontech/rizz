"use client";

import {
  ChevronRight,
  CircleCheck,
  Clock,
  Gift,
  Heart,
  MessageCircle,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  avisar,
  BotaoSalvar,
  CampoData,
  CampoNumero,
  CampoSwitch,
  CampoTelefone,
  CampoTexto,
  Confirmar,
} from "@/components/admin/campos";
import { Cabecalho, Janela, Kpi, MenuAcoes, PainelLateral, Selo, useUltimo } from "@/components/admin/ui";
import { EstadoVazio } from "@/components/sistema/estados/estado-vazio";
import { InputBusca } from "@/components/sistema/inputs/input-texto";
import { ItemEscalonado, ListaEscalonada } from "@/components/sistema/movimento";
import { ControleSegmentado } from "@/components/sistema/pickers/controle-segmentado";
import { Button } from "@/components/sistema/ui/button";
import { Card } from "@/components/sistema/ui/card";
import { Skeleton } from "@/components/sistema/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/sistema/ui/table";
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
import { cn } from "@/lib/utils";

type Filtro = "todos" | "premio" | "aniversario" | "inativos";

function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

function Avatar({ nome, premio, grande }: { nome: string; premio?: boolean; grande?: boolean }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold",
        grande ? "size-11 text-sm" : "size-9 text-xs",
        premio ? "bg-ambar text-[#2b0710]" : "bg-primary-suave text-primary-texto",
      )}
    >
      {iniciais(nome)}
    </span>
  );
}

/** Cartela visual de selos. */
function Cartela({ selos, meta, compacta }: { selos: number; meta: number; compacta?: boolean }) {
  const cheios = Math.min(selos, meta);
  return (
    <div className={cn("flex flex-wrap", compacta ? "gap-1" : "gap-2")} aria-label={`${cheios} de ${meta} selos`}>
      {Array.from({ length: meta }, (_, i) => (
        <span
          key={i}
          className={cn(
            "grid place-items-center rounded-full transition-colors",
            compacta ? "size-2.5" : "size-9",
            i < cheios ? "bg-primary text-primary-foreground" : "bg-card shadow-[inset_0_0_0_1.5px_var(--border)]",
          )}
        >
          {!compacta && i < cheios && <Heart className="size-4 fill-current" />}
        </span>
      ))}
    </div>
  );
}

/** Barra fina de progresso da cartela. */
function Progresso({ selos, meta }: { selos: number; meta: number }) {
  const pct = Math.min(100, (selos / meta) * 100);
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted" role="meter" aria-valuenow={selos} aria-valuemin={0} aria-valuemax={meta} aria-label="Progresso da cartela">
      <div className={cn("h-full rounded-full", selos >= meta ? "bg-ambar" : "bg-primary")} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Cadastro ──────────────────────────────────────────────────

function FormCliente({ aberto, cliente, onFechar }: { aberto: boolean; cliente: Cliente | null; onFechar: () => void }) {
  const [nome, setNome] = useState(cliente?.nome ?? "");
  const [telefone, setTelefone] = useState(cliente?.telefone ?? "");
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
    <PainelLateral
      aberto={aberto}
      aoFechar={onFechar}
      icone={UserPlus}
      titulo={cliente ? "Editar cliente" : "Novo cliente"}
      descricao={cliente?.nome ?? "Cadastro no caixa ou no salão"}
      rodape={
        <>
          <Button variant="secondary" className="rounded-full" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <BotaoSalvar className="flex-1" pendente={salvando} onClick={salvar}>
            Salvar
          </BotaoSalvar>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <CampoTexto label="Nome" value={nome} onChange={setNome} obrigatorio autoFocus />
        <CampoTelefone
          label="Celular / WhatsApp"
          value={telefone}
          onChange={setTelefone}
          descricao="É a chave do cartão fidelidade."
        />
        <CampoData label="Aniversário" value={aniversario} onChange={setAniversario} />
        <CampoTexto label="E-mail (opcional)" tipo="email" value={email} onChange={setEmail} />
        <CampoTexto
          label="Observações"
          value={obs}
          onChange={setObs}
          multilinha
          linhas={2}
          placeholder="Prefere mesa no salão, alergia a camarão…"
        />
        <CampoSwitch
          label="Aceita receber mensagens"
          descricao="Promoções e parabéns de aniversário pelo WhatsApp (LGPD)."
          value={aceita}
          onChange={setAceita}
        />
      </div>
    </PainelLateral>
  );
}

// ─── Ficha do cliente (visitas, resgate, histórico) ────────────

type Evento = { id: number; tipo: "visita" | "resgate" | "ajuste"; quantidade: number; nota: string | null; criadoEm: string };

function Ficha({
  aberto,
  cliente,
  config,
  onFechar,
  onEditar,
}: {
  aberto: boolean;
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
  const [corrigindo, setCorrigindo] = useState(false);
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
        if (r.dados.completou)
          toast.success(`${cliente.nome.split(" ")[0]} completou a cartela! 🎉`, { description: config.recompensa });
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
        setCorrigindo(false);
        recarregarHistorico();
      }
    });
  }

  const whats = telefoneWhats(cliente.telefone);

  return (
    <PainelLateral
      aberto={aberto}
      aoFechar={onFechar}
      topo={<Avatar nome={cliente.nome} premio={pronto} grande />}
      titulo={cliente.nome}
      descricao={`${mascaraTelefone(cliente.telefone)}${
        cliente.aniversario ? ` · aniversário ${formatarData(cliente.aniversario, { day: "2-digit", month: "long" })}` : ""
      }`}
      rodape={
        <>
          {whats && (
            <a
              href={`https://wa.me/${whats}`}
              target="_blank"
              rel="noopener"
              className="mr-auto flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-medium text-primary-texto transition-colors hover:bg-primary-suave"
            >
              <MessageCircle className="size-4" /> WhatsApp
            </a>
          )}
          <Button variant="secondary" className="rounded-full" onClick={onEditar}>
            <Pencil /> Editar dados
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="rounded-3xl bg-muted/70 p-5">
          <div className="mb-4 flex items-baseline justify-between">
            <p className="text-sm font-semibold">Cartela</p>
            <p className="numeros text-sm">
              <span className="text-[2rem] leading-none font-semibold tracking-tight">{selos}</span>
              <span className="text-muted-foreground"> / {config.meta}</span>
            </p>
          </div>
          <Cartela selos={selos} meta={config.meta} />
          {pronto && (
            <p className="mt-4 flex items-center gap-2 rounded-xl bg-ambar/20 px-3 py-2.5 text-sm font-medium">
              <Gift className="size-4 shrink-0" /> Prêmio disponível: {config.recompensa}
            </p>
          )}
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <BotaoSalvar size="lg" pendente={pendente} onClick={visita}>
            <Plus /> Registrar visita
          </BotaoSalvar>
          <Button size="lg" variant="secondary" className="rounded-full" onClick={resgatar} disabled={!pronto || pendente}>
            <Gift /> Resgatar prêmio
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            ["Visitas", visitas],
            ["Prêmios", premios],
            ["Desde", formatarData(cliente.criadoEm.slice(0, 10), { month: "short", year: "2-digit" })],
          ].map(([rotulo, valor]) => (
            <div key={rotulo} className="rounded-2xl bg-muted/70 p-3">
              <p className="text-[0.68rem] font-medium text-muted-foreground uppercase">{rotulo}</p>
              <p className="numeros mt-0.5 font-semibold">{valor}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-2 text-sm font-semibold">Histórico</p>
          {historico === null ? (
            <div className="flex flex-col gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="h-9 rounded-xl" />
              ))}
            </div>
          ) : historico.length === 0 ? (
            <p className="rounded-xl bg-muted/70 px-3 py-3 text-sm text-muted-foreground">Nenhuma movimentação ainda.</p>
          ) : (
            <ul className="-mx-2 flex flex-col">
              {historico.map((e) => (
                <li key={e.id} className="flex items-center justify-between gap-3 rounded-xl px-2 py-2 text-sm">
                  <span className="flex items-center gap-2.5">
                    <span
                      className={cn(
                        "grid size-7 place-items-center rounded-full",
                        e.tipo === "resgate"
                          ? "bg-atencao/14 text-atencao-texto"
                          : e.tipo === "visita"
                            ? "bg-positivo/12 text-positivo-texto"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {e.tipo === "resgate" ? (
                        <Gift className="size-3.5" />
                      ) : e.tipo === "visita" ? (
                        <CircleCheck className="size-3.5" />
                      ) : (
                        <Settings2 className="size-3.5" />
                      )}
                    </span>
                    {e.tipo === "visita"
                      ? `Visita (+${e.quantidade})`
                      : e.tipo === "resgate"
                        ? `Resgate (−${e.quantidade})`
                        : `Ajuste (${e.quantidade > 0 ? "+" : ""}${e.quantidade})`}
                  </span>
                  <span className="numeros text-xs text-texto-terciario">
                    {new Date(e.criadoEm).toLocaleString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl bg-muted/70">
          <button
            type="button"
            onClick={() => setCorrigindo((v) => !v)}
            aria-expanded={corrigindo}
            className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-muted-foreground"
          >
            <Settings2 className="size-4" /> Corrigir selos manualmente
            <ChevronRight className={cn("ml-auto size-4 transition-transform", corrigindo && "rotate-90")} />
          </button>
          {corrigindo && (
            <div className="flex items-end gap-2 px-4 pb-4">
              <CampoNumero label="Selos atuais" value={ajuste ?? selos} onChange={setAjuste} min={0} max={999} className="grow" />
              <Button variant="secondary" className="rounded-full bg-card" onClick={aplicarAjuste} disabled={ajuste === null || pendente}>
                Aplicar
              </Button>
            </div>
          )}
        </div>
      </div>
    </PainelLateral>
  );
}

// ─── Configuração do programa ──────────────────────────────────

function FormConfig({ aberto, config, onFechar }: { aberto: boolean; config: FidelidadeConfig; onFechar: () => void }) {
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
    <Janela
      aberta={aberto}
      aoFechar={onFechar}
      icone={Settings2}
      titulo="Regras do programa"
      rodape={
        <>
          <Button variant="secondary" className="rounded-full" onClick={onFechar} disabled={salvando}>
            Cancelar
          </Button>
          <BotaoSalvar pendente={salvando} onClick={salvar}>
            Salvar regras
          </BotaoSalvar>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <CampoSwitch
          label="Programa ativo no site"
          descricao="Mostra a página /fidelidade para cadastro e consulta de selos."
          value={ativo}
          onChange={setAtivo}
        />
        <CampoNumero label="Visitas para ganhar o prêmio" value={meta} onChange={setMeta} min={2} max={50} />
        <CampoTexto label="Prêmio" value={recompensa} onChange={setRecompensa} maxLength={120} />
        <CampoTexto label="Regras (aparecem no site)" value={regras} onChange={setRegras} multilinha linhas={3} maxLength={500} />
      </div>
    </Janela>
  );
}

// ─── Página ────────────────────────────────────────────────────

type Modal = { tipo: "ficha"; cliente: Cliente } | { tipo: "form"; cliente: Cliente | null } | { tipo: "config" };

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
  const [modal, setModal] = useState<Modal | null>(null);
  const atual = useUltimo(modal);
  const [excluindo, setExcluindo] = useState<Cliente | null>(null);
  const excluido = useUltimo(excluindo);
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
        if (r.dados.completou)
          toast.success(`${c.nome.split(" ")[0]} completou a cartela! 🎉`, { description: config.recompensa });
        else toast.success(`+1 selo para ${c.nome.split(" ")[0]} · ${r.dados.selos}/${r.dados.meta}`);
      } else avisar(r, "");
    });
  }

  const vazio = (
    <EstadoVazio
      icone={Heart}
      titulo={clientes.length ? "Ninguém encontrado" : "Nenhum cliente no programa"}
      descricao={
        clientes.length
          ? "Busque pelo nome ou pelos números do celular."
          : "Cadastre no caixa ou divulgue a página /fidelidade do site."
      }
      acao={
        !clientes.length && (
          <Button className="rounded-full" onClick={() => setModal({ tipo: "form", cliente: null })}>
            <UserPlus /> Cadastrar cliente
          </Button>
        )
      }
    />
  );

  return (
    <>
      <Cabecalho
        titulo="Fidelidade"
        descricao={`Cartão digital: a cada ${config.meta} visitas, o cliente ganha ${config.recompensa.toLowerCase()}.`}
        acoes={
          <>
            <Button
              variant="secondary"
              className="rounded-full bg-card shadow-suave hover:bg-accent"
              onClick={() => setModal({ tipo: "config" })}
            >
              <Settings2 /> Regras
            </Button>
            <Button className="rounded-full" onClick={() => setModal({ tipo: "form", cliente: null })}>
              <UserPlus /> Novo cliente
            </Button>
          </>
        }
      />

      {!config.ativo && (
        <p className="mb-4 rounded-2xl bg-atencao/14 px-4 py-3 text-sm text-atencao-texto">
          O programa está desativado no site. Os clientes não conseguem se cadastrar nem consultar selos.
        </p>
      )}

      <ListaEscalonada className="mb-5 grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <ItemEscalonado>
          <Kpi rotulo="Clientes" valor={clientes.length} detalhe="Cadastrados no cartão" icone={Users} tom="marca" />
        </ItemEscalonado>
        <ItemEscalonado>
          <Kpi rotulo="Com prêmio" valor={contagem.premio} detalhe="Prontos para resgatar" icone={Gift} tom="atencao" />
        </ItemEscalonado>
        <ItemEscalonado>
          <Kpi rotulo="Visitas" valor={visitasTotais} detalhe={`${resgates} prêmios entregues`} icone={CircleCheck} tom="positivo" />
        </ItemEscalonado>
        <ItemEscalonado>
          <Kpi rotulo="Sumidos" valor={contagem.inativos} detalhe="Sem visita há 60 dias" icone={Clock} />
        </ItemEscalonado>
      </ListaEscalonada>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <InputBusca
          valor={busca}
          aoMudar={setBusca}
          placeholder="Nome ou celular…"
          aria-label="Buscar cliente"
          classeCaixa="rounded-full border-0 bg-card shadow-suave lg:max-w-sm"
        />
        <div className="-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:px-0">
          <ControleSegmentado
            rotulo="Filtrar clientes"
            sobrePagina
            valor={filtro}
            aoMudar={setFiltro}
            opcoes={[
              { valor: "todos", rotulo: "Todos" },
              { valor: "premio", rotulo: "Com prêmio", contagem: contagem.premio },
              { valor: "aniversario", rotulo: "Aniversariantes", contagem: contagem.aniversario },
              { valor: "inativos", rotulo: "Sumidos", contagem: contagem.inativos },
            ]}
          />
        </div>
      </div>

      {/* Desktop */}
      <Card className="hidden py-0 md:flex">
        {lista.length === 0 ? (
          vazio
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-11 pl-5">Cliente</TableHead>
                <TableHead>Selos</TableHead>
                <TableHead>Visitas</TableHead>
                <TableHead>Última visita</TableHead>
                <TableHead className="pr-5 text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lista.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="py-3 pl-5">
                    <button
                      type="button"
                      className="flex items-center gap-3 text-left"
                      onClick={() => setModal({ tipo: "ficha", cliente: c })}
                    >
                      <Avatar nome={c.nome} premio={c.selos >= config.meta} />
                      <span>
                        <span className="block font-medium hover:underline">{c.nome}</span>
                        <span className="numeros block text-xs text-muted-foreground">
                          {mascaraTelefone(c.telefone)}
                          {c.origem === "site" ? " · via site" : ""}
                        </span>
                      </span>
                    </button>
                  </TableCell>
                  <TableCell>
                    <div className="flex w-40 flex-col gap-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="numeros font-medium">
                          {Math.min(c.selos, config.meta)}/{config.meta}
                        </span>
                        {c.selos >= config.meta && <Selo tom="atencao">Prêmio</Selo>}
                      </div>
                      <Progresso selos={c.selos} meta={config.meta} />
                    </div>
                  </TableCell>
                  <TableCell className="numeros">{c.totalVisitas}</TableCell>
                  <TableCell className="numeros text-muted-foreground">
                    {c.ultimaVisita
                      ? formatarData(c.ultimaVisita.slice(0, 10), { day: "2-digit", month: "short", year: "2-digit" })
                      : "—"}
                  </TableCell>
                  <TableCell className="pr-5">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="secondary" className="rounded-full" onClick={() => visitaRapida(c)}>
                        <Plus /> Visita
                      </Button>
                      <MenuAcoes
                        rotulo={`Ações de ${c.nome}`}
                        acoes={[
                          { id: "ficha", rotulo: "Abrir cartela", icone: Heart },
                          { id: "editar", rotulo: "Editar dados", icone: Pencil },
                          { id: "excluir", rotulo: "Excluir cliente", icone: Trash2, perigo: true, separar: true },
                        ]}
                        aoEscolher={(k) => {
                          if (k === "ficha") setModal({ tipo: "ficha", cliente: c });
                          if (k === "editar") setModal({ tipo: "form", cliente: c });
                          if (k === "excluir") setExcluindo(c);
                        }}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* Celular */}
      <div className="flex flex-col gap-3 md:hidden">
        {lista.length === 0 ? (
          <Card>{vazio}</Card>
        ) : (
          lista.map((c) => (
            <Card key={c.id} size="sm" className="gap-3">
              <button
                type="button"
                className="flex items-center gap-3 px-(--card-spacing) text-left"
                onClick={() => setModal({ tipo: "ficha", cliente: c })}
              >
                <Avatar nome={c.nome} premio={c.selos >= config.meta} />
                <span className="min-w-0 grow">
                  <span className="block truncate text-[15px] font-semibold">{c.nome}</span>
                  <span className="numeros block text-[13px] text-muted-foreground">{mascaraTelefone(c.telefone)}</span>
                </span>
                <span className="numeros text-sm font-semibold">
                  {Math.min(c.selos, config.meta)}/{config.meta}
                </span>
              </button>
              <div className="px-(--card-spacing)">
                <Progresso selos={c.selos} meta={config.meta} />
              </div>
              <div className="flex gap-2 px-(--card-spacing)">
                <Button className="grow rounded-full" onClick={() => visitaRapida(c)}>
                  <Plus /> Registrar visita
                </Button>
                <Button variant="secondary" className="rounded-full" onClick={() => setModal({ tipo: "ficha", cliente: c })}>
                  Cartela
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {atual?.tipo === "ficha" && (
        <Ficha
          key={`ficha-${atual.cliente.id}`}
          aberto={modal?.tipo === "ficha"}
          cliente={atual.cliente}
          config={config}
          onFechar={() => setModal(null)}
          onEditar={() => setModal({ tipo: "form", cliente: atual.cliente })}
        />
      )}
      {atual?.tipo === "form" && (
        <FormCliente
          key={`form-${atual.cliente?.id ?? "novo"}`}
          aberto={modal?.tipo === "form"}
          cliente={atual.cliente}
          onFechar={() => setModal(null)}
        />
      )}
      {atual?.tipo === "config" && <FormConfig aberto={modal?.tipo === "config"} config={config} onFechar={() => setModal(null)} />}

      <Confirmar
        aberto={excluindo !== null}
        onFechar={() => setExcluindo(null)}
        titulo="Excluir cliente?"
        texto={
          <>
            <strong className="text-foreground">{excluido?.nome}</strong> e todo o histórico de selos serão apagados.
          </>
        }
        onConfirmar={async () => {
          if (excluindo) avisar(await excluirCliente(excluindo.id), "Cliente excluído");
        }}
      />
    </>
  );
}
