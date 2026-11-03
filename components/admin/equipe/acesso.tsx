"use client";

import { Check } from "lucide-react";

import { Seletor } from "@/components/sistema/pickers/seletor";
import { AREAS, NIVEIS, PAPEIS, permissoesDe, type Nivel, type Papel, type Permissoes } from "@/lib/permissoes";
import { cn } from "@/lib/utils";

const DEGRAUS: Record<Nivel, number> = { nenhum: 0, ver: 1, editar: 2 };

/**
 * Medidor de dois tracinhos (vazio, meio, cheio), sem cor nem ícone de ação:
 * é uma informação, não um botão. As cores e o lápis do "Editar" faziam o
 * rótulo parecer clicável.
 */
function Medidor({ nivel }: { nivel: Nivel }) {
  return (
    <span className="flex shrink-0 items-center gap-0.5" aria-hidden>
      {[1, 2].map((d) => (
        <span key={d} className={cn("h-3 w-1.5 rounded-[2px]", DEGRAUS[nivel] >= d ? "bg-foreground/75" : "bg-foreground/12")} />
      ))}
    </span>
  );
}

/** Nível só para ler (tabela de referência, "Seu acesso"). */
export function RotuloNivel({ nivel, className }: { nivel: Nivel; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[13px] whitespace-nowrap", nivel === "nenhum" ? "text-muted-foreground" : "text-foreground", className)}>
      <Medidor nivel={nivel} />
      {NIVEIS.find((n) => n.id === nivel)!.rotulo}
    </span>
  );
}

/** Legenda dos três níveis, uma vez por tela. */
export function LegendaNiveis({ className }: { className?: string }) {
  return (
    <dl className={cn("grid gap-x-5 gap-y-2 rounded-2xl bg-muted/50 px-3.5 py-3 sm:grid-cols-3", className)}>
      {NIVEIS.map((n) => (
        <div key={n.id} className="flex flex-col gap-0.5">
          <dt>
            <RotuloNivel nivel={n.id} className="font-medium text-foreground" />
          </dt>
          <dd className="text-xs leading-snug text-muted-foreground">{n.descricao}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Lista das áreas com o nível de cada uma, só para ler. */
export function MatrizLeitura({ permissoes }: { permissoes: Permissoes }) {
  return (
    <ul className="flex flex-col divide-y rounded-2xl border">
      {AREAS.map((a) => (
        <li key={a.id} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
          <span className={cn("text-sm", permissoes[a.id] === "nenhum" && "text-muted-foreground")}>{a.rotulo}</span>
          <RotuloNivel nivel={permissoes[a.id]} />
        </li>
      ))}
    </ul>
  );
}

/**
 * Escolha do acesso: um dos papéis prontos ou área por área. Cada área tem um
 * seletor (parece um campo, não um botão); mudar uma área de um papel pronto
 * vira "Personalizado" a partir dele.
 */
export function EditorAcesso({
  papel,
  permissoes,
  aoMudar,
  podeDarAdmin,
}: {
  papel: Papel;
  permissoes: Permissoes;
  aoMudar: (papel: Papel, permissoes: Permissoes) => void;
  podeDarAdmin: boolean;
}) {
  return (
    <div className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="mb-2 text-sm font-medium">Tipo de acesso</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {PAPEIS.map((p) => {
            const escolhido = p.id === papel;
            const bloqueado = p.id === "dono" && !podeDarAdmin;
            return (
              <label
                key={p.id}
                className={cn(
                  "relative flex cursor-pointer flex-col gap-1 rounded-2xl border p-3.5 transition-colors has-focus-visible:ring-3 has-focus-visible:ring-ring/30",
                  escolhido ? "border-foreground bg-muted/50" : "hover:bg-muted/40",
                  bloqueado && "cursor-not-allowed opacity-50",
                )}
              >
                <input
                  type="radio"
                  name="papel"
                  value={p.id}
                  checked={escolhido}
                  disabled={bloqueado}
                  onChange={() => aoMudar(p.id, p.id === "personalizado" ? permissoes : permissoesDe(p.id))}
                  className="sr-only"
                />
                <span className="flex items-center justify-between gap-2 text-sm font-semibold">
                  {p.rotulo}
                  <span
                    className={cn(
                      "grid size-5 place-items-center rounded-full border transition-colors",
                      escolhido ? "border-foreground bg-foreground text-background" : "bg-background",
                    )}
                    aria-hidden
                  >
                    {escolhido && <Check className="size-3" strokeWidth={3} />}
                  </span>
                </span>
                <span className="text-[13px] leading-snug text-muted-foreground">
                  {bloqueado ? "Só um administrador pode dar este acesso." : p.descricao}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-2.5">
        <div>
          <p className="text-sm font-medium">O que a pessoa consegue fazer em cada área</p>
          <p className="text-[13px] text-muted-foreground">
            {papel === "dono"
              ? "Administrador consulta e altera todas as áreas."
              : papel === "personalizado"
                ? "Escolha o nível de cada área."
                : "Já vem do tipo escolhido. Se mudar alguma área, o tipo passa a ser Personalizado."}
          </p>
        </div>
        <LegendaNiveis />
        <ul className="flex flex-col divide-y rounded-2xl border">
          {AREAS.map((a) => (
            <li key={a.id} className="flex flex-col gap-2 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <span className="min-w-0">
                <span className="block text-sm font-medium">{a.rotulo}</span>
                <span className="block text-xs text-muted-foreground">{a.descricao}</span>
              </span>
              {papel === "dono" ? (
                <RotuloNivel nivel="editar" className="sm:w-48" />
              ) : (
                <Seletor
                  aria-label={`Nível de acesso em ${a.rotulo}`}
                  valor={permissoes[a.id]}
                  aoMudar={(v) => aoMudar("personalizado", { ...permissoes, [a.id]: v as Nivel })}
                  opcoes={NIVEIS.map((n) => ({ valor: n.id, rotulo: n.rotulo }))}
                  className="shrink-0 sm:w-48"
                />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
