"use client";

import type { ReactNode } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/sistema/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/sistema/ui/popover";
import { useDesktop } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";

type Props = {
  aberto: boolean;
  aoMudar: (aberto: boolean) => void;
  gatilho: ReactNode;
  titulo: string;
  children: ReactNode;
  alinhar?: "start" | "center" | "end";
  className?: string;
};

/** Popover no desktop e bottom sheet (Vaul) no celular, com o mesmo conteúdo. */
export function PainelAdaptavel({ aberto, aoMudar, gatilho, titulo, children, alinhar = "start", className }: Props) {
  const desktop = useDesktop();

  if (desktop) {
    return (
      <Popover open={aberto} onOpenChange={aoMudar}>
        <PopoverTrigger asChild>{gatilho}</PopoverTrigger>
        <PopoverContent align={alinhar} collisionPadding={16} className={cn("w-auto max-w-[calc(100vw-2rem)] p-2", className)}>
          {children}
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Drawer open={aberto} onOpenChange={aoMudar}>
      <DrawerTrigger asChild>{gatilho}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="pb-2 text-left">
          <DrawerTitle className="text-lg font-semibold">{titulo}</DrawerTitle>
          <DrawerDescription className="sr-only">{titulo}</DrawerDescription>
        </DrawerHeader>
        <div className={cn("overflow-y-auto px-4 pb-6", className)}>{children}</div>
      </DrawerContent>
    </Drawer>
  );
}
