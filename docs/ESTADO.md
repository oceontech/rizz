# Estado do projeto e pendências

Atualizado em 02/11/2026. Ao resolver um item, apague-o daqui (ou mova para "Feito recentemente").

## Feito recentemente

- **Entradas da home** (`components/motion/CenasHome.tsx`, montado no fim de `app/(site)/page.tsx`): as seções marcam elementos com `data-anima` e um componente só coordena as entradas, com coreografia própria para desktop e celular. `letreiro` (a cursiva se escreve da esquerda para a direita; no desktop a serifada sobe letra a letra saindo de um desfoque, no celular entra inteira), `midia` (no desktop a foto abre de baixo como cortina com o zoom assentando; no celular abre do centro para as bordas), `cascata` (filhos em sequência; carrosséis do celular entram da direita), `data-anima-contar` (a nota das avaliações conta até o valor) e `data-anima-magnetico` (botões que seguem o cursor, só com mouse). Tudo roda uma vez, não esconde o que já está à vista e não anima com movimento reduzido. As cenas presas (hero, galeria da casa, camarão, mosaico, galeria) seguem com a animação própria.
- **Home em notebooks** (telas largas e baixas, como 1366×657 e 1280×600): em `app/globals.css`, a unidade base (`rem`) segue a altura da janela a partir de 1024px de largura e abaixo de 896px de altura (16px a partir de 800px de altura, mínimo de 13px). Os vídeos e fotos em pé da home (prato mais pedido, rodízio, arcos de "Nossa cozinha" e mural) têm um teto de largura calculado pela altura da tela. Em 1920×969 nada muda. Medido no preview em 1366×657, 1280×600 e 1920×969: nenhuma mídia passa da altura da tela.
- **Versão B virou a home** (02/11/2026): `app/(site)/page.tsx` é a antiga `/b` (que agora redireciona para `/`, em `next.config.ts`), e os componentes só da home antiga foram apagados (`components/home/` guarda apenas os que a home atual usa). As avaliações da home perderam os textos de exemplo: mostram a nota real do Google e o link, e os cartões só aparecem com textos reais (API do Google ou `data/reviews.ts` com `fonte: "manual"`).
- **Carta de vinhos no celular**: o menu do header só aparece a partir de 768px e a barra inferior não tinha a carta. Entrou a aba **Vinhos** na barra inferior (`components/layout/BottomNav.tsx`) e o botão "Ver a carta de vinhos" na seção do vinho da home.
- **Domínio `rizzcucinaevino.com.br`** adicionado ao projeto na Vercel (02/11/2026), com o `www` redirecionando (308) para o domínio sem `www`. `site.url` aponta para ele. O DNS fica na Hostinger de quem registrou o domínio (Registro.br, nameservers `dns-parking.com`); ver "Domínio" em Pendências.

- **Organização do painel** (branch `feat/painel-organizacao`): Menu executivo virou aba do Cardápio; Selos e WhatsApp viraram abas de Configurações (sidebar mais curta, mesmos endereços). Nas Reservas, um selo mostra se o WhatsApp está conectado; desconectado, abre a janela já com o QR Code (`components/admin/whatsapp/conexao.tsx`, usado também na tela do WhatsApp). Página inicial: o prato é escolhido num seletor com fotos e, ao trocar, título e texto vêm do prato (antes ficavam os do camarão e parecia que nada mudava).

- **Upgrade do painel: cores, selos e página inicial** (branch `feat/painel-upgrade`).
  - Cores: o vinho ficou só em pontos de marca (logo, avatar). Ação principal em grafite; cada área do painel tem uma cor própria (`data-secao` no Shell, tokens `--secao*` em `admin.css`); switch ligado em verde; situações com cores de significado (verde, âmbar, vermelho, azul).
  - Corrigido: o painel parava de aceitar cliques depois de abrir um editor pelo menu "…" (dois modais do Radix deixavam `pointer-events: none` no body). `MenuAcoes` agora é não modal e roda a ação depois de fechar. Reproduzido e conferido no navegador.
  - **Selos** viraram cadastro (`/admin/selos`, tabela `selos`): nome, legenda, formato, símbolo e cor, desenhados em SVG (`components/ui/SeloSvg.tsx`) com entrada animada (`app/selos.css`). O VPJ e o Duroc viraram selos como os outros; a coluna `itens.vpj` fica por compatibilidade e é lida como o selo `vpj`.
  - **Página inicial** editável (`/admin/home`, configuração `home`): o prato mais pedido (com chamada, título e texto) e a seleção do cardápio. O vídeo de abertura é do camarão: com outro prato, a dobra entra sem ele.
  - Cardápio do painel: índice de categorias, selos desenhados nas linhas, botão de situação (Disponível/Esgotado) e editor com prévia de como o prato aparece no site.
  - **Fidelidade trancada** ("Em breve"): o gestor continua em `components/admin/fidelidade/`; para liberar, ver o comentário em `app/(admin)/admin/(painel)/fidelidade/page.tsx`. A visão geral não mostra mais os blocos dela.
  - Barra "alterações não salvas" no lugar do botão flutuante (WhatsApp e ajustes de reservas).
  - Conferido: lint, typecheck, build e capturas locais logado (sessão só local, sem salvar nada).

