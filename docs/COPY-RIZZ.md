# Revisão editorial do Rizz Cucina & Vino

Pesquisa, auditoria e proposta de textos. Data: 21/09/2026.

Escopo: página inicial, cardápio, reservas, vinhos, avaliações, privacidade, navegação, mensagens de interface, acessibilidade e apresentação nos buscadores. A revisão foi aplicada após autorização do usuário. A pesquisa e o plano originais abaixo registram a base das decisões; as atualizações desta seção prevalecem sobre as recomendações iniciais.

Atualizações da implementação:

- O usuário confirmou que o restaurante comunica o camarão como o mais pedido. A chamada foi mantida, com descrição objetiva dos acompanhamentos. O selo também mantém “O MAIS PEDIDO”, sem acrescentar a classificação não confirmada de criação da casa.
- A seção “Nossa cozinha” apresenta risotos, cozinha contemporânea e vinhos com fotografias do acervo do restaurante que correspondem aos textos.
- Os dias e preços divergentes do executivo ficaram para consulta com a equipe. Os valores cadastrados foram preservados, mas não são exibidos enquanto `condicoesConfirmadas` estiver desativado. O menor preço passa a ser calculado a partir da lista de pratos. Antes de ativar, conferir todos os valores, a segunda-feira, a tabela de funcionamento e a regra de disponibilidade.
- Foram removidas as instruções técnicas das páginas públicas, as afirmações genéricas de rastreabilidade e exclusividade e as descrições promocionais derivadas da arquitetura das fotos.
- As avaliações guardadas exibem data de consulta; o acesso a todas as avaliações aponta para o Google.
- A página de privacidade descreve o fluxo observado de navegação, formulário e serviços externos. Uma política completa sobre práticas da operação e da hospedagem ainda depende de confirmação dos responsáveis.
- O domínio de referência passou a ser o informado na bio oficial: `rizzrestaurante.com.br`. A revisão não inclui implantação nem alteração de DNS.

## 1. Direção recomendada

O site deve apresentar o Rizz como um restaurante de cozinha contemporânea, especializado em risotos, em Espírito Santo do Pinhal, com vinhos fazendo parte da proposta da casa.

Essa direção se apoia na apresentação pública do próprio restaurante. A narrativa atual dá protagonismo a ingredientes, fornecedores e descrições das imagens, mas deixa pouco clara a proposta para quem está escolhendo onde comer.

A página precisa responder, em sequência: que restaurante é este, o que posso comer, o que encontro para acompanhar, como é visitar a casa e como consulto horários ou solicito uma reserva. Quem já conhece o Rizz deve conseguir ir direto ao cardápio e ao contato.

A história do restaurante merece espaço quando houver fatos suficientes para contá-la. Uma lista de ingredientes não substitui uma história. A descrição de uma fotografia também não substitui um convite.

## 2. Pesquisa e aplicação ao Rizz

### Clareza e confiança

