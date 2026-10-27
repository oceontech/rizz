import Image from "next/image";

import Parallax from "@/components/motion/Parallax";
import Reveal from "@/components/motion/Reveal";
import RevealScrub from "@/components/motion/RevealScrub";
import { img, type ImgKey } from "@/lib/images";

const capitulos: {
  numero: string;
  destaque: string;
  texto: string;
  prato: string;
  foto: ImgKey;
  alt: string;
}[] = [
  {
    numero: "I",
    destaque: "Especialidade em risotos.",
    texto: "Do açafrão espanhol com ragu de costela ao alho negro trufado com funghi e brie, o risoto tem um capítulo inteiro no cardápio.",
    prato: "Risoto de açafrão espanhol com ragu de costela bovina",
    foto: "risoto-acafrao-ragu-costela",
    alt: "Risoto de açafrão com ragu de costela e folha de manjericão em prato verde decorado",
  },
  {
    numero: "II",
    destaque: "Cozinha contemporânea.",
    texto: "Entradas, massas, carnes, peixes e sobremesas completam a mesa, como o camarão rosa com massa ao molho alfredo trufado.",
    prato: "Camarão rosa com massa ao molho alfredo trufado",
    foto: "camarao-massa-alfredo-trufado",
    alt: "Camarões rosa sobre massa ao molho alfredo em prato azul",
  },
  {
    numero: "III",
    destaque: "Trufa, alho negro e açafrão.",
    texto: "Aparecem em risotos, carnes e entradas, como no ancho Red Angus com risoto de açafrão trufado.",
    prato: "Ancho Red Angus com risoto de açafrão trufado",
    foto: "ancho-acafrao-trufado",
    alt: "Ancho grelhado ao lado de risoto de açafrão com lâmina de trufa em prato azul",
  },
];

/**
 * "Nossa cozinha" da versão B: papel creme, como o cardápio impresso, e três
 * capítulos com a foto inteira do prato num arco, em vez do palco escuro com
 * recortes da versão A.
 *
 * Cada frase cita o prato da foto ao lado: texto e imagem dizem a mesma coisa.
 */
export default function CozinhaB() {
  return (
    <section aria-labelledby="cozinha-b" className="on-creme relative overflow-hidden py-24 md:py-36">
      <div className="wrap">
        <div className="max-w-3xl">
          <p className="eyebrow text-vinho">Nossa cozinha</p>
          <RevealScrub as="h2" id="cozinha-b" className="mt-5 text-display text-vinho">
            Por onde começar.
          </RevealScrub>
        </div>

        <ol className="mt-16 flex flex-col gap-24 md:mt-24 md:gap-36">
          {capitulos.map((c, i) => {
            const invertido = i % 2 === 1;
            return (
              <li key={c.numero} className="grid items-center gap-10 md:grid-cols-12 md:gap-8">
                <div
                  className={`relative mx-auto w-full max-w-md md:col-span-5 md:max-w-none ${invertido ? "md:order-2 md:col-start-8" : "md:col-start-1"}`}
                >
                  {/* Moldura em arco com filete interno: a moldura de espelho
                      dos convites, sem ornamento desenhado. */}
                  <div className="relative rounded-t-full border border-vinho/25 p-2.5 md:p-3.5">
                    <Parallax className="aspect-[3/4] rounded-t-full" forca={8}>
                      <Image
                        src={img(c.foto)}
                        alt={c.alt}
                        placeholder="blur"
                        sizes="(min-width: 860px) 40vw, 90vw"
                        className="size-full object-cover"
                      />
                    </Parallax>
                  </div>

                  <Reveal delay={0.15} y={20}>
                    <p
                      className={`absolute -bottom-6 max-w-[15rem] rotate-[-3deg] bg-creme-2 px-4 py-3 text-[0.8125rem] leading-snug shadow-[0_14px_30px_rgb(58_18_25/0.18)] ${invertido ? "-left-2 md:-left-8" : "-right-2 md:-right-8"}`}
                    >
                      <span className="eyebrow block text-[0.625rem] text-vinho">No prato</span>
                      <span className="mt-1 block font-display text-lg italic text-tinta">{c.prato}</span>
                    </p>
                  </Reveal>
                </div>

                <div className={`md:col-span-6 ${invertido ? "md:order-1 md:col-start-1" : "md:col-start-7"}`}>
                  <Reveal>
                    <span aria-hidden className="block font-display text-[clamp(4.5rem,11vw,9rem)] leading-none text-vinho/15 italic">
                      {c.numero}
                    </span>
                    <h3 className="-mt-4 font-display text-titulo text-vinho italic md:-mt-8">{c.destaque}</h3>
                    <p className="mt-5 max-w-lg text-lg leading-relaxed text-tinta/80">{c.texto}</p>
                  </Reveal>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
