import { mascaraDeDigitos } from "./cursor";

// Data, hora e mês digitáveis. O valor limpo são os dígitos digitados; o
// valor do banco só existe quando o campo está completo e válido.

function juntar(d: string, cortes: number[], separador: string) {
  const partes: string[] = [];
  let inicio = 0;
  for (const corte of [...cortes, d.length]) {
    if (inicio >= d.length) break;
    partes.push(d.slice(inicio, corte));
    inicio = corte;
  }
  return partes.join(separador);
}

/** dd/mm/aaaa */
export const MASCARA_DATA = mascaraDeDigitos(8, (d) => juntar(d, [2, 4], "/"));
/** hh:mm */
export const MASCARA_HORA = mascaraDeDigitos(4, (d) => juntar(d, [2], ":"));
/** mm/aaaa */
export const MASCARA_MES_ANO = mascaraDeDigitos(6, (d) => juntar(d, [2], "/"));

const ISO_DATA = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_HORA = /^(\d{2}):(\d{2})$/;

function dataExiste(dia: number, mes: number, ano: number) {
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  return data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia;
}

export function validarData(limpo: string): string | null {
  if (!limpo) return null;
  if (limpo.length < 8) return "Data incompleta. Use dd/mm/aaaa.";
  const [dia, mes, ano] = [Number(limpo.slice(0, 2)), Number(limpo.slice(2, 4)), Number(limpo.slice(4))];
  if (ano < 1900 || ano > 2100 || !dataExiste(dia, mes, ano)) return "Essa data não existe.";
  return null;
}

/** "08102026" → "2026-10-08" (null se incompleta ou inválida) */
export function dataParaIso(limpo: string): string | null {
  if (validarData(limpo) !== null || !limpo) return null;
  return `${limpo.slice(4)}-${limpo.slice(2, 4)}-${limpo.slice(0, 2)}`;
}

/** "2026-10-08" → "08102026"; texto que não é ISO volta como dígitos */
export function isoParaDigitosData(valor: string | null | undefined): string {
  const iso = ISO_DATA.exec(valor ?? "");
  return iso ? `${iso[3]}${iso[2]}${iso[1]}` : (valor ?? "").replace(/\D/g, "").slice(0, 8);
}

export function validarHora(limpo: string): string | null {
  if (!limpo) return null;
  if (limpo.length < 4) return "Hora incompleta. Use hh:mm.";
  return Number(limpo.slice(0, 2)) > 23 || Number(limpo.slice(2)) > 59 ? "Hora inválida." : null;
}

/** "1830" → "18:30" */
export function horaDeDigitos(limpo: string): string | null {
  return limpo && validarHora(limpo) === null ? `${limpo.slice(0, 2)}:${limpo.slice(2)}` : null;
}

export function horaParaDigitos(valor: string | null | undefined): string {
  const hora = ISO_HORA.exec(valor ?? "");
  return hora ? `${hora[1]}${hora[2]}` : (valor ?? "").replace(/\D/g, "").slice(0, 4);
}

export function validarMesAno(limpo: string): string | null {
  if (!limpo) return null;
  if (limpo.length < 6) return "Mês incompleto. Use mm/aaaa.";
  const [mes, ano] = [Number(limpo.slice(0, 2)), Number(limpo.slice(2))];
  return mes < 1 || mes > 12 || ano < 1900 || ano > 2100 ? "Mês inválido." : null;
}

/** "102026" → "2026-10-01" (primeiro dia do mês, como no banco) */
export function mesAnoParaIso(limpo: string): string | null {
  return limpo && validarMesAno(limpo) === null ? `${limpo.slice(2)}-${limpo.slice(0, 2)}-01` : null;
}

export function isoParaDigitosMes(valor: string | null | undefined): string {
  const iso = ISO_DATA.exec(valor ?? "");
  return iso ? `${iso[2]}${iso[1]}` : (valor ?? "").replace(/\D/g, "").slice(0, 6);
}
