"use client";

import {
  Ban,
  Check,
  Copy,
  KeyRound,
  Link2,
  LogOut,
  Mail,
  MailPlus,
  MessageCircle,
  Send,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { avisar, BotaoSalvar, CampoSelect, CampoTelefone, CampoTexto, Confirmar } from "@/components/admin/campos";
import { Cabecalho, Janela, MenuAcoes, PainelLateral, Secao, Selo, useUltimo, type Tom } from "@/components/admin/ui";
import { Button } from "@/components/sistema/ui/button";
import type { Canais, Envio } from "@/lib/admin/envio-acesso";
import type { ConvitePendente, Membro } from "@/lib/admin/equipe";
import {
  cancelarConvite,
  convidar,
  definirAtivo,
  encerrarSessoesDe,
  linkNovaSenha,
  mudarAcesso,
  removerMembro,
  renovarConvite,
} from "@/lib/admin/equipe-actions";
import { AREAS_VISIVEIS, PAPEIS, papelInfo, permissoesDe, resumoPermissoes, type Papel, type Permissoes } from "@/lib/permissoes";
import { cn } from "@/lib/utils";

import { EditorAcesso, LegendaNiveis, RotuloNivel } from "./acesso";

const TOM_PAPEL: Record<Papel, Tom> = { dono: "marca", gerente: "info", colaborador: "positivo", personalizado: "atencao" };
const CORES = ["bg-rose-600", "bg-amber-600", "bg-emerald-600", "bg-sky-600", "bg-indigo-600", "bg-fuchsia-600", "bg-teal-600"];

function iniciais(nome: string) {
  return nome.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]!.toUpperCase()).join("") || "?";
}

function Avatar({ nome, apagado }: { nome: string; apagado?: boolean }) {
  const cor = CORES[[...nome].reduce((t, c) => t + c.charCodeAt(0), 0) % CORES.length];
  return (
    <span className={cn("grid size-10 shrink-0 place-items-center rounded-full text-sm font-semibold text-white", apagado ? "bg-muted-foreground/40" : cor)} aria-hidden>
      {iniciais(nome)}
    </span>
  );
}

/** "há 5 min", "ontem", "há 3 dias", "12/10". */
const TZ = "America/Sao_Paulo";
const diaSP = (ms: number) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(ms);
const horaSP = (ms: number) => new Date(ms).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TZ });

/** Até 3 min depois do último gesto, a pessoa conta como usando o painel agora. */
const ATIVO_AGORA_MIN = 3;

/**
 * Último uso do painel, para a lista da Equipe. Vale o mais recente entre a
 * última atividade (clique, tecla, rolagem) e o último login.
 */
function presenca(m: Membro, agora: number): { agora: boolean; texto: string; curto: string } | null {
  const marcas = [m.ultimaAtividade, m.ultimoLogin].filter(Boolean).map((v) => new Date(v!).getTime());
  if (!marcas.length) return null;
  const quando = Math.max(...marcas);
  const min = Math.floor((agora - quando) / 6e4);
  if (min < ATIVO_AGORA_MIN) return { agora: true, texto: "Ativo agora", curto: "ativo agora" };
  if (min < 60) return { agora: false, texto: `Ativo há ${min} min`, curto: `ativo há ${min} min` };
  const dias = Math.round((new Date(diaSP(agora)).getTime() - new Date(diaSP(quando)).getTime()) / 864e5);
  const hora = horaSP(quando);
  const dia =
    dias === 0
      ? `hoje às ${hora}`
      : dias === 1
        ? `ontem às ${hora}`
        : dias < 7
          ? `${new Date(quando).toLocaleDateString("pt-BR", { weekday: "short", timeZone: TZ }).replace(".", "")} às ${hora}`
          : `em ${new Date(quando).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: dias > 300 ? "2-digit" : undefined, timeZone: TZ })}`;
  return { agora: false, texto: `Ativo ${dia}`, curto: `ativo ${dia}` };
}

function dicaLogin(m: Membro) {
  return m.ultimoLogin
    ? `Último login: ${new Date(m.ultimoLogin).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: TZ })}`
    : "Ainda não entrou";
}

const diasAte = (iso: string, agora: number) => Math.max(0, Math.ceil((new Date(iso).getTime() - agora) / 864e5));

// ─── Resultado do envio (convite ou nova senha) ────────────────

type EnvioPronto = { link: string; nome: string; tipo: "convite" | "senha"; envios: Envio[] };

