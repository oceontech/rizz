"use client";

/**
 * Kit de campos do painel — tudo HeroUI, nada nativo à vista.
 * Cada wrapper recebe/devolve valores simples (string, number, "AAAA-MM-DD",
 * "HH:MM") e esconde a conversão para os tipos do React Aria.
 */

import { Picture, TrashBin, ArrowUpFromSquare } from "@gravity-ui/icons";
import {
  AlertDialog,
  Button,
  Calendar,
  DateField,
  DatePicker,
  DateRangePicker,
  Description,
  FieldError,
  Input,
  Label,
  ListBox,
  NumberField,
  RangeCalendar,
  Select,
  Spinner,
  Switch,
  TextArea,
  TextField,
  TimeField,
  toast,
} from "@heroui/react";
import { parseDate, parseTime } from "@internationalized/date";
import Image from "next/image";
import { useRef, useState } from "react";

import { enviarImagem } from "@/lib/admin/cardapio-actions";

// ─── Texto ─────────────────────────────────────────────────────

export function CampoTexto({
  label,
  value,
  onChange,
  placeholder,
  descricao,
  obrigatorio,
  multilinha,
  linhas = 3,
  tipo = "text",
  maxLength,
  className,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  descricao?: string;
  obrigatorio?: boolean;
  multilinha?: boolean;
  linhas?: number;
  tipo?: "text" | "email" | "tel" | "url";
  maxLength?: number;
  className?: string;
  autoFocus?: boolean;
}) {
  return (
    <TextField
      value={value}
      onChange={onChange}
      isRequired={obrigatorio}
      type={tipo}
      maxLength={maxLength}
      fullWidth
      className={className}
      autoFocus={autoFocus}
    >
      <Label>{label}</Label>
      {multilinha ? (
        <TextArea placeholder={placeholder} rows={linhas} className="w-full resize-y" />
      ) : (
        <Input placeholder={placeholder} className="w-full" />
      )}
      {descricao && <Description>{descricao}</Description>}
      <FieldError />
    </TextField>
  );
}

// ─── Número ────────────────────────────────────────────────────

export function CampoNumero({
  label,
  value,
  onChange,
  min,
  max,
  passo = 1,
  formato,
  descricao,
  desabilitado,
  className,
}: {
  label: string;
  value: number | null;
  onChange: (v: number | null) => void;
  min?: number;
  max?: number;
  passo?: number;
  formato?: Intl.NumberFormatOptions;
  descricao?: string;
  desabilitado?: boolean;
  className?: string;
}) {
  return (
    <NumberField
      value={value ?? Number.NaN}
      onChange={(v) => onChange(Number.isNaN(v) ? null : v)}
      minValue={min}
      maxValue={max}
      step={passo}
      formatOptions={formato}
      isDisabled={desabilitado}
      fullWidth
      className={className}
    >
      <Label>{label}</Label>
      <NumberField.Group>
        <NumberField.DecrementButton />
        <NumberField.Input className="w-full min-w-0" />
        <NumberField.IncrementButton />
      </NumberField.Group>
      {descricao && <Description>{descricao}</Description>}
    </NumberField>
  );
}

export const FORMATO_BRL: Intl.NumberFormatOptions = { style: "currency", currency: "BRL" };

// ─── Select ────────────────────────────────────────────────────

export type Opcao = { id: string; rotulo: string; descricao?: string };

export function CampoSelect({
  label,
  value,
  onChange,
  opcoes,
  placeholder = "Selecione",
  descricao,
  className,
  ocultarLabel,
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  opcoes: Opcao[];
  placeholder?: string;
  descricao?: string;
  className?: string;
  ocultarLabel?: boolean;
}) {
  return (
    <Select
      value={value}
      onChange={(k) => k !== null && onChange(String(k))}
      placeholder={placeholder}
      className={className ?? "w-full"}
      aria-label={ocultarLabel ? label : undefined}
    >
      {!ocultarLabel && <Label>{label}</Label>}
      <Select.Trigger>
        <Select.Value />
        <Select.Indicator />
      </Select.Trigger>
      {descricao && <Description>{descricao}</Description>}
      <Select.Popover>
        <ListBox>
          {opcoes.map((o) => (
            <ListBox.Item key={o.id} id={o.id} textValue={o.rotulo}>
              {o.descricao ? (
                <div className="flex flex-col">
                  <Label>{o.rotulo}</Label>
                  <Description>{o.descricao}</Description>
                </div>
              ) : (
                o.rotulo
              )}
              <ListBox.ItemIndicator />
            </ListBox.Item>
          ))}
        </ListBox>
      </Select.Popover>
    </Select>
  );
}

// ─── Switch ────────────────────────────────────────────────────