- **WhatsApp pela Evolution API** (em produção desde 26/10/2026). Guia em [`whatsapp.md`](whatsapp.md). Evolution na VPS (`https://evo.rizz.genext.group`), variáveis na Vercel, tabela `whatsapp_envios` criada e lembretes pelo cron da VPS a cada 10 min.
  - Falta: conectar o número pelo painel (QR Code), mandar a mensagem de teste e ligar **Enviar mensagens automáticas** (estava desligado).

- **Nova UI do painel e da reserva** (em produção desde 23/10/2026).
  - Painel: saiu o HeroUI; entrou o sistema visual do Ge System (cinza neutro, cards sem borda, sidebar escura flutuante e recolhível, barra inferior em pílula no celular, tema claro/escuro), com o vinho do Rizz no lugar do azul. Componentes base em `components/sistema/`, tokens em `app/(admin)/admin.css`.
  - Reserva online: saiu do layout escuro do site para `app/(reserva)/`, com root layout próprio, branco. Fluxo em etapas (pessoas → dia → horário → dados → revisão), calendário e seletores próprios, resumo ao lado no computador. Com a reserva online pausada, o mesmo fluxo termina no WhatsApp (substitui o antigo formulário com `<select>` e `input date/time` nativos).
  - Conferido: lint, typecheck, build e capturas locais (reserva completa até a revisão, sem enviar; login; telas do painel por uma rota temporária só de leitura, já apagada). **Não testado logado** no painel: salvar, excluir e mudar status pelas telas novas.
  - O pop-up promocional não aparece mais na página de reservas (ela não usa mais o layout do site). A opção "Reservas" em "Onde aparece" continua no painel, sem efeito.
  - O cartão de fidelidade do site (`components/fidelidade/CartaoFidelidade.tsx`) ainda usa `input type="date"` nativo; o site ficou fora desta mudança.

- **Reservas online** (commit `38c48d6`, em produção desde 19/10/2026). Detalhes em [`reservas.md`](reservas.md).
  - Migração aplicada no banco (`npm run db:setup`).
  - Testado ponta a ponta pela API local: reservar, link pessoal, `.ics`, alterar, cancelar e as recusas (duplicada, grupo grande, data fora do limite, robô, link inválido). A reserva de teste foi apagada.
  - **Não testado:** clicando no navegador (site e painel com login).

## Em andamento: e-mail com Resend

Objetivo: o painel mandar e-mails. Primeiro uso: **convite de administrador**. Hoje não há como cadastrar um novo usuário do painel (ver "Acesso ao painel" abaixo).

Passo a passo:

1. [x] Começar o cadastro do domínio no Resend: `mail.oceontech.com.br`, região São Paulo (sa-east-1), Return-Path `send`, rastreamento de cliques e de aberturas **desligados**.
2. [ ] Criar no DNS da **Hostinger** (hPanel → Domínios → `oceontech.com.br` → DNS) os registros TXT/MX que o Resend mostrar, e clicar em **Verify** no Resend. O domínio raiz não tinha MX nem SPF em 19/10/2026, então não há conflito.
3. [ ] Criar a chave da API no Resend (Sending access, restrita ao domínio). O usuário coloca `RESEND_API_KEY` no `.env.local` e na Vercel (Production e Preview). Nunca pedir a chave no chat.
4. [ ] Implementar no código:
   - instalar o SDK `resend` e criar um módulo `lib/email.ts` (`server-only`), com remetente `Rizz <nao-responda@mail.oceontech.com.br>`;
   - **convite de administrador:** em Configurações, um administrador logado informa nome e e-mail. O sistema grava um convite com token de uso único e validade, e manda um link `/admin/convite/[token]` onde a pessoa define a senha;
   - **recuperação de senha** no login, com o mesmo mecanismo de token;
   - depois: **aviso de reserva nova** para a equipe e, se o cliente informar e-mail, a confirmação com o link pessoal.
