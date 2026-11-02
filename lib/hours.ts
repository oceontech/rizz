export type Servico = { inicio: string; fim: string };

export type DiaOperacao = {
  /** 0 = domingo, 6 = sábado (igual a Date#getDay). */
  dia: number;
  nome: string;
  nomeCurto: string;
  fechado?: boolean;
  almoco?: Servico;
  jantar?: Servico;
};

export const horarios: DiaOperacao[] = [
  { dia: 0, nome: "Domingo", nomeCurto: "Dom", almoco: { inicio: "11:00", fim: "15:30" }, jantar: { inicio: "18:00", fim: "22:00" } },
  { dia: 1, nome: "Segunda-feira", nomeCurto: "Seg", fechado: true },
  { dia: 2, nome: "Terça-feira", nomeCurto: "Ter", almoco: { inicio: "11:00", fim: "14:30" }, jantar: { inicio: "18:30", fim: "22:00" } },
  { dia: 3, nome: "Quarta-feira", nomeCurto: "Qua", almoco: { inicio: "11:00", fim: "14:30" }, jantar: { inicio: "18:30", fim: "22:30" } },
  { dia: 4, nome: "Quinta-feira", nomeCurto: "Qui", almoco: { inicio: "11:00", fim: "14:30" }, jantar: { inicio: "18:30", fim: "22:30" } },
  { dia: 5, nome: "Sexta-feira", nomeCurto: "Sex", almoco: { inicio: "11:00", fim: "15:00" }, jantar: { inicio: "18:30", fim: "23:00" } },
  { dia: 6, nome: "Sábado", nomeCurto: "Sáb", almoco: { inicio: "11:00", fim: "15:00" }, jantar: { inicio: "18:30", fim: "23:00" } },
];

/**
 * Data especial (feriado, evento, manutenção): vale só naquela data e passa
 * por cima da semana padrão. Editada no painel (Horários e contato) e
 * aplicada por lib/conteudo.ts, como os horários.
 */
export type DataEspecial = {
  /** AAAA-MM-DD */
  data: string;
  /** "Feriado de Natal", "Evento fechado"… aparece no site. */
  motivo: string;
  fechado: boolean;
  almoco?: Servico;
  jantar?: Servico;
};

export const datasEspeciais: DataEspecial[] = [];

const TZ = "America/Sao_Paulo";

/** Data de hoje (AAAA-MM-DD) no fuso do restaurante. */
export function hojeNoRestaurante(base = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(base);
}

/** Soma dias a uma data AAAA-MM-DD (sem fuso: conta em UTC). */
export function somarDiasISO(iso: string, n: number) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10);
}

/** 0 = domingo … 6 = sábado. */
export function diaDaSemanaISO(iso: string) {
  const [a, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay();
}

export function dataEspecialDe(iso: string) {
  return datasEspeciais.find((e) => e.data === iso) ?? null;
}

/**
 * Horário de uma DATA: a data especial, se houver, senão o dia da semana.
 * É o que reservas, "aberto agora", executivo e rodízio usam.
 */
export function diaNaData(iso: string): DiaOperacao & { especial: DataEspecial | null } {
  const base = diaDe(diaDaSemanaISO(iso));
  const especial = dataEspecialDe(iso);
  if (!especial) return { ...base, especial: null };
  const nomes = { dia: base.dia, nome: base.nome, nomeCurto: base.nomeCurto };
  return especial.fechado
    ? { ...nomes, fechado: true, especial }
    : { ...nomes, almoco: especial.almoco, jantar: especial.jantar, especial };
}

/** Minutos desde a meia-noite e dia da semana no fuso do restaurante. */
export function agoraNoRestaurante(base = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const partes = Object.fromEntries(
    fmt.formatToParts(base).map((p) => [p.type, p.value]),
  );

  const mapaDias: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };

  const hora = Number(partes.hour);
  const minuto = Number(partes.minute);

  return {
    dia: mapaDias[partes.weekday as string] ?? base.getDay(),
    minutos: (hora === 24 ? 0 : hora) * 60 + minuto,
  };
}

