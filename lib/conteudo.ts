import { datasEspeciais, horarios, type DataEspecial, type DiaOperacao } from "@/lib/hours";
import { rodizio } from "@/lib/rodizio";
import { atualizarEnderecoLinha, site } from "@/lib/site";

/**
 * Funcionamento e contato editáveis no painel (Configurações → Horários e Contato).
 *
 * O site inteiro lê três objetos únicos: `horarios` (lib/hours), `rodizio`
 * (lib/rodizio) e `site` (lib/site), muitas vezes em funções síncronas que
 * rodam no servidor E no navegador ("aberto agora", turnos de reserva,
 * status do rodízio, links do WhatsApp). Em vez de reescrever os ~20 pontos
 * que os usam, `aplicarConteudo` atualiza ESSES MESMOS objetos com o que foi
 * salvo no painel:
 *   - no servidor, `carregarConteudo()` (lib/conteudo-servidor) roda antes
 *     dos layouts, páginas e rotas que dependem deles;
 *   - no navegador, `<ConteudoSite>` aplica antes de os componentes
 *     desenharem.
 * Os valores escritos no código ficam como padrão (e como reserva se o banco
 * falhar).
 */

export type ContatoConfig = {
  telefone: string;
  whatsapp: string;
  rua: string;
  bairro: string;
  cidade: string;
  uf: string;
  cep: string;
  instagram: string;
  facebook: string;
};

export type RodizioConfig = {
  dias: number[];
  etapas: { titulo: string; texto: string }[];
};

export type ConteudoSiteConfig = {
  horarios: DiaOperacao[];
  /** Feriados e datas fora do padrão; passam por cima da semana. */
  datasEspeciais: DataEspecial[];
  rodizio: RodizioConfig;
  contato: ContatoConfig;
};

const copiar = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/** Fotografia dos valores do código, tirada antes de qualquer alteração. */
export const CONTEUDO_PADRAO: ConteudoSiteConfig = {
  horarios: copiar(horarios),
  datasEspeciais: [],
  rodizio: copiar({ dias: rodizio.dias, etapas: rodizio.etapas }),
  contato: {
    telefone: site.telefone,
    whatsapp: site.whatsapp,
    rua: site.endereco.rua,
    bairro: site.endereco.bairro,
    cidade: site.endereco.cidade,
    uf: site.endereco.uf,
    cep: site.endereco.cep,
    instagram: site.redes.instagram,
    facebook: site.redes.facebook,
  },
};

/** "(19) 3661-5503" → "+551936615503". */
export function telefoneParaLink(telefone: string) {
  const d = telefone.replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");
  return `+55${d}`;
}

/** Atualiza os objetos do site no lugar. Idempotente e barato. */
export function aplicarConteudo(c: ConteudoSiteConfig) {
  horarios.splice(0, horarios.length, ...copiar(c.horarios).sort((a, b) => a.dia - b.dia));
  datasEspeciais.splice(0, datasEspeciais.length, ...copiar(c.datasEspeciais ?? []));

  const r = rodizio as { dias: number[]; etapas: { titulo: string; texto: string }[] };
  r.dias = [...c.rodizio.dias].sort((a, b) => a - b);
  r.etapas = copiar(c.rodizio.etapas);

  // `site` é declarado `as const` para o TypeScript; os campos de contato são
  // os únicos que mudam em tempo de execução.
  const s = site as unknown as {
    telefone: string;
    telefoneLink: string;
    whatsapp: string;
    endereco: Record<string, string>;
    redes: Record<string, string>;
  };
  s.telefone = c.contato.telefone;
  s.telefoneLink = telefoneParaLink(c.contato.telefone);
  s.whatsapp = c.contato.whatsapp.replace(/\D/g, "");
  Object.assign(s.endereco, { rua: c.contato.rua, bairro: c.contato.bairro, cidade: c.contato.cidade, uf: c.contato.uf, cep: c.contato.cep });
  Object.assign(s.redes, { instagram: c.contato.instagram, facebook: c.contato.facebook });
  atualizarEnderecoLinha();
}
