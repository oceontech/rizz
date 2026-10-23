"use client";

import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { useState } from "react";
import { Calendario } from "./calendario";
import { GatilhoCampo } from "./gatilho-campo";
import { PainelAdaptavel } from "./painel-adaptavel";

type Props = {
  valor: Date | undefined;
  aoMudar: (data: Date | undefined) => void;
  placeholder?: string;
  titulo?: string;
  desabilitado?: boolean;
  /** Datas fora deste intervalo ficam desabilitadas */
  minimo?: Date;
  maximo?: Date;
  id?: string;
  className?: string;
};

export function SeletorData({
  valor,
  aoMudar,
  placeholder = "Escolha uma data",
  titulo = "Escolha uma data",
  desabilitado,
  minimo,
  maximo,
  id,
  className,
}: Props) {
  const [aberto, setAberto] = useState(false);
  const limites = [...(minimo ? [{ before: minimo }] : []), ...(maximo ? [{ after: maximo }] : [])];

  return (
    <PainelAdaptavel
      aberto={aberto}
      aoMudar={setAberto}
      titulo={titulo}
      gatilho={
        <GatilhoCampo
          id={id}
          icone={CalendarDays}
          valor={valor ? format(valor, "dd/MM/yyyy") : null}
          placeholder={placeholder}
          disabled={desabilitado}
          className={className}
        />
      }
    >
      <Calendario
        mode="single"
        selected={valor}
        defaultMonth={valor}
        disabled={limites}
        onSelect={(data) => {
          aoMudar(data);
          setAberto(false);
        }}
        className="mx-auto"
      />
    </PainelAdaptavel>
  );
}
