/**
 * Papéis e permissões do painel. Arquivo puro (sem servidor) para a tela de
 * equipe montar a matriz e o servidor checar cada página e ação.
 *
 * Cada área tem um nível: "nenhum" (some do menu), "ver" (abre só para
 * consultar) ou "editar". Os papéis são atalhos para conjuntos de níveis;
 * "personalizado" guarda a matriz escolhida à mão.
 */

export const AREAS = [
  { id: "reservas", rotulo: "Reservas", descricao: "Agenda, confirmar ou recusar, mesas, bloqueios e lotação." },
  { id: "cardapio", rotulo: "Cardápio e executivo", descricao: "Pratos, preços, fotos, esgotados e menu executivo." },
  { id: "vinhos", rotulo: "Carta de vinhos", descricao: "Rótulos, preços e disponibilidade." },
  { id: "site", rotulo: "Página inicial e promoções", descricao: "Destaques da home, promoções e pop-up." },
  { id: "fidelidade", rotulo: "Fidelidade", descricao: "Clientes, pontos e recompensas." },
  { id: "horarios", rotulo: "Horários e contato", descricao: "Semana, feriados, rodízio, telefone e endereço." },
  { id: "configuracoes", rotulo: "Aviso, selos e WhatsApp", descricao: "Barra de aviso do site, selos dos pratos e mensagens automáticas." },
  { id: "equipe", rotulo: "Equipe e acessos", descricao: "Convidar pessoas, mudar acessos e remover." },
] as const;

export type Area = (typeof AREAS)[number]["id"];
export type Nivel = "nenhum" | "ver" | "editar";
export type Permissoes = Record<Area, Nivel>;
export type Papel = "dono" | "gerente" | "colaborador" | "personalizado";

/**
 * Rótulos descrevem o que a pessoa consegue fazer, não uma ação: "Editar"
 * num botão verde parecia um botão de edição.
 */
export const NIVEIS: { id: Nivel; rotulo: string; descricao: string }[] = [
  { id: "nenhum", rotulo: "Não acessa", descricao: "A área nem aparece no menu." },
  { id: "ver", rotulo: "Só consulta", descricao: "Abre e vê tudo, mas não muda nada." },
  { id: "editar", rotulo: "Consulta e altera", descricao: "Pode mudar e salvar." },
];

const todas = (nivel: Nivel) => Object.fromEntries(AREAS.map((a) => [a.id, nivel])) as Permissoes;

export const PAPEIS: { id: Papel; rotulo: string; descricao: string; permissoes: Permissoes }[] = [
  {
    id: "dono",
    rotulo: "Administrador",
    descricao: "Acesso total, inclusive à equipe. Para o dono e quem responde pelo restaurante.",
    permissoes: todas("editar"),
  },
  {
    id: "gerente",
    rotulo: "Gerente",
    descricao: "Cuida de tudo no dia a dia, mas não mexe na equipe.",
    permissoes: { ...todas("editar"), equipe: "ver" },
  },
  {
    id: "colaborador",
    rotulo: "Colaborador",
    descricao: "Recepção e salão: reservas e esgotados do cardápio. Vê os horários.",
    permissoes: { ...todas("nenhum"), reservas: "editar", cardapio: "editar", vinhos: "editar", horarios: "ver" },
  },
  {
    id: "personalizado",
    rotulo: "Personalizado",
    descricao: "Você escolhe área por área o que a pessoa vê e edita.",
    permissoes: { ...todas("nenhum"), reservas: "ver" },
  },
];

export const papelInfo = (papel: Papel) => PAPEIS.find((p) => p.id === papel) ?? PAPEIS[3];

const ehNivel = (v: unknown): v is Nivel => v === "nenhum" || v === "ver" || v === "editar";

/** Permissões efetivas: os papéis prontos valem como estão; o personalizado usa a matriz salva. */
export function permissoesDe(papel: string, salvas?: unknown): Permissoes {
  if (papel !== "personalizado") return { ...(PAPEIS.find((p) => p.id === papel) ?? PAPEIS[0]).permissoes };
  const base = todas("nenhum");
  if (salvas && typeof salvas === "object") {
    for (const a of AREAS) {
      const v = (salvas as Record<string, unknown>)[a.id];
      if (ehNivel(v)) base[a.id] = v;
    }
  }
  return base;
}

export function pode(p: Permissoes, area: Area, nivel: "ver" | "editar" = "ver") {
  return nivel === "ver" ? p[area] !== "nenhum" : p[area] === "editar";
}

/** Resumo curto da matriz ("Altera 3 áreas · consulta 2"), para a lista da equipe. */
export function resumoPermissoes(p: Permissoes) {
  const edita = AREAS.filter((a) => p[a.id] === "editar").length;
  const ve = AREAS.filter((a) => p[a.id] === "ver").length;
  if (edita === AREAS.length) return "Acesso total";
  const partes = [edita && `altera ${edita} ${edita === 1 ? "área" : "áreas"}`, ve && `consulta ${ve}`].filter(Boolean);
  return partes.length ? String(partes.join(" · ")).replace(/^./, (c) => c.toUpperCase()) : "Não acessa nenhuma área";
}
