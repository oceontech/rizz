/**
 * Recursos ligados ou desligados no site e no painel.
 *
 * FIDELIDADE: o programa (cartão de selos) ainda não existe. Desligado, nada
 * dele aparece: a página /fidelidade e a rota /api/fidelidade respondem 404,
 * e somem o link do rodapé, o sitemap, a seção da política de privacidade, o
 * item do menu do painel, a área na tabela de acessos e os destinos de link
 * do aviso e das promoções. O código continua no projeto; para lançar, mude
 * para `true` (e revise os textos de lib/site e da privacidade).
 */
export const FIDELIDADE_ATIVA = false;
