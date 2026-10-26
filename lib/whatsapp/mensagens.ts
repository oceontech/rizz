/**
 * Mensagens automáticas de reserva pelo WhatsApp: configuração, modelos e a
 * troca das variáveis. Funções puras, usadas no servidor (para enviar) e no
 * painel (para a prévia).
 */

export type TipoMensagem = "recebida" | "confirmacao" | "alteracao" | "cancelamento" | "lembrete" | "equipe";

export type WhatsappConfig = {
  /** Chave geral: desligada, nada é enviado (o painel continua conectando). */
  ativo: boolean;
  /** Reserva nova: "recebida" se pendente, "confirmacao" se confirmada. */
  confirmacao: boolean;
  /** Também para as reservas que a equipe lança no painel. */
  confirmacaoPainel: boolean;
  alteracao: boolean;
  cancelamento: boolean;
  lembrete: boolean;
  /** Quantas horas antes do horário sai o lembrete. */
  lembreteHoras: number;
  /** Aviso de reserva nova feita pelo site, para os números da equipe. */
  avisoEquipe: boolean;
  /** Só dígitos, com DDD (sem o 55). */
  telefonesEquipe: string[];
  modelos: Record<TipoMensagem, string>;
};

export const MODELOS_PADRAO: Record<TipoMensagem, string> = {
  recebida: [
    "Olá, {nome}! Recebemos seu pedido de reserva no Rizz Cucina & Vino 🍷",
    "",
    "📅 {data}",
    "🕐 {hora}",
    "👥 {pessoas}",
    "",
    "A equipe confirma por aqui em breve. Acompanhe pelo link: {link}",
  ].join("\n"),
  confirmacao: [
    "Olá, {nome}! Sua reserva no Rizz Cucina & Vino está confirmada ✅",
    "",
    "📅 {data}",
    "🕐 {hora}",
    "👥 {pessoas}",
    "",
    "Para ver, alterar ou cancelar: {link}",
    "",
    "Até lá!",
  ].join("\n"),
  alteracao: [
    "Olá, {nome}! Sua reserva no Rizz foi alterada:",
    "",
    "📅 {data}",
    "🕐 {hora}",
    "👥 {pessoas}",
    "",
    "Detalhes: {link}",
  ].join("\n"),
  cancelamento: [
    "Olá, {nome}. Sua reserva no Rizz para {data} às {hora} foi cancelada.",
    "",
    "Quando quiser, é só reservar de novo: {site}/reservas",
  ].join("\n"),
  lembrete: [
    "Olá, {nome}! Passando para lembrar da sua reserva no Rizz {quando} às {hora}, {pessoas} 🍷",
    "",
    "📍 {endereco}",
    "",
    "Se não puder vir, avise pelo link: {link}",
  ].join("\n"),
  equipe: [
    "🔔 Nova reserva pelo site ({status})",
    "",
    "{nomeCompleto} · {pessoas}",
    "{data} às {hora}",
    "WhatsApp: {telefone}",
    "{ocasiao}",
    "{obs}",
    "",
    "Painel: {site}/admin/reservas",
  ].join("\n"),
};

export const WHATSAPP_PADRAO: WhatsappConfig = {
  ativo: false,
  confirmacao: true,
  confirmacaoPainel: true,
  alteracao: true,
  cancelamento: true,
  lembrete: true,
  lembreteHoras: 3,
  avisoEquipe: false,
  telefonesEquipe: [],
  modelos: MODELOS_PADRAO,
};

/** Mescla o que está salvo com os padrões (inclusive modelos novos). */
export function completarConfig(salvo: Partial<WhatsappConfig> | null): WhatsappConfig {
  return {
    ...WHATSAPP_PADRAO,
    ...salvo,
    modelos: { ...MODELOS_PADRAO, ...salvo?.modelos },
  };
}

export const TIPOS: { id: TipoMensagem; rotulo: string; quando: string }[] = [
  { id: "confirmacao", rotulo: "Reserva confirmada", quando: "Quando a reserva nasce confirmada ou a equipe confirma uma pendente." },
  { id: "recebida", rotulo: "Pedido recebido", quando: "Quando a reserva chega pendente, esperando a equipe confirmar." },
  { id: "alteracao", rotulo: "Reserva alterada", quando: "Quando o cliente ou a equipe muda o dia, o horário ou as pessoas." },
  { id: "cancelamento", rotulo: "Reserva cancelada", quando: "Quando o cliente cancela pelo link ou a equipe cancela no painel." },
  { id: "lembrete", rotulo: "Lembrete", quando: "Algumas horas antes do horário, para as reservas confirmadas." },
  { id: "equipe", rotulo: "Aviso para a equipe", quando: "Para os números da equipe, a cada reserva nova feita pelo site." },
];

export const VARIAVEIS: { chave: string; descricao: string }[] = [
  { chave: "nome", descricao: "Primeiro nome do cliente" },
  { chave: "nomeCompleto", descricao: "Nome completo" },
  { chave: "data", descricao: "Dia por extenso" },
  { chave: "quando", descricao: "“hoje”, “amanhã” ou o dia" },
  { chave: "hora", descricao: "Horário" },
  { chave: "pessoas", descricao: "Ex.: 4 pessoas" },
  { chave: "link", descricao: "Link pessoal da reserva" },
  { chave: "telefone", descricao: "WhatsApp do cliente" },
  { chave: "ocasiao", descricao: "Ocasião, se informada" },
  { chave: "obs", descricao: "Observações, se houver" },
  { chave: "status", descricao: "Confirmada ou pendente" },
  { chave: "endereco", descricao: "Endereço do restaurante" },
  { chave: "site", descricao: "Endereço do site" },
];

export type Variaveis = Record<string, string>;

/**
 * Troca `{variavel}` pelo valor. Linhas que ficam vazias por causa de uma
 * variável vazia (ex.: sem observações) somem, e não sobram linhas em branco
 * repetidas.
 */
export function montarMensagem(modelo: string, v: Variaveis) {
  return modelo
    .split("\n")
    .flatMap((linha) => {
      const tinhaVariavel = /\{\w+\}/.test(linha);
      const trocada = linha.replace(/\{(\w+)\}/g, (_, k: string) => v[k] ?? "");
      return tinhaVariavel && !trocada.trim() ? [] : [trocada];
    })
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Valores de exemplo para a prévia do painel. */
export const EXEMPLO: Variaveis = {
  nome: "Marina",
  nomeCompleto: "Marina Albuquerque",
  data: "sábado, 25 de outubro",
  quando: "hoje",
  hora: "20:00",
  pessoas: "4 pessoas",
  link: "https://rizz-pinhal.vercel.app/reservas/Xk3d9QpA",
  telefone: "(19) 99876-5432",
  ocasiao: "Ocasião: Aniversário",
  obs: "Obs.: mesa perto da janela, se possível",
  status: "confirmada",
  endereco: "Rua Coronel Joaquim Vergueiro, 87 · Centro · Espírito Santo do Pinhal/SP",
  site: "https://rizz-pinhal.vercel.app",
};
