import type { StaticImageData } from "next/image";

import anchoAcafraoMadeira from "@/assets/img/ancho-risoto-acafrao-madeira.webp";
import anchoAcafraoTrufado from "@/assets/img/ancho-risoto-acafrao-trufado.webp";
import anchoTalharimParma from "@/assets/img/ancho-talharim-fonduta-parma.webp";
import camaraoPestoPistache from "@/assets/img/camarao-massa-pesto-pistache.webp";
import camaraoRizz from "@/assets/img/camarao-rizz.webp";
import copaLomboLimao from "@/assets/img/copa-lombo-milanesa-risoto-limao.webp";
import cordeiroHortela from "@/assets/img/cordeiro-creme-batatas-hortela.webp";
import fileParmesaoVinho from "@/assets/img/file-risoto-parmesao-vinho.webp";
import frangoTalharimAlfredo from "@/assets/img/frango-milanesa-talharim-alfredo.webp";
import mesaExecutivo from "@/assets/img/mesa-executivo-alto.webp";
import parmegianaBrie from "@/assets/img/parmegiana-brie-risoto.webp";
import parmegianaFritas from "@/assets/img/parmegiana-arroz-fritas.webp";
import peixeArrozNegro from "@/assets/img/peixe-arroz-negro-aspargos.webp";
import risotoTrufadoBrie from "@/assets/img/risoto-trufado-brie-frigideira.webp";
import salaoClaraboia from "@/assets/img/salao-claraboia-vinho.webp";

// Geradas com Higgsfield para as cenas que não existiam em foto.
import texturaAcafrao from "@/assets/img/textura-acafrao.webp";
import texturaMancha from "@/assets/img/textura-mancha.webp";
import texturaTrufa from "@/assets/img/textura-trufa.webp";

/**
 * Imports estáticos: o Next deriva width/height/blurDataURL no build.
 * É o que mantém o CLS em zero sem declarar dimensão à mão em cada uso.
 */
export const images = {
  "ancho-acafrao-madeira": anchoAcafraoMadeira,
  "ancho-acafrao-trufado": anchoAcafraoTrufado,
  "ancho-talharim-parma": anchoTalharimParma,
  "camarao-pesto-pistache": camaraoPestoPistache,
  "camarao-rizz": camaraoRizz,
  "copa-lombo-limao": copaLomboLimao,
  "cordeiro-hortela": cordeiroHortela,
  "file-parmesao-vinho": fileParmesaoVinho,
  "frango-talharim-alfredo": frangoTalharimAlfredo,
  "mesa-executivo": mesaExecutivo,
  "parmegiana-brie": parmegianaBrie,
  "parmegiana-fritas": parmegianaFritas,
  "peixe-arroz-negro": peixeArrozNegro,
  "risoto-trufado-brie": risotoTrufadoBrie,
  "salao-claraboia": salaoClaraboia,
  "textura-acafrao": texturaAcafrao,
  "textura-mancha": texturaMancha,
  "textura-trufa": texturaTrufa,
} satisfies Record<string, StaticImageData>;

export type ImgKey = keyof typeof images;

export function img(key: ImgKey): StaticImageData {
  return images[key];
}
