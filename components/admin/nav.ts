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
};

export const NAV: ItemNav[] = [
  { href: "/admin", rotulo: "Visão geral", curto: "Início", Icone: LayoutGrid, secao: "inicio", grupo: "restaurante" },
  { href: "/admin/reservas", rotulo: "Reservas", curto: "Reservas", Icone: CalendarDays, secao: "reservas", grupo: "restaurante" },
  { href: "/admin/cardapio", rotulo: "Cardápio", curto: "Cardápio", Icone: BookOpen, secao: "cardapio", grupo: "restaurante" },
  { href: "/admin/executivo", rotulo: "Menu executivo", curto: "Executivo", Icone: BriefcaseBusiness, secao: "executivo", grupo: "restaurante" },
  { href: "/admin/selos", rotulo: "Selos", curto: "Selos", Icone: Award, secao: "selos", grupo: "restaurante" },
  { href: "/admin/home", rotulo: "Página inicial", curto: "Início do site", Icone: House, secao: "home", grupo: "site" },
  { href: "/admin/promocoes", rotulo: "Promoções e pop-up", curto: "Promoções", Icone: Megaphone, secao: "promocoes", grupo: "site" },
  { href: "/admin/fidelidade", rotulo: "Fidelidade", curto: "Fidelidade", Icone: Heart, secao: "fidelidade", grupo: "site", emBreve: true },
  { href: "/admin/whatsapp", rotulo: "WhatsApp", curto: "WhatsApp", Icone: MessageCircle, secao: "whatsapp", grupo: "rodape" },
  { href: "/admin/configuracoes", rotulo: "Configurações", curto: "Ajustes", Icone: Settings, secao: "configuracoes", grupo: "rodape" },
];

/** As quatro que cabem na barra inferior do celular; o resto fica no "Mais". */
export const NAV_BARRA = ["/admin", "/admin/reservas", "/admin/cardapio", "/admin/whatsapp"];

export const COOKIE_SIDEBAR = "rizz_sidebar";

export function ativo(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}

/** Área da página atual (a mais específica que casa com o caminho). */
export function areaDe(pathname: string) {
  return [...NAV].reverse().find((n) => ativo(pathname, n.href));
}