export function CampoSwitch({
  label,
  descricao,
  value,
  onChange,
  tamanho = "md",
}: {
  label: string;
  descricao?: string;
  value: boolean;
  onChange: (v: boolean) => void;
  tamanho?: "sm" | "md" | "lg";
}) {
  return (
    <Switch isSelected={value} onChange={onChange} size={tamanho} className="w-full">
      <Switch.Content className="flex w-full items-start justify-between gap-4">
        <span className="flex min-w-0 flex-col">
          <span className="text-sm font-medium">{label}</span>
          {descricao && <span className="text-xs text-muted">{descricao}</span>}
        </span>
        <Switch.Control className="mt-0.5 shrink-0">
          <Switch.Thumb />
        </Switch.Control>
      </Switch.Content>
    </Switch>
  );
}

// ─── Data, período e hora ──────────────────────────────────────

function paraData(v: string | null) {
  try {
    return v ? parseDate(v) : null;
  } catch {
    return null;
  }
}

function Calendario({ rotulo }: { rotulo: string }) {
  return (
    <Calendar aria-label={rotulo}>
      <Calendar.Header>
        <Calendar.YearPickerTrigger>
          <Calendar.YearPickerTriggerHeading />
          <Calendar.YearPickerTriggerIndicator />
        </Calendar.YearPickerTrigger>
        <Calendar.NavButton slot="previous" />
        <Calendar.NavButton slot="next" />
      </Calendar.Header>
      <Calendar.Grid>
        <Calendar.GridHeader>{(dia) => <Calendar.HeaderCell>{dia}</Calendar.HeaderCell>}</Calendar.GridHeader>
        <Calendar.GridBody>{(data) => <Calendar.Cell date={data} />}</Calendar.GridBody>
      </Calendar.Grid>
      <Calendar.YearPickerGrid>
        <Calendar.YearPickerGridBody>
          {({ year }) => <Calendar.YearPickerCell year={year} />}
        </Calendar.YearPickerGridBody>
      </Calendar.YearPickerGrid>
    </Calendar>
  );
}

export function CampoData({
  label,
  value,
  onChange,
  descricao,
  minimo,
  obrigatorio,
  className,
  ocultarLabel,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  descricao?: string;
  minimo?: string;
  obrigatorio?: boolean;
  className?: string;
  ocultarLabel?: boolean;
}) {
  return (
    <DatePicker
      value={paraData(value)}
      onChange={(d) => onChange(d ? d.toString() : null)}
      minValue={paraData(minimo ?? null) ?? undefined}
      isRequired={obrigatorio}
      className={className ?? "w-full"}
    >
      <Label className={ocultarLabel ? "sr-only" : undefined}>{label}</Label>
      <DateField.Group fullWidth>
        <DateField.Input>{(s) => <DateField.Segment segment={s} />}</DateField.Input>
        <DateField.Suffix>
          <DatePicker.Trigger>
            <DatePicker.TriggerIndicator />
          </DatePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      {descricao && <Description>{descricao}</Description>}
      <DatePicker.Popover>
        <Calendario rotulo={label} />
      </DatePicker.Popover>
    </DatePicker>
  );
}

export function CampoPeriodo({
  label,
  inicio,
  fim,
  onChange,
  descricao,
  className,
}: {
  label: string;
  inicio: string | null;
  fim: string | null;
  onChange: (inicio: string | null, fim: string | null) => void;
  descricao?: string;
  className?: string;
}) {
  const a = paraData(inicio);
  const b = paraData(fim);
  return (
    <DateRangePicker
      value={a && b ? { start: a, end: b } : null}
      onChange={(r) => onChange(r ? r.start.toString() : null, r ? r.end.toString() : null)}
      className={className ?? "w-full"}
    >
      <Label>{label}</Label>
      <DateField.Group fullWidth>
        <DateField.Input slot="start">{(s) => <DateField.Segment segment={s} />}</DateField.Input>
        <DateRangePicker.RangeSeparator />
        <DateField.Input slot="end">{(s) => <DateField.Segment segment={s} />}</DateField.Input>
        <DateField.Suffix>
          <DateRangePicker.Trigger>
            <DateRangePicker.TriggerIndicator />
          </DateRangePicker.Trigger>
        </DateField.Suffix>
      </DateField.Group>
      {descricao && <Description>{descricao}</Description>}
      <DateRangePicker.Popover>
        <RangeCalendar aria-label={label}>
          <RangeCalendar.Header>
            <RangeCalendar.YearPickerTrigger>
              <RangeCalendar.YearPickerTriggerHeading />
              <RangeCalendar.YearPickerTriggerIndicator />
            </RangeCalendar.YearPickerTrigger>
            <RangeCalendar.NavButton slot="previous" />
            <RangeCalendar.NavButton slot="next" />
          </RangeCalendar.Header>
          <RangeCalendar.Grid>
            <RangeCalendar.GridHeader>
              {(dia) => <RangeCalendar.HeaderCell>{dia}</RangeCalendar.HeaderCell>}
            </RangeCalendar.GridHeader>
            <RangeCalendar.GridBody>{(d) => <RangeCalendar.Cell date={d} />}</RangeCalendar.GridBody>
          </RangeCalendar.Grid>
          <RangeCalendar.YearPickerGrid>
            <RangeCalendar.YearPickerGridBody>
              {({ year }) => <RangeCalendar.YearPickerCell year={year} />}
            </RangeCalendar.YearPickerGridBody>
          </RangeCalendar.YearPickerGrid>
        </RangeCalendar>
      </DateRangePicker.Popover>
    </DateRangePicker>
  );
}

