"use client";

import { Bell, BellOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/sistema/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/sistema/ui/tooltip";
import { formatarData } from "@/lib/admin/formato";
import { novidadesReservas, type NovaReserva } from "@/lib/admin/reservas-actions";

const CHAVE_SOM = "rizz_som_reservas";
const EVENTO_SOM = "rizz:som-reservas";

/** Intervalo da consulta: rápido com a aba à vista, mais calmo em segundo plano. */
const VISIVEL_MS = 10_000;
const OCULTO_MS = 30_000;

function somLigado() {
  try {
    return localStorage.getItem(CHAVE_SOM) !== "0";
  } catch {
    return true;
  }
}

let audio: AudioContext | null = null;

/**
 * O navegador só libera áudio depois de um toque ou clique na página. O
 * contexto é criado (ou retomado) no primeiro gesto, e daí em diante o aviso
 * toca mesmo com a aba em segundo plano.
 */
function prepararAudio() {
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") void audio.resume();
  } catch {
    audio = null;
  }
}

/** Duas notas suaves (sino), geradas na hora: nada de arquivo de áudio. */
function tocarAviso() {
  if (!audio || audio.state !== "running" || !somLigado()) return;
  const agora = audio.currentTime;
  for (const [i, freq] of [880, 1318.5].entries()) {
    const inicio = agora + i * 0.16;
    const osc = audio.createOscillator();
    const volume = audio.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    volume.gain.setValueAtTime(0.0001, inicio);
    volume.gain.exponentialRampToValueAtTime(0.22, inicio + 0.02);
    volume.gain.exponentialRampToValueAtTime(0.0001, inicio + 0.9);
    osc.connect(volume).connect(audio.destination);
    osc.start(inicio);
    osc.stop(inicio + 0.95);
  }
}

function descrever(r: NovaReserva) {
  const quando = r.data ? formatarData(r.data, { weekday: "short", day: "2-digit", month: "2-digit" }) : "sem data";
  return `${r.nome} · ${r.pessoas} ${r.pessoas === 1 ? "pessoa" : "pessoas"} · ${quando}${r.hora ? ` às ${r.hora}` : ""}`;
}

/**
 * Mantém o painel em dia sem recarregar: pergunta ao servidor se as reservas
 * mudaram (ou se o dia virou) e, se sim, atualiza a tela (`router.refresh`, que traz também o
 * contador de pendentes da barra lateral). Reserva nova do site toca um aviso
 * e mostra quem reservou.
 */
export function AoVivo() {
  const router = useRouter();
  const versao = useRef<string | null>(null);
  const dia = useRef<string | null>(null);
  const ultimo = useRef(0);

  useEffect(() => {
    let vivo = true;
    let timer: number | undefined;

    const agendar = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(consultar, document.visibilityState === "visible" ? VISIVEL_MS : OCULTO_MS);
    };

    async function consultar() {
      try {
        const r = await novidadesReservas(ultimo.current);
        if (!vivo || !r.ok || !r.dados) return;
        const { versao: nova, hoje, ultimo: id, novas } = r.dados;

        const mudou = versao.current !== null && nova !== versao.current;
        // Virada do dia: a página aberta de um dia para o outro continuava no
        // "hoje" antigo (reservas, painel e promoções calculam o dia no servidor).
        const virouDia = dia.current !== null && hoje !== dia.current;
        if (mudou || virouDia) router.refresh();
        versao.current = nova;
        dia.current = hoje;
        ultimo.current = Math.max(ultimo.current, id);

        if (novas.length) {
          tocarAviso();
          for (const reserva of novas) {
            toast(reserva.status === "pendente" ? "Nova reserva para confirmar" : "Nova reserva confirmada", {
              description: descrever(reserva),
              duration: 12_000,
              action: { label: "Ver", onClick: () => router.push("/admin/reservas?aba=lista") },
            });
          }
        }
      } catch {
        // Sem rede: tenta de novo na próxima volta.
      } finally {
        if (vivo) agendar();
      }
    }

    const aoVoltar = () => {
      if (document.visibilityState === "visible") void consultar();
    };

    // Rede de segurança: uma ação do painel que falhou por falta de conexão e
    // não foi tratada na tela vira um aviso, em vez de sumir em silêncio.
    const semRede = (e: PromiseRejectionEvent) => {
      const msg = e.reason instanceof Error ? e.reason.message : String(e.reason ?? "");
      if (/fetch|network|rede|conex/i.test(msg)) {
        toast.error("Sem conexão com o servidor. Confira a internet e tente de novo.", { id: "sem-rede" });
      }
    };
    window.addEventListener("unhandledrejection", semRede);

    void consultar();
    document.addEventListener("visibilitychange", aoVoltar);
    window.addEventListener("pointerdown", prepararAudio, { passive: true });
    window.addEventListener("keydown", prepararAudio);
    return () => {
      vivo = false;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", aoVoltar);
      window.removeEventListener("unhandledrejection", semRede);
      window.removeEventListener("pointerdown", prepararAudio);
      window.removeEventListener("keydown", prepararAudio);
    };
  }, [router]);

  return null;
}

/** Liga e desliga o som do aviso de reserva nova (vale neste navegador). */
export function BotaoSom() {
  const [ligado, setLigado] = useState(true);

  useEffect(() => {
    const ler = () => setLigado(somLigado());
    ler();
    window.addEventListener(EVENTO_SOM, ler);
    return () => window.removeEventListener(EVENTO_SOM, ler);
  }, []);

  function alternar() {
    const novo = !ligado;
    try {
      localStorage.setItem(CHAVE_SOM, novo ? "1" : "0");
    } catch {}
    setLigado(novo);
    window.dispatchEvent(new Event(EVENTO_SOM));
    if (novo) {
      prepararAudio();
      // Amostra do aviso, para a pessoa saber como soa.
      window.setTimeout(tocarAviso, 60);
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full bg-card shadow-suave hover:bg-accent"
          aria-label={ligado ? "Desligar som de reserva nova" : "Ligar som de reserva nova"}
          aria-pressed={ligado}
          onClick={alternar}
        >
          {ligado ? <Bell /> : <BellOff className="text-muted-foreground" />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{ligado ? "Som de reserva nova ligado" : "Som de reserva nova desligado"}</TooltipContent>
    </Tooltip>
  );
}
