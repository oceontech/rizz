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
 * A reserva vira uma mensagem pronta no WhatsApp — e, em paralelo, um pedido
 * "pendente" no painel (/admin/reservas), onde a equipe confirma e responde.
 *
 * O registro vai por sendBeacon, sem esperar resposta: o window.open precisa
 * sair no mesmo gesto do clique, senão o navegador bloqueia a aba nova.
 */
export default function FormReserva() {
  const [dados, setDados] = useState({
    nome: "",
    telefone: "",
    pessoas: "2",
    data: "",
    hora: "",
    obs: "",
  });

  const diasFechados = horarios.filter((d) => d.fechado).map((d) => d.nome);

  function montarMensagem() {
    return [
      `Olá! Gostaria de consultar a disponibilidade de uma mesa no ${site.nome}.`,
      dados.nome && `Nome: ${dados.nome}`,
      dados.telefone && `Telefone: ${dados.telefone}`,
      dados.pessoas && `Número de pessoas: ${dados.pessoas}`,
      dados.data &&
        `Data: ${new Date(`${dados.data}T00:00`).toLocaleDateString("pt-BR")}`,
      dados.hora && `Horário desejado: ${dados.hora}`,
      dados.obs && `Observações: ${dados.obs}`,
    ]
      .filter(Boolean)
      .join("\n");
  }

  function registrarNoPainel() {
    const corpo = JSON.stringify({
      nome: dados.nome,
      telefone: dados.telefone,
      pessoas: dados.pessoas === "mais de 12" ? 13 : Number(dados.pessoas),
      data: dados.data,
      hora: dados.hora,
      obs: dados.obs,
      site: "",
    });
    try {
      const blob = new Blob([corpo], { type: "application/json" });
      if (!navigator.sendBeacon?.("/api/reservas", blob)) {
        void fetch("/api/reservas", { method: "POST", body: corpo, keepalive: true, headers: { "content-type": "application/json" } });
      }
    } catch {
      /* o WhatsApp segue sendo o canal principal */
    }
  }

  function enviar(evento: React.FormEvent) {
    evento.preventDefault();
    registrarNoPainel();
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
            placeholder="Seu nome"
            className={campo}
          />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="telefone" className={rotulo}>
            WhatsApp para contato
          </label>
          <input
            id="telefone"
            name="telefone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            required
            value={dados.telefone}
            onChange={(e) => setDados({ ...dados, telefone: e.target.value })}
            placeholder="(19) 99999-9999"
            className={campo}
          />
        </div>

        <div>
          <label htmlFor="pessoas" className={rotulo}>
            Número de pessoas
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
            Data da visita (opcional)
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
            Horário desejado (opcional)
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
            placeholder="Conte se há alguma preferência ou informação para a equipe."
            className={`${campo} h-auto resize-y py-3`}
          />
        </div>
      </div>

      <p className="mt-7 text-xs leading-relaxed text-creme/45">
        {diasFechados.length > 0 && (
          <>Não abrimos {diasFechados.join(" e ").toLowerCase()}. </>
        )}
        Você poderá revisar e enviar a mensagem no WhatsApp.
        A reserva será confirmada pela equipe.
      </p>

      <Botao type="submit" tamanho="lg" className="mt-9">
        Continuar no WhatsApp
      </Botao>
    </form>
  );
}
