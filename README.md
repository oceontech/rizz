# Rizz Cucina & Vino

Site e painel do restaurante Rizz Cucina & Vino (Espírito Santo do Pinhal/SP), feito pela Oceon.

- Produção: https://rizz-pinhal.vercel.app
- Stack: Next.js 16, React 19, Tailwind v4, Postgres (Neon) e Vercel Blob.

```bash
npm install
vercel env pull .env.local --yes   # variáveis do projeto (ver .env.example)
npm run dev                        # http://localhost:3000
```

Atenção: o banco é um só para todos os ambientes, então o site local usa os dados reais.

Documentação:

- [`AGENTS.md`](AGENTS.md) — stack, comandos, ambientes, estrutura e contas.
- [`docs/ESTADO.md`](docs/ESTADO.md) — o que está pronto e o que falta.
- [`docs/reservas.md`](docs/reservas.md) — sistema de reservas online.
- [`docs/COPY-RIZZ.md`](docs/COPY-RIZZ.md) — textos do site.
- [`ENTREGA.md`](ENTREGA.md) e [`PLANO.md`](PLANO.md) — histórico da v2 (design e animações).
