"use client";

import { useState } from "react";

import { Botao } from "@/components/ui/Botao";

const campo =
  "h-12 w-full border-b border-creme/20 bg-transparent text-[0.9375rem] text-creme placeholder:text-creme/30 focus:border-ambar focus:outline-none";
const rotulo = "mb-2 block text-[0.625rem] uppercase tracking-[0.18em] text-creme/45";

type Resultado = { primeiroNome: string; selos: number; resgates: number };

function mascara(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Consulta de selos e cadastro — no mesmo desenho do formulário de reservas. */
export default function CartaoFidelidade({ meta, recompensa }: { meta: number; recompensa: string }) {
  const [modo, setModo] = useState<"consultar" | "cadastrar">("consultar");
  const [telefone, setTelefone] = useState("");
  const [nome, setNome] = useState("");
  const [aniversario, setAniversario] = useState("");
  const [aceita, setAceita] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado | null>(null);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      const r = await fetch("/api/fidelidade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(
          modo === "consultar"
            ? { acao: "consultar", telefone }
            : { acao: "cadastrar", telefone, nome, aniversario, aceitaContato: aceita, site: "" },
        ),
      });
      const json = await r.json();
      if (!json.ok) {
        setErro(json.erro ?? "Não foi possível consultar agora.");
        if (r.status === 404) setModo("cadastrar");
      } else {
        setResultado(json.cliente);
      }
    } catch {
      setErro("Sem conexão. Tente de novo em instantes.");
    } finally {
      setEnviando(false);
    }
  }

  if (resultado) {
    const cheios = Math.min(resultado.selos, meta);
    const pronto = resultado.selos >= meta;
    return (
      <div className="max-w-xl">
        <p className="eyebrow text-ambar">Olá, {resultado.primeiroNome}</p>
        <p className="mt-4 font-display text-4xl italic text-creme md:text-5xl">
          {cheios} <span className="text-creme/40">de</span> {meta} selos
        </p>

        <div className="mt-8 grid grid-cols-5 gap-3 sm:gap-4" aria-label={`${cheios} de ${meta} selos`}>
          {Array.from({ length: meta }, (_, i) => (
            <span
              key={i}
              className={`grid aspect-square place-items-center rounded-full border font-display text-lg italic ${
                i < cheios ? "border-ambar bg-ambar text-noite" : "border-dashed border-creme/25 text-creme/25"
              }`}
            >
              {i < cheios ? "R" : i + 1}
            </span>
          ))}
        </div>

        <p className="mt-8 leading-relaxed text-creme/70">
          {pronto ? (
            <>
              Seu cartão está completo! Avise a equipe na próxima visita para receber{" "}
              <strong className="font-medium text-ambar">{recompensa.toLowerCase()}</strong>.
            </>
          ) : (
            <>
              Faltam <strong className="font-medium text-creme">{meta - cheios}</strong>{" "}
              {meta - cheios === 1 ? "visita" : "visitas"} para {recompensa.toLowerCase()}.
            </>
          )}
          {resultado.resgates > 0 && ` Você já ganhou ${resultado.resgates} ${resultado.resgates === 1 ? "prêmio" : "prêmios"}.`}
        </p>

        <button
          type="button"
          onClick={() => setResultado(null)}
          className="mt-8 text-[0.6875rem] uppercase tracking-[0.14em] text-creme/50 underline-offset-4 hover:text-ambar hover:underline"
        >
          Consultar outro número
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={enviar} className="max-w-xl">
      <div className="mb-10 flex gap-8 border-b border-creme/10" role="tablist">
        {(["consultar", "cadastrar"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={modo === m}
            onClick={() => {
              setModo(m);
              setErro(null);
            }}
            className={`-mb-px border-b pb-3 text-[0.6875rem] uppercase tracking-[0.18em] transition-colors ${
              modo === m ? "border-ambar text-ambar" : "border-transparent text-creme/45 hover:text-creme"
            }`}
          >
            {m === "consultar" ? "Ver meus selos" : "Quero participar"}
          </button>
        ))}
      </div>

      <div className="grid gap-7 sm:grid-cols-2">
        {modo === "cadastrar" && (
          <div className="sm:col-span-2">
            <label htmlFor="fid-nome" className={rotulo}>
              Nome
            </label>
            <input
              id="fid-nome"
              required
              autoComplete="name"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Seu nome"
              className={campo}
            />
          </div>
        )}

        <div className={modo === "consultar" ? "sm:col-span-2" : ""}>
          <label htmlFor="fid-tel" className={rotulo}>
            Celular
          </label>
          <input
            id="fid-tel"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={telefone}
            onChange={(e) => setTelefone(mascara(e.target.value))}
            placeholder="(19) 99999-9999"
            className={campo}
          />
        </div>

        {modo === "cadastrar" && (
          <div>
            <label htmlFor="fid-niver" className={rotulo}>
              Aniversário (opcional)
            </label>
            <input
              id="fid-niver"
              type="date"
              value={aniversario}
              onChange={(e) => setAniversario(e.target.value)}
              className={`${campo} [color-scheme:dark]`}
            />
          </div>
        )}
      </div>

      {modo === "cadastrar" && (
        <label className="mt-7 flex items-start gap-3 text-xs leading-relaxed text-creme/55">
          <input
            type="checkbox"
            checked={aceita}
            onChange={(e) => setAceita(e.target.checked)}
            className="mt-0.5 size-4 accent-[var(--color-ambar)]"
          />
          Aceito receber novidades e um mimo no meu aniversário pelo WhatsApp.
        </label>
      )}

      {erro && (
        <p role="alert" className="mt-7 text-sm text-ambar">
          {erro}
        </p>
      )}

      <Botao type="submit" tamanho="lg" className="mt-9" disabled={enviando}>
        {enviando ? "Um instante…" : modo === "consultar" ? "Ver meu cartão" : "Criar meu cartão"}
      </Botao>
    </form>
  );
}
