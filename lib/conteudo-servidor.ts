import "server-only";

import { unstable_cache } from "next/cache";

import { CONTEUDO_PADRAO, aplicarConteudo, type ConteudoSiteConfig } from "@/lib/conteudo";
import { TAGS } from "@/lib/dados";
import { bancoConfigurado, sql } from "@/lib/db";

/**
 * Horários, datas especiais, rodízio e contato salvos no painel (chaves
 * `horarios`, `datas_especiais`, `rodizio` e `contato` da tabela `configuracoes`). O que não foi salvo
 * ainda fica com o valor do código.
 */
export const conteudoDoSite = unstable_cache(
  async (): Promise<ConteudoSiteConfig> => {
    if (!bancoConfigurado) return CONTEUDO_PADRAO;
    try {
      // Leitura direta: `lerConfig` mescla como objeto e desmontaria a lista dos 7 dias.
      const linhas = await sql`select chave, valor from configuracoes where chave in ('horarios', 'datas_especiais', 'rodizio', 'contato')`;
      const valor = (chave: string) => linhas.find((l) => l.chave === chave)?.valor as unknown;
      const horarios = valor("horarios");
      const datas = valor("datas_especiais");
      const rodizio = valor("rodizio") as Partial<ConteudoSiteConfig["rodizio"]> | undefined;
      const contato = valor("contato") as Partial<ConteudoSiteConfig["contato"]> | undefined;
      return {
        horarios: Array.isArray(horarios) && horarios.length === 7 ? (horarios as ConteudoSiteConfig["horarios"]) : CONTEUDO_PADRAO.horarios,
        datasEspeciais: Array.isArray(datas) ? (datas as ConteudoSiteConfig["datasEspeciais"]) : [],
        rodizio: { ...CONTEUDO_PADRAO.rodizio, ...rodizio },
        contato: { ...CONTEUDO_PADRAO.contato, ...contato },
      };
    } catch (erro) {
      console.error("[conteudo] usando os valores do código:", erro);
      return CONTEUDO_PADRAO;
    }
  },
  ["conteudo-site"],
  { tags: [TAGS.config], revalidate: 3600 },
);

/**
 * Aplica a configuração nos objetos do site e a devolve (para repassar ao
 * navegador por `<ConteudoSite>`). Chamar no começo de layouts, páginas,
 * rotas e ações que usam horários, rodízio ou contato.
 */
export async function carregarConteudo() {
  const c = await conteudoDoSite();
  aplicarConteudo(c);
  return c;
}
