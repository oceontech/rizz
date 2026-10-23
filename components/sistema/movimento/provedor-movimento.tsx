"use client";

import { MotionConfig } from "motion/react";
import type { ReactNode } from "react";

/**
 * Com prefers-reduced-motion, o Motion tira deslocamentos e escalas e mantém
 * só os fades. Decidido no navegador, sem diferença na hidratação.
 */
export function ProvedorMovimento({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
