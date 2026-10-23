"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/sistema/ui/button";
import { cn } from "@/lib/utils";

/** Alterna entre claro e escuro. Os ícones trocam por CSS, sem esperar a hidratação. */
export function BotaoTema({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("rounded-full", className)}
      onClick={() => {
        const novo = resolvedTheme === "dark" ? "light" : "dark";
        setTheme(novo);

      }}
      aria-label="Alternar tema claro e escuro"
    >
      <Sun className="size-[18px] scale-100 rotate-0 transition-transform duration-300 dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute size-[18px] scale-0 rotate-90 transition-transform duration-300 dark:scale-100 dark:rotate-0" />
    </Button>
  );
}
