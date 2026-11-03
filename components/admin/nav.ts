import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Clock,
  Heart,
  House,
  LayoutGrid,
  Megaphone,
  MessageCircle,
  MapPin,
  Settings,
  UserRound,
  Users,
  Wine,
  type LucideIcon,
} from "lucide-react";

import { pode, type Area, type Permissoes } from "@/lib/permissoes";

/** Área do painel: dá a cor do item na sidebar e dos ícones da página (admin.css). */
export type Secao =
  | "inicio"
  | "reservas"
  | "cardapio"
  | "executivo"
  | "vinhos"
  | "funcionamento"
  | "selos"
  | "home"
  | "promocoes"
  | "fidelidade"
  | "whatsapp"
  | "contato"
  | "equipe"
  | "conta"
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
  /** Permissão que a página exige para aparecer (sem área: qualquer pessoa logada). */
  area?: Area;
};

export const NAV: ItemNav[] = [
  { href: "/admin", rotulo: "Visão geral", curto: "Início", Icone: LayoutGrid, secao: "inicio", grupo: "restaurante" },
  { href: "/admin/reservas", rotulo: "Reservas", curto: "Reservas", Icone: CalendarDays, secao: "reservas", grupo: "restaurante", area: "reservas" },
  { href: "/admin/cardapio", rotulo: "Cardápio", curto: "Cardápio", Icone: BookOpen, secao: "cardapio", grupo: "restaurante", aba: "Cardápio", area: "cardapio" },
  { href: "/admin/executivo", rotulo: "Menu executivo", curto: "Executivo", Icone: BriefcaseBusiness, secao: "executivo", grupo: "restaurante", pai: "/admin/cardapio", area: "cardapio" },
  { href: "/admin/vinhos", rotulo: "Carta de vinhos", curto: "Vinhos", Icone: Wine, secao: "vinhos", grupo: "restaurante", area: "vinhos" },
  { href: "/admin/home", rotulo: "Página inicial", curto: "Início do site", Icone: House, secao: "home", grupo: "site", area: "site" },
  { href: "/admin/promocoes", rotulo: "Promoções e pop-up", curto: "Promoções", Icone: Megaphone, secao: "promocoes", grupo: "site", area: "site" },
  { href: "/admin/fidelidade", rotulo: "Fidelidade", curto: "Fidelidade", Icone: Heart, secao: "fidelidade", grupo: "site", emBreve: true, area: "fidelidade" },
  // Configurações: a mãe e as abas, na ordem em que aparecem.
  { href: "/admin/configuracoes", rotulo: "Configurações", curto: "Ajustes", Icone: Settings, secao: "configuracoes", grupo: "rodape", aba: "Geral", area: "configuracoes" },
  { href: "/admin/configuracoes/horarios", rotulo: "Horários", curto: "Horários", Icone: Clock, secao: "funcionamento", grupo: "rodape", pai: "/admin/configuracoes", area: "horarios" },
  { href: "/admin/configuracoes/contato", rotulo: "Contato e endereço", curto: "Contato", Icone: MapPin, secao: "contato", grupo: "rodape", pai: "/admin/configuracoes", aba: "Contato", area: "horarios" },
  { href: "/admin/configuracoes/equipe", rotulo: "Equipe e acessos", curto: "Equipe", Icone: Users, secao: "equipe", grupo: "rodape", pai: "/admin/configuracoes", aba: "Equipe", area: "equipe" },
  { href: "/admin/selos", rotulo: "Selos", curto: "Selos", Icone: Award, secao: "selos", grupo: "rodape", pai: "/admin/configuracoes", area: "configuracoes" },
  { href: "/admin/whatsapp", rotulo: "WhatsApp", curto: "WhatsApp", Icone: MessageCircle, secao: "whatsapp", grupo: "rodape", pai: "/admin/configuracoes", area: "configuracoes" },
  { href: "/admin/configuracoes/conta", rotulo: "Minha conta", curto: "Conta", Icone: UserRound, secao: "conta", grupo: "rodape", pai: "/admin/configuracoes" },
];

/** A pessoa logada vê este item? */
export const visivel = (n: ItemNav, p: Permissoes) => !n.area || pode(p, n.area, "ver");

/** As quatro que cabem na barra inferior do celular; o resto fica no "Mais". */
export const NAV_BARRA = ["/admin", "/admin/reservas", "/admin/cardapio", "/admin/home"];

export const COOKIE_SIDEBAR = "rizz_sidebar";

export function ativo(pathname: string, href: string) {
  // Só o caminho inteiro ou uma subpasta: "/conta" não acende em "/contato".
  return href === "/admin" ? pathname === "/admin" : pathname === href || pathname.startsWith(`${href}/`);
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

/** Abas da página atual: a mãe e as subpáginas dela que a pessoa pode ver (vazio se não tem). */
export function abasDe(pathname: string, p: Permissoes) {
  const area = areaDe(pathname);
  if (!area) return [];
  return abasDaMae(area.pai ?? area.href, p);
}

function abasDaMae(mae: string, p: Permissoes) {
  const filhas = NAV.filter((n) => n.pai === mae);
  if (!filhas.length) return [];
  return [NAV.find((n) => n.href === mae)!, ...filhas].filter((n) => visivel(n, p));
}

/**
 * Para onde o item da sidebar leva: a própria página ou, se ela tem abas e a
 * pessoa não pode ver a primeira, a primeira aba que ela pode ver.
 */
export function destinoDe(n: ItemNav, p: Permissoes) {
  if (visivel(n, p)) return n.href;
  return abasDaMae(n.href, p)[0]?.href ?? null;
}
