export const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarData(iso: string | null, opcoes?: Intl.DateTimeFormatOptions) {
  if (!iso) return "—";
  const [a, m, d] = iso.slice(0, 10).split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString(
    "pt-BR",
    opcoes ?? { day: "2-digit", month: "short" },
  );
}

/** "(19) 99999-9999" → "5519999999999" para links do WhatsApp. */
export function telefoneWhats(tel: string | null) {
  if (!tel) return null;
  const digitos = tel.replace(/\D/g, "");
  if (digitos.length < 10) return null;
  return digitos.startsWith("55") ? digitos : `55${digitos}`;
}

export function mascaraTelefone(valor: string) {
  const d = valor.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Só dígitos, sem o 55 do país: é a chave única do cliente na fidelidade. */
export function normalizarTelefone(tel: string) {
  return tel.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
}
