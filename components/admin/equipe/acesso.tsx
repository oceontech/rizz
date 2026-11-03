"use client";

import { Check, Eye, Minus, PenLine } from "lucide-react";

import { AREAS, NIVEIS, PAPEIS, permissoesDe, type Nivel, type Papel, type Permissoes } from "@/lib/permissoes";
import { cn } from "@/lib/utils";

const ICONE_NIVEL = { nenhum: Minus, ver: Eye, editar: PenLine } as const;
const COR_NIVEL = {
  nenhum: "text-muted-foreground",
  ver: "text-info-texto",
  editar: "text-positivo-texto",
} as const;

export function RotuloNivel({ nivel, className }: { nivel: Nivel; className?: string }) {
  const Icone = ICONE_NIVEL[nivel];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[13px] font-medium whitespace-nowrap", COR_NIVEL[nivel], className)}>
      <Icone className="size-3.5" aria-hidden />
      {NIVEIS.find((n) => n.id === nivel)!.rotulo}
    </span>
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
 * Escolha do acesso: um dos papéis prontos ou a matriz área por área. Mexer
 * na matriz de um papel pronto vira "Personalizado" a partir dele.
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
    <div className="flex flex-col gap-4">
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

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-medium">O que pode fazer em cada área</span>
          {papel !== "personalizado" && papel !== "dono" && <span className="text-xs text-muted-foreground">Mudar aqui vira personalizado</span>}
        </div>
        <ul className="flex flex-col divide-y rounded-2xl border">
          {AREAS.map((a) => (
            <li key={a.id} className="flex flex-col gap-2 px-3.5 py-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="min-w-0">
                <span className="block text-sm font-medium">{a.rotulo}</span>
                <span className="block text-xs text-muted-foreground">{a.descricao}</span>
              </span>
              <span role="radiogroup" aria-label={a.rotulo} className="inline-flex shrink-0 rounded-full bg-muted p-0.5">
                {NIVEIS.map((n) => {
                  const ativo = permissoes[a.id] === n.id;
                  const Icone = ICONE_NIVEL[n.id];
                  return (
                    <button
                      key={n.id}
                      type="button"
                      role="radio"
                      aria-checked={ativo}
                      disabled={papel === "dono"}
                      onClick={() => aoMudar("personalizado", { ...permissoes, [a.id]: n.id })}
                      className={cn(
                        "flex h-8 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed",
                        ativo ? cn("bg-card shadow-suave", COR_NIVEL[n.id]) : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      <Icone className="size-3.5" aria-hidden />
                      {n.rotulo}
                    </button>
                  );
                })}
              </span>
            </li>
          ))}
        </ul>
        {papel === "dono" && <p className="text-xs text-muted-foreground">Administrador tem acesso total a todas as áreas.</p>}
      </div>
    </div>
  );
}
