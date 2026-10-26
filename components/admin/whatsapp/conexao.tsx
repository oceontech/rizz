"use client";

import { CircleAlert, KeyRound, Loader2, QrCode, Settings2 } from "lucide-react";
import Image from "next/image";
import NextLink from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { BotaoSalvar, CampoOpcoes, CampoTelefone } from "@/components/admin/campos";
import { Janela } from "@/components/admin/ui";
import { conectarWhatsapp, estadoWhatsapp, type EstadoWhatsapp } from "@/lib/admin/whatsapp-actions";
import type { QrCode as Qr } from "@/lib/whatsapp/evolution";
import { cn } from "@/lib/utils";

/** Cada QR vale uns 40 s; depois de alguns minutos sem escanear, para de pedir. */
const RENOVAR_QR_MS = 35_000;
const DESISTIR_MS = 4 * 60_000;

/** O símbolo do WhatsApp (balão com o telefone), em SVG, na cor atual. */
export function LogoWhatsapp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M17.47 14.38c-.3-.15-1.75-.86-2.02-.96-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.25-.46-2.38-1.47-.88-.79-1.47-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.45-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.53-.07-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.09 1.75-.72 2-1.41.25-.69.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35M12.05 21.5h-.01a9.47 9.47 0 0 1-4.83-1.32l-.35-.21-3.59.94.96-3.5-.23-.36a9.46 9.46 0 0 1-1.45-5.04c0-5.23 4.26-9.49 9.5-9.49 2.54 0 4.92.99 6.71 2.79a9.43 9.43 0 0 1 2.78 6.71c0 5.23-4.26 9.48-9.49 9.48m8.08-17.57A11.35 11.35 0 0 0 12.05.58C5.75.58.62 5.7.62 12c0 2.01.53 3.98 1.53 5.71L.53 23.42l5.85-1.53a11.4 11.4 0 0 0 5.66 1.44h.01c6.3 0 11.43-5.12 11.43-11.42 0-3.05-1.19-5.92-3.35-8.08" />
    </svg>
  );
}

export function Passos({ itens }: { itens: React.ReactNode[] }) {
  return (
    <ol className="flex flex-col gap-3">
      {itens.map((item, i) => (
        <li key={i} className="flex items-start gap-3 text-sm">
          <span className="numeros grid size-6 shrink-0 place-items-center rounded-full bg-secao/12 text-xs font-semibold text-secao-texto">
            {i + 1}
          </span>
          <span className="pt-0.5 leading-snug">{item}</span>
        </li>
      ))}
    </ol>
  );
}

/**
 * Conectar o número: QR Code (ou código pelo número), conferindo a conexão a
 * cada 3 s e renovando o QR. Usado na tela do WhatsApp e na janela que abre
 * pelo selo das Reservas (lá, com `autoGerar`, o QR já aparece ao abrir).
 */