Os estudos de leitura na web do Nielsen Norman Group favorecem textos concisos, organizados para leitura rápida e com menos exagero promocional. São estudos de usabilidade, incluindo pesquisas antigas, e não uma previsão de aumento de reservas para o Rizz. A aplicação aqui é usar títulos informativos, uma ideia por parágrafo e argumentos verificáveis. [Pesquisa de escrita na web](https://www.nngroup.com/articles/concise-scannable-and-objective-how-to-write-for-the-web/) e [credibilidade e leitura](https://www.nngroup.com/articles/how-users-read-on-the-web/).

### Necessidades específicas de quem procura um restaurante

A orientação da OpenTable destaca cardápio, localização, horários e reserva como informações que o visitante deve encontrar rapidamente. Também recomenda uma apresentação que corresponda à identidade real da casa. Para o Rizz, isso significa reduzir os blocos abstratos e manter caminhos diretos para consultar o menu e planejar a visita. A referência é de um fornecedor comercial; não implica contratar seu sistema. [Guia de sites para restaurantes](https://www.opentable.com/restaurant-solutions/resources/restaurant-website-creation/).

### Descrição de pratos

A ChowNow recomenda descrições naturais, claras e compatíveis com a voz do restaurante, destacando ingredientes e características que ajudam a escolher. Aplicação: dizer o que vem no prato, como ele é preparado quando isso estiver documentado e quais acompanhamentos estão incluídos. Evitar completar receitas pela aparência da foto. [Guia de descrição de pratos](https://get.chownow.com/blog/menu-descriptions/).

O material da Menu Cover Depot também valoriza nomes compreensíveis e ingredientes relevantes. Não adoto suas promessas comerciais como resultados garantidos. Para o Rizz, a estrutura útil é nome do prato, composição que não esteja evidente no nome, quantidade ou acompanhamento e preço. [Orientações para descrições de cardápio](https://www.menucoverdepot.com/resource-center/articles/how-to-write-menu-descriptions/).

### Síntese editorial

Estas são decisões para este projeto, inferidas da pesquisa e da auditoria:

1. A identidade começa pela especialidade e pela cidade.
2. O desejo de experimentar vem de pratos reais, boas imagens e combinações compreensíveis.
3. Adjetivos sensoriais podem aparecer quando descrevem o preparo confirmado. Não precisam preencher todas as frases.
4. A confiança depende de preços, horários, nomes, links e promessas consistentes.
5. Cada seção deve acrescentar uma informação. Repetir cozinha, criações e experiência em várias telas não desenvolve uma narrativa.
6. O botão deve dizer o que acontece ao clicar.
7. Fotos mostram o ambiente; o texto explica a proposta ou ajuda a organizar a visita.
8. AIDA e outras fórmulas podem ajudar a organizar atenção e ação, mas não justificam fabricar urgência, exclusividade ou popularidade.

## 3. Apuração do restaurante

| Informação | Evidência consultada | Decisão editorial |
| --- | --- | --- |
| Nome Rizz Cucina & Vino | Marca no projeto e perfil oficial | Manter a grafia da marca. |
| Cozinha contemporânea e especialidade em risotos | Captura enviada pelo usuário e resultado público do perfil oficial | Usar como núcleo da apresentação. |
| Espírito Santo do Pinhal | Captura enviada, perfil e dados locais | Mostrar já na abertura. |
| Endereço na Rua Coronel Joaquim Vergueiro, 87 | Captura enviada e `lib/site.ts` | Manter; preferir nome por extenso nos blocos de contato. |
| 17 anos de história | Bio da captura e resultado indexado do Instagram | É o que a bio informa. Confirmar aniversário e ano de abertura antes de tornar o número uma chamada permanente. Não deduzir automaticamente um ano de fundação. |
| Vinhos | Nome, bio e referências ao cardápio | Incorporar à narrativa. Não afirmar quantidade, origem de todos os rótulos, premiações ou melhor seleção da região. |
| Executivo de R$ 75,90 | Dados do projeto e trechos públicos indexados dos perfis oficiais | Há convergência, mas os trechos não comprovam vigência. Confirmar preço e condições antes de publicar a oferta. |
| Executivo de segunda a sexta | `data/executivo.ts` e trechos públicos de redes sociais | Diverge da tabela local, que fecha segunda, e da lógica do selo, que considera terça a sexta. Não resolver por suposição. |
| Carnes, massas, peixes e composição dos pratos | `data/menu.ts`, identificado no projeto como transcrição de peças impressas | Base para o rascunho. Nesta revisão não foi possível confrontar todas as receitas e preços com um cardápio oficial vigente. |
| VPJ e Duroc | Marcações por item no cardápio local; `PLANO.md` também registra esse limite | Não transformar identificação de itens em promessa de origem de toda a cozinha. Confirmar o significado autorizado dos selos. |
| Camarão como campeão de vendas | Apenas afirmação no código | Não comprovado. Remover a alegação e apresentar como destaque editorial. |
| Nota 4,6 e 763 avaliações | Registro local com data de 16/09/2026 | Tratar como registro datado até verificação atual. Não apresentar como consulta ao vivo por padrão. |
| Telefone e WhatsApp | `lib/site.ts` e documentação anterior do projeto | Manter provisoriamente. A validação anterior não substitui um teste do canal antes da publicação. |
| Domínio do restaurante | A bio enviada aponta `rizzrestaurante.com.br`; o projeto usa outro domínio como provisório | Corrigir os metadados somente após definir o domínio desta publicação. |

Fontes do restaurante: [Instagram oficial](https://www.instagram.com/rizzcucinaevino/) e [Facebook oficial](https://www.facebook.com/rizzrestaurante/). O Instagram foi consultado por conteúdo público indexado e pela captura fornecida, sem acesso completo ao histórico de publicações ou a Stories. Trechos de busca ajudam a localizar informações, mas não estabelecem sozinhos datas ou condições atuais.

A tentativa de leitura de [rizzrestaurante.com.br](https://rizzrestaurante.com.br/) retornou HTTP 500, sem conteúdo utilizável. Não foi possível conferir a apresentação atual desse site. Resultados de rodízios e festivais não foram tratados como ofertas permanentes.

Os resultados da pesquisa estão salvos em `.firecrawl/copy-*.json` e `.firecrawl/copy-rizz-oficial.md`, pasta já ignorada pelo Git. Os comentários de versões anteriores do projeto foram tratados como registros de trabalho, não como comprovação independente.

## 4. Auditoria dos textos atuais

P0: informação que pode induzir uma decisão errada ou expor bastidores. P1: posicionamento, coerência e clareza. P2: padronização e acabamento.

| Local | Texto ou situação atual | Problema | Tratamento |
| --- | --- | --- | --- |
| Abertura | “Desde sempre no ponto” | Não identifica a casa nem comunica um fato. | P1. Substituir pela cidade. |
| Abertura, galeria, rodapé e metadados | “Criações e releituras” e repetição de cozinha italiana | Abstração repetida; a bio apresenta cozinha contemporânea. | P1. Especialidade em risotos como chamada principal. Influência italiana só como caracterização secundária validada. |
| Faixa de palavras | Risotos, massas, Red Angus, cordeiro, peixes, trufas, vinhos | Mistura categorias, uma identificação de carne e ingrediente. | P2. Usar categorias paralelas ou retirar a faixa se apenas repetir o cardápio. |
| Manifesto | “O que nos define” | O título promete identidade; os blocos mostram ingredientes e cortes. | P1. Substituir por apresentação da cozinha e dos vinhos, com função clara. |
| Manifesto | Carnaroli e preparo “na hora, nunca antes” | Processo e variedade do arroz não demonstrados nesta apuração. | P0. Excluir até confirmação da cozinha. |
| Manifesto e rodapé | Rastreabilidade “do campo ao prato” | Amplia o alcance dos selos sem evidência. | P0. Remover a promessa geral. |
| Manifesto | Combinações que o cliente não encontra em outro lugar | Exclusividade não comprovada. | P0. Excluir. |
| Destaque de camarão | “O mais pedido da casa” no título e no selo | Popularidade apresentada como fato sem dados. | P0. Usar “Em destaque”. |
| Destaque de camarão | “o que mais volta” | Pode sugerir devolução de prato. | P1. Eliminar. |
| Destaque de camarão | “empanado na hora” e creme que “amarra tudo” | Processo não apurado e linguagem pouco informativa. | P1. Descrever composição e acompanhamentos. |
| Carrossel | “Alguns favoritos” | Sugere preferência de clientes; a seleção foi feita por disponibilidade de fotos. | P1. “Uma seleção do cardápio”. |
| Carrossel | Card de risoto sem a palavra risoto | Fora da categoria original, alguns nomes perdem contexto. | P1. Acrescentar “Risoto de” apenas na apresentação isolada. |
| Ambiente | “Um pedaço de uma noite qualquer” | Chamada vaga e limitada ao jantar. | P1. “Conheça o Rizz”. |
| Ambiente | Tijolo, claraboia, adega na parede e chopp | Legenda extensa da imagem, com pouca utilidade para a visita. | P1. Trocar por convite curto e acesso ao Instagram ou à reserva. |
| Executivo | “todo dia útil” e “Segunda a sexta” | Incompatível com a tabela que fecha segunda e o selo que começa terça. | P0. Confirmar e unificar dados, texto e estados. |
| Executivo | Avulsos a partir de R$ 39,90 | A lista contém talharim a R$ 39,00. | P0. Confirmar os valores. Não escolher um deles por conveniência. |
| Executivo | “Mais de 20 opções” | São 22 itens somando entradas, pratos e sobremesas; só 13 são pratos principais. | P1. Preferir explicar as três etapas do menu. |
| Executivo | Pratos que não são “versão reduzida de nada” | Promete equivalência de porção e composição sem comprovação. | P0. Remover. |
| Executivo | “qualquer entrada + prato + sobremesa” | “Qualquer” pode incluir o cardápio inteiro na interpretação do visitante. | P1. Restringir a escolha às opções do executivo. |
| Vinhos | QR Code nas mesas, carta que muda frequentemente e publicação “em breve” | Há registro de QR Code em uma peça, mas isso não comprova localização, rotina de atualização ou prazo. | P0. Mostrar o acesso real disponível. |
| Vinhos | “Para a equipe” e instruções de `cartaVinhosUrl` | Bastidores de desenvolvimento expostos ao cliente. | P0. Remover da interface pública. |
| Avaliações | Instruções de chave da API e limite da integração | Informação técnica no lugar de orientação ao visitante. | P0. Remover da interface pública. |
| Avaliações | “Ver todas” abre uma página com seleção | O destino não entrega o que o botão promete. | P0. “Ver todas no Google” deve abrir o perfil do Google. |
| Avaliações | “Depoimentos recentes” | O código não garante ordem cronológica e filtra notas máximas. | P0. Usar “Comentários de clientes” ou “Seleção de avaliações”. |
| Avaliações | “nada aqui é inventado” | Defesa desnecessária que introduz desconfiança. | P1. Mostrar fonte e data, sem autojustificativa. |
| Reservas | “Guarde sua mesa” | Formulação pouco natural e aparência de confirmação imediata. | P1. “Solicite sua reserva”. |
| Reservas | “Como devemos chamar?” | Falta o complemento; o campo só precisa orientar o preenchimento. | P2. “Seu nome”. |
| Busca | “pratos encontrados” inclui bebidas | Contagem usa uma categoria errada. | P1. “itens encontrados”. |
| Busca sem resultado | “Tente afrouxar um deles” | Expressão pouco clara para alterar filtros. | P2. “Tente outro termo ou limpe os filtros.” |
| Filtros de preço | Números sem moeda e faixa “60 a 90” | A faixa intermediária exclui 60, embora o rótulo não esclareça. | P2. Incluir R$ e explicitar o limite. |
| Selos interativos | “Mostrar todos os pratos” ao desligar uma etiqueta | Outros filtros podem continuar ativos. | P1. “Remover filtro: [nome]”. |
| Rodapé e navegação móvel | “Home” | Vocabulário diferente do restante da interface. | P2. “Início”. |
| Privacidade | Métricas agregadas e armazenamento para lembrar a abertura | Não foi encontrada integração de métricas no código inspecionado; a regra de sessão do preloader foi retirada. | P0. Conferir também a hospedagem e ajustar a descrição ao comportamento real. |
| Metadados | Domínio presumido e apresentação diferente da bio | Resultados de busca e compartilhamentos podem carregar identidade e endereço incorretos. | P0. Unificar com os dados confirmados da publicação. |
| Textos alternativos | Descrições longas de fotos e pratos | Descrever imagem é apropriado para acessibilidade, mas não deve virar argumento comercial. | P2. Tornar os textos alternativos objetivos e fiéis, sem eliminar sua função. |

## 5. Voz e regras de escrita

- Português brasileiro, acolhedor, direto e cuidadoso.
- Sem travessões nos textos escritos para o site, inclusive metadados, selos, títulos acessíveis e mensagens prontas.
- Períodos curtos. Pontos, vírgulas e dois-pontos resolvem a pontuação.
- Preferir “Conheça o cardápio”, “Consulte os vinhos” e “Solicite sua reserva” a promessas grandiosas.
- Não usar como preenchimento: experiência única, inesquecível, explosão de sabores, paixão em cada detalhe, viagem de sabores, sofisticação que encanta ou tradição e inovação sem uma explicação concreta.
- Não inventar família fundadora, receitas de gerações, chef premiado, produção artesanal, origem local, frescor diário, preparo sob pedido ou atendimento especializado.
- Não usar “o melhor”, “o mais pedido”, “exclusivo” ou “o preferido” sem comprovação adequada.
- Distinguir voz da marca de voz do cliente. Avaliações autênticas não devem ser reescritas para retirar pontuação ou adequar o estilo.
- Usar “Rizz Cucina & Vino” na primeira identificação e “Rizz” nas demais.
- Padronizar horários em texto como “11h às 14h30” e preços como “R$ 75,90”.
- A grafia dos nomes oficiais dos pratos deve ser preservada. Correções como “pera”, “alho-poró”, “pimenta-do-reino” e unidades devem ser conferidas na revisão final.

## 6. Proposta completa para a página inicial

Os textos abaixo são uma proposta editorial. Nomes e composições se baseiam no cardápio do projeto; disponibilidade, preços e condições seguem as pendências da seção 3.

### Abertura

Identificação: logo do Rizz Cucina & Vino.

Linha de localização: **Espírito Santo do Pinhal, SP**

Chamada principal: **Especialidade em risotos.**

Texto de apoio: **Cozinha contemporânea e vinhos para acompanhar seu almoço ou jantar.**

Botão principal: **Ver cardápio**

Botão secundário, com destino à página de reservas: **Reservar mesa**

Se o botão continuar abrindo o WhatsApp diretamente, usar **Reservar pelo WhatsApp**. Não usar o mesmo rótulo para destinos diferentes sem indicação do canal.

Manter o indicador de funcionamento somente após resolver os horários. Incluir acesso curto a **Horários e endereço**, sem obrigar a percorrer todas as cenas.

Título acessível: **Rizz Cucina & Vino. Restaurante em Espírito Santo do Pinhal.**

### Galeria de apresentação

Legenda: **Conheça a casa**

Texto: **Rizz Cucina & Vino, em Espírito Santo do Pinhal.**

Não acrescentar uma descrição de cada detalhe do salão. Se a localização já estiver visível junto à galeria, basta a legenda.

### Faixa de categorias

Se for mantida: **Risotos · Massas · Carnes · Peixes · Sobremesas · Vinhos**

É um resumo da oferta, sem funcionar como manifesto. Não é necessário criar uma frase de apoio.

### Apresentação que substitui “O que nos define”

Rótulo: **Nossa cozinha**

Título: **Conheça o Rizz à mesa**

Bloco 1: **Especialidade em risotos**

Texto: **Conheça as combinações do nosso cardápio, como pera com gorgonzola e nozes ou camarão com aspargos e toast de queijo coalho.**

Bloco 2: **Cozinha contemporânea**

Texto: **O cardápio também reúne entradas, massas, carnes, peixes e sobremesas.**

Bloco 3: **Vinhos para acompanhar**

Texto: **Converse com a equipe para conhecer os rótulos disponíveis.**

Botão: **Ver cardápio**

Decisão de coerência visual: a imagem de trufa não deve continuar junto ao bloco de vinhos. Usar uma fotografia real adequada ou transformar o conjunto em um bloco breve, sem terceira imagem. A nova estrutura não precisa manter três telas de rolagem apenas para acomodar três frases. A apresentação deve ser proporcional à quantidade de informação.

Não abrir uma seção de história com datas, fundadores ou valores inventados. Após a confirmação dos 17 anos, a apresentação pode ganhar um parágrafo histórico com fatos fornecidos pela casa, sem substituir as informações de cardápio.

### Prato em destaque

Rótulo: **Em destaque**

Título: **Camarão rosa empanado**

Descrição: **Servido com risoto de alho-poró e creme de Catupiry.**

Preço: valor vigente do mesmo item no cardápio, sem duplicação manual.

Botão: **Ver no cardápio**

Selo, caso seja mantido: **RIZZ CUCINA & VINO · EM DESTAQUE ·**

O nome completo do prato continua preservado na página de cardápio. Não acrescentar outro parágrafo que repita título e ingredientes. “Criação Rizz” não deve entrar no selo desse prato só porque ele ganhou destaque: o cadastro atual não o identifica com essa etiqueta.

### Seleção de pratos

Rótulo: **Do cardápio**

Título: **Outras sugestões para sua mesa**

Botão: **Ver cardápio completo**

Os sete cards atuais podem manter os pratos, sujeitos à confirmação da carta vigente. Ajustar os nomes somente para compreensão fora da categoria:

| Card | Nome de apresentação |
| --- | --- |
| Ancho com açafrão | Ancho Red Angus com risoto de açafrão trufado |
| Cordeiro | Lombo de cordeiro com creme de batatas e molho de hortelã |
| Risoto de alho negro | Risoto de alho negro trufado com funghi e brie |
| Camarão com pesto | Camarão rosa com massa ao pesto e farofa de pistache |
| Ancho com talharim | Ancho Red Angus com talharim na fonduta de parmesão e presunto Parma |
| Filé com Syrah | Filé mignon na redução de Syrah da Mantiqueira com cogumelos e risoto de parmesão |
| Filé à milanesa | Filé mignon à milanesa ao pomodoro com risoto de brie |

Manter acompanhamentos e informações de finalização; eliminar repetições entre nome, descrição e selo quando não acrescentarem nada. Verificar a correspondência entre cada foto e o prato. O texto não deve tentar corrigir uma fotografia de outro prato.

### Ambiente e Instagram

Rótulo: **A casa**

Título: **Conheça o Rizz**

Texto: **Venha almoçar ou jantar com a gente. No Instagram, você acompanha as novidades do restaurante.**

Botões: **Reservar mesa** e **Acompanhar no Instagram**

Se esse bloco e a primeira galeria ficarem repetitivos, concentrar o convite aqui e deixar a galeria inicial apenas visual. Não preencher o espaço com uma lista de objetos do salão.

### Almoço executivo

Rótulo: **Almoço executivo**

Título: **Entrada, prato principal e sobremesa**

Texto: **Monte seu almoço escolhendo uma entrada, um prato principal e uma sobremesa entre as opções do menu executivo.**

Preço completo: **Menu completo por pessoa: R$ [valor confirmado]**

Avulsos: **Pratos principais a partir de R$ [menor preço confirmado]**

Serviço: **[Dias confirmados], das [abertura] às [encerramento].**

Botão: **Ver menu executivo**

Nota, apenas se necessária: **Consulte a equipe sobre as opções disponíveis no dia.**

Alternativa provisória caso os dados não sejam confirmados: **Consulte as opções e os valores do almoço executivo com a equipe.** Botão: **Consultar executivo pelo WhatsApp**. Nesse estado, ocultar a oferta detalhada ainda contraditória. Os campos entre colchetes são instruções para preenchimento, nunca textos para publicação.

### Avaliações

Rótulo: **Avaliações**

Título: **O que nossos clientes dizem**

Com comentários disponíveis: apresentar os textos originais, autor, nota, data e identificação do Google. Identificar o conjunto como seleção quando houver filtro.

Sem comentários disponíveis no site: **Leia as avaliações dos clientes no perfil do Rizz no Google.**

Botão: **Ver avaliações no Google**

Se houver uma nota armazenada sem atualização automática comprovada: **Dados consultados em [data da conferência].** Se não houver evidência suficiente para a nota, mostrar apenas o convite ao Google.

### Localização e funcionamento

Rótulo: **Planeje sua visita**

Título: **Horários e endereço**

Endereço: **Rua Coronel Joaquim Vergueiro, 87, Centro, Espírito Santo do Pinhal, SP.**

Rótulo do contato: **Telefone e WhatsApp**, se ambos forem confirmados para o número.

Botões: **Como chegar** e **Reservar pelo WhatsApp**

Manter a tabela completa de horários, após confirmação. Não escrever um parágrafo para repetir os dados da tabela.

## 7. Páginas internas

### Cardápio

Título: **Cardápio**

Introdução: **Conheça os pratos, acompanhamentos e bebidas do Rizz.**

Link para a página de vinhos sem carta disponível: **Consultar vinhos**. Quando a carta estiver disponível, usar **Carta de vinhos**.

Descrições de categoria:

| Categoria | Texto proposto |
| --- | --- |
| Entradas | Para começar a refeição. |
| Saladas | Não precisa de introdução. Os ingredientes de cada salada já cumprem essa função. |
| Risotos | Nossa especialidade, em diferentes combinações. |
| Carne bovina | Confira os cortes e os acompanhamentos de cada prato. |
| Cordeiro | Não precisa de introdução adicional. |
| Peixes e frutos do mar | Não precisa de introdução adicional. |
| Sobremesas | Para encerrar a refeição. |
| Bebidas | Para conhecer os vinhos disponíveis, consulte a equipe. |

Os nomes, ingredientes, quantidades e preços dos itens foram incluídos na leitura de `data/menu.ts` e `data/executivo.ts`. A recomendação é preservar o conteúdo factual dos itens e revisar a transcrição, sem recriar dezenas de receitas como publicidade. Não há base suficiente nesta pesquisa para validar cada receita como oferta vigente.

Orientações para todos os itens:

- Manter quantidades, acompanhamentos e observações úteis, como “8 unidades”, “acompanha pão italiano” e “servido frio”.
- Não substituir “trufado” por uma afirmação sobre trufa fresca, lâminas ou espécie. Confirmar o ingrediente antes de ampliar a descrição.
- Identificações de vegetariano, VPJ, Duroc e criação da casa precisam corresponder ao item e à ficha fornecida pelo restaurante.
- “Massa” não autoriza afirmar massa fresca ou fabricação própria.
- “Artesanal” permanece somente onde fizer parte do nome ou informação confirmada da casa.
- Evitar duplicar “Risoto de” dentro de uma categoria já chamada Risotos; acrescentar o contexto nos cards isolados.
- Corrigir ortografia sem alterar a composição: pera, alho-poró, pimenta-do-reino e unidades como “350 ml”.
- Não inventar preço para o brownie. Texto: **Consulte o valor com a equipe.**
- O conjunto “Massas” aparece na comunicação, mas está distribuído por outras categorias. Planejar um caminho de navegação para encontrá-las, sem duplicar cadastros ou inventar pratos.

Fechamento da página: **Gostou de algum prato? Planeje sua visita.**

Botões: **Reservar mesa** e **Horários e endereço**

Bloco executivo: reutilizar o texto e os dados confirmados da página inicial. A nota “valores sujeitos a alteração” não resolve valores contraditórios publicados simultaneamente.

### Reservas

Título: **Solicite sua reserva**

Introdução: **Preencha os dados para preparar sua mensagem no WhatsApp. A equipe confirma a disponibilidade e a reserva na conversa.**

| Campo ou mensagem | Texto proposto |
| --- | --- |
| Nome | Seu nome |
| Quantidade | Número de pessoas |
| Data | Data da visita |
| Horário | Horário desejado |
| Campo livre | Observações (opcional) |
| Exemplo no campo livre | Conte se há alguma preferência ou informação para a equipe. |
| Antes de continuar | Você poderá revisar e enviar a mensagem no WhatsApp. A reserva será confirmada pela equipe. |
| Botão | Continuar no WhatsApp |
| Alternativa de contato | Se preferir, ligue para [telefone confirmado]. |

Mensagem preparada:

> Olá! Gostaria de consultar a disponibilidade de uma mesa no Rizz.
>
> Nome: [nome]
>
> Número de pessoas: [quantidade]
>
> Data: [data]
>
> Horário desejado: [horário]
>
> Observações: [somente se preenchidas]

Não mostrar “Reserva confirmada” quando apenas abrir o WhatsApp. Data e horário não são obrigatórios no formulário atual. Se continuarem opcionais, indicar “opcional” ou “se já souber”; não descrever a mensagem como uma solicitação completa garantida.

Não prometer mesa específica, tolerância de atraso, resposta imediata, acessibilidade física, estacionamento, atendimento a grupos ou adaptação de pratos sem informações da operação.

### Vinhos

Estado atual, sem carta publicada:

Título: **Vinhos**

Texto: **Para conhecer os rótulos e valores disponíveis, fale com a equipe do Rizz.**

Botão principal: **Consultar vinhos pelo WhatsApp**

Botão secundário: **Ver cardápio**

Mensagem: **Olá! Gostaria de consultar os vinhos disponíveis no Rizz.**

Estado com carta publicada:

Título: **Carta de vinhos**

Texto: **Consulte os rótulos e valores na nossa carta de vinhos.**

Botão: **Abrir carta de vinhos**

Não mencionar QR Code, renovação frequente, seleção nacional e importada ou futura publicação sem confirmação. Retirar integralmente o bloco com orientações para desenvolvimento.

### Avaliações

Título: **Avaliações de clientes**

Introdução: **Veja o que os clientes contam sobre a visita ao Rizz.**

Com uma seleção de comentários: **Comentários publicados no Google**.

Se continuar o filtro de notas máximas, apresentar como **Seleção de avaliações do Google**. A nota geral e os comentários selecionados são informações diferentes; não dizer que a lista representa todos os comentários.

Sem comentários carregados: **Você pode ler as avaliações no perfil do restaurante no Google.**

Botão: **Ver todas as avaliações no Google**

Convite ao final: **Já visitou o Rizz? Conte como foi.**

O link atual leva a uma busca pelo perfil. Enquanto não houver um link validado para iniciar a avaliação, usar **Abrir perfil no Google**. Com o destino de avaliação validado, usar **Avaliar no Google**.

Não apresentar avisos de configuração, nomes de variáveis, erros HTTP ou explicações sobre limites da API. Quando houver nota estática, incluir sua data de conferência.

### Privacidade

Esta página precisa de verificação factual da aplicação e da hospedagem antes da redação definitiva. A revisão editorial não deve declarar conformidade jurídica nem inferir práticas apenas pelo código.

Título sugerido: **Privacidade**

Organização proposta:

1. **Navegação no site.** Informar a ausência de cadastro somente se isso continuar verdadeiro.
2. **Solicitações pelo WhatsApp.** Explicar que os campos preparam uma mensagem e que a reserva é tratada na conversa. Evitar a garantia absoluta de que os dados “ficam no aparelho até o envio”: a abertura do link já envolve um serviço externo.
3. **Serviços de terceiros.** Identificar o mapa incorporado e os destinos de Instagram, Facebook, Google e WhatsApp conforme o uso real, com links para as políticas correspondentes quando necessário.
4. **Dados técnicos e armazenamento.** Confirmar logs de hospedagem, métricas e recursos de terceiros. Remover a afirmação sobre armazenamento da abertura, que não corresponde ao preloader inspecionado.
5. **Contato.** Informar o canal responsável por dúvidas sobre dados.

Trecho de reservas proposto, sujeito à validação do fluxo: **Ao continuar, o site abre o WhatsApp com uma mensagem preparada a partir dos dados preenchidos. Você pode revisar a mensagem antes de enviá-la. O atendimento à solicitação acontece pelo WhatsApp.**

O conteúdo sobre métricas e cookies fica pendente até confirmar os serviços utilizados. Não preencher essa lacuna com um texto genérico.

## 8. Microtextos, navegação e acessibilidade

| Elemento | Texto ou regra proposta |
| --- | --- |
| Navegação para a página inicial | Início |
| Navegação principal | Cardápio, Vinhos, Reservas, Horários e endereço, conforme o espaço disponível |
| Avaliações na navegação | Manter acesso; não precisam ter mais destaque que informações práticas da visita |
| Busca | Buscar prato, bebida ou ingrediente |
| Nome acessível da busca | Buscar no cardápio |
| Filtro de preço 1 | Até R$ 60 |
| Filtro de preço 2 | Acima de R$ 60 até R$ 90 |
| Filtro de preço 3 | Acima de R$ 90 |
| Limpeza | Limpar filtros e busca |
| Resultado singular | 1 item encontrado |
| Resultado plural | [n] itens encontrados |
| Sem filtro | [n] itens no cardápio |
| Sem resultado | Nenhum item encontrado. Tente outro termo ou limpe os filtros. |
| Ativar etiqueta | Filtrar por: [nome] |
| Desativar etiqueta | Remover filtro: [nome] |
| Selo vegetariano | Vegetariano, após confirmação do item |
| Selo da casa | Criação Rizz, somente onde confirmado |
| Selo trufado | Trufado; detalhar ingrediente apenas após confirmação |
| Identificação VPJ ou Duroc | Reproduzir a identificação confirmada, sem acrescentar rastreabilidade geral |
| Restaurante aberto | Aberto agora. [Serviço] até [horário]. |
| Antes do próximo serviço | Abrimos às [horário]. |
| Fechado no dia | Fechado hoje. Próximo atendimento: [dia e horário confirmados]. |
| Executivo em serviço | Executivo disponível agora |
| Executivo fora do serviço | Executivo: [dias e horários confirmados] |
| Botão flutuante | WhatsApp; nome acessível “Consultar reserva pelo WhatsApp” |
| Link do logo | Rizz Cucina & Vino. Página inicial. |
| Mapa | Localização do Rizz Cucina & Vino |
| Atalho acessível | Pular para o conteúdo |
| Rodapé, descrição da marca | Cozinha contemporânea, especialidade em risotos e vinhos em Espírito Santo do Pinhal. |
| Rodapé, navegação | Explore o Rizz |
| Rodapé, contato | Contato |
| Rodapé, política | Privacidade, se esse for o título final da página |

Textos alternativos devem descrever o conteúdo relevante de cada imagem real. Exemplos, após conferir a imagem: “Salão do Rizz Cucina & Vino” e “Camarão rosa empanado com risoto de alho-poró”. Detalhes de arquitetura podem ser úteis nesse contexto de acessibilidade. A restrição é não convertê-los automaticamente em argumento de venda.

Imagens decorativas não precisam repetir o texto ao lado. Imagens geradas ou ilustrativas não devem receber descrições que as apresentem como registro real de um prato servido ou de um processo de cozinha.

## 9. Buscadores e compartilhamento

| Página | Título proposto | Descrição proposta |
| --- | --- | --- |
| Inicial | Rizz Cucina & Vino em Espírito Santo do Pinhal | Cozinha contemporânea, especialidade em risotos e vinhos em Espírito Santo do Pinhal. Conheça o cardápio e consulte horários e reservas. |
| Cardápio | Cardápio · Rizz Cucina & Vino | Conheça os pratos e bebidas do Rizz Cucina & Vino em Espírito Santo do Pinhal e consulte as opções do almoço executivo. |
| Reservas | Reservas · Rizz Cucina & Vino | Consulte a disponibilidade de mesas no Rizz pelo WhatsApp. Veja o endereço e os horários para planejar sua visita. |
| Vinhos sem carta | Vinhos · Rizz Cucina & Vino | Fale com a equipe do Rizz para conhecer os vinhos e valores disponíveis. |
| Vinhos com carta | Carta de vinhos · Rizz Cucina & Vino | Consulte a carta de vinhos do Rizz Cucina & Vino. |
| Avaliações | Avaliações · Rizz Cucina & Vino | Acesse as avaliações de clientes do Rizz Cucina & Vino no Google. |
| Privacidade | Privacidade · Rizz Cucina & Vino | Informações sobre privacidade, contato e serviços utilizados no site do Rizz. |

Usar as mesmas descrições essenciais nos compartilhamentos, sem criar promessas mais fortes para redes sociais. Confirmar domínio canônico, telefone, horários e demais dados estruturados. Não mudar apenas o texto visível e deixar informações antigas nos metadados.

## 10. Sequência de implementação

### Etapa 1: corrigir conteúdo sem depender de novas informações

- Remover instruções técnicas das páginas públicas.
- Retirar alegações de mais pedido, exclusividade, rastreabilidade geral e equivalência de porções.
- Substituir as descrições decorativas do ambiente.
- Corrigir rótulos de busca, contagens, filtros e navegação.
- Aplicar a regra de pontuação a textos próprios, metadados e acessibilidade.
- Ajustar a linguagem de reserva para solicitação e confirmação pela equipe.

### Etapa 2: confirmar os fatos operacionais

Confirmar com a casa: dias e horários, oferta do executivo, preço completo, menor preço avulso, cardápio vigente, carta de vinhos, canal de reserva, data de abertura e uso correto dos selos. Confirmar também domínio desta publicação e práticas reais de tratamento de dados.

Essas pendências não impedem a revisão de todos os textos independentes delas. Onde houver oferta não confirmada, usar o acesso à equipe sem publicar números ou horários contraditórios.

### Etapa 3: aplicar a narrativa e conectar as páginas

Arquivos principais: `components/home/*`, `components/layout/*`, `components/menu/MenuClient.tsx`, `components/reservas/FormReserva.tsx`, `components/ui/Selos.tsx`, `components/ui/BadgeExecutivo.tsx`, `app/*/page.tsx`, `app/layout.tsx`, `data/menu.ts`, `data/executivo.ts`, `lib/site.ts` e `lib/hours.ts`.

Manter preço e composição compartilhados entre cardápio e destaques. Ajustar imagem e seção juntas quando a função editorial mudar. Um texto sobre vinhos não deve permanecer ao lado de uma imagem de trufa apenas para reaproveitar o componente.

Antes de editar a aplicação, ler a documentação relevante da versão instalada do Next.js conforme `AGENTS.md`.

### Etapa 4: revisar no contexto real

- Conferir a leitura completa no celular e no desktop, incluindo textos que aparecem durante a rolagem.
- Verificar se títulos longos, preços e botões continuam cabendo e legíveis nas cenas animadas.
- Abrir cada chamada para confirmar que rótulo e destino correspondem.
- Conferir estados sem resultado, sem carta, sem avaliações e fora do horário.
- Revisar informações repetidas entre página inicial, cardápio, reservas, rodapé e metadados.
- Confirmar que todas as datas, valores e horários publicados têm fonte ou responsável identificado.
- Conferir a distinção entre conteúdo próprio e depoimentos originais.
- Buscar travessões nos textos próprios; não alterar citações de clientes para atender a uma regra de estilo da marca.
- Rodar as verificações do projeto após a implementação. Nenhum teste da aplicação é necessário apenas para este documento.

## 11. Critério de aprovação editorial

Cada texto deve responder positivamente a quatro perguntas: comunica algo útil para a visita, corresponde ao que o Rizz oferece, combina com o título e a imagem da seção e leva a uma ação cujo destino cumpre a promessa?

Se a frase não informa, não ajuda a escolher e não expressa uma característica real da casa, ela pode ser retirada. Não é necessário substituir todo espaço por outra frase.
