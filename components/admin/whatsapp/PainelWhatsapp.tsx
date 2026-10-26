"use client";

import {
  BellRing,
  CircleAlert,
  Clock,
  History,
  KeyRound,
  Loader2,
  MessageSquareText,
  Plus,
  QrCode,
  RefreshCw,
  RotateCcw,
  Send,
  Smartphone,
  Unplug,
  X,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
  avisar,
  BotaoSalvar,
  CampoOpcoes,
  CampoSelect,
  CampoSwitch,
  CampoTelefone,
  Confirmar,
} from "@/components/admin/campos";
import { Cabecalho, ListaCard, Secao, Selo } from "@/components/admin/ui";
import { Campo } from "@/components/sistema/formulario/campo";
import { AreaTexto } from "@/components/sistema/inputs/input-texto";
import { Button } from "@/components/sistema/ui/button";
import { mascaraTelefone } from "@/lib/admin/formato";
import {
  conectarWhatsapp,
  desconectarWhatsapp,
  estadoWhatsapp,
  salvarConfigWhatsapp,
  testarWhatsapp,
  type EstadoWhatsapp,
} from "@/lib/admin/whatsapp-actions";
import type { Envio } from "@/lib/whatsapp/avisos";
import type { QrCode as Qr } from "@/lib/whatsapp/evolution";
import {
  EXEMPLO,
  MODELOS_PADRAO,
  montarMensagem,
  TIPOS,
  VARIAVEIS,
  type TipoMensagem,
  type WhatsappConfig,
} from "@/lib/whatsapp/mensagens";
import { cn } from "@/lib/utils";

type Rodada = { em: string | null; enviados: number; falhas: number };

const ROTULO_TIPO: Record<string, string> = {
  ...Object.fromEntries(TIPOS.map((t) => [t.id, t.rotulo])),
  teste: "Mensagem de teste",
};

const HORAS_LEMBRETE = [
  { id: "2", rotulo: "2 horas antes" },
  { id: "3", rotulo: "3 horas antes" },
  { id: "6", rotulo: "6 horas antes" },
  { id: "12", rotulo: "12 horas antes" },
  { id: "24", rotulo: "1 dia antes" },
];

/** Cada QR vale uns 40 s; depois de alguns minutos sem escanear, para de pedir. */
const RENOVAR_QR_MS = 35_000;
const DESISTIR_MS = 4 * 60_000;

function telefoneLegivel(digitos: string | null) {
  if (!digitos) return "";
  const d = digitos.replace(/^55(?=\d{10,11}$)/, "");
  return mascaraTelefone(d);
}

