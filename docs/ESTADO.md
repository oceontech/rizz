# Estado do projeto e pendências

Atualizado em 19/10/2026. Ao resolver um item, apague-o daqui (ou mova para "Feito recentemente").

## Feito recentemente

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

- A tabela `admin_usuarios` só ganha registro pelo `npm run db:setup`, e só quando está vazia. Esse primeiro acesso já existe: o e-mail padrão do script é `admin@rizzrestaurante.com.br`, e a senha apareceu uma única vez no terminal de quem rodou.
- Em Configurações, o usuário logado troca o próprio nome, e-mail e senha (`lib/admin/sessao-actions.ts`). **Não existe tela para criar outro usuário nem para recuperar a senha.**
- O usuário (Oceon) ainda não conseguiu um acesso com o próprio e-mail. Duas saídas:
  - quem tiver a senha do primeiro acesso entra e troca o e-mail para o seu em Configurações;
  - ou esperar o convite por e-mail (seção acima).

## Pendências

### Domínio
- `rizzrestaurante.com.br` **não está ligado ao projeto na Vercel e não responde**. Mesmo assim, o site usa esse endereço (`site.url` em `lib/site.ts`) em links absolutos: o link de detalhes no arquivo `.ics` e os metadados de SEO (canonical, `app/sitemap.ts`, `app/robots.ts`, `app/(site)/layout.tsx`). Até ligar o domínio, esses links não abrem. A mensagem de confirmação que a equipe manda por WhatsApp pelo painel usa o endereço em que o painel está aberto (`window.location.origin`), então funciona. Falta confirmar com o cliente quem controla o domínio, adicioná-lo na Vercel e configurar o DNS.

### Reservas (ver detalhes em `reservas.md`)
- **Corrida no último lugar:** o servidor grava e só depois confere a lotação. Se duas pessoas reservarem o último lugar no mesmo instante, as duas podem ser desfeitas, mas nunca passam da lotação. A correção é uma trava (`pg_advisory_xact_lock` por data+turno, dentro de `sql.transaction`).
- **A equipe não é avisada** de reserva nova; precisa abrir o painel. Com a confirmação manual ligada, uma pendente pode passar despercebida. A solução depende do Resend.
- **Sem limite de pedidos por pessoa** na API pública; a única proteção contra robôs é o campo invisível. Daria para lotar um turno com reservas falsas.
- **O cliente só recebe o link na tela** depois de reservar; se perder, a equipe reenvia pelo painel (ação "Enviar confirmação" no WhatsApp).
- A recusa do robô devolve a mensagem crua do zod (em inglês). É inofensivo, só aparece para robôs.

### Conteúdo e dados (herdado da v2, ver `ENTREGA.md`)
- Chaves do Google Places (`GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID`) não configuradas.
- Confirmar com a casa o preço do menu executivo (R$ 75,90 × 72,90), o preço do Brownie e se segunda-feira é mesmo fechada (`lib/hours.ts`; as reservas seguem esses horários).
- Carta de vinhos sem PDF/link (`cartaVinhosUrl` em `lib/site.ts`).

### Repositório
- `cardápios/` (PDFs do cardápio impresso de 2026, material de referência) fica fora do git, no `.gitignore`.
- A branch `feat/reservas` já foi mesclada na `main`; pode ser apagada (local e no GitHub) quando o usuário quiser.