5. [ ] Ajustar `db:setup`/`schema.sql` com a tabela de convites/tokens (o usuário roda `! npm run db:setup`).

## Acesso ao painel

- A tabela `admin_usuarios` só ganha registro pelo `npm run db:setup`, e só quando está vazia. Esse primeiro acesso já existe: o e-mail desse registro é `admin@rizzrestaurante.com.br` (o padrão do script era esse; hoje é `admin@rizzcucinaevino.com.br`, que só vale para um banco novo), e a senha apareceu uma única vez no terminal de quem rodou.
- Em Configurações, o usuário logado troca o próprio nome, e-mail e senha (`lib/admin/sessao-actions.ts`). **Não existe tela para criar outro usuário nem para recuperar a senha.**
- O usuário (Oceon) ainda não conseguiu um acesso com o próprio e-mail. Duas saídas:
  - quem tiver a senha do primeiro acesso entra e troca o e-mail para o seu em Configurações;
  - ou esperar o convite por e-mail (seção acima).

## Pendências

### Domínio
- `rizzcucinaevino.com.br` já está no projeto da Vercel, mas **o DNS na Hostinger ainda aponta para a página de estacionamento** (A `2.57.91.91` e um AAAA). Trocar por: A `@` → `216.150.1.1` (e apagar o AAAA `@`); CNAME `www` → `5b04ce0cb676dc92.vercel-dns-017.com`. Conferir com `curl -sI https://rizzcucinaevino.com.br` ou na Vercel (Settings → Domains). Até lá, os links absolutos (`.ics`, canonical, sitemap) apontam para um endereço que ainda não abre o site.

### Reservas (ver detalhes em `reservas.md`)
- **Corrida no último lugar:** o servidor grava e só depois confere a lotação. Se duas pessoas reservarem o último lugar no mesmo instante, as duas podem ser desfeitas, mas nunca passam da lotação. A correção é uma trava (`pg_advisory_xact_lock` por data+turno, dentro de `sql.transaction`).
- **A equipe não é avisada** de reserva nova; precisa abrir o painel. Com a confirmação manual ligada, uma pendente pode passar despercebida. Resolve com o "aviso à equipe" do WhatsApp, quando estiver configurado (seção acima).
- **Sem limite de pedidos por pessoa** na API pública; a única proteção contra robôs é o campo invisível. Daria para lotar um turno com reservas falsas.
- **O cliente só recebe o link na tela** depois de reservar; se perder, a equipe reenvia pelo painel (ação "Enviar confirmação" no WhatsApp). Resolve com a confirmação automática do WhatsApp, quando estiver configurada.
- A recusa do robô devolve a mensagem crua do zod (em inglês). É inofensivo, só aparece para robôs.

### Conteúdo e dados (herdado da v2, ver `ENTREGA.md`)
- Chaves do Google Places (`GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID`) não configuradas.
- Confirmar com a casa o preço do menu executivo (R$ 75,90 × 72,90), o preço do Brownie e se segunda-feira é mesmo fechada (`lib/hours.ts`; as reservas seguem esses horários).
- Carta de vinhos (`/carta-de-vinhos`): os 145 rótulos estão em `data/vinhos.ts`, transcritos do cardápio online do restaurante (fechaconta.com.br/cardapio/rizzpinhal) em 27/10/2026. Não há sincronização: mudanças lá precisam ser transcritas de novo. `cartaVinhosUrl` em `lib/site.ts` não é mais usado pela página.
- Rodízio de risotos (`lib/rodizio.ts`): dias e etapas vêm do vídeo do restaurante (abr/2026: quartas e quintas no jantar; arancini, seis risotos à vontade, sobremesa da semana). Falta confirmar o valor; enquanto isso o site manda consultar pelo WhatsApp. O aviso "hoje/amanhã tem rodízio" usa o horário do jantar de `lib/hours.ts`.
- Avaliações da home e de `/avaliacoes` só com a nota: para mostrar textos, configurar `GOOGLE_PLACES_API_KEY` e `GOOGLE_PLACE_ID` (ou preencher `data/reviews.ts` com textos reais).

### Repositório
- `cardápios/` (PDFs do cardápio impresso de 2026, material de referência) fica fora do git, no `.gitignore`.
- A branch `feat/reservas` já foi mesclada na `main`; pode ser apagada (local e no GitHub) quando o usuário quiser.