/** `agora` vem do servidor: o mesmo valor no HTML e na hidratação. */
function haQuanto(iso: string, agora: number) {
  const min = Math.round((agora - new Date(iso).getTime()) / 60_000);
  if (min < 1) return "agora há pouco";
  if (min < 60) return `há ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `há ${h} h`;
  return new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

// ─── Conexão ───────────────────────────────────────────────────

function Passos({ itens }: { itens: React.ReactNode[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {itens.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-sm">
          <span className="numeros grid size-6 shrink-0 place-items-center rounded-full bg-primary-suave text-xs font-semibold text-primary-texto">
            {i + 1}
          </span>
          <span className="pt-0.5 leading-snug">{item}</span>
        </li>
      ))}
    </ol>
  );
}

function SemConfiguracao() {
  return (
    <Secao
      icone={KeyRound}
      titulo="Falta ligar a Evolution API"
      descricao="O painel ainda não sabe onde está a sua Evolution. Isso é feito uma única vez, pela Oceon."
    >
      <Passos
        itens={[
          <>
            Na Vercel, em <b>Settings → Environment Variables</b>, criar <code>EVOLUTION_API_URL</code> (endereço da
            Evolution na VPS) e <code>EVOLUTION_API_KEY</code> (a <code>AUTHENTICATION_API_KEY</code> do serviço).
          </>,
          <>Publicar o site de novo para as variáveis valerem.</>,
          <>Voltar aqui e conectar o WhatsApp do restaurante pelo QR Code.</>,
        ]}
      />
    </Secao>
  );
}

function Conectado({ estado, aoMudar }: { estado: EstadoWhatsapp; aoMudar: () => void }) {
  const info = estado.info!;
  const [telefone, setTelefone] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  async function testar() {
    setEnviando(true);
    avisar(await testarWhatsapp(telefone), "Mensagem de teste enviada");
    setEnviando(false);
  }

  return (
    <Secao
      icone={Smartphone}
      titulo="WhatsApp conectado"
      descricao="As mensagens automáticas saem deste número."
      acoes={
        <Selo tom="positivo" ponto>
          Conectado
        </Selo>
      }
    >
      <div className="flex items-center gap-4 rounded-2xl bg-muted/60 p-4">
        {info.foto ? (
          <Image src={info.foto} alt="" width={56} height={56} unoptimized className="size-14 rounded-full object-cover" />
        ) : (
          <span className="grid size-14 place-items-center rounded-full bg-primary-suave text-primary-texto">
            <Smartphone className="size-6" />
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold">{info.nomePerfil ?? "WhatsApp do restaurante"}</p>
          <p className="numeros text-sm text-muted-foreground">{telefoneLegivel(info.numero) || "Número não informado"}</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <CampoTelefone
          label="Enviar uma mensagem de teste para"
          value={telefone}
          onChange={setTelefone}
          className="grow"
        />
        <BotaoSalvar pendente={enviando} onClick={testar} disabled={telefone.replace(/\D/g, "").length < 12} variant="secondary">
          <Send /> Enviar teste
        </BotaoSalvar>
      </div>

      <Button variant="ghost" className="self-start rounded-full text-negativo-texto" onClick={() => setConfirmando(true)}>
        <Unplug /> Desconectar este número
      </Button>
      <Confirmar
        aberto={confirmando}
        onFechar={() => setConfirmando(false)}
        titulo="Desconectar o WhatsApp?"
        texto="As mensagens automáticas param até alguém conectar de novo pelo QR Code. O WhatsApp do celular continua funcionando normalmente."
        rotuloAcao="Desconectar"
        onConfirmar={async () => {
          if (avisar(await desconectarWhatsapp(), "WhatsApp desconectado")) aoMudar();
        }}
      />
    </Secao>
  );
}

function Conectar({ aoConectar }: { aoConectar: () => void }) {
  const [modo, setModo] = useState<"qr" | "codigo">("qr");
  const [numero, setNumero] = useState("");
  const [qr, setQr] = useState<Qr | null>(null);
  const [gerando, setGerando] = useState(false);
  const [expirou, setExpirou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inicio = useRef(0);

  async function gerar() {
    setGerando(true);
    setErro(null);
    setExpirou(false);
    const r = await conectarWhatsapp(modo === "codigo" ? numero : undefined);
    setGerando(false);
    if (!r.ok) return setErro(r.erro);
    if (!r.dados?.imagem && !r.dados?.codigoPareamento) {
      return setErro("A Evolution não devolveu o código. Tente de novo em alguns segundos.");
    }
    if (!inicio.current) inicio.current = Date.now();
    setQr(r.dados);
  }

  // Enquanto o código está na tela: confere a conexão a cada 3 s e renova o QR.
  const aberto = Boolean(qr) && !expirou;
  useEffect(() => {
    if (!aberto) return;
    let vivo = true;
    const conferir = setInterval(async () => {
      const r = await estadoWhatsapp();
      if (!vivo) return;
      if (r.ok && r.dados?.info?.estado === "open") {
        toast.success("WhatsApp conectado!");
        aoConectar();
      }
    }, 3000);
    const renovar = setInterval(async () => {
      if (Date.now() - inicio.current > DESISTIR_MS) {
        setExpirou(true);
        inicio.current = 0;
        return;
      }
      if (modo === "qr") {
        const r = await conectarWhatsapp();
        if (vivo && r.ok && r.dados?.imagem) setQr(r.dados);
      }
    }, RENOVAR_QR_MS);
    return () => {
      vivo = false;
      clearInterval(conferir);
      clearInterval(renovar);
    };
  }, [aberto, modo, aoConectar]);

  function trocarModo(m: "qr" | "codigo") {
    setModo(m);
    setQr(null);
    setErro(null);
    inicio.current = 0;
  }

  const numeroOk = numero.replace(/\D/g, "").length >= 12;

  return (
    <Secao
      icone={QrCode}
      titulo="Conectar o WhatsApp do restaurante"
      descricao="Funciona como o WhatsApp Web: o celular continua com o WhatsApp normal, e o painel passa a enviar as mensagens de reserva."
      acoes={<Selo tom="atencao" ponto>Desconectado</Selo>}
    >
      <CampoOpcoes
        label="Como conectar"
        value={modo}
        onChange={trocarModo}
        opcoes={[
          { id: "qr", rotulo: "QR Code" },
          { id: "codigo", rotulo: "Código pelo número" },
        ]}
        descricao={
          modo === "qr"
            ? "Para quem está com o celular do restaurante na mão, ao lado do computador."
            : "Para quem está no próprio celular do restaurante e não tem como escanear a tela."
        }
      />

      {modo === "codigo" && !qr && (
        <CampoTelefone label="Número do WhatsApp do restaurante" value={numero} onChange={setNumero} />
      )}

      {erro && (
        <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-negativo/10 px-3.5 py-3 text-sm text-negativo-texto">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          {erro}
        </p>
      )}

      {qr && !expirou ? (
        <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
          {modo === "qr" && qr.imagem ? (
            <div className="relative mx-auto rounded-2xl bg-white p-3 shadow-suave">
              {/* O QR é uma imagem em base64 gerada na hora: não passa pelo otimizador. */}
              <Image src={qr.imagem} alt="QR Code para conectar o WhatsApp" width={232} height={232} unoptimized className="size-58" />
            </div>
          ) : (
            <div className="mx-auto rounded-2xl bg-muted px-6 py-5 text-center">
              <p className="text-xs font-medium text-muted-foreground">Código de conexão</p>
              <p className="mt-1 font-mono text-3xl font-semibold tracking-[0.2em]">
                {qr.codigoPareamento?.replace(/^(.{4})(.{4})$/, "$1-$2") ?? "—"}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-4">
            <Passos
              itens={
                modo === "qr"
                  ? [
                      "Abra o WhatsApp no celular do restaurante.",
                      <>
                        Toque em <b>⋮</b> (Android) ou <b>Configurações</b> (iPhone) e depois em <b>Aparelhos conectados</b>.
                      </>,
                      <>
                        Toque em <b>Conectar um aparelho</b> e aponte a câmera para o código ao lado.
                      </>,
                    ]
                  : [
                      <>
                        No WhatsApp, abra <b>Aparelhos conectados</b> → <b>Conectar um aparelho</b>.
                      </>,
                      <>
                        Toque em <b>Conectar com número de telefone</b>.
                      </>,
                      "Digite o código mostrado aqui.",
                    ]
              }
            />
            <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Esperando o celular… a tela atualiza sozinha.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {expirou && <p className="text-sm text-muted-foreground">O código expirou. Gere outro quando estiver com o celular em mãos.</p>}
          <BotaoSalvar
            pendente={gerando}
            onClick={gerar}
            disabled={modo === "codigo" && !numeroOk}
            className="self-start"
          >
            {modo === "qr" ? <QrCode /> : <KeyRound />}
            {modo === "qr" ? "Gerar QR Code" : "Gerar código"}
          </BotaoSalvar>
        </div>
      )}
    </Secao>
  );
}

function Conexao({ inicial }: { inicial: EstadoWhatsapp }) {
  const router = useRouter();
  const [estado, setEstado] = useState(inicial);
  const [atualizando, setAtualizando] = useState(false);

  async function atualizar() {
    setAtualizando(true);
    const r = await estadoWhatsapp();
    setAtualizando(false);
    if (r.ok && r.dados) setEstado(r.dados);
    router.refresh();
  }

  if (!estado.configurada) return <SemConfiguracao />;
  if (estado.erro) {
    return (
      <Secao icone={CircleAlert} titulo="Não consegui falar com a Evolution" descricao={estado.erro}>
        <BotaoSalvar pendente={atualizando} onClick={atualizar} variant="secondary" className="self-start">
          <RefreshCw /> Tentar de novo
        </BotaoSalvar>
      </Secao>
    );
  }
  if (estado.info?.estado === "open") return <Conectado estado={estado} aoMudar={atualizar} />;
  return <Conectar aoConectar={atualizar} />;
}

// ─── Mensagens automáticas ─────────────────────────────────────

function Automaticas({
  c,
  mudar,
  conectado,
}: {
  c: WhatsappConfig;
  mudar: <K extends keyof WhatsappConfig>(k: K, v: WhatsappConfig[K]) => void;
  conectado: boolean;
}) {
  const [novoTelefone, setNovoTelefone] = useState("");

  function adicionarTelefone() {
    const t = novoTelefone.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
    if (t.length < 10) return toast.error("Informe o número com DDD.");
    if (c.telefonesEquipe.includes(t)) return toast.error("Esse número já está na lista.");
    mudar("telefonesEquipe", [...c.telefonesEquipe, t]);
    setNovoTelefone("");
  }

  return (
    <Secao icone={BellRing} titulo="Mensagens automáticas" descricao="O que o sistema manda sozinho, sem ninguém precisar abrir o WhatsApp.">
      <CampoSwitch
        label="Enviar mensagens automáticas"
        descricao={
          conectado
            ? "Chave geral. Desligada, nada é enviado."
            : "Chave geral. Só começa a enviar depois que o WhatsApp estiver conectado."
        }
        value={c.ativo}
        onChange={(v) => mudar("ativo", v)}
      />
      <div className={cn("flex flex-col gap-5 transition-opacity", !c.ativo && "pointer-events-none opacity-45")} aria-disabled={!c.ativo}>
        <CampoSwitch
          label="Confirmação da reserva"
          descricao="Assim que o cliente reserva pelo site, com o link para alterar ou cancelar. Pendentes recebem “pedido recebido” e, quando a equipe confirma, a confirmação."
          value={c.confirmacao}
          onChange={(v) => mudar("confirmacao", v)}
        />
        <CampoSwitch
          label="Também para reservas lançadas no painel"
          descricao="Pedidos por telefone ou balcão que a equipe registra aqui."
          value={c.confirmacaoPainel}
          onChange={(v) => mudar("confirmacaoPainel", v)}
          className={cn(!c.confirmacao && "opacity-45")}
        />
        <CampoSwitch
          label="Alteração"
          descricao="Quando o dia, o horário ou o número de pessoas muda."
          value={c.alteracao}
          onChange={(v) => mudar("alteracao", v)}
        />
        <CampoSwitch label="Cancelamento" value={c.cancelamento} onChange={(v) => mudar("cancelamento", v)} />
        <div className="flex flex-col gap-3">
          <CampoSwitch
            label="Lembrete antes da reserva"
            descricao="Só para reservas confirmadas, com o endereço e o link para avisar se não puder vir."
            value={c.lembrete}
            onChange={(v) => mudar("lembrete", v)}
          />
          {c.lembrete && (
            <CampoSelect
              label="Quando enviar o lembrete"
              value={String(c.lembreteHoras)}
              onChange={(v) => mudar("lembreteHoras", Number(v))}
              opcoes={HORAS_LEMBRETE}
              className="sm:max-w-xs"
            />
          )}
        </div>
        <div className="flex flex-col gap-3">
          <CampoSwitch
            label="Avisar a equipe de reserva nova"
            descricao="Uma mensagem para cada número abaixo sempre que alguém reservar pelo site. Use números pessoais: mensagem para o próprio número conectado não toca."
            value={c.avisoEquipe}
            onChange={(v) => mudar("avisoEquipe", v)}
          />
          {c.avisoEquipe && (
            <div className="flex flex-col gap-3">
              {c.telefonesEquipe.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {c.telefonesEquipe.map((t) => (
                    <li key={t} className="numeros flex h-8 items-center gap-1 rounded-full bg-muted pr-1 pl-3 text-sm">
                      {mascaraTelefone(t)}
                      <button
                        type="button"
                        aria-label={`Tirar ${mascaraTelefone(t)}`}
                        onClick={() => mudar("telefonesEquipe", c.telefonesEquipe.filter((x) => x !== t))}
                        className="grid size-6 place-items-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground"
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {c.telefonesEquipe.length < 5 && (
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
                  <CampoTelefone label="Adicionar número da equipe" value={novoTelefone} onChange={setNovoTelefone} className="grow" />
                  <Button variant="secondary" className="rounded-full" onClick={adicionarTelefone}>
                    <Plus /> Adicionar
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Secao>
  );
}

// ─── Modelos ───────────────────────────────────────────────────

function Modelos({
  modelos,
  aoMudar,
}: {
  modelos: Record<TipoMensagem, string>;
  aoMudar: (tipo: TipoMensagem, texto: string) => void;
}) {
  const [tipo, setTipo] = useState<TipoMensagem>("confirmacao");
  const area = useRef<HTMLTextAreaElement>(null);
  const atual = TIPOS.find((t) => t.id === tipo)!;
  const texto = modelos[tipo];

  /** Põe a variável onde está o cursor (ou no fim). */
  function inserir(chave: string) {
    const el = area.current;
    const marca = `{${chave}}`;
    if (!el) return aoMudar(tipo, texto + marca);
    const [ini, fim] = [el.selectionStart ?? texto.length, el.selectionEnd ?? texto.length];
    aoMudar(tipo, texto.slice(0, ini) + marca + texto.slice(fim));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(ini + marca.length, ini + marca.length);
    });
  }

  return (
    <Secao
      icone={MessageSquareText}
      titulo="Textos das mensagens"
      descricao="Escreva do jeito da casa. As palavras entre chaves são trocadas pelos dados de cada reserva."
    >
      <CampoSelect
        label="Mensagem"
        value={tipo}
        onChange={(v) => setTipo(v as TipoMensagem)}
        opcoes={TIPOS.map((t) => ({ id: t.id, rotulo: t.rotulo, descricao: t.quando }))}
      />
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="flex flex-col gap-3">
          <Campo id="modelo-texto" rotulo="Texto" ajuda={atual.quando}>
            <AreaTexto ref={area} rows={11} value={texto} maxLength={1500} onChange={(e) => aoMudar(tipo, e.currentTarget.value)} />
          </Campo>
          <div>
            <p className="mb-2 text-[0.8rem] text-muted-foreground">Toque para inserir no texto:</p>
            <div className="flex flex-wrap gap-1.5">
              {VARIAVEIS.map((v) => (
                <button
                  key={v.chave}
                  type="button"
                  title={v.descricao}
                  onClick={() => inserir(v.chave)}
                  className="h-7 rounded-full bg-muted px-2.5 font-mono text-xs text-foreground transition-colors hover:bg-primary-suave hover:text-primary-texto"
                >
                  {`{${v.chave}}`}
                </button>
              ))}
            </div>
          </div>
          {texto !== MODELOS_PADRAO[tipo] && (
            <Button variant="ghost" size="sm" className="self-start rounded-full" onClick={() => aoMudar(tipo, MODELOS_PADRAO[tipo])}>
              <RotateCcw /> Voltar ao texto padrão
            </Button>
          )}
        </div>
        <div>
          <p className="mb-1.5 text-sm font-medium">Prévia</p>
          <div className="rounded-2xl bg-[#e9e2d8] p-4 dark:bg-[#0b141a]">
            <div className="ml-auto max-w-[92%] rounded-xl rounded-tr-sm bg-[#d9fdd3] px-3 py-2 text-[14px] leading-snug whitespace-pre-wrap text-[#111b21] shadow-sm dark:bg-[#005c4b] dark:text-[#e9edef]">
              {montarMensagem(texto, EXEMPLO) || "…"}
            </div>
          </div>
          <p className="mt-2 text-[0.8rem] text-muted-foreground">Com dados de exemplo. Linhas com variável vazia (ex.: sem observações) somem.</p>
        </div>
      </div>
    </Secao>
  );
}

// ─── Lembretes e histórico ─────────────────────────────────────

function Agendador({ rodada, lembreteLigado, agora }: { rodada: Rodada; lembreteLigado: boolean; agora: number }) {
  const recente = rodada.em && agora - new Date(rodada.em).getTime() < 60 * 60_000;
  return (
    <Secao
      icone={Clock}
      titulo="Agendador dos lembretes"
      descricao="Os lembretes dependem de um agendador que chama o site a cada 10–15 minutos."
      acoes={
        rodada.em ? (
          <Selo tom={recente ? "positivo" : "atencao"} ponto>
            {recente ? "Funcionando" : "Parado"}
          </Selo>
        ) : (
          <Selo tom={lembreteLigado ? "atencao" : "neutro"}>Nunca rodou</Selo>
        )
      }
    >
      {rodada.em ? (
        <p className="text-sm">
          Última rodada {haQuanto(rodada.em, agora)}
          {rodada.enviados > 0 && `, ${rodada.enviados} ${rodada.enviados === 1 ? "lembrete enviado" : "lembretes enviados"}`}
          {rodada.falhas > 0 && `, ${rodada.falhas} com falha`}.
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">
          Ainda não recebi nenhuma chamada do agendador. A configuração é feita pela Oceon (ver <code>docs/whatsapp.md</code>).
        </p>
      )}
    </Secao>
  );
}

function Historico({ envios, agora }: { envios: Envio[]; agora: number }) {
  return (
    <Secao icone={History} titulo="Últimas mensagens" descricao="As 30 mais recentes, para conferir o que saiu e o que falhou.">
      {envios.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma mensagem enviada ainda.</p>
      ) : (
        <ListaCard className="-my-2">
          {envios.map((e) => (
            <li key={e.id} className="flex items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  {ROTULO_TIPO[e.tipo] ?? e.tipo}
                  {e.nome && <span className="font-normal text-muted-foreground"> · {e.nome}</span>}
                </p>
                <p className="numeros text-[13px] text-muted-foreground">
                  {telefoneLegivel(e.telefone)} · {haQuanto(e.criadoEm, agora)}
                </p>
                {e.erro && <p className="mt-1 text-[13px] text-negativo-texto">{e.erro}</p>}
              </div>
              <Selo tom={e.status === "enviado" ? "positivo" : e.status === "erro" ? "negativo" : "neutro"}>
                {e.status === "enviado" ? "Enviada" : e.status === "erro" ? "Falhou" : "Enviando"}
              </Selo>
            </li>
          ))}
        </ListaCard>
      )}
    </Secao>
  );
}

// ─── Página ────────────────────────────────────────────────────

export default function PainelWhatsapp({
  config,
  envios,
  rodada,
  estadoInicial,
  agora,
}: {
  config: WhatsappConfig;
  envios: Envio[];
  rodada: Rodada;
  estadoInicial: EstadoWhatsapp;
  agora: number;
}) {
  const [c, setC] = useState(config);
  const [salvando, setSalvando] = useState(false);
  const mudar = <K extends keyof WhatsappConfig>(k: K, v: WhatsappConfig[K]) => setC((x) => ({ ...x, [k]: v }));
  const alterado = JSON.stringify(c) !== JSON.stringify(config);
  const conectado = estadoInicial.info?.estado === "open";

  async function salvar() {
    setSalvando(true);
    avisar(await salvarConfigWhatsapp(c), "Mensagens salvas");
    setSalvando(false);
  }

  return (
    <>
      <Cabecalho
        titulo="WhatsApp"
        descricao="Conecte o número do restaurante e escolha as mensagens que saem sozinhas: confirmação, lembrete e avisos de reserva."
      />
      <div className="grid items-start gap-4 xl:grid-cols-2">
        <div className="flex flex-col gap-4">
          <Conexao inicial={estadoInicial} />
          <Automaticas c={c} mudar={mudar} conectado={conectado} />
        </div>
        <div className="flex flex-col gap-4">
          <Modelos modelos={c.modelos} aoMudar={(tipo, texto) => mudar("modelos", { ...c.modelos, [tipo]: texto })} />
          <Agendador rodada={rodada} lembreteLigado={c.ativo && c.lembrete} agora={agora} />
          <Historico envios={envios} agora={agora} />
        </div>
      </div>

      <div className="sticky bottom-28 z-10 mt-4 flex justify-end md:bottom-6">
        <BotaoSalvar pendente={salvando} onClick={salvar} disabled={!alterado} size="lg" className="shadow-flutuante">
          {alterado ? "Salvar mensagens" : "Mensagens salvas"}
        </BotaoSalvar>
      </div>
    </>
  );
}
