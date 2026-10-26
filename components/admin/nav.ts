import {
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Heart,
  LayoutGrid,
  Megaphone,
  MessageCircle,
  Settings,
  type LucideIcon,
} from "lucide-react";

type ItemNav = { href: string; rotulo: string; curto: string; Icone: LucideIcon; grupo: "principal" | "rodape" };

export const NAV: ItemNav[] = [
  { href: "/admin", rotulo: "Visão geral", curto: "Início", Icone: LayoutGrid, grupo: "principal" },
  { href: "/admin/reservas", rotulo: "Reservas", curto: "Reservas", Icone: CalendarDays, grupo: "principal" },
  { href: "/admin/cardapio", rotulo: "Cardápio", curto: "Cardápio", Icone: BookOpen, grupo: "principal" },
  { href: "/admin/executivo", rotulo: "Menu executivo", curto: "Executivo", Icone: BriefcaseBusiness, grupo: "principal" },
  { href: "/admin/fidelidade", rotulo: "Fidelidade", curto: "Fidelidade", Icone: Heart, grupo: "principal" },
  { href: "/admin/promocoes", rotulo: "Promoções e pop-up", curto: "Promoções", Icone: Megaphone, grupo: "principal" },
  { href: "/admin/whatsapp", rotulo: "WhatsApp", curto: "WhatsApp", Icone: MessageCircle, grupo: "rodape" },
  { href: "/admin/configuracoes", rotulo: "Configurações", curto: "Ajustes", Icone: Settings, grupo: "rodape" },
];

/** As quatro que cabem na barra inferior do celular; o resto fica no "Mais". */
export const NAV_BARRA = ["/admin", "/admin/reservas", "/admin/cardapio", "/admin/fidelidade"];

export const COOKIE_SIDEBAR = "rizz_sidebar";

export function ativo(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}
