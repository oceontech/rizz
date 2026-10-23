"use client";

import type { ComponentProps } from "react";
import { ptBR } from "react-day-picker/locale";
import { Calendar } from "@/components/sistema/ui/calendar";

/** Calendar do shadcn já em pt-BR. */
export function Calendario(props: ComponentProps<typeof Calendar>) {
  return <Calendar locale={ptBR} {...props} />;
}
