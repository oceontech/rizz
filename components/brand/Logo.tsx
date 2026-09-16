import Image, { type ImageProps } from "next/image";

import original from "@/assets/marca/logo-original.webp";
import branca from "@/assets/marca/logo-branca.webp";
import vinho from "@/assets/marca/logo-vinho.webp";

const variantes = { original, branca, vinho };

export type VarianteLogo = keyof typeof variantes;

/**
 * Herda as props do <Image> e repassa o resto adiante. Sem isso, atributos
 * como `data-marca` eram silenciosamente descartados — e quem procurasse por
 * eles no DOM recebia `null`.
 */
type Props = Omit<ImageProps, "src" | "alt"> & {
  variante?: VarianteLogo;
  /** Decorativo quando o nome da marca já está no texto ao lado. */
  decorativo?: boolean;
};

/**
 * Assinatura oficial — arquivo real da marca, não recriação.
 *
 * A v1 desenhava o wordmark em SVG e errava o desenho (o garfo do "i" tem as
 * pontas para baixo, não para cima). Com o arquivo em mãos, reconstruir seria
 * só uma cópia pior.
 */
export default function Logo({
  variante = "branca",
  decorativo = false,
  sizes = "(min-width: 860px) 420px, 60vw",
  ...resto
}: Props) {
  return (
    <Image
      src={variantes[variante]}
      alt={decorativo ? "" : "Rizz Cucina & Vino"}
      aria-hidden={decorativo || undefined}
      sizes={sizes}
      {...resto}
    />
  );
}
