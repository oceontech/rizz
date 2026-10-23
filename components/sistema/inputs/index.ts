// Smart inputs do Ge System: um componente por tipo de dado, com máscara,
// validação e normalização (src/lib/mascaras). Nenhum campo de dado usa
// input simples; sempre o smart input do tipo correspondente.
export { BotaoInterno, Caixa, useLigacaoCampo, type PropsBase } from "./caixa";
export { InputData, InputHora, InputMesAno } from "./input-data";
export { InputMascarado } from "./input-mascarado";
export { InputMoeda } from "./input-moeda";
export { InputDecimal, InputInteiro, InputPercentual } from "./input-numero";
export { InputSenha } from "./input-senha";
export { InputTelefone } from "./input-telefone";
export { AreaTexto, InputBusca, InputTexto } from "./input-texto";
export { InputCodigo, InputContaAnuncio, InputEmail, InputInstagram, InputUrl } from "./input-web";