export function CampoHora({
  label,
  value,
  onChange,
  descricao,
  obrigatorio,
  className,
}: {
  label: string;
  value: string | null;
  onChange: (v: string | null) => void;
  descricao?: string;
  obrigatorio?: boolean;
  className?: string;
}) {
  let t = null;
  try {
    t = value ? parseTime(value) : null;
  } catch {
    t = null;
  }
  return (
    <TimeField
      value={t}
      onChange={(v) => onChange(v ? v.toString().slice(0, 5) : null)}
      hourCycle={24}
      isRequired={obrigatorio}
      className={className ?? "w-full"}
    >
      <Label>{label}</Label>
      <TimeField.Group fullWidth>
        <TimeField.Input>{(s) => <TimeField.Segment segment={s} />}</TimeField.Input>
      </TimeField.Group>
      {descricao && <Description>{descricao}</Description>}
    </TimeField>
  );
}

// ─── Upload de imagem (Vercel Blob) ────────────────────────────

export function UploadImagem({
  label,
  value,
  onChange,
  pasta,
  descricao,
  proporcao = "aspect-[4/3]",
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  pasta: "pratos" | "promocoes";
  descricao?: string;
  proporcao?: string;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [arrastando, setArrastando] = useState(false);

  async function enviar(arquivo: File | undefined) {
    if (!arquivo) return;
    setEnviando(true);
    const form = new FormData();
    form.set("arquivo", arquivo);
    form.set("pasta", pasta);
    const r = await enviarImagem(form);
    setEnviando(false);
    if (r.ok && r.dados) {
      onChange(r.dados);
      toast.success("Imagem enviada");
    } else if (!r.ok) {
      toast.danger(r.erro);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setArrastando(true);
        }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          void enviar(e.dataTransfer.files[0]);
        }}
        className={`relative overflow-hidden rounded-2xl border border-dashed transition-colors ${proporcao} ${
          arrastando ? "border-accent bg-accent/5" : "border-border bg-surface-secondary"
        }`}
      >
        {value ? (
          <Image src={value} alt="" fill sizes="480px" className="object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-muted">
            <Picture className="size-7" />
            <p className="text-xs">Arraste uma foto ou use o botão abaixo</p>
          </div>
        )}
        {enviando && (
          <div className="absolute inset-0 grid place-items-center bg-surface/70">
            <Spinner />
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="secondary" onPress={() => entrada.current?.click()} isDisabled={enviando}>
          <ArrowUpFromSquare /> {value ? "Trocar foto" : "Enviar foto"}
        </Button>
        {value && (
          <Button size="sm" variant="ghost" onPress={() => onChange(null)} isDisabled={enviando}>
            <TrashBin /> Remover
          </Button>
        )}
      </div>
      {descricao && <p className="text-xs text-muted">{descricao}</p>}
      <input
        ref={entrada}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(e) => {
          void enviar(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Confirmação destrutiva ────────────────────────────────────

export function Confirmar({
  aberto,
  onFechar,
  titulo,
  texto,
  rotuloAcao = "Excluir",
  onConfirmar,
}: {
  aberto: boolean;
  onFechar: () => void;
  titulo: string;
  texto: React.ReactNode;
  rotuloAcao?: string;
  onConfirmar: () => Promise<void> | void;
}) {
  const [pendente, setPendente] = useState(false);
  return (
    <AlertDialog>
      <AlertDialog.Backdrop isOpen={aberto} onOpenChange={(v) => !v && onFechar()}>
        <AlertDialog.Container>
          <AlertDialog.Dialog className="sm:max-w-[420px]">
            <AlertDialog.Header>
              <AlertDialog.Icon status="danger" />
              <AlertDialog.Heading>{titulo}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              <div className="text-sm text-muted">{texto}</div>
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button variant="tertiary" onPress={onFechar} isDisabled={pendente}>
                Cancelar
              </Button>
              <Button
                variant="danger"
                isPending={pendente}
                onPress={async () => {
                  setPendente(true);
                  await onConfirmar();
                  setPendente(false);
                  onFechar();
                }}
              >
                {rotuloAcao}
              </Button>
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}

/** Mostra o resultado de uma action num toast; devolve se deu certo. */
export function avisar(r: { ok: boolean; erro?: string }, sucesso: string) {
  if (r.ok) toast.success(sucesso);
  else toast.danger(r.erro ?? "Algo deu errado.");
  return r.ok;
}
