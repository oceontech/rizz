"use client";

import { useState } from "react";

import { Botao } from "@/components/ui/Botao";
import { horarios } from "@/lib/hours";
import { site, whatsappLink } from "@/lib/site";

const campo =
  "h-12 w-full border-b border-creme/20 bg-transparent text-[0.9375rem] text-creme placeholder:text-creme/30 focus:border-ambar focus:outline-none";

const rotulo =
  "mb-2 block text-[0.625rem] uppercase tracking-[0.18em] text-creme/45";

/**
 * A reserva vira uma mensagem pronta no WhatsApp.
 *
 * Sem back-end de reservas ainda (Fase 4), este é o caminho honesto: o cliente
 * revisa o texto antes de enviar e a equipe responde no canal que já usa.
 */
export default function FormReserva() {
  const [dados, setDados] = useState({
    nome: "",
    pessoas: "2",
    data: "",
    hora: "",
    obs: "",
  });

  const diasFechados = horarios.filter((d) => d.fechado).map((d) => d.nome);

  function montarMensagem() {
    return [
      `Olá! Gostaria de reservar uma mesa no ${site.nome}.`,
      dados.nome && `Nome: ${dados.nome}`,
      dados.pessoas && `Pessoas: ${dados.pessoas}`,
      dados.data &&
        `Data: ${new Date(`${dados.data}T00:00`).toLocaleDateString("pt-BR")}`,
      dados.hora && `Horário: ${dados.hora}`,
      dados.obs && `Observações: ${dados.obs}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    window.open(whatsappLink(montarMensagem()), "_blank", "noopener");
  }

  const hoje = new Date().toISOString().slice(0, 10);

  return (
    <form onSubmit={enviar} className="max-w-xl">
      <div className="grid gap-7 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="nome" className={rotulo}>
            Nome
          </label>
          <input
            id="nome"
            name="nome"
            required
            value={dados.nome}
            onChange={(e) => setDados({ ...dados, nome: e.target.value })}
            placeholder="Como devemos chamar?"
            className={campo}
          />
        </div>

        <div>
          <label htmlFor="pessoas" className={rotulo}>
            Pessoas
          </label>
          <select
            id="pessoas"
            name="pessoas"
            value={dados.pessoas}
            onChange={(e) => setDados({ ...dados, pessoas: e.target.value })}
            className={`${campo} [&>option]:bg-noite`}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={String(n)}>
                {n} {n === 1 ? "pessoa" : "pessoas"}
              </option>
            ))}
            <option value="mais de 12">mais de 12</option>
          </select>
        </div>

        <div>
          <label htmlFor="data" className={rotulo}>
            Data
          </label>
          <input
            id="data"
            name="data"
            type="date"
            min={hoje}
            value={dados.data}
            onChange={(e) => setDados({ ...dados, data: e.target.value })}
            className={`${campo} [color-scheme:dark]`}
          />
        </div>

        <div>
          <label htmlFor="hora" className={rotulo}>
            Horário
          </label>
          <input
            id="hora"
            name="hora"
            type="time"
            value={dados.hora}
            onChange={(e) => setDados({ ...dados, hora: e.target.value })}
            className={`${campo} [color-scheme:dark]`}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="obs" className={rotulo}>
            Observações <span className="normal-case tracking-normal text-creme/30">(opcional)</span>
          </label>
          <textarea
            id="obs"
            name="obs"
            rows={3}
            value={dados.obs}
            onChange={(e) => setDados({ ...dados, obs: e.target.value })}
            placeholder="Aniversário, restrição alimentar, preferência de mesa…"
            className={`${campo} h-auto resize-y py-3`}
          />
        </div>
      </div>

      <p className="mt-7 text-xs leading-relaxed text-creme/45">
        {diasFechados.length > 0 && (
          <>Não abrimos {diasFechados.join(" e ").toLowerCase()}. </>
        )}
        Ao continuar, abrimos o WhatsApp com a mensagem pronta — você confere e
        envia. A reserva só é confirmada pela resposta da equipe.
      </p>

      <Botao type="submit" tamanho="lg" className="mt-9">
        Continuar no WhatsApp
      </Botao>
    </form>
  );
}
