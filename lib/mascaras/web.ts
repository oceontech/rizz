import type { Mascara } from "./cursor";
import { digito } from "./cursor";

// E-mail, URL, Instagram, conta de anúncio e códigos técnicos.

const semAcentos = (texto: string) => texto.normalize("NFD").replace(/[̀-ͯ]/g, "");

// ——— E-mail: minúsculas e sem espaços ———
export const MASCARA_EMAIL: Mascara = {
  preparar: (texto) => texto.toLowerCase(),
  significativo: (c) => !/\s/.test(c),
  formatar: (limpo) => limpo,
  maximo: 254,
};

const EMAIL = /^[a-z0-9._%+-]+@[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/;

export function validarEmail(limpo: string): string | null {
  if (!limpo) return null;
  return EMAIL.test(limpo) ? null : "E-mail inválido. Confira o endereço.";
}

const DOMINIOS_CORRIGIDOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gamil.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmal.com": "hotmail.com",
  "hotmai.com": "hotmail.com",
  "hotmail.con": "hotmail.com",
  "outlok.com": "outlook.com",
  "outlook.con": "outlook.com",
  "yahoo.con": "yahoo.com",
  "yaho.com": "yahoo.com",
};

/** Sugere o e-mail com o domínio corrigido ("ana@gmial.com" → "ana@gmail.com") */
export function sugerirEmail(limpo: string): string | null {
  const [usuario, dominio] = limpo.split("@");
  if (!usuario || !dominio) return null;
  const corrigido = DOMINIOS_CORRIGIDOS[dominio] ?? (dominio.endsWith(".con") ? `${dominio.slice(0, -4)}.com` : null);
  return corrigido ? `${usuario}@${corrigido}` : null;
}

// ——— URL: completa https:// sozinho ———
export const MASCARA_URL: Mascara = {
  significativo: (c) => !/\s/.test(c),
  formatar: (limpo) => limpo,
  maximo: 2048,
};

export function completarUrl(limpo: string): string {
  if (!limpo) return "";
  if (/^https?:\/\//i.test(limpo)) return limpo.replace(/^https?/i, (p) => p.toLowerCase());
  return `https://${limpo.replace(/^\/+/, "")}`;
}

export function validarUrl(limpo: string): string | null {
  if (!limpo) return null;
  return /^https?:\/\/[^\s/.]+(\.[^\s/.]+)+/.test(completarUrl(limpo)) ? null : "Endereço inválido. Ex.: burgerdavila.com.br";
}

// ——— Instagram: tela mostra o usuário, banco guarda o link ———
const caractereInstagram = (c: string) => (c >= "a" && c <= "z") || digito(c) || c === "." || c === "_";

export const MASCARA_INSTAGRAM: Mascara = {
  preparar: (texto) => usuarioInstagram(texto),
  significativo: caractereInstagram,
  formatar: (limpo) => limpo,
  maximo: 30,
};

/** Aceita "@usuario", "usuario" ou o link do perfil e devolve só o usuário */
export function usuarioInstagram(texto: string | null | undefined): string {
  let t = (texto ?? "").trim();
  const link = /instagram\.com\/([^/?#\s]+)/i.exec(t);
  if (link) t = link[1];
  return t.replace(/^@+/, "").toLowerCase();
}

export function instagramParaBanco(usuario: string): string | null {
  return usuario ? `https://instagram.com/${usuario}` : null;
}

export function validarInstagram(usuario: string): string | null {
  if (!usuario) return null;
  if (usuario.startsWith(".") || usuario.endsWith(".") || usuario.includes("..")) return "Usuário inválido. Confira o @.";
  return null;
}

// ——— Conta de anúncio da Meta: "act_" fixo + dígitos ———
export const MASCARA_CONTA_ANUNCIO: Mascara = {
  preparar: (texto) => texto.replace(/^\s*act_/i, ""),
  significativo: digito,
  formatar: (limpo) => limpo,
  maximo: 20,
};

export function contaAnuncioDigitos(valor: string | null | undefined): string {
  return (valor ?? "").replace(/^act_/i, "").replace(/\D/g, "");
}

export function validarContaAnuncio(digitos: string): string | null {
  if (!digitos) return null;
  return digitos.length < 5 ? "ID curto demais. Copie do Gerenciador de Anúncios." : null;
}

// ——— Código técnico (ex.: evento da Meta): minúsculas, _ e . ———
export const MASCARA_CODIGO: Mascara = {
  preparar: (texto) => semAcentos(texto).toLowerCase().replace(/[\s-]/g, "_"),
  significativo: (c) => (c >= "a" && c <= "z") || digito(c) || c === "_" || c === ".",
  formatar: (limpo) => limpo,
  maximo: 80,
};
