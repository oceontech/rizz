"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { TAGS } from "@/lib/dados";
import { sql } from "@/lib/db";

import { ErroAmigavel, protegida } from "./comum";

const hora = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Hora inválida.");
const servico = z.object({ inicio: hora, fim: hora }).optional();
const minutos = (h: string) => Number(h.slice(0, 2)) * 60 + Number(h.slice(3));

const esquemaDia = z.object({
  dia: z.number().int().min(0).max(6),
  nome: z.string(),
  nomeCurto: z.string(),
  fechado: z.boolean().optional(),
  almoco: servico,
  jantar: servico,
});

async function gravar(chave: string, valor: unknown) {
  await sql`insert into configuracoes (chave, valor, atualizado_em) values (${chave}, ${JSON.stringify(valor)}::jsonb, now())
            on conflict (chave) do update set valor = excluded.valor, atualizado_em = now()`;
  // O site inteiro mostra horários e contato (rodapé, home, reservas).
  revalidatePath("/", "layout");
}

const esquemaData = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Escolha a data."),
  motivo: z.string().trim().min(2, "Escreva o motivo (aparece no site).").max(60),
  fechado: z.boolean(),
  almoco: servico,
  jantar: servico,
});

/** Salva a lista inteira de datas especiais (as que já passaram saem). */
export async function salvarDatasEspeciais(entrada: z.infer<typeof esquemaData>[]) {
  return protegida(
    async () => {
      const lista = z.array(esquemaData).max(120).parse(entrada);
      const ontem = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
      const vistas = new Set<string>();
      const limpas = [];
      for (const d of lista.sort((a, b) => a.data.localeCompare(b.data))) {
        if (d.data < ontem) continue;
        if (vistas.has(d.data)) throw new ErroAmigavel(`A data ${d.data.split("-").reverse().join("/")} está repetida.`);
        vistas.add(d.data);
        if (d.fechado) {
          limpas.push({ data: d.data, motivo: d.motivo, fechado: true });
          continue;
        }
        const quando = d.data.split("-").reverse().join("/");
        if (!d.almoco && !d.jantar) throw new ErroAmigavel(`${quando}: marque almoço, jantar ou feche o dia.`);
        for (const [nome, s] of [["almoço", d.almoco], ["jantar", d.jantar]] as const) {
          if (s && minutos(s.inicio) >= minutos(s.fim)) throw new ErroAmigavel(`${quando}: o ${nome} precisa terminar depois de começar.`);
        }
        limpas.push({ data: d.data, motivo: d.motivo, fechado: false, almoco: d.almoco, jantar: d.jantar });
      }
      await gravar("datas_especiais", limpas);
    },
    { tags: [TAGS.config] },
  );
}

const NOMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export async function salvarHorarios(entrada: z.infer<typeof esquemaDia>[]) {
  return protegida(
    async () => {
      const dias = z.array(esquemaDia).length(7).parse(entrada);
      for (const d of dias) {
        if (d.fechado) {
          delete d.almoco;
          delete d.jantar;
          continue;
        }
        if (!d.almoco && !d.jantar) throw new ErroAmigavel(`${NOMES[d.dia]}: marque almoço, jantar ou feche o dia.`);
        for (const [nome, s] of [["almoço", d.almoco], ["jantar", d.jantar]] as const) {
          if (s && minutos(s.inicio) >= minutos(s.fim)) {
            throw new ErroAmigavel(`${NOMES[d.dia]}: o ${nome} precisa terminar depois de começar.`);
          }
        }
        if (d.almoco && d.jantar && minutos(d.almoco.fim) > minutos(d.jantar.inicio)) {
          throw new ErroAmigavel(`${NOMES[d.dia]}: o almoço termina depois de o jantar começar.`);
        }
      }
      await gravar("horarios", dias.sort((a, b) => a.dia - b.dia));
    },
    { tags: [TAGS.config] },
  );
}

const esquemaRodizio = z.object({
  dias: z.array(z.number().int().min(0).max(6)).max(7),
  etapas: z
    .array(z.object({ titulo: z.string().trim().min(2, "Dê um nome a cada etapa.").max(40), texto: z.string().trim().max(200) }))
    .min(1, "O rodízio precisa de ao menos uma etapa.")
    .max(6),
});

export async function salvarRodizio(entrada: z.infer<typeof esquemaRodizio>) {
  return protegida(
    async () => {
      const d = esquemaRodizio.parse(entrada);
      await gravar("rodizio", { dias: [...new Set(d.dias)].sort(), etapas: d.etapas });
    },
    { tags: [TAGS.config] },
  );
}

const url = z
  .string()
  .trim()
  .max(300)
  .refine((v) => v === "" || /^https:\/\//.test(v), "Os links das redes começam com https://");

const esquemaContato = z.object({
  telefone: z.string().trim().refine((v) => /^\d{10,11}$/.test(v.replace(/\D/g, "")), "Telefone com DDD, ex.: (19) 3661-5503."),
  whatsapp: z.string().trim().refine((v) => /^(55)?\d{10,11}$/.test(v.replace(/\D/g, "")), "WhatsApp com DDD."),
  rua: z.string().trim().min(3, "Informe a rua e o número.").max(120),
  bairro: z.string().trim().max(60),
  cidade: z.string().trim().min(2, "Informe a cidade.").max(60),
  uf: z.string().trim().length(2, "UF com 2 letras."),
  cep: z.string().trim().max(10),
  instagram: url,
  facebook: url,
});

export async function salvarContato(entrada: z.infer<typeof esquemaContato>) {
  return protegida(
    async () => {
      const d = esquemaContato.parse(entrada);
      const digitos = d.whatsapp.replace(/\D/g, "");
      await gravar("contato", { ...d, uf: d.uf.toUpperCase(), whatsapp: digitos.startsWith("55") ? digitos : `55${digitos}` });
    },
    { tags: [TAGS.config] },
  );
}
