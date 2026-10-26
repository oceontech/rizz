import "server-only";

/**
 * Cliente da Evolution API (v2), que mantém o WhatsApp do restaurante
 * conectado como um "aparelho conectado" e envia as mensagens.
 *
 * A Evolution roda na VPS (Docker Compose, https://evo.rizz.genext.group). O site só conversa com ela
 * pelo servidor, com a chave global (`AUTHENTICATION_API_KEY` da Evolution),
 * que nunca chega ao navegador.
 *
 *   EVOLUTION_API_URL   https://evo.rizz.genext.group
 *   EVOLUTION_API_KEY   a AUTHENTICATION_API_KEY do serviço da Evolution
 *   EVOLUTION_INSTANCIA nome da instância (padrão: "rizz")
 */

const URL_BASE = process.env.EVOLUTION_API_URL?.trim().replace(/\/+$/, "");
const CHAVE = process.env.EVOLUTION_API_KEY?.trim();

export const INSTANCIA = process.env.EVOLUTION_INSTANCIA?.trim() || "rizz";

export const evolutionConfigurada = Boolean(URL_BASE && CHAVE);

export type EstadoConexao = "open" | "connecting" | "close";

export type InfoInstancia = {
  existe: boolean;
  estado: EstadoConexao;
  /** Número conectado, só dígitos (ex.: 551936615503). */
  numero: string | null;
  nomePerfil: string | null;
  foto: string | null;
};

export type QrCode = {
  /** Imagem pronta para o <img src>: "data:image/png;base64,...". */
  imagem: string | null;
  /** Código de 8 caracteres para "Conectar com número de telefone". */
  codigoPareamento: string | null;
};

/** Erro com mensagem que pode ir para a tela do painel. */
export class ErroEvolution extends Error {
  constructor(
    mensagem: string,
    readonly status?: number,
  ) {
    super(mensagem);
  }
}

