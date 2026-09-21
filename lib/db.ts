import "server-only";

import { neon } from "@neondatabase/serverless";

/**
 * Cliente do Postgres (Neon, provisionado pela Vercel Marketplace).
 *
 * O driver HTTP não mantém conexão aberta: cada consulta é uma requisição,
 * o que casa com funções serverless — nada de pool esgotado em pico.
 */
const url = process.env.DATABASE_URL;

export const sql = neon(url ?? "postgres://indisponivel");

/** Sem DATABASE_URL o site cai nos dados estáticos em vez de quebrar. */
export const bancoConfigurado = Boolean(url);
