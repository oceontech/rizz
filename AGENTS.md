<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Rizz Cucina & Vino — site e painel

Site do restaurante Rizz Cucina & Vino (Espírito Santo do Pinhal/SP), cliente da Oceon. Tem duas partes:

- **Site público:** home com cenas de scroll, cardápio, carta de vinhos, avaliações, fidelidade, **reservas online** e privacidade.
- **Painel `/admin`:** cardápio, menu executivo, reservas, promoções/pop-up, fidelidade e configurações.

O estado atual e o que falta fazer estão em [`docs/ESTADO.md`](docs/ESTADO.md). **Leia esse arquivo antes de começar.**

## Stack

- Next.js 16.3 (App Router, `proxy.ts` no lugar de `middleware.ts`), React 19.2, TypeScript, Tailwind v4.
- Site: GSAP + Lenis (regras de animação em `ENTREGA.md`, seção "Cenas de scroll").
- Painel: HeroUI v3 e ícones `@gravity-ui/icons`.
- Banco: Postgres no **Neon**, via `@neondatabase/serverless` (driver HTTP, uma requisição por consulta), com SQL escrito à mão em `` sql`...` ``. Não há ORM.
- Arquivos: **Vercel Blob** (fotos de pratos e promoções).
- Login do painel: JWT próprio (`jose`) num cookie `rizz_sessao` e senhas com `bcryptjs`. Não usa Neon Auth, apesar das variáveis `NEON_AUTH_*` existirem.
- Validação: `zod` v4.
- Gerenciador de pacotes: **npm** (`package-lock.json`).

## Comandos

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # eslint
npx tsc --noEmit   # typecheck (não há script próprio)
npm run build      # build de produção
npm run db:setup   # aplica scripts/schema.sql e o seed — ATENÇÃO: banco de produção (ver abaixo)
```

Não há testes automatizados. Antes de dizer que terminou, rode lint, typecheck e build.

## Ambientes

| Ambiente | Onde |
|---|---|
| Produção | https://rizz-pinhal.vercel.app (projeto `oceonteam/rizz` na Vercel). **O domínio `rizzrestaurante.com.br` não está ligado ao projeto**, apesar de estar em `lib/site.ts` |
| Preview | Deploys automáticos de cada branch na Vercel |
| Local | `npm run dev`, com o `.env.local` (baixado por `vercel env pull`) |

- **Push ou merge na `main` publica em produção** (Vercel ligada ao Git). Trate como ida para produção e confirme antes.
- **Só existe um banco.** A `DATABASE_URL` é a mesma em Production, Preview e Development, então rodar o site local, um preview ou o `db:setup` mexe nos **dados reais**. Teste com registros marcados (ex.: nome `TESTE ...`) e apague no fim.
- Mudanças de banco: acrescente ao `scripts/schema.sql` comandos idempotentes (`if not exists`, `add column if not exists`) e rode `npm run db:setup` **antes** de publicar o código que depende delas. O script também faz o seed (cardápio, executivo, configurações padrão) só onde a tabela está vazia, e cria o administrador só se não houver nenhum. No Claude Code, o modo automático bloqueia esse comando; peça ao usuário para rodar `! npm run db:setup`.
- Branch principal: `main`. Trabalho novo em `feat/...`, `fix/...`, `chore/...`. A branch local `backup/antes-rollback-site` é mantida de propósito.

## Variáveis de ambiente

Os nomes estão em `.env.example`; os valores ficam no `.env.local` e na Vercel. Nunca exiba os valores.

| Variável | Para quê | Situação |
|---|---|---|
| `DATABASE_URL` (+ `PG*`, `POSTGRES_*`, `NEON_*`) | Neon, provisionado pela Vercel Marketplace | ok |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob | ok |
| `AUTH_SECRET` | assina o cookie do painel | ok |
| `GOOGLE_PLACES_API_KEY`, `GOOGLE_PLACE_ID` | avaliações do Google | **não configuradas**: o site usa o retrato fixo em `data/reviews.ts` |
| `RESEND_API_KEY` | envio de e-mails (Resend) | **em configuração** (ver `docs/ESTADO.md`) |

## Estrutura

```
app/(site)/          páginas públicas (reservas/[codigo] = link pessoal da reserva)
app/(admin)/admin/   login e painel ((painel)/ = páginas que exigem sessão)
app/api/             reservas, fidelidade, promoções (rotas públicas)
components/          site (home, menu, reservas, ...) e admin/ (painel)
lib/
  site.ts            nome, endereço, telefone, URL e links do restaurante
  hours.ts           horários de funcionamento (base dos turnos de reserva)
  db.ts              cliente do Neon (`sql`, `bancoConfigurado`)
  dados.ts           leituras do site com cache (`unstable_cache` + tags) e fallback estático
  auth.ts            sessão do painel; `exigirSessao()` é a checagem que vale
  admin/             Server Actions do painel (`*-actions.ts`, sempre via `protegida()`)
  reservas/          regras de lotação (`regras.ts`, puras) e consultas (`servidor.ts`)
data/                cardápio, executivo e avaliações estáticos (fallback e seed)
scripts/             schema.sql e db-setup.ts
proxy.ts             redireciona /admin para o login sem sessão (checagem otimista)
docs/                ESTADO.md (estado e pendências), reservas.md, COPY-RIZZ.md (textos do site)
ENTREGA.md, PLANO.md histórico da v2 do site (decisões de design e animação); não é o estado atual
```

Convenções do código: nomes em português (`salvarReserva`, `lerConfig`), comentários curtos explicando o porquê, Server Actions do painel sempre embrulhadas em `protegida()` (que checa a sessão e revalida o cache), e configurações em JSON na tabela `configuracoes` (chaves `aviso`, `fidelidade`, `reservas`), lidas com `lerConfig(chave, PADRAO)`.

## Contas e CLIs

- Este projeto usa os tokens de `.claude/settings.local.json`, que valem só para esta pasta (GitHub: `oceontech`, repositório `oceontech/rizz`; Vercel: time `oceon`).
- Nunca rodar `gh auth login`, `supabase login` ou `vercel login`, nem alterar configurações globais (git, gh, supabase, vercel).
- Todo comando da Vercel usa `--token $VERCEL_TOKEN` e o escopo da conta deste projeto: `--scope team_jsF9ervoTl8eJv5RwbwjQAlC` (time `oceon`). No PowerShell, use `$env:VERCEL_TOKEN`.
- Resend: conta da Oceon, domínio de envio `mail.oceontech.com.br` (DNS do `oceontech.com.br` na Hostinger). A chave vai só no `.env.local` e na Vercel, colocada pelo usuário.
- Nunca exibir, registrar ou commitar tokens.
