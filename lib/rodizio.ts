import { agoraNoRestaurante, diaDe, horarios } from "@/lib/hours";

/**
 * Rodízio de risotos.
 *
 * Fonte: vídeos do próprio restaurante (álbum, abr/2026): "acontece todas as
 * quartas e quintas no jantar e é composto por três etapas" — arancini de
 * entrada, seis sabores de risoto à vontade (que mudam toda semana) e a
 * sobremesa da semana. O valor não aparece nos vídeos: o site manda
 * consultar a equipe até ele ser confirmado.
 */
export const rodizio = {
  /** 0 = domingo … 6 = sábado. */
  dias: [3, 4],
  etapas: [
    { titulo: "Arancini", texto: "De entrada, o bolinho de arroz de risoto." },
    { titulo: "Seis risotos", texto: "Seis sabores para você se servir à vontade. Os sabores mudam toda semana." },
    { titulo: "Sobremesa da semana", texto: "Para fechar, a sobremesa que a casa preparou para a semana." },
  ],
};

export type StatusRodizio = {
  /** agora: o jantar com rodízio está acontecendo; hoje: ainda vai começar. */
  fase: "agora" | "hoje" | "amanha" | "proximo";
  /** Frase curta para selos e faixas. */
  rotulo: string;
  /** Complemento com dia e horário. */
  detalhe: string;
};

function minutos(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

const nomeDoDia = (dia: number) => diaDe(dia).nome.toLowerCase();

/**
 * Situação do rodízio agora, no fuso do restaurante. Usa o horário do jantar
 * de `lib/hours.ts`, então muda junto se o horário do restaurante mudar.
 */
export function statusDoRodizio(base = new Date()): StatusRodizio {
  const { dia, minutos: agora } = agoraNoRestaurante(base);
  const jantarHoje = diaDe(dia).jantar;

  if (rodizio.dias.includes(dia) && jantarHoje) {
    const inicio = minutos(jantarHoje.inicio);
    const fim = minutos(jantarHoje.fim);
    if (agora >= inicio && agora < fim) {
      return { fase: "agora", rotulo: "Rodízio de risotos agora", detalhe: `Jantar até ${jantarHoje.fim}` };
    }
    if (agora < inicio) {
      return { fase: "hoje", rotulo: "Hoje tem rodízio de risotos", detalhe: `No jantar, a partir das ${jantarHoje.inicio}` };
    }
  }

  const amanha = (dia + 1) % 7;
  const jantarAmanha = diaDe(amanha).jantar;
  if (rodizio.dias.includes(amanha) && jantarAmanha) {
    return { fase: "amanha", rotulo: "Amanhã tem rodízio de risotos", detalhe: `${diaDe(amanha).nome}, a partir das ${jantarAmanha.inicio}` };
  }

  for (let i = 2; i <= 7; i++) {
    const d = (dia + i) % 7;
    const jantar = diaDe(d).jantar;
    if (rodizio.dias.includes(d) && jantar) {
      return { fase: "proximo", rotulo: "Rodízio de risotos", detalhe: `Próximo: ${nomeDoDia(d)}, a partir das ${jantar.inicio}` };
    }
  }

  return { fase: "proximo", rotulo: "Rodízio de risotos", detalhe: "Consulte as datas com a equipe" };
}

/** "Quartas e quintas" — a partir de `rodizio.dias`. */
export function diasDoRodizio() {
  const nomes = rodizio.dias.map((d) => horarios.find((h) => h.dia === d)!.nome.replace("-feira", "s").toLowerCase());
  const lista = nomes.length > 1 ? `${nomes.slice(0, -1).join(", ")} e ${nomes.at(-1)}` : nomes[0];
  return lista.charAt(0).toUpperCase() + lista.slice(1);
}

/** Faixa do jantar nos dias de rodízio, ex.: "18:30 às 22:30". */
export function horarioDoRodizio() {
  const j = diaDe(rodizio.dias[0]).jantar;
  return j ? `${j.inicio} às ${j.fim}` : "";
}
