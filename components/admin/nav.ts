import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Heart,
  House,
  LayoutGrid,
  Megaphone,
  MessageCircle,
  Settings,
  type LucideIcon,
} from "lucide-react";

/** Área do painel: dá a cor do item na sidebar e dos ícones da página (admin.css). */
export type Secao =
  | "inicio"
  | "reservas"
  | "cardapio"
  | "executivo"
  | "selos"
  | "home"
  | "promocoes"
  | "fidelidade"
  | "whatsapp"
  | "configuracoes";

type ItemNav = {
  href: string;
  rotulo: string;
  curto: string;
  Icone: LucideIcon;
  secao: Secao;
  grupo: "restaurante" | "site" | "rodape";
  /** Aparece trancado, com "Em breve", e a página não abre. */
  emBreve?: boolean;
  /** Subpágina: some da sidebar e vira uma aba dentro da página-mãe (este href). */
  pai?: string;
  /** Rótulo da aba, quando difere do rótulo da página. */
  aba?: string;
};

export const NAV: ItemNav[] = [
  { href: "/admin", rotulo: "Visão geral", curto: "Início", Icone: LayoutGrid, secao: "inicio", grupo: "restaurante" },
  { href: "/admin/reservas", rotulo: "Reservas", curto: "Reservas", Icone: CalendarDays, secao: "reservas", grupo: "restaurante" },
  { href: "/admin/cardapio", rotulo: "Cardápio", curto: "Cardápio", Icone: BookOpen, secao: "cardapio", grupo: "restaurante", aba: "Cardápio" },
  { href: "/admin/executivo", rotulo: "Menu executivo", curto: "Executivo", Icone: BriefcaseBusiness, secao: "executivo", grupo: "restaurante", pai: "/admin/cardapio" },
  { href: "/admin/home", rotulo: "Página inicial", curto: "Início do site", Icone: House, secao: "home", grupo: "site" },
  { href: "/admin/promocoes", rotulo: "Promoções e pop-up", curto: "Promoções", Icone: Megaphone, secao: "promocoes", grupo: "site" },
  { href: "/admin/fidelidade", rotulo: "Fidelidade", curto: "Fidelidade", Icone: Heart, secao: "fidelidade", grupo: "site", emBreve: true },
  { href: "/admin/configuracoes", rotulo: "Configurações", curto: "Ajustes", Icone: Settings, secao: "configuracoes", grupo: "rodape", aba: "Geral" },
  { href: "/admin/selos", rotulo: "Selos", curto: "Selos", Icone: Award, secao: "selos", grupo: "rodape", pai: "/admin/configuracoes" },
  { href: "/admin/whatsapp", rotulo: "WhatsApp", curto: "WhatsApp", Icone: MessageCircle, secao: "whatsapp", grupo: "rodape", pai: "/admin/configuracoes" },
];

/** As quatro que cabem na barra inferior do celular; o resto fica no "Mais". */
export const NAV_BARRA = ["/admin", "/admin/reservas", "/admin/cardapio", "/admin/home"];

export const COOKIE_SIDEBAR = "rizz_sidebar";

export function ativo(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/** Área da página atual (a mais específica que casa com o caminho, inclusive subpáginas). */
export function areaDe(pathname: string) {
  return [...NAV].reverse().find((n) => ativo(pathname, n.href));
}

/** Itens que aparecem na sidebar (as subpáginas ficam como abas). */
export const NAV_SIDEBAR = NAV.filter((n) => !n.pai);

/** O item da sidebar aceso: a própria página ou a mãe da subpágina atual. */
export function ativoNaSidebar(pathname: string, href: string) {
  const area = areaDe(pathname);
  return area ? (area.pai ?? area.href) === href : false;
}

/** Abas da página atual: a mãe e as subpáginas dela (vazio se a página não tem). */
export function abasDe(pathname: string) {
  const area = areaDe(pathname);
  if (!area) return [];
  const mae = area.pai ?? area.href;
  const filhas = NAV.filter((n) => n.pai === mae);
  if (!filhas.length) return [];
  return [NAV.find((n) => n.href === mae)!, ...filhas];
}