async function chamar<T>(metodo: "GET" | "POST" | "DELETE", caminho: string, corpo?: unknown): Promise<T> {
  if (!URL_BASE || !CHAVE) {
    throw new ErroEvolution("A Evolution API não está configurada (EVOLUTION_API_URL e EVOLUTION_API_KEY).");
  }
  let resposta: Response;
  try {
    resposta = await fetch(`${URL_BASE}${caminho}`, {
      method: metodo,
      headers: { apikey: CHAVE, ...(corpo ? { "content-type": "application/json" } : {}) },
      body: corpo ? JSON.stringify(corpo) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch (erro) {
    const tempo = erro instanceof Error && erro.name === "TimeoutError";
    throw new ErroEvolution(
      tempo
        ? "A Evolution API demorou demais para responder. Confira se o serviço está no ar na VPS."
        : "Não foi possível falar com a Evolution API. Confira o endereço (EVOLUTION_API_URL) e se o serviço está no ar.",
    );
  }

  const texto = await resposta.text();
  let json: unknown = null;
  try {
    json = texto ? JSON.parse(texto) : null;
  } catch {
    json = texto;
  }

  if (!resposta.ok) {
    if (resposta.status === 401 || resposta.status === 403) {
      throw new ErroEvolution("A Evolution recusou a chave (EVOLUTION_API_KEY). Confira a AUTHENTICATION_API_KEY do serviço.", 401);
    }
    throw new ErroEvolution(mensagemDeErro(json) ?? `A Evolution respondeu com erro ${resposta.status}.`, resposta.status);
  }
  return json as T;
}

/** A Evolution devolve o motivo em formatos diferentes conforme a rota. */
function mensagemDeErro(json: unknown): string | null {
  if (!json || typeof json !== "object") return typeof json === "string" && json ? json.slice(0, 200) : null;
  const r = (json as { response?: { message?: unknown } }).response?.message ?? (json as { message?: unknown }).message;
  const lista = Array.isArray(r) ? r : [r];
  for (const item of lista) {
    if (item && typeof item === "object" && "exists" in item && (item as { exists: boolean }).exists === false) {
      return "Esse número não tem WhatsApp.";
    }
    if (typeof item === "string" && item) return item;
  }
  return null;
}

function soDigitos(jid: unknown) {
  return typeof jid === "string" ? jid.split("@")[0].replace(/\D/g, "") || null : null;
}

type InstanciaBruta = {
  name?: string;
  connectionStatus?: EstadoConexao;
  ownerJid?: string | null;
  profileName?: string | null;
  profilePicUrl?: string | null;
  instance?: { instanceName?: string; status?: EstadoConexao; owner?: string; profileName?: string; profilePictureUrl?: string };
};

/** Situação da instância. Não existir não é erro: o painel oferece criar. */
export async function infoInstancia(): Promise<InfoInstancia> {
  const lista = await chamar<InstanciaBruta[]>("GET", `/instance/fetchInstances?instanceName=${encodeURIComponent(INSTANCIA)}`).catch(
    (erro) => {
      // Algumas versões respondem 404 quando a instância não existe.
      if (erro instanceof ErroEvolution && erro.status === 404) return [] as InstanciaBruta[];
      throw erro;
    },
  );
  const i = (Array.isArray(lista) ? lista : []).find((x) => (x.name ?? x.instance?.instanceName) === INSTANCIA);
  if (!i) return { existe: false, estado: "close", numero: null, nomePerfil: null, foto: null };

  let estado = i.connectionStatus ?? i.instance?.status;
  if (!estado) {
    const r = await chamar<{ instance?: { state?: EstadoConexao } }>("GET", `/instance/connectionState/${INSTANCIA}`);
    estado = r.instance?.state ?? "close";
  }
  return {
    existe: true,
    estado,
    numero: soDigitos(i.ownerJid ?? i.instance?.owner),
    nomePerfil: i.profileName ?? i.instance?.profileName ?? null,
    foto: i.profilePicUrl ?? i.instance?.profilePictureUrl ?? null,
  };
}

type QrBruto = { base64?: string; code?: string; pairingCode?: string | null; qrcode?: QrBruto };

function paraQr(r: QrBruto | null | undefined): QrCode {
  const q = r?.qrcode ?? r;
  const imagem = q?.base64 ? (q.base64.startsWith("data:") ? q.base64 : `data:image/png;base64,${q.base64}`) : null;
  return { imagem, codigoPareamento: q?.pairingCode ?? null };
}

/**
 * Gera o QR Code (e, com `numero`, o código de pareamento). Cria a
 * instância na primeira vez. Cada QR vale uns 40 segundos: o painel pede
 * outro enquanto a pessoa não escaneia.
 */
export async function gerarQrCode(numero?: string): Promise<QrCode> {
  const info = await infoInstancia();
  if (!info.existe) {
    const criada = await chamar<QrBruto>("POST", "/instance/create", {
      instanceName: INSTANCIA,
      integration: "WHATSAPP-BAILEYS",
      qrcode: true,
      ...(numero ? { number: numero } : {}),
      // Ligado, o celular do restaurante para de tocar as notificações.
      alwaysOnline: false,
      readMessages: false,
      groupsIgnore: true,
      rejectCall: false,
    });
    const qr = paraQr(criada);
    if (qr.imagem || qr.codigoPareamento) return qr;
  }
  if (info.estado === "open") throw new ErroEvolution("O WhatsApp já está conectado.");
  const consulta = numero ? `?number=${numero}` : "";
  return paraQr(await chamar<QrBruto>("GET", `/instance/connect/${INSTANCIA}${consulta}`));
}

/** Desconecta o aparelho. A instância continua existindo para conectar de novo. */
export async function desconectar() {
  await chamar("DELETE", `/instance/logout/${INSTANCIA}`);
}

/**
 * Envia um texto. `telefone` pode vir com ou sem o 55; a Evolution acerta o
 * nono dígito dos números brasileiros.
 */
export async function enviarTexto(telefone: string, texto: string) {
  const digitos = telefone.replace(/\D/g, "");
  const numero = digitos.length <= 11 ? `55${digitos}` : digitos;
  const r = await chamar<{ key?: { id?: string } }>("POST", `/message/sendText/${INSTANCIA}`, {
    number: numero,
    text: texto,
    linkPreview: true,
  });
  return { id: r?.key?.id ?? null };
}
