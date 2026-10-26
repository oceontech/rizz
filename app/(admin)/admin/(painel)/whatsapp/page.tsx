import type { Metadata } from "next";

import PainelWhatsapp from "@/components/admin/whatsapp/PainelWhatsapp";
import { estadoWhatsapp } from "@/lib/admin/whatsapp-actions";
import { exigirSessao } from "@/lib/auth";
import { lerConfigWhatsapp, ultimaRodadaLembretes, ultimosEnvios } from "@/lib/whatsapp/avisos";

export const metadata: Metadata = { title: "WhatsApp" };

/** Hora da renderização: a tela calcula o "há X min" a partir dela. */
const agoraMs = () => Date.now();

export default async function WhatsappPage() {
  await exigirSessao();
  const [config, envios, rodada, estado] = await Promise.all([
    lerConfigWhatsapp(),
    // Sem a tabela (db:setup ainda não rodou), a tela abre sem o histórico.
    ultimosEnvios().catch(() => []),
    ultimaRodadaLembretes(),
    estadoWhatsapp(),
  ]);
  return (
    <PainelWhatsapp
      config={config}
      envios={envios}
      rodada={rodada}
      estadoInicial={estado.ok ? estado.dados! : { configurada: false, instancia: "", info: null, erro: null }}
      agora={agoraMs()}
    />
  );
}
