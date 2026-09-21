"use server";

import { z } from "zod";

import { sql } from "@/lib/db";

import { protegida } from "./comum";

export type StatusReserva = "pendente" | "confirmada" | "concluida" | "cancelada";

const esquema = z.object({
  id: z.number().optional(),
  nome: z.string().trim().min(2, "Informe o nome."),
  telefone: z.string().trim().max(30).nullable(),
  pessoas: z.number().int().min(1).max(200),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Escolha a data."),
  hora: z.string().regex(/^\d{2}:\d{2}$/, "Escolha o horário."),
  obs: z.string().trim().max(500).nullable(),
  status: z.enum(["pendente", "confirmada", "concluida", "cancelada"]),
});

export async function salvarReserva(entrada: z.infer<typeof esquema>) {
  return protegida(async () => {
    const d = esquema.parse(entrada);
    if (d.id) {
      await sql`update reservas set nome = ${d.nome}, telefone = ${d.telefone || null}, pessoas = ${d.pessoas},
                data = ${d.data}, hora = ${d.hora}, obs = ${d.obs || null}, status = ${d.status}
                where id = ${d.id}`;
      return;
    }
    await sql`insert into reservas (nome, telefone, pessoas, data, hora, obs, status, origem)
              values (${d.nome}, ${d.telefone || null}, ${d.pessoas}, ${d.data}, ${d.hora},
                      ${d.obs || null}, ${d.status}, 'painel')`;
  });
}

export async function mudarStatusReserva(id: number, status: StatusReserva) {
  return protegida(async () => {
    z.enum(["pendente", "confirmada", "concluida", "cancelada"]).parse(status);
    await sql`update reservas set status = ${status} where id = ${id}`;
  });
}

export async function excluirReserva(id: number) {
  return protegida(async () => {
    await sql`delete from reservas where id = ${id}`;
  });
}