export function ConectarWhatsapp({ aoConectar, autoGerar = false }: { aoConectar: () => void; autoGerar?: boolean }) {
  const [modo, setModo] = useState<"qr" | "codigo">("qr");
  const [numero, setNumero] = useState("");
  const [qr, setQr] = useState<Qr | null>(null);
  const [gerando, setGerando] = useState(autoGerar);
  const [expirou, setExpirou] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const inicio = useRef(0);

  const gerar = useCallback(
    async (modoAtual: "qr" | "codigo", numeroAtual: string) => {
      setGerando(true);
      setErro(null);
      setExpirou(false);
      const r = await conectarWhatsapp(modoAtual === "codigo" ? numeroAtual : undefined);
      setGerando(false);
      if (!r.ok) return setErro(r.erro);
      if (!r.dados?.imagem && !r.dados?.codigoPareamento) {
        return setErro("A Evolution não devolveu o código. Tente de novo em alguns segundos.");
      }
      if (!inicio.current) inicio.current = Date.now();
      setQr(r.dados);
    },
    [],
  );

  // Pelo selo das Reservas: quem abriu a janela quer o QR, sem mais um clique.
  const pediuAoAbrir = useRef(false);
  useEffect(() => {
    if (!autoGerar || pediuAoAbrir.current) return;
    pediuAoAbrir.current = true;
    void gerar("qr", "");
  }, [autoGerar, gerar]);

  // Enquanto o código está na tela: confere a conexão a cada 3 s e renova o QR.
  const aberto = Boolean(qr) && !expirou;
  useEffect(() => {
    if (!aberto) return;
    let vivo = true;
    const conferir = setInterval(async () => {
      const r = await estadoWhatsapp();
      if (!vivo) return;
      if (r.ok && r.dados?.info?.estado === "open") {
        toast.success("WhatsApp conectado!");
        aoConectar();
      }
    }, 3000);
    const renovar = setInterval(async () => {
      if (Date.now() - inicio.current > DESISTIR_MS) {
        setExpirou(true);
        inicio.current = 0;
        return;
      }
      if (modo === "qr") {
        const r = await conectarWhatsapp();
        if (vivo && r.ok && r.dados?.imagem) setQr(r.dados);
      }
    }, RENOVAR_QR_MS);
    return () => {
      vivo = false;
      clearInterval(conferir);
      clearInterval(renovar);
    };
  }, [aberto, modo, aoConectar]);

  function trocarModo(m: "qr" | "codigo") {
    setModo(m);
    setQr(null);
    setErro(null);
    inicio.current = 0;
  }

  const numeroOk = numero.replace(/\D/g, "").length >= 12;

  return (
    <div className="flex flex-col gap-5">
      <CampoOpcoes
        label="Como conectar"
        value={modo}
        onChange={trocarModo}
        opcoes={[
          { id: "qr", rotulo: "QR Code" },
          { id: "codigo", rotulo: "Código pelo número" },
        ]}
        descricao={
          modo === "qr"
            ? "Para quem está com o celular do restaurante na mão, ao lado do computador."
            : "Para quem está no próprio celular do restaurante e não tem como escanear a tela."
        }
      />

      {modo === "codigo" && !qr && <CampoTelefone label="Número do WhatsApp do restaurante" value={numero} onChange={setNumero} />}

      {erro && (
        <p role="alert" className="flex items-start gap-2.5 rounded-xl bg-negativo/10 px-3.5 py-3 text-sm text-negativo-texto">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          {erro}
        </p>
      )}

      {qr && !expirou ? (
        <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
          {modo === "qr" && qr.imagem ? (
            <div className="mx-auto rounded-2xl border-4 border-marca bg-white p-3">
              {/* O QR é uma imagem em base64 gerada na hora: não passa pelo otimizador.
                  A Evolution entrega em azul: o filtro deixa preto no branco, e o recorte
                  de 2px tira a linha clara que a imagem traz nas bordas. */}
              <Image
                src={qr.imagem}
                alt="QR Code para conectar o WhatsApp"
                width={232}
                height={232}
                unoptimized
                className="size-58 grayscale contrast-[10] [clip-path:inset(2px)]"
              />
            </div>
          ) : (
            <div className="mx-auto rounded-2xl bg-muted px-6 py-5 text-center">
              <p className="text-xs font-medium text-muted-foreground">Código de conexão</p>
              <p className="mt-1 font-mono text-3xl font-semibold tracking-[0.2em]">
                {qr.codigoPareamento?.replace(/^(.{4})(.{4})$/, "$1-$2") ?? "—"}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-4">
            <Passos
              itens={
                modo === "qr"
                  ? [
                      "Abra o WhatsApp no celular do restaurante.",
                      <>
                        Toque em <b>⋮</b> (Android) ou <b>Configurações</b> (iPhone) e depois em <b>Aparelhos conectados</b>.
                      </>,
                      <>
                        Toque em <b>Conectar um aparelho</b> e aponte a câmera para o código ao lado.
                      </>,
                    ]
                  : [
                      <>
                        No WhatsApp, abra <b>Aparelhos conectados</b> → <b>Conectar um aparelho</b>.
                      </>,
                      <>
                        Toque em <b>Conectar com número de telefone</b>.
                      </>,
                      "Digite o código mostrado aqui.",
                    ]
              }
            />
            <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" /> Esperando o celular… a tela atualiza sozinha.
            </p>
          </div>
        </div>
      ) : gerando && modo === "qr" ? (
        <div className="grid h-58 place-items-center rounded-2xl bg-muted/60">
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" /> Gerando o QR Code…
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {expirou && <p className="text-sm text-muted-foreground">O código expirou. Gere outro quando estiver com o celular em mãos.</p>}
          <BotaoSalvar
            pendente={gerando}
            onClick={() => gerar(modo, numero)}
            disabled={modo === "codigo" && !numeroOk}
            className="self-start"
          >
            {modo === "qr" ? <QrCode /> : <KeyRound />}
            {modo === "qr" ? "Gerar QR Code" : "Gerar código"}
          </BotaoSalvar>
        </div>
      )}
    </div>
  );
}

type Situacao = "carregando" | "conectado" | "desconectado" | "sem-config" | "erro";

function situacaoDe(e: EstadoWhatsapp | null): Situacao {
  if (!e) return "erro";
  if (!e.configurada) return "sem-config";
  if (e.erro) return "erro";
  return e.info?.estado === "open" ? "conectado" : "desconectado";
}

const ROTULO: Record<Situacao, string> = {
  carregando: "WhatsApp…",
  conectado: "WhatsApp conectado",
  desconectado: "WhatsApp desconectado",
  "sem-config": "WhatsApp não configurado",
  erro: "WhatsApp sem resposta",
};

/**
 * Selo com o logo do WhatsApp e a situação da conexão, para as Reservas.
 * Desconectado, abre uma janela já com o QR Code; conectado, leva aos ajustes.
 */
export function SeloWhatsapp() {
  const [estado, setEstado] = useState<EstadoWhatsapp | null>(null);
  const [situacao, setSituacao] = useState<Situacao>("carregando");
  const [aberta, setAberta] = useState(false);
  const [sessao, setSessao] = useState(0);

  const consultar = useCallback(
    () =>
      estadoWhatsapp().then((r) => {
        const e = r.ok ? (r.dados ?? null) : null;
        setEstado(e);
        setSituacao(situacaoDe(e));
      }),
    [],
  );

  // A Evolution pode demorar: a página abre na hora e o selo se atualiza depois.
  useEffect(() => {
    let vivo = true;
    estadoWhatsapp().then((r) => {
      if (!vivo) return;
      const e = r.ok ? (r.dados ?? null) : null;
      setEstado(e);
      setSituacao(situacaoDe(e));
    });
    return () => {
      vivo = false;
    };
  }, []);

  const aoConectar = useCallback(() => {
    setAberta(false);
    void consultar();
  }, [consultar]);

  const conectado = situacao === "conectado";
  const classe =
    "inline-flex h-10 items-center gap-2 rounded-full bg-card pr-4 pl-2 text-sm font-medium shadow-suave transition-colors outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/40";
  const conteudo = (
    <>
      <span
        className={cn(
          "relative grid size-7 place-items-center rounded-full text-white",
          situacao === "carregando" ? "bg-muted-foreground/40" : conectado ? "bg-[#25d366]" : "bg-muted-foreground/60",
        )}
      >
        <LogoWhatsapp className="size-4" />
        {situacao !== "carregando" && (
          <span
            className={cn(
              "absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full ring-2 ring-card",
              conectado ? "bg-positivo" : situacao === "desconectado" ? "bg-negativo" : "bg-atencao",
            )}
            aria-hidden
          />
        )}
      </span>
      <span className={cn(!conectado && situacao !== "carregando" && "text-negativo-texto")}>{ROTULO[situacao]}</span>
    </>
  );

  if (situacao !== "desconectado") {
    return (
      <NextLink
        href="/admin/whatsapp"
        className={classe}
        title={conectado && estado?.info?.nomePerfil ? `Conectado como ${estado.info.nomePerfil}` : "Ajustes do WhatsApp"}
      >
        {conteudo}
      </NextLink>
    );
  }

  return (
    <>
      <button
        type="button"
        className={classe}
        onClick={() => {
          setSessao((n) => n + 1);
          setAberta(true);
        }}
      >
        {conteudo}
      </button>
      <Janela
        aberta={aberta}
        aoFechar={() => setAberta(false)}
        titulo="Conectar o WhatsApp do restaurante"
        descricao="As confirmações e lembretes de reserva saem por este número."
        largura="sm:max-w-2xl"
        rodape={
          <NextLink
            href="/admin/whatsapp"
            className="flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Settings2 className="size-4" /> Mensagens e ajustes do WhatsApp
          </NextLink>
        }
      >
        <div data-secao="whatsapp">{aberta && <ConectarWhatsapp key={sessao} aoConectar={aoConectar} autoGerar />}</div>
      </Janela>
    </>
  );
}
