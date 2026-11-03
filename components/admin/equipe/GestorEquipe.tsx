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
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { avisar, BotaoSalvar, CampoSelect, CampoTexto, Confirmar } from "@/components/admin/campos";
import { Cabecalho, Janela, MenuAcoes, PainelLateral, Secao, Selo, useUltimo, type Tom } from "@/components/admin/ui";
import { Button } from "@/components/sistema/ui/button";
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
import { AREAS, PAPEIS, papelInfo, permissoesDe, resumoPermissoes, type Papel, type Permissoes } from "@/lib/permissoes";
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
function relativo(iso: string | null, agora: number) {
  if (!iso) return null;
  const min = Math.round((agora - new Date(iso).getTime()) / 6e4);
  if (min < 2) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return "ontem";
  if (d < 30) return `há ${d} dias`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit", timeZone: "America/Sao_Paulo" });
}

const diasAte = (iso: string, agora: number) => Math.max(0, Math.ceil((new Date(iso).getTime() - agora) / 864e5));

// ─── Link gerado (convite ou nova senha) ───────────────────────

type LinkPronto = { link: string; nome: string; email: string; tipo: "convite" | "senha"; validade: string };

function JanelaLink({ dados, aoFechar }: { dados: LinkPronto | null; aoFechar: () => void }) {
  const d = useUltimo(dados);
  const [copiado, setCopiado] = useState(false);
  if (!d) return null;
  const primeiro = d.nome.split(" ")[0];
  const mensagem =
    d.tipo === "convite"
      ? `Olá, ${primeiro}! Você foi convidado para o painel do Rizz Cucina & Vino. Crie sua senha por este link (vale ${d.validade}): ${d.link}`
      : `Olá, ${primeiro}! Crie uma senha nova para o painel do Rizz por este link (vale ${d.validade}): ${d.link}`;

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
      icone={Link2}
      titulo={d.tipo === "convite" ? "Convite criado" : "Link de nova senha"}
      descricao={`Envie para ${d.nome}. O link vale ${d.validade} e só pode ser usado uma vez.`}
      rodape={
        <Button className="rounded-full" onClick={aoFechar}>
          Pronto
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 rounded-2xl border bg-muted/50 p-1.5 pl-3.5">
          <span className="min-w-0 grow truncate font-mono text-[13px] select-all">{d.link}</span>
          <Button size="sm" variant={copiado ? "secondary" : "default"} className="shrink-0 rounded-full" onClick={copiar}>
            {copiado ? <Check /> : <Copy />}
            {copiado ? "Copiado" : "Copiar"}
          </Button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(mensagem)}`}
            target="_blank"
            rel="noopener"
            className="flex h-11 items-center justify-center gap-2 rounded-full bg-[#25d366] px-4 text-sm font-semibold text-[#0b3d1f] transition-opacity hover:opacity-90"
          >
            Enviar pelo WhatsApp
          </a>
          {d.email && (
            <a
              href={`mailto:${d.email}?subject=${encodeURIComponent("Acesso ao painel do Rizz")}&body=${encodeURIComponent(mensagem)}`}
              className="flex h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors hover:bg-muted"
            >
              <Mail className="size-4" /> Enviar por e-mail
            </a>
          )}
        </div>
        <p className="text-[13px] text-muted-foreground">
          Por segurança, o link não fica guardado no painel. Se perder, gere outro: o anterior deixa de valer.
        </p>
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
  aoCriar,
}: {
  aberto: boolean;
  aoFechar: () => void;
  podeDarAdmin: boolean;
  aoCriar: (l: LinkPronto) => void;
}) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [cargo, setCargo] = useState("");
  const [papel, setPapel] = useState<Papel>("colaborador");
  const [permissoes, setPermissoes] = useState<Permissoes>(permissoesDe("colaborador"));
  const [validade, setValidade] = useState("7");
  const [enviando, setEnviando] = useState(false);

  function limpar() {
    setNome("");
    setEmail("");
    setCargo("");
    setPapel("colaborador");
    setPermissoes(permissoesDe("colaborador"));
    setValidade("7");
  }

  async function enviar() {
    setEnviando(true);
    const r = await convidar({ nome, email, cargo, papel, permissoes, validadeDias: Number(validade) });
    setEnviando(false);
    if (!r.ok) return avisar(r, "");
    aoCriar({ link: r.dados!.link, nome, email, tipo: "convite", validade: VALIDADES.find((v) => v.id === validade)!.rotulo });
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
            <MailPlus /> Criar convite
          </BotaoSalvar>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <CampoTexto label="Nome" value={nome} onChange={setNome} maxLength={60} placeholder="Ana Souza" autoFocus />
          <CampoTexto label="Cargo (opcional)" value={cargo} onChange={setCargo} maxLength={40} placeholder="Recepção" />
        </div>
        <CampoTexto label="E-mail" tipo="email" value={email} onChange={setEmail} descricao="É com ele que a pessoa vai entrar no painel." />
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
  const [salvando, setSalvando] = useState(false);
  if (membro !== de) {
    setDe(membro);
    if (membro) {
      setPapel(membro.papel);
      setPermissoes(membro.permissoes);
      setCargo(membro.cargo);
    }
  }
  if (!m) return null;

  async function salvar() {
    setSalvando(true);
    const r = await mudarAcesso(m!.id, { papel, permissoes, cargo });
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
        <CampoTexto label="Cargo (opcional)" value={cargo} onChange={setCargo} maxLength={40} placeholder="Recepção" className="sm:max-w-sm" />
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
                  {p.rotulo}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {AREAS.map((a) => (
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
}: {
  membros: Membro[];
  convites: ConvitePendente[];
  eu: { id: number; papel: Papel };
  podeEditar: boolean;
  agora: number;
}) {
  const router = useRouter();
  const [convidando, setConvidando] = useState(false);
  const [editando, setEditando] = useState<Membro | null>(null);
  const [link, setLink] = useState<LinkPronto | null>(null);
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
      if (r.ok) setLink({ link: r.dados!.link, nome: m.nome, email: m.email, tipo: "senha", validade: "24 horas" });
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
        setLink({ link: r.dados!.link, nome: c.nome, email: c.email, tipo: "convite", validade: "7 dias" });
        router.refresh();
      } else avisar(r, "");
    }
    if (id === "cancelar") setConfirmar({ tipo: "cancelar", convite: c });
  }

  function linhaMembro(m: Membro) {
    const papel = papelInfo(m.papel);
    const visto = relativo(m.ultimoLogin, agora);
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
            {papel.rotulo} · {m.ativo ? (visto ? `entrou ${visto}` : "ainda não entrou") : "desativado"}
          </p>
        </div>
        <div className="hidden w-44 shrink-0 flex-col items-start gap-1 @2xl:flex">
          <Selo tom={m.ativo ? TOM_PAPEL[m.papel] : "neutro"}>{m.ativo ? papel.rotulo : "Desativado"}</Selo>
          {m.papel === "personalizado" && <span className="text-xs text-muted-foreground">{resumoPermissoes(m.permissoes)}</span>}
        </div>
        <span className="hidden w-28 shrink-0 text-[13px] text-muted-foreground @2xl:block">
          {visto ? `Entrou ${visto}` : "Ainda não entrou"}
        </span>
        <div className="w-8 shrink-0">
          {podeMexer(m) && (
            <MenuAcoes
              rotulo={`Ações para ${m.nome}`}
              aoEscolher={(id) => acaoMembro(m, id)}
              acoes={[
                m.ativo && { id: "acesso", rotulo: "Mudar acesso e cargo", icone: ShieldCheck },
                m.ativo && { id: "senha", rotulo: "Gerar link de nova senha", icone: KeyRound },
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
                          { id: "link", rotulo: "Gerar novo link", icone: RefreshCw },
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
          descricao={podeEditar ? "Toque no ⋯ para mudar o acesso, gerar uma senha nova ou desativar." : "Seu acesso à equipe é só para consultar."}
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
        aoCriar={(l) => {
          setConvidando(false);
          setLink(l);
          router.refresh();
        }}
      />
      <PainelAcesso membro={editando} aoFechar={() => { setEditando(null); router.refresh(); }} podeDarAdmin={souAdmin} />
      <JanelaLink dados={link} aoFechar={() => setLink(null)} />
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
