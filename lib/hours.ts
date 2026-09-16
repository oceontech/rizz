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

const TZ = "America/Sao_Paulo";

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

export type StatusAbertura = {
  aberto: boolean;
  /** "Aberto agora" · "Abre às 18:30" · "Fechado hoje" */
  rotulo: string;
  detalhe: string;
  servico: "almoco" | "jantar" | null;
};

export function statusDeAbertura(base = new Date()): StatusAbertura {
  const { dia, minutos } = agoraNoRestaurante(base);
  const hoje = diaDe(dia);

  if (hoje.fechado) {
    const amanha = diaDe((dia + 1) % 7);
    return {
      aberto: false,
      rotulo: "Fechado hoje",
      detalhe: amanha.fechado
        ? "Volta a abrir em breve"
        : `Reabre ${amanha.nomeCurto.toLowerCase()} às ${amanha.almoco!.inicio}`,
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
        detalhe: `${s.nome} ${s.faixa!.inicio}–${s.faixa!.fim}`,
        servico: null,
      };
    }
  }

  const amanha = diaDe((dia + 1) % 7);
  return {
    aberto: false,
    rotulo: "Fechado agora",
    detalhe: amanha.fechado
      ? "Segunda não abrimos"
      : `Amanhã a partir das ${amanha.almoco!.inicio}`,
    servico: null,
  };
}

/** Menu executivo: segunda a sexta, 11h–14h30 (segunda o restaurante fecha). */
export function executivoDisponivel(base = new Date()) {
  const { dia, minutos } = agoraNoRestaurante(base);
  const ehDiaUtil = dia >= 2 && dia <= 5;
  return ehDiaUtil && minutos >= paraMinutos("11:00") && minutos < paraMinutos("14:30");
}

/** Formato "11:00 – 14:30" para exibição. */
export function faixa(s?: Servico) {
  return s ? `${s.inicio} – ${s.fim}` : null;
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
