import {
  Book,
  Briefcase,
  Calendar,
  Gear,
  Heart,
  House,
  Megaphone,
} from "@gravity-ui/icons";

export const NAV = [
  { href: "/admin", rotulo: "Visão geral", curto: "Início", Icone: House },
  { href: "/admin/cardapio", rotulo: "Cardápio", curto: "Cardápio", Icone: Book },
  { href: "/admin/executivo", rotulo: "Menu executivo", curto: "Executivo", Icone: Briefcase },
  { href: "/admin/reservas", rotulo: "Reservas", curto: "Reservas", Icone: Calendar },
  { href: "/admin/promocoes", rotulo: "Promoções e pop-up", curto: "Promoções", Icone: Megaphone },
  { href: "/admin/fidelidade", rotulo: "Fidelidade", curto: "Fidelidade", Icone: Heart },
  { href: "/admin/configuracoes", rotulo: "Configurações", curto: "Ajustes", Icone: Gear },
] as const;

/** As quatro que cabem na barra inferior do celular; o resto fica no "Mais". */
export const NAV_BARRA = ["/admin", "/admin/cardapio", "/admin/reservas", "/admin/fidelidade"];

export function ativo(pathname: string, href: string) {
  return href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
}