function paraMinutos(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

export function diaDe(dia: number) {
  return horarios.find((d) => d.dia === dia)!;
}

/** Primeiro horário de abertura do dia (o almoço, ou o jantar se só houver jantar). */
function abertura(d: DiaOperacao) {
  return (d.almoco ?? d.jantar)?.inicio ?? null;
}

/** Próxima abertura a partir de amanhã: "amanhã às 11:00", "qua às 18:30" ou "dia 26/12 às 11:00". */
function proximaAbertura(hoje: string) {
  for (let i = 1; i <= 14; i++) {
    const data = somarDiasISO(hoje, i);
    const d = diaNaData(data);
    const hora = !d.fechado && abertura(d);
    if (!hora) continue;
    if (i === 1) return `amanhã às ${hora}`;
    if (i <= 6) return `${d.nomeCurto.toLowerCase()} às ${hora}`;
    return `dia ${data.slice(8)}/${data.slice(5, 7)} às ${hora}`;
  }
  return null;
}

export type StatusAbertura = {
  aberto: boolean;
  /** "Aberto agora" · "Abre às 18:30" · "Fechado hoje" */
  rotulo: string;
  detalhe: string;
  servico: "almoco" | "jantar" | null;
};

export function statusDeAbertura(base = new Date()): StatusAbertura {
  const { minutos } = agoraNoRestaurante(base);
  const data = hojeNoRestaurante(base);
  const hoje = diaNaData(data);

  if (hoje.fechado) {
    const proxima = proximaAbertura(data);
    return {
      aberto: false,
      rotulo: "Fechado hoje",
      // Na data especial, o motivo vem antes: "Feriado de Natal · Reabre amanhã às 11:00".
      detalhe: [hoje.especial?.motivo, proxima ? `Reabre ${proxima}` : "Volta a abrir em breve"].filter(Boolean).join(" · "),
      servico: null,
    };
  }

  const servicos = [
    { chave: "almoco" as const, faixa: hoje.almoco, nome: "almoço" },
    { chave: "jantar" as const, faixa: hoje.jantar, nome: "jantar" },
  ].filter((s) => s.faixa);

  for (const s of servicos) {
    const inicio = paraMinutos(s.faixa!.inicio);
    const fim = paraMinutos(s.faixa!.fim);

    if (minutos >= inicio && minutos < fim) {
      return {
        aberto: true,
        rotulo: "Aberto agora",
        detalhe: `${s.nome} até ${s.faixa!.fim}`,
        servico: s.chave,
      };
    }

    if (minutos < inicio) {
      return {
        aberto: false,
        rotulo: `Abre às ${s.faixa!.inicio}`,
        detalhe: `${s.nome} das ${s.faixa!.inicio} às ${s.faixa!.fim}`,
        servico: null,
      };
    }
  }

  const proxima = proximaAbertura(data);
  return {
    aberto: false,
    rotulo: "Fechado agora",
    detalhe: proxima ? `Reabre ${proxima}` : "Volta a abrir em breve",
    servico: null,
  };
}

/** Menu executivo: segunda a sexta, 11h–14h30 (segunda o restaurante fecha). */
export function executivoDisponivel(base = new Date()) {
  const { dia, minutos } = agoraNoRestaurante(base);
  const ehDiaUtil = dia >= 2 && dia <= 5 && temAlmoco(hojeNoRestaurante(base));
  return ehDiaUtil && minutos >= paraMinutos("11:00") && minutos < paraMinutos("14:30");
}

/** A data tem almoço (não está fechada, nem só com jantar, por data especial). */
function temAlmoco(iso: string) {
  const d = diaNaData(iso);
  return !d.fechado && Boolean(d.almoco);
}

export type StatusExecutivo = {
  disponivel: boolean;
  /** "Disponível agora" · "Hoje, a partir das 11h" · "Volta amanhã" … */
  rotulo: string;
  detalhe: string;
};

/**
 * Situação do executivo para o cartão do cardápio. Mesma janela de
 * `executivoDisponivel` (terça a sexta, 11h às 14h30; segunda a casa fecha).
 */
export function statusDoExecutivo(base = new Date()): StatusExecutivo {
  const { minutos } = agoraNoRestaurante(base);
  const hoje = hojeNoRestaurante(base);
  const inicio = paraMinutos("11:00");
  const fim = paraMinutos("14:30");
  // Terça a sexta, e só se a data tiver almoço (feriado fechado não tem executivo).
  const ehData = (iso: string) => {
    const d = diaDaSemanaISO(iso);
    return d >= 2 && d <= 5 && temAlmoco(iso);
  };

  if (ehData(hoje) && minutos >= inicio && minutos < fim) {
    const falta = fim - minutos;
    return {
      disponivel: true,
      rotulo: "Disponível agora",
      detalhe: falta <= 45 ? `Últimos ${falta} minutos · até 14h30` : "Servido até 14h30",
    };
  }
  if (ehData(hoje) && minutos < inicio) {
    return { disponivel: false, rotulo: "Hoje tem executivo", detalhe: "A partir das 11h, até 14h30" };
  }
  for (let i = 1; i <= 14; i++) {
    const data = somarDiasISO(hoje, i);
    if (ehData(data)) {
      return {
        disponivel: false,
        rotulo: i === 1 ? "Volta amanhã" : `Volta ${diaDe(diaDaSemanaISO(data)).nome.toLowerCase()}`,
        detalhe: "Das 11h às 14h30",
      };
    }
  }
  return { disponivel: false, rotulo: "Consulte a equipe", detalhe: "" };
}

/** Formato "11:00 – 14:30" para exibição. */
export function faixa(s?: Servico) {
  return s ? `${s.inicio} às ${s.fim}` : null;
}

/** Datas especiais de hoje em diante, em ordem (para o site e o painel). */
export function proximasDatasEspeciais(base = new Date(), dias = 60) {
  const hoje = hojeNoRestaurante(base);
  const ate = somarDiasISO(hoje, dias);
  return datasEspeciais.filter((e) => e.data >= hoje && e.data <= ate).sort((a, b) => a.data.localeCompare(b.data));
}

/** Datas especiais no formato de schema.org (é assim que o Google mostra feriados). */
export function specialOpeningHoursSpecification() {
  return proximasDatasEspeciais(new Date(), 120).flatMap((e) => {
    const base = { "@type": "OpeningHoursSpecification", validFrom: e.data, validThrough: e.data };
    if (e.fechado) return [{ ...base, opens: "00:00", closes: "00:00" }];
    return ([e.almoco, e.jantar].filter(Boolean) as Servico[]).map((sv) => ({ ...base, opens: sv.inicio, closes: sv.fim }));
  });
}

/** Usado no JSON-LD de schema.org/Restaurant. */
export function openingHoursSpecification() {
  const dias: Record<number, string> = {
    0: "Sunday", 1: "Monday", 2: "Tuesday", 3: "Wednesday",
    4: "Thursday", 5: "Friday", 6: "Saturday",
  };

  return horarios.flatMap((d) => {
    if (d.fechado) return [];
    return ([d.almoco, d.jantar].filter(Boolean) as Servico[]).map((s) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: dias[d.dia],
      opens: s.inicio,
      closes: s.fim,
    }));
  });
}
