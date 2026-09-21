"use client";

import { Toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import { I18nProvider, RouterProvider } from "react-aria-components";

/**
 * pt-BR para datas, horas e números de todos os pickers do HeroUI, e o
 * roteador do Next para os links internos dos componentes React Aria.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <I18nProvider locale="pt-BR">
      <RouterProvider navigate={router.push}>
        {children}
        <Toast.Provider placement="bottom end" />
      </RouterProvider>
    </I18nProvider>
  );
}
