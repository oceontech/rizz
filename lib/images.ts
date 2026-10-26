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

// Pratos do álbum de fotos do restaurante (iCloud, out/2026).
import aranciniParmesao from "@/assets/img/arancini-parmesao.webp";
import aranciniSalmaoTrufado from "@/assets/img/arancini-salmao-trufado.webp";
import brigadeiroColher from "@/assets/img/brigadeiro-colher.webp";
import brownieFrutasVermelhas from "@/assets/img/brownie-frutas-vermelhas.webp";
import burrataCogumelosTrufados from "@/assets/img/burrata-cogumelos-trufados.webp";
import camaraoMassaAlfredoTrufado from "@/assets/img/camarao-massa-alfredo-trufado.webp";
import carpaccioSalada from "@/assets/img/carpaccio-salada.webp";
import copaLomboDijonRisotoAlhoPoro from "@/assets/img/copa-lombo-dijon-risoto-alho-poro.webp";
import cordeiroSyrahRisotoFunghi from "@/assets/img/cordeiro-syrah-risoto-funghi.webp";
import espagueteCarbonara from "@/assets/img/espaguete-carbonara.webp";
import fileCremeFunghiRisotoBrie from "@/assets/img/file-creme-funghi-risoto-brie.webp";
import fileMostardaRisotoAspargos from "@/assets/img/file-mostarda-risoto-aspargos.webp";
import fileParmegianaArrozFritas from "@/assets/img/file-parmegiana-arroz-fritas.webp";
import fritas from "@/assets/img/fritas.webp";
import massaFormaggioFile from "@/assets/img/massa-formaggio-file.webp";
import polentaRaguCogumelos from "@/assets/img/polenta-ragu-cogumelos.webp";
import pudim from "@/assets/img/pudim.webp";
import risotoAcafraoRaguCostela from "@/assets/img/risoto-acafrao-ragu-costela.webp";
import risotoBacalhau from "@/assets/img/risoto-bacalhau.webp";
import risotoCamarao from "@/assets/img/risoto-camarao.webp";
import risotoCamaraoAspargos from "@/assets/img/risoto-camarao-aspargos.webp";
import risotoCogumelos from "@/assets/img/risoto-cogumelos.webp";
import risotoCostelaRucula from "@/assets/img/risoto-costela-rucula.webp";
import risotoSalmaoTrufado from "@/assets/img/risoto-salmao-trufado.webp";
import saladaRizz from "@/assets/img/salada-rizz.webp";
import salmaoCogumelosRisotoParmesao from "@/assets/img/salmao-cogumelos-risoto-parmesao.webp";
import salmaoFunghiRisotoBrie from "@/assets/img/salmao-funghi-risoto-brie.webp";
import salmaoPistacheRisotoLimao from "@/assets/img/salmao-pistache-risoto-limao.webp";
import steakMilanesaRisotoBrie from "@/assets/img/steak-milanesa-risoto-brie.webp";
import steakParmegiana from "@/assets/img/steak-parmegiana.webp";
import strogonoff from "@/assets/img/strogonoff.webp";
import tilapiaMilanesaRisotoFunghi from "@/assets/img/tilapia-milanesa-risoto-funghi.webp";

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
  "arancini-parmesao": aranciniParmesao,
  "arancini-salmao-trufado": aranciniSalmaoTrufado,
  "brigadeiro-colher": brigadeiroColher,
  "brownie-frutas-vermelhas": brownieFrutasVermelhas,
  "burrata-cogumelos-trufados": burrataCogumelosTrufados,
  "camarao-massa-alfredo-trufado": camaraoMassaAlfredoTrufado,
  "carpaccio-salada": carpaccioSalada,
  "copa-lombo-dijon-risoto-alho-poro": copaLomboDijonRisotoAlhoPoro,
  "cordeiro-syrah-risoto-funghi": cordeiroSyrahRisotoFunghi,
  "espaguete-carbonara": espagueteCarbonara,
  "file-creme-funghi-risoto-brie": fileCremeFunghiRisotoBrie,
  "file-mostarda-risoto-aspargos": fileMostardaRisotoAspargos,
  "file-parmegiana-arroz-fritas": fileParmegianaArrozFritas,
  "fritas": fritas,
  "massa-formaggio-file": massaFormaggioFile,
  "polenta-ragu-cogumelos": polentaRaguCogumelos,
  "pudim": pudim,
  "risoto-acafrao-ragu-costela": risotoAcafraoRaguCostela,
  "risoto-bacalhau": risotoBacalhau,
  "risoto-camarao": risotoCamarao,
  "risoto-camarao-aspargos": risotoCamaraoAspargos,
  "risoto-cogumelos": risotoCogumelos,
  "risoto-costela-rucula": risotoCostelaRucula,
  "risoto-salmao-trufado": risotoSalmaoTrufado,
  "salada-rizz": saladaRizz,
  "salmao-cogumelos-risoto-parmesao": salmaoCogumelosRisotoParmesao,
  "salmao-funghi-risoto-brie": salmaoFunghiRisotoBrie,
  "salmao-pistache-risoto-limao": salmaoPistacheRisotoLimao,
  "steak-milanesa-risoto-brie": steakMilanesaRisotoBrie,
  "steak-parmegiana": steakParmegiana,
  "strogonoff": strogonoff,
  "tilapia-milanesa-risoto-funghi": tilapiaMilanesaRisotoFunghi,
  "textura-acafrao": texturaAcafrao,
  "textura-mancha": texturaMancha,
  "textura-trufa": texturaTrufa,
} satisfies Record<string, StaticImageData>;

export type ImgKey = keyof typeof images;

export function img(key: ImgKey): StaticImageData {
  return images[key];
}

/** Foto de um prato: a enviada pelo painel (Blob) ou a do acervo do site. */
export function fotoDoPrato(p: { foto?: string; img?: ImgKey }): string | StaticImageData | null {
  if (p.foto) return p.foto;
  if (p.img && p.img in images) return images[p.img];
  return null;
}
