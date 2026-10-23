import { mascaraDeDigitos } from "./cursor";

const soDigitos = (texto: string | null | undefined) => (texto ?? "").replace(/\D/g, "");

// Telefone brasileiro. Na tela: (11) 91234-5678 com "+55" fixo ao lado.
// No banco: só dígitos, sempre com o DDI 55 ("5511912345678").

/** DDDs em uso no Brasil (Anatel) */
export const DDDS = new Set([
  "11", "12", "13", "14", "15", "16", "17", "18", "19", "21", "22", "24", "27", "28",
  "31", "32", "33", "34", "35", "37", "38", "41", "42", "43", "44", "45", "46", "47",
  "48", "49", "51", "53", "54", "55", "61", "62", "63", "64", "65", "66", "67", "68",
  "69", "71", "73", "74", "75", "77", "79", "81", "82", "83", "84", "85", "86", "87",
  "88", "89", "91", "92", "93", "94", "95", "96", "97", "98", "99",
]);

/** (11) 91234-5678 ou (11) 3212-3456, também com dígitos parciais */
export function formatarTelefoneLocal(digitos: string): string {
  const d = digitos.slice(0, 11);
  if (!d) return "";
  if (d.length <= 2) return `(${d}`;
  const numero = d.slice(2);
  const corte = numero.length > 8 || numero[0] === "9" ? 5 : 4;
  const meio = numero.length > corte ? `${numero.slice(0, corte)}-${numero.slice(corte)}` : numero;
  return `(${d.slice(0, 2)}) ${meio}`;
}

export const MASCARA_TELEFONE = {
  ...mascaraDeDigitos(11, formatarTelefoneLocal),
  // Colar "+55 11 91234-5678" ou "5511912345678": descarta o DDI
  preparar: (texto: string) => {
    const d = soDigitos(texto);
    return d.length > 11 && d.startsWith("55") ? d.slice(2) : texto;
  },
};

/** Valor do banco (com ou sem 55) → dígitos locais (DDD + número) */
export function telefoneLocal(valor: string | null | undefined): string {
  const d = soDigitos(valor);
  return d.length > 11 && d.startsWith("55") ? d.slice(2) : d.slice(0, 11);
}

/** Dígitos locais → valor do banco, com DDI */
export function telefoneParaBanco(local: string): string | null {
  return local ? `55${local}` : null;
}

export function validarTelefone(local: string): string | null {
  if (!local) return null;
  if (local.length < 10) return "Número incompleto.";
  if (!DDDS.has(local.slice(0, 2))) return "DDD inexistente.";
  const numero = local.slice(2);
  if (numero.length === 9 && numero[0] !== "9") return "Celular começa com 9.";
  if (numero.length === 8 && !/[2-5]/.test(numero[0])) return "Fixo começa com 2, 3, 4 ou 5.";
  return null;
}

/** Valida o valor do banco (para o Zod): aceita com ou sem DDI */
export function validarTelefoneBanco(valor: string): string | null {
  return validarTelefone(telefoneLocal(valor));
}
