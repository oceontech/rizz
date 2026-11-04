import type { MetadataRoute } from "next";

import { site } from "@/lib/site";
import { FIDELIDADE_ATIVA } from "@/lib/recursos";

export default function sitemap(): MetadataRoute.Sitemap {
  const agora = new Date();

  const rotas: { caminho: string; prioridade: number; frequencia: "weekly" | "monthly" }[] =
    [
      { caminho: "", prioridade: 1, frequencia: "weekly" },
      { caminho: "/cardapio", prioridade: 0.9, frequencia: "weekly" },
      { caminho: "/avaliacoes", prioridade: 0.7, frequencia: "weekly" },
      { caminho: "/reservas", prioridade: 0.8, frequencia: "monthly" },
      { caminho: "/carta-de-vinhos", prioridade: 0.5, frequencia: "monthly" },
      ...(FIDELIDADE_ATIVA ? [{ caminho: "/fidelidade", prioridade: 0.5, frequencia: "monthly" as const }] : []),
    ];

  return rotas.map((r) => ({
    url: `${site.url}${r.caminho}`,
    lastModified: agora,
    changeFrequency: r.frequencia,
    priority: r.prioridade,
  }));
}
