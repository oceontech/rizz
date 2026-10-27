import Image from "next/image";

import { BotaoLink } from "@/components/ui/Botao";
import { img, type ImgKey } from "@/lib/images";

/** `alta` ocupa duas linhas da grade. */
const FOTOS: { chave: ImgKey; nome: string; alta?: boolean }[] = [
  { chave: "salada-rizz", nome: "Salada Rizz", alta: true },
  { chave: "polenta-ragu-cogumelos", nome: "Polenta cremosa com ragu de cogumelos" },
  { chave: "steak-milanesa-risoto-brie", nome: "Steak Red Angus à milanesa com risoto de brie" },
  { chave: "risoto-cogumelos", nome: "Risoto de cogumelos com gorgonzola e alho-poró", alta: true },
  { chave: "arancini-parmesao", nome: "Arancini de parmesão com fonduta cremosa" },
  { chave: "file-mostarda-risoto-aspargos", nome: "Filé mignon ao molho mostarda Dijon com risoto de aspargos" },
  { chave: "pudim", nome: "Pudim da casa" },
  { chave: "copa-lombo-dijon-risoto-alho-poro", nome: "Copa lombo suíno ao molho mostarda Dijon com risoto de alho-poró" },
];

/**
 * Mural da versão B: fotos coladas umas nas outras, de ponta a ponta da tela,
 * sem vão nem moldura. Um ladrilho vinho com o título entra na própria grade.
 */
export default function MuralB() {
  return (
    <section aria-labelledby="mural-b" className="bg-noite">
      <ul className="grid auto-rows-[56vw] grid-flow-dense grid-cols-2 md:auto-rows-[24vw] md:grid-cols-4">
        <li className="col-span-2 flex flex-col items-center justify-center gap-6 bg-vinho px-6 text-center md:col-span-1 md:row-span-2">
          <h2 id="mural-b" className="flex flex-col items-center leading-[0.9] not-italic">
            <span className="font-display text-[clamp(2.75rem,5vw,4.5rem)] text-creme italic">A mesa</span>
            <span className="font-sans text-[clamp(2.5rem,4.6vw,4rem)] font-semibold tracking-[-0.03em] text-ouro-claro uppercase">
              do Rizz
            </span>
          </h2>
          <BotaoLink href="/cardapio" variante="contorno">
            Ver o cardápio
          </BotaoLink>
        </li>

        {FOTOS.map((f) => (
          <li key={f.chave} className={`group relative overflow-hidden ${f.alta ? "row-span-2" : ""}`}>
            <Image
              src={img(f.chave)}
              alt={f.nome}
              fill
              placeholder="blur"
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover transition-transform duration-700 ease-[var(--ease-rizz)] group-hover:scale-[1.05]"
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