/** Linha "vai por e-mail / WhatsApp" do formulário, antes de enviar. */
function CanalPrevisto({ icone: Icone, rotulo, destino, ligado, desligado }: { icone: typeof Mail; rotulo: string; destino: string; ligado: boolean; desligado: string }) {
  return (
    <li className="flex items-start gap-2.5 py-2 text-sm">
      <Icone className={cn("mt-0.5 size-4 shrink-0", ligado ? "text-foreground" : "text-muted-foreground")} />
      <span className="min-w-0">
        <span className={cn("font-medium", !ligado && "text-muted-foreground")}>{rotulo}</span>
        <span className="block truncate text-[13px] text-muted-foreground">{ligado ? destino : desligado}</span>
      </span>
    </li>
  );
}

function JanelaEnvio({ dados, aoFechar }: { dados: EnvioPronto | null; aoFechar: () => void }) {
  const d = useUltimo(dados);
  const [copiado, setCopiado] = useState(false);
  if (!d) return null;
  const enviados = d.envios.filter((e) => e.ok);
  const nadaSaiu = enviados.length === 0;
  const primeiro = d.nome.split(" ")[0];

  async function copiar() {
    try {
      await navigator.clipboard.writeText(d!.link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      avisar({ ok: false, erro: "Não deu para copiar. Selecione o link e copie à mão." }, "");
    }
  }

  return (
    <Janela
      aberta={Boolean(dados)}
      aoFechar={aoFechar}
      icone={nadaSaiu ? Link2 : Send}
      titulo={nadaSaiu ? "Link criado, mas não foi enviado" : d.tipo === "convite" ? `Convite enviado para ${primeiro}` : `Link de senha enviado para ${primeiro}`}
      descricao={
        nadaSaiu
          ? "Nenhum canal de envio está disponível agora. Copie o link e mande para a pessoa."
          : d.tipo === "convite"
            ? "A pessoa toca no link, cria a senha e já entra com o acesso que você escolheu."
            : "O link vale 24 horas e só pode ser usado uma vez."
      }
      rodape={
        <Button className="rounded-full" onClick={aoFechar}>
          Pronto
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        {d.envios.length > 0 && (
          <ul className="flex flex-col divide-y rounded-2xl border px-3.5">
            {d.envios.map((e) => {
              const Icone = e.canal === "email" ? Mail : MessageCircle;
              return (
                <li key={e.canal} className="flex items-center gap-3 py-3">
                  <Icone className="size-4 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 grow">
                    <span className="block text-sm font-medium">{e.canal === "email" ? "E-mail" : "WhatsApp"}</span>
                    <span className="block truncate text-[13px] text-muted-foreground">{e.ok ? e.destino : e.motivo}</span>
                  </span>
                  <Selo tom={e.ok ? "positivo" : "neutro"}>{e.ok ? "Enviado" : "Não enviado"}</Selo>
                </li>
              );
            })}
          </ul>
        )}
        <div className={cn("flex flex-col gap-2", !nadaSaiu && "rounded-2xl bg-muted/50 p-3.5")}>
          {!nadaSaiu && <p className="text-[13px] text-muted-foreground">Se a pessoa não receber, copie o link e mande por outro caminho.</p>}
          <div className="flex items-center gap-2 rounded-2xl border bg-background p-1.5 pl-3.5">
            <span className="min-w-0 grow truncate font-mono text-[13px] select-all">{d.link}</span>
            <Button size="sm" variant={copiado ? "secondary" : nadaSaiu ? "default" : "secondary"} className="shrink-0 rounded-full" onClick={copiar}>
              {copiado ? <Check /> : <Copy />}
              {copiado ? "Copiado" : "Copiar link"}
            </Button>
          </div>
        </div>
      </div>
    </Janela>
  );
}

// ─── Convidar e editar acesso ──────────────────────────────────

const VALIDADES = [
  { id: "1", rotulo: "1 dia" },
  { id: "3", rotulo: "3 dias" },
  { id: "7", rotulo: "7 dias" },
  { id: "15", rotulo: "15 dias" },
  { id: "30", rotulo: "30 dias" },
];

function PainelConvite({
  aberto,
  aoFechar,
  podeDarAdmin,
  canais,
  aoCriar,
}: {
  aberto: boolean;
  aoFechar: () => void;
  podeDarAdmin: boolean;
  canais: Canais;
  aoCriar: (l: EnvioPronto) => void;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cargo, setCargo] = useState("");
  const [papel, setPapel] = useState<Papel>("colaborador");
  const [permissoes, setPermissoes] = useState<Permissoes>(permissoesDe("colaborador"));
  const [validade, setValidade] = useState("7");
  const [enviando, setEnviando] = useState(false);

  function limpar() {
    setNome("");
    setEmail("");
    setTelefone("");
    setCargo("");
    setPapel("colaborador");
    setPermissoes(permissoesDe("colaborador"));
    setValidade("7");
  }

  async function enviar() {
    setEnviando(true);
    const r = await convidar({ nome, email, telefone, cargo, papel, permissoes, validadeDias: Number(validade) });
    setEnviando(false);
    if (!r.ok) return avisar(r, "");
    aoCriar({ link: r.dados!.link, nome, tipo: "convite", envios: r.dados!.envios });
    limpar();
  }

  return (
    <PainelLateral
      aberto={aberto}
      aoFechar={aoFechar}
      icone={UserPlus}
      titulo="Convidar pessoa"
      descricao="Ela recebe um link para criar a própria senha."
      largura="data-[side=right]:sm:max-w-xl"
      rodape={
        <>
          <Button variant="secondary" className="rounded-full" onClick={aoFechar}>
            Cancelar
          </Button>
          <BotaoSalvar pendente={enviando} onClick={enviar} className="ml-auto" disabled={nome.trim().length < 2 || !email.includes("@")}>
            <Send /> Enviar convite
          </BotaoSalvar>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto label="Nome" value={nome} onChange={setNome} maxLength={60} placeholder="Ana Souza" autoFocus />
          <CampoTexto label="Cargo (opcional)" value={cargo} onChange={setCargo} maxLength={40} placeholder="Recepção" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto label="E-mail" tipo="email" value={email} onChange={setEmail} descricao="É com ele que a pessoa vai entrar no painel." />
          <CampoTelefone label="WhatsApp (opcional)" value={telefone} onChange={setTelefone} descricao="Para receber o convite também por lá." />
        </div>
        <EditorAcesso
          papel={papel}
          permissoes={permissoes}
          podeDarAdmin={podeDarAdmin}
          aoMudar={(p, m) => {
            setPapel(p);
            setPermissoes(m);
          }}
        />
        <CampoSelect label="O link vale por" value={validade} onChange={setValidade} opcoes={VALIDADES} className="sm:max-w-56" />
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium">O convite vai por</span>
          <ul className="flex flex-col divide-y rounded-2xl border px-3.5">
            <CanalPrevisto icone={Mail} rotulo="E-mail" ligado={canais.email} destino={email || "o e-mail informado acima"} desligado="Ainda não configurado: o link aparece para você copiar" />
            <CanalPrevisto
              icone={MessageCircle}
              rotulo="WhatsApp"
              ligado={canais.whatsapp && telefone.replace(/\D/g, "").length >= 12}
              destino={`Pelo WhatsApp do restaurante, para ${telefone ? "o número informado" : "o número"}`}
              desligado={canais.whatsapp ? "Informe o número acima para enviar por aqui também" : "WhatsApp do restaurante desconectado (Configurações → WhatsApp)"}
            />
          </ul>
        </div>
      </div>
    </PainelLateral>
  );
}

function PainelAcesso({
  membro,
  aoFechar,
  podeDarAdmin,
}: {
  membro: Membro | null;
  aoFechar: () => void;
  podeDarAdmin: boolean;
}) {
  const m = useUltimo(membro);
  const [de, setDe] = useState(membro);
  const [papel, setPapel] = useState<Papel>(membro?.papel ?? "colaborador");
  const [permissoes, setPermissoes] = useState<Permissoes>(membro?.permissoes ?? permissoesDe("colaborador"));
  const [cargo, setCargo] = useState(membro?.cargo ?? "");
  const [telefone, setTelefone] = useState(membro?.telefone ?? "");
  const [salvando, setSalvando] = useState(false);
  if (membro !== de) {
    setDe(membro);
    if (membro) {
      setPapel(membro.papel);
      setPermissoes(membro.permissoes);
      setCargo(membro.cargo);
      setTelefone(membro.telefone);
    }
  }
  if (!m) return null;

  async function salvar() {
    setSalvando(true);
    const r = await mudarAcesso(m!.id, { papel, permissoes, cargo, telefone });
    setSalvando(false);
    if (avisar(r, `Acesso de ${m!.nome.split(" ")[0]} atualizado`)) aoFechar();
  }

  return (
    <PainelLateral
      aberto={Boolean(membro)}
      aoFechar={aoFechar}
      icone={ShieldCheck}
      titulo={`Acesso de ${m.nome}`}
      descricao={m.email}
      largura="data-[side=right]:sm:max-w-xl"
      rodape={
        <>
          <Button variant="secondary" className="rounded-full" onClick={aoFechar}>
            Cancelar
          </Button>
          <BotaoSalvar pendente={salvando} onClick={salvar} className="ml-auto">
            Salvar acesso
          </BotaoSalvar>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto label="Cargo (opcional)" value={cargo} onChange={setCargo} maxLength={40} placeholder="Recepção" />
          <CampoTelefone label="WhatsApp (opcional)" value={telefone} onChange={setTelefone} descricao="Recebe por aqui o link de nova senha." />
        </div>
        <EditorAcesso
          papel={papel}
          permissoes={permissoes}
          podeDarAdmin={podeDarAdmin}
          aoMudar={(p, x) => {
            setPapel(p);
            setPermissoes(x);
          }}
        />
        <p className="text-[13px] text-muted-foreground">A mudança vale na hora, sem a pessoa precisar sair e entrar de novo.</p>
      </div>
    </PainelLateral>
  );
}

// ─── Tabela de referência dos papéis ───────────────────────────

function ReferenciaPapeis() {
  const prontos = PAPEIS.filter((p) => p.id !== "personalizado");
  return (
    <Secao icone={ShieldCheck} titulo="Como funcionam os acessos" descricao="Três tipos prontos. Se nenhum servir, escolha Personalizado e marque área por área.">
      <LegendaNiveis />
      <div className="-mx-(--card-spacing) overflow-x-auto px-(--card-spacing)">
        <table className="w-full min-w-[34rem] text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="py-2 pr-3 font-medium">Área</th>
              {prontos.map((p) => (
                <th key={p.id} className="px-3 py-2 font-medium">
                  <Selo tom={TOM_PAPEL[p.id]}>{p.rotulo}</Selo>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {AREAS_VISIVEIS.map((a) => (
              <tr key={a.id}>
                <td className="py-2.5 pr-3">{a.rotulo}</td>
                {prontos.map((p) => (
                  <td key={p.id} className="px-3 py-2.5">
                    <RotuloNivel nivel={p.permissoes[a.id]} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Secao>
  );
}

// ─── Página ────────────────────────────────────────────────────

type Pendente =
  | { tipo: "remover"; membro: Membro }
  | { tipo: "desativar"; membro: Membro }
  | { tipo: "cancelar"; convite: ConvitePendente };

export default function GestorEquipe({
  membros,
  convites,
  eu,
  podeEditar,
  agora,
  canais,
}: {
  membros: Membro[];
  convites: ConvitePendente[];
  eu: { id: number; papel: Papel };
  podeEditar: boolean;
  agora: number;
  canais: Canais;
}) {
  const router = useRouter();

  // "Ativo agora" envelhece: com a tela aberta, a lista se atualiza a cada minuto.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, 60_000);
    return () => window.clearInterval(id);
  }, [router]);
  const [convidando, setConvidando] = useState(false);
  const [editando, setEditando] = useState<Membro | null>(null);
  const [envio, setEnvio] = useState<EnvioPronto | null>(null);
  const [confirmar, setConfirmar] = useState<Pendente | null>(null);
  const ultimoConfirmar = useUltimo(confirmar);
  const souAdmin = eu.papel === "dono";
  const ativos = membros.filter((m) => m.ativo);
  const inativos = membros.filter((m) => !m.ativo);

  /** Quem não é administrador não mexe em administrador. */
  const podeMexer = (m: Membro) => podeEditar && m.id !== eu.id && (souAdmin || m.papel !== "dono");

  async function executar(r: Promise<{ ok: boolean; erro?: string }>, sucesso: string) {
    if (avisar(await r, sucesso)) router.refresh();
  }

  async function acaoMembro(m: Membro, id: string) {
    const primeiro = m.nome.split(" ")[0];
    if (id === "acesso") setEditando(m);
    if (id === "senha") {
      const r = await linkNovaSenha(m.id);
      if (r.ok) setEnvio({ link: r.dados!.link, nome: m.nome, tipo: "senha", envios: r.dados!.envios });
      else avisar(r, "");
    }
    if (id === "sessoes") executar(encerrarSessoesDe(m.id), `${primeiro} vai precisar entrar de novo`);
    if (id === "desativar") setConfirmar({ tipo: "desativar", membro: m });
    if (id === "reativar") executar(definirAtivo(m.id, true), `${primeiro} voltou a ter acesso`);
    if (id === "remover") setConfirmar({ tipo: "remover", membro: m });
  }

  async function acaoConvite(c: ConvitePendente, id: string) {
    if (id === "link") {
      const r = await renovarConvite(c.id);
      if (r.ok) {
        setEnvio({ link: r.dados!.link, nome: c.nome, tipo: "convite", envios: r.dados!.envios });
        router.refresh();
      } else avisar(r, "");
    }
    if (id === "cancelar") setConfirmar({ tipo: "cancelar", convite: c });
  }

  function linhaMembro(m: Membro) {
    const papel = papelInfo(m.papel);
    // Quem está vendo a lista está usando o painel agora, por definição.
    const uso = m.id === eu.id ? { agora: true, texto: "Ativo agora", curto: "ativo agora" } : presenca(m, agora);
    return (
      <li key={m.id} className="flex items-center gap-3 py-3.5 first:pt-1 last:pb-1">
        <Avatar nome={m.nome} apagado={!m.ativo} />
        <div className="min-w-0 grow">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className={cn("truncate font-semibold", !m.ativo && "text-muted-foreground")}>{m.nome}</span>
            {m.id === eu.id && <span className="text-xs text-muted-foreground">(você)</span>}
            {m.cargo && <span className="text-[13px] text-muted-foreground">· {m.cargo}</span>}
          </p>
          <p className="truncate text-[13px] text-muted-foreground">{m.email}</p>
          <p className="mt-1 text-xs text-muted-foreground @2xl:hidden">
            {papel.rotulo} · {m.ativo ? (uso ? uso.curto : "ainda não entrou") : "desativado"}
          </p>
        </div>
        <div className="hidden w-44 shrink-0 flex-col items-start gap-1 @2xl:flex">
          <Selo tom={m.ativo ? TOM_PAPEL[m.papel] : "neutro"}>{m.ativo ? papel.rotulo : "Desativado"}</Selo>
          {m.papel === "personalizado" && <span className="text-xs text-muted-foreground">{resumoPermissoes(m.permissoes)}</span>}
        </div>
        <span
          className={cn(
            "hidden w-40 shrink-0 items-center gap-1.5 text-[13px] @2xl:flex",
            uso?.agora && m.ativo ? "font-medium text-positivo-texto" : "text-muted-foreground",
          )}
          title={dicaLogin(m)}
        >
          {uso?.agora && m.ativo && (
            <span className="relative flex size-2" aria-hidden>
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-positivo opacity-60 motion-reduce:animate-none" />
              <span className="relative inline-flex size-2 rounded-full bg-positivo" />
            </span>
          )}
          {uso ? uso.texto : "Ainda não entrou"}
        </span>
        <div className="w-8 shrink-0">
          {podeMexer(m) && (
            <MenuAcoes
              rotulo={`Ações para ${m.nome}`}
              aoEscolher={(id) => acaoMembro(m, id)}
              acoes={[
                m.ativo && { id: "acesso", rotulo: "Mudar acesso e cargo", icone: ShieldCheck },
                m.ativo && { id: "senha", rotulo: "Enviar link de nova senha", icone: KeyRound },
                m.ativo && { id: "sessoes", rotulo: "Desconectar dos aparelhos", icone: LogOut },
                m.ativo ? { id: "desativar", rotulo: "Desativar acesso", icone: Ban, separar: true } : { id: "reativar", rotulo: "Reativar acesso", icone: UserCheck },
                { id: "remover", rotulo: "Remover da equipe", icone: Trash2, perigo: true, separar: !m.ativo },
              ]}
            />
          )}
        </div>
      </li>
    );
  }

  const textoConfirmar = (() => {
    const c = ultimoConfirmar;
    if (!c) return { titulo: "", texto: "", acao: "" };
    if (c.tipo === "cancelar") return { titulo: `Cancelar o convite de ${c.convite.nome}?`, texto: "O link enviado deixa de funcionar. Dá para convidar de novo depois.", acao: "Cancelar convite" };
    if (c.tipo === "desativar")
      return {
        titulo: `Desativar ${c.membro.nome}?`,
        texto: "A pessoa sai do painel na hora e não consegue mais entrar. O cadastro fica guardado e dá para reativar quando quiser.",
        acao: "Desativar",
      };
    return { titulo: `Remover ${c.membro.nome} da equipe?`, texto: "O acesso é apagado de vez. Se a pessoa voltar, será preciso convidar de novo.", acao: "Remover" };
  })();

  return (
    <>
      <Cabecalho
        titulo="Equipe e acessos"
        descricao="Quem entra no painel e o que cada pessoa pode ver ou alterar."
        acoes={
          podeEditar && (
            <Button className="rounded-full" onClick={() => setConvidando(true)}>
              <UserPlus /> Convidar pessoa
            </Button>
          )
        }
      />

      <div className="flex flex-col gap-5">
        {convites.length > 0 && (
          <Secao icone={MailPlus} titulo="Convites pendentes" descricao="Ainda não criaram a senha. O link vence sozinho no prazo.">
            <ul className="flex flex-col divide-y">
              {convites.map((c) => {
                const dias = diasAte(c.expiraEm, agora);
                return (
                  <li key={c.id} className="flex items-center gap-3 py-3 first:pt-1 last:pb-1">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full border border-dashed text-muted-foreground">
                      <Mail className="size-4" />
                    </span>
                    <div className="min-w-0 grow">
                      <p className="truncate font-semibold">
                        {c.nome} {c.cargo && <span className="text-[13px] font-normal text-muted-foreground">· {c.cargo}</span>}
                      </p>
                      <p className="truncate text-[13px] text-muted-foreground">
                        {c.email} · {papelInfo(c.papel).rotulo} · {dias <= 1 ? "vence hoje ou amanhã" : `vence em ${dias} dias`}
                        {c.criadoPor && ` · por ${c.criadoPor.split(" ")[0]}`}
                      </p>
                    </div>
                    {podeEditar && (souAdmin || c.papel !== "dono") && (
                      <MenuAcoes
                        rotulo={`Ações do convite de ${c.nome}`}
                        aoEscolher={(id) => acaoConvite(c, id)}
                        acoes={[
                          { id: "link", rotulo: "Reenviar convite", icone: RefreshCw },
                          { id: "cancelar", rotulo: "Cancelar convite", icone: X, perigo: true, separar: true },
                        ]}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </Secao>
        )}

        <Secao
          icone={Users}
          titulo={`Pessoas com acesso (${ativos.length})`}
          descricao={podeEditar ? "Toque no ⋯ para mudar o acesso, enviar uma senha nova ou desativar." : "Seu acesso à equipe é só para consultar."}
        >
          <ul className="flex flex-col divide-y">{ativos.map(linhaMembro)}</ul>
          {inativos.length > 0 && (
            <details className="group rounded-2xl border px-3.5 py-2">
              <summary className="cursor-pointer py-1 text-sm font-medium text-muted-foreground select-none">
                Desativados ({inativos.length})
              </summary>
              <ul className="mt-1 flex flex-col divide-y">{inativos.map(linhaMembro)}</ul>
            </details>
          )}
        </Secao>

        <ReferenciaPapeis />
      </div>

      <PainelConvite
        aberto={convidando}
        aoFechar={() => setConvidando(false)}
        podeDarAdmin={souAdmin}
        canais={canais}
        aoCriar={(l) => {
          setConvidando(false);
          setEnvio(l);
          router.refresh();
        }}
      />
      <PainelAcesso membro={editando} aoFechar={() => { setEditando(null); router.refresh(); }} podeDarAdmin={souAdmin} />
      <JanelaEnvio dados={envio} aoFechar={() => setEnvio(null)} />
      <Confirmar
        aberto={Boolean(confirmar)}
        onFechar={() => setConfirmar(null)}
        titulo={textoConfirmar.titulo}
        texto={textoConfirmar.texto}
        rotuloAcao={textoConfirmar.acao}
        onConfirmar={async () => {
          const c = confirmar;
          if (!c) return;
          if (c.tipo === "cancelar") await executar(cancelarConvite(c.convite.id), "Convite cancelado");
          if (c.tipo === "desativar") await executar(definirAtivo(c.membro.id, false), `${c.membro.nome.split(" ")[0]} foi desativado`);
          if (c.tipo === "remover") await executar(removerMembro(c.membro.id), `${c.membro.nome.split(" ")[0]} saiu da equipe`);
        }}
      />
    </>
  );
}
