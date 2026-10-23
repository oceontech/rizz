"use client";

import { format, parse } from "date-fns";
import { CalendarDays, Clock } from "lucide-react";
import { useState, type Ref } from "react";
import { Calendario, ConteudoHora, GradeMeses, PainelAdaptavel } from "@/components/sistema/pickers";
import {
  MASCARA_DATA,
  MASCARA_HORA,
  MASCARA_MES_ANO,
  dataParaIso,
  horaDeDigitos,
  horaParaDigitos,
  isoParaDigitosData,
  isoParaDigitosMes,
  mesAnoParaIso,
} from "@/lib/mascaras";
import { BotaoInterno, type PropsBase } from "./caixa";
import { InputMascarado } from "./input-mascarado";

// Data, hora e mês digitáveis, com o picker ao lado. O formulário recebe o
// formato do banco quando o campo está completo e válido ("2026-10-08",
// "18:30", "2026-10-01"); incompleto, recebe os dígitos digitados, que o
// esquema Zod recusa com a mensagem certa. Vazio = null.

type PropsTempo = PropsBase & {
  valor: string | null | undefined;
  aoMudar: (valor: string | null) => void;
  ref?: Ref<HTMLInputElement>;
};

const ISO = "yyyy-MM-dd";
const paraData = (iso: string | null) => (iso ? parse(iso, ISO, new Date()) : undefined);

export function InputData({
  valor,
  aoMudar,
  minimo,
  maximo,
  ...props
}: PropsTempo & { minimo?: string; maximo?: string }) {
  const [aberto, setAberto] = useState(false);
  const digitos = isoParaDigitosData(valor);
  const selecionada = paraData(dataParaIso(digitos));
  const limites = [
    ...(minimo ? [{ before: parse(minimo, ISO, new Date()) }] : []),
    ...(maximo ? [{ after: parse(maximo, ISO, new Date()) }] : []),
  ];

  return (
    <InputMascarado
      inputMode="numeric"
      placeholder="dd/mm/aaaa"
      {...props}
      className="numeros"
      mascara={MASCARA_DATA}
      valor={digitos}
      aoMudar={(limpo) => aoMudar(limpo ? (dataParaIso(limpo) ?? limpo) : null)}
      acao={
        <PainelAdaptavel
          aberto={aberto}
          aoMudar={setAberto}
          titulo="Escolha uma data"
          alinhar="end"
          gatilho={
            <BotaoInterno aria-label="Abrir calendário" disabled={props.disabled}>
              <CalendarDays />
            </BotaoInterno>
          }
        >
          <Calendario
            mode="single"
            selected={selecionada}
            defaultMonth={selecionada}
            disabled={limites}
            onSelect={(data) => {
              aoMudar(data ? format(data, ISO) : null);
              setAberto(false);
            }}
            className="mx-auto"
          />
        </PainelAdaptavel>
      }
    />
  );
}

export function InputHora({ valor, aoMudar, passoMinutos = 5, ...props }: PropsTempo & { passoMinutos?: number }) {
  const [aberto, setAberto] = useState(false);
  const digitos = horaParaDigitos(valor);

  return (
    <InputMascarado
      inputMode="numeric"
      placeholder="hh:mm"
      {...props}
      className="numeros"
      mascara={MASCARA_HORA}
      valor={digitos}
      aoMudar={(limpo) => aoMudar(limpo ? (horaDeDigitos(limpo) ?? limpo) : null)}
      acao={
        <PainelAdaptavel
          aberto={aberto}
          aoMudar={setAberto}
          titulo="Escolha a hora"
          alinhar="end"
          gatilho={
            <BotaoInterno aria-label="Escolher hora" disabled={props.disabled}>
              <Clock />
            </BotaoInterno>
          }
        >
          <ConteudoHora
            valor={horaDeDigitos(digitos) ?? undefined}
            passoMinutos={passoMinutos}
            aoConfirmar={(hora) => {
              aoMudar(hora);
              setAberto(false);
            }}
          />
        </PainelAdaptavel>
      }
    />
  );
}

export function InputMesAno({ valor, aoMudar, ...props }: PropsTempo) {
  const [aberto, setAberto] = useState(false);
  const digitos = isoParaDigitosMes(valor);

  return (
    <InputMascarado
      inputMode="numeric"
      placeholder="mm/aaaa"
      {...props}
      className="numeros"
      mascara={MASCARA_MES_ANO}
      valor={digitos}
      aoMudar={(limpo) => aoMudar(limpo ? (mesAnoParaIso(limpo) ?? limpo) : null)}
      acao={
        <PainelAdaptavel
          aberto={aberto}
          aoMudar={setAberto}
          titulo="Escolha o mês"
          alinhar="end"
          gatilho={
            <BotaoInterno aria-label="Escolher mês" disabled={props.disabled}>
              <CalendarDays />
            </BotaoInterno>
          }
        >
          <GradeMeses
            valor={paraData(mesAnoParaIso(digitos))}
            aoEscolher={(mes) => {
              aoMudar(format(mes, ISO));
              setAberto(false);
            }}
          />
        </PainelAdaptavel>
      }
    />
  );
}
