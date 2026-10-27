/**
 * Textura de papel para os painéis amarelos da versão B: grão fino (ruído SVG
 * em multiplicação), um clarão suave no alto e as bordas um tom mais escuras.
 * Tira o aspecto de cor chapada sem pesar: é um SVG de poucos bytes.
 */
const RUIDO =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='r'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.35 0 0 0 0 0.12 0 0 0 0 0.05 0 0 0 0.55 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23r)'/%3E%3C/svg%3E\")";

export default function Textura() {
  return (
    <>
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-45 mix-blend-multiply" style={{ backgroundImage: RUIDO }} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 70% 45% at 50% 28%, rgb(255 248 220 / 0.38), transparent 70%), radial-gradient(ellipse at center, transparent 55%, rgb(112 1 42 / 0.16) 100%)",
        }}
      />
    </>
  );
}
