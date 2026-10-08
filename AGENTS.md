<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Contas e CLIs

- Este projeto usa os tokens de `.claude/settings.local.json`, que valem só para esta pasta (GitHub: `oceontech`; Vercel: time `oceon`).
- Nunca rodar `gh auth login`, `supabase login` ou `vercel login`, nem alterar configurações globais (git, gh, supabase, vercel).
- Todo comando da Vercel usa `--token $VERCEL_TOKEN` e o escopo da conta deste projeto: `--scope team_jsF9ervoTl8eJv5RwbwjQAlC` (time `oceon`). No PowerShell, use `$env:VERCEL_TOKEN`.
- Nunca exibir, registrar ou commitar tokens.
