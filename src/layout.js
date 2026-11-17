// Documento HTML base de todas as páginas: head (SEO, fontes, tokens de identidade),
// barra de aviso, topo fixo, menu do celular, rodapé e scripts.
// Também concentra o que é compartilhado entre as páginas: rótulos, ícones,
// derivação de cores da identidade e componentes (item da grade, tabela, migalhas).
//
// Assinatura do contrato:
//   layout({ ctx, titulo, descricao, caminho, ogImagem, corpo, jsonLd, classeBody }) -> string
// Campos extras opcionais: preload ({ href, srcset, sizes, media? } da imagem LCP, ver
//   preloadImagem, ou uma lista deles, um por orientação de tela),
//   noindex (true na 404), tituloCompleto (substitui "titulo | marca"),
//   whats ({ href, tipo }: mensagem de WhatsApp da página, usada no topo, no menu e no rodapé;
//   tipo "produto" na página da peça, "geral" no resto),
//   ancoraMedidas (href do item "Medidas" do topo, menu e rodapé; na peça, "#medidas-peca").

"use strict";

const path = require("path");
const imagens = require("./imagens.js");

// ---------- rótulos únicos por intenção (um texto por ação em todo o site) ----------

const ROTULOS = {
  contato: "Pedir no WhatsApp",
  catalogo: "Ver a coleção",
  politica: "Ler a política de trocas",
  maisItens: "Ver todas as peças",
  esgotado: "Avisar quando voltar",
  semPreco: "Preço pelo WhatsApp",
  semPrecoColecao: "Consulte os valores pelo WhatsApp.",
  troca: "Falar sobre uma troca",
  ajudaTamanho: "Pedir ajuda com o tamanho",
  verVideo: "Ver o vídeo",
  verVideos: "Ver vídeos",
  verPecas: "Ver peças",
  verTudo: "Ver tudo",
  seguir: "Seguir no Instagram",
  novidades: "Quero receber novidades",
  favoritas: "Enviar favoritas no WhatsApp",
  favoritos: "Favoritos",
  salvar: "Salvar nos favoritos",
  buscar: "Buscar",
  menu: "Menu",
  fechar: "Fechar"
};

// Frases padrão da barra de topo (quando conteudo.barraTopo não existir).
const BARRA_TOPO_PADRAO = ["Atendimento direto pelo WhatsApp", "Veja cada peça em vídeo", "Ajuda para escolher o tamanho"];

// Mensagem do link de WhatsApp no estado vazio da busca ({termo} = o que a pessoa buscou).
const MENSAGEM_BUSCA = "Olá! Procurei por \"{termo}\" no site e não encontrei. Vocês têm alguma peça assim?";

const FONTES_PADRAO = { titulo: "Jost", texto: "Instrument Sans" };
const FALLBACK_FONTE = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
// Famílias com serifa caem para Georgia (e não para Arial) enquanto a fonte do Google não chega.
const FAMILIAS_SERIFADAS = ["DM Serif Display"];
const FALLBACK_SERIFA = 'Georgia, "Times New Roman", serif';

// Face do nome da marca (wordmark, assinatura do rodapé, @ do Instagram e o nome dentro de textos).
// IBM Plex Sans tem "l" minúsculo com cauda e "I" maiúsculo com serifa: "ltmodasestilo" não vira
// "Itmodasstio", como acontece na Bricolage e na Instrument Sans. Pedida ao Google só com os glifos
// do nome e do @ (&text=), o que deixa cada peso com poucos KB.
const FONTE_MARCA = { familia: "IBM Plex Sans", pesos: "400;500;600" };

// Eixos pedidos ao Google para a fonte de título (padrão: pesos 400, 500 e 600).
// Bricolage Grotesque tem eixo de tamanho óptico: fixar o corte 48 deixa o arquivo latino
// em cerca de 41 KB; a faixa inteira (12..96) quase dobra o peso. Títulos só usam 500 e 600.
// DM Serif Display só existe no peso 400: pedir 500 ou 600 derrubaria a folha inteira,
// então ela vai sem eixo (o Google devolve o 400).
const EIXOS_TITULO = { "Bricolage Grotesque": "opsz,wght@48,500..600", "DM Serif Display": "" };

// Fallback local com size-adjust medido para a troca de fonte não mudar a quebra de linha
// (largura do texto na fonte real dividida pela largura na fonte local, medida no navegador:
// h1 do hero para as de título, cinco frases de corpo para a Instrument Sans).
// local: fonte do sistema usada no lugar (Arial, ou Georgia para as serifadas).
const AJUSTE_FALLBACK = {
  "Schibsted Grotesk": { local: "Arial", ajuste: "103%" },
  "Bricolage Grotesque": { local: "Arial", ajuste: "102%" },
  "Instrument Sans": { local: "Arial", ajuste: "101%" },
  "DM Serif Display": { local: "Georgia", ajuste: "100%" }
};

const CORES_PADRAO = { fundo: "#f6f4f0", tinta: "#151413", acento: "#1e6b43" };

// Valor de sizes de cada layout de foto (em px reais de CSS, ver style.css).
const TAMANHOS = {
  grade: "(min-width: 1280px) 395px, (min-width: 1024px) calc(33vw - 32px), (min-width: 640px) calc(50vw - 30px), calc(50vw - 22px)",
  gradeTres: "(min-width: 1280px) 395px, (min-width: 1024px) calc(33vw - 32px), (min-width: 640px) calc(50vw - 30px), calc(50vw - 22px)",
  quatro: "(min-width: 1280px) 290px, (min-width: 1024px) calc(25vw - 30px), (min-width: 640px) calc(50vw - 30px), calc(50vw - 22px)",
  faixa: "(min-width: 1280px) 290px, (min-width: 1024px) calc(25vw - 30px), 62vw",
  galeria: "(min-width: 1024px) 540px, 100vw",
  hero: "(min-width: 1024px) 570px, 100vw",
  sobre: "(min-width: 1024px) 400px, 78vw",
  video: "(min-width: 1024px) 216px, 42vw"
};

// ---------- ícones ----------
// WhatsApp do Simple Icons; list, x e plus do Phosphor (traço 16 em 256, peso regular);
// play, pause, som, setas, busca, Instagram, WhatsApp de traço, câmera de vídeo, régua,
// setas de troca, caminhão, cartão, porcentagem, coração (regular e cheio), seta longa e
// lixeira copiados de @phosphor-icons/core 2.1.1 (regular e fill). Nenhum desenhado à mão.

const CAMINHO_WHATSAPP = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z";

function iconeTraco(linhas, tamanho) {
  return `<svg aria-hidden="true" focusable="false" width="${tamanho}" height="${tamanho}" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">${linhas
    .map(([x1, y1, x2, y2]) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`)
    .join("")}</svg>`;
}

const CAMINHOS_PHOSPHOR = {
  playFill: "M240,128a15.74,15.74,0,0,1-7.6,13.51L88.32,229.65a16,16,0,0,1-16.2.3A15.86,15.86,0,0,1,64,216.13V39.87a15.86,15.86,0,0,1,8.12-13.82,16,16,0,0,1,16.2.3L232.4,114.49A15.74,15.74,0,0,1,240,128Z",
  play: "M232.4,114.49,88.32,26.35a16,16,0,0,0-16.2-.3A15.86,15.86,0,0,0,64,39.87V216.13A15.94,15.94,0,0,0,80,232a16.07,16.07,0,0,0,8.36-2.35L232.4,141.51a15.81,15.81,0,0,0,0-27ZM80,215.94V40l143.83,88Z",
  pause: "M200,32H160a16,16,0,0,0-16,16V208a16,16,0,0,0,16,16h40a16,16,0,0,0,16-16V48A16,16,0,0,0,200,32Zm0,176H160V48h40ZM96,32H56A16,16,0,0,0,40,48V208a16,16,0,0,0,16,16H96a16,16,0,0,0,16-16V48A16,16,0,0,0,96,32Zm0,176H56V48H96Z",
  somLigado: "M163.51,24.81a8,8,0,0,0-8.42.88L85.25,80H40A16,16,0,0,0,24,96v64a16,16,0,0,0,16,16H85.25l69.84,54.31A8,8,0,0,0,168,224V32A8,8,0,0,0,163.51,24.81ZM152,207.64,92.91,161.69A7.94,7.94,0,0,0,88,160H40V96H88a7.94,7.94,0,0,0,4.91-1.69L152,48.36ZM208,104v48a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm32-16v80a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Z",
  somDesligado: "M192,152V104a8,8,0,0,1,16,0v48a8,8,0,0,1-16,0Zm40-72a8,8,0,0,0-8,8v80a8,8,0,0,0,16,0V88A8,8,0,0,0,232,80ZM221.92,210.62a8,8,0,1,1-11.84,10.76L168,175.09V224a8,8,0,0,1-12.91,6.31L85.25,176H40a16,16,0,0,1-16-16V96A16,16,0,0,1,40,80H81.55L50.08,45.38A8,8,0,0,1,61.92,34.62ZM152,157.49,96.1,96H40v64H88a7.94,7.94,0,0,1,4.91,1.69L152,207.64ZM125.06,69.31l26.94-21v58.47a8,8,0,0,0,16,0V32a8,8,0,0,0-12.91-6.31l-39.85,31a8,8,0,0,0,9.82,12.63Z",
  setaEsquerda: "M165.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L91.31,128Z",
  setaDireita: "M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z",
  busca: "M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z",
  instagram: "M128,80a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160ZM176,24H80A56.06,56.06,0,0,0,24,80v96a56.06,56.06,0,0,0,56,56h96a56.06,56.06,0,0,0,56-56V80A56.06,56.06,0,0,0,176,24Zm40,152a40,40,0,0,1-40,40H80a40,40,0,0,1-40-40V80A40,40,0,0,1,80,40h96a40,40,0,0,1,40,40ZM192,76a12,12,0,1,1-12-12A12,12,0,0,1,192,76Z",
  whatsappLinha: "M187.58,144.84l-32-16a8,8,0,0,0-8,.5l-14.69,9.8a40.55,40.55,0,0,1-16-16l9.8-14.69a8,8,0,0,0,.5-8l-16-32A8,8,0,0,0,104,64a40,40,0,0,0-40,40,88.1,88.1,0,0,0,88,88,40,40,0,0,0,40-40A8,8,0,0,0,187.58,144.84ZM152,176a72.08,72.08,0,0,1-72-72A24,24,0,0,1,99.29,80.46l11.48,23L101,118a8,8,0,0,0-.73,7.51,56.47,56.47,0,0,0,30.15,30.15A8,8,0,0,0,138,155l14.61-9.74,23,11.48A24,24,0,0,1,152,176ZM128,24A104,104,0,0,0,36.18,176.88L24.83,210.93a16,16,0,0,0,20.24,20.24l34.05-11.35A104,104,0,1,0,128,24Zm0,192a87.87,87.87,0,0,1-44.06-11.81,8,8,0,0,0-6.54-.67L40,216,52.47,178.6a8,8,0,0,0-.66-6.54A88,88,0,1,1,128,216Z",
  videoCamera: "M251.77,73a8,8,0,0,0-8.21.39L208,97.05V72a16,16,0,0,0-16-16H32A16,16,0,0,0,16,72V184a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V159l35.56,23.71A8,8,0,0,0,248,184a8,8,0,0,0,8-8V80A8,8,0,0,0,251.77,73ZM192,184H32V72H192V184Zm48-22.95-32-21.33V116.28L240,95Z",
  regua: "M235.32,73.37,182.63,20.69a16,16,0,0,0-22.63,0L20.68,160a16,16,0,0,0,0,22.63l52.69,52.68a16,16,0,0,0,22.63,0L235.32,96A16,16,0,0,0,235.32,73.37ZM84.68,224,32,171.31l32-32,26.34,26.35a8,8,0,0,0,11.32-11.32L75.31,128,96,107.31l26.34,26.35a8,8,0,0,0,11.32-11.32L107.31,96,128,75.31l26.34,26.35a8,8,0,0,0,11.32-11.32L139.31,64l32-32L224,84.69Z",
  troca: "M224,48V96a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h28.69L182.06,73.37a79.56,79.56,0,0,0-56.13-23.43h-.45A79.52,79.52,0,0,0,69.59,72.71,8,8,0,0,1,58.41,61.27a96,96,0,0,1,135,.79L208,76.69V48a8,8,0,0,1,16,0ZM186.41,183.29a80,80,0,0,1-112.47-.66L59.31,168H88a8,8,0,0,0,0-16H40a8,8,0,0,0-8,8v48a8,8,0,0,0,16,0V179.31l14.63,14.63A95.43,95.43,0,0,0,130,222.06h.53a95.36,95.36,0,0,0,67.07-27.33,8,8,0,0,0-11.18-11.44Z",
  caminhao: "M255.42,117l-14-35A15.93,15.93,0,0,0,226.58,72H192V64a8,8,0,0,0-8-8H32A16,16,0,0,0,16,72V184a16,16,0,0,0,16,16H49a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A7.94,7.94,0,0,0,255.42,117ZM192,88h34.58l9.6,24H192ZM32,72H176v64H32ZM80,208a16,16,0,1,1,16-16A16,16,0,0,1,80,208Zm81-24H111a32,32,0,0,0-62,0H32V152H176v12.31A32.11,32.11,0,0,0,161,184Zm31,24a16,16,0,1,1,16-16A16,16,0,0,1,192,208Zm48-24H223a32.06,32.06,0,0,0-31-24V128h48Z",
  cartao: "M224,48H32A16,16,0,0,0,16,64V192a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V64A16,16,0,0,0,224,48Zm0,16V88H32V64Zm0,128H32V104H224v88Zm-16-24a8,8,0,0,1-8,8H168a8,8,0,0,1,0-16h32A8,8,0,0,1,208,168Zm-64,0a8,8,0,0,1-8,8H120a8,8,0,0,1,0-16h16A8,8,0,0,1,144,168Z",
  porcento: "M205.66,61.64l-144,144a8,8,0,0,1-11.32-11.32l144-144a8,8,0,0,1,11.32,11.31ZM50.54,101.44a36,36,0,0,1,50.92-50.91h0a36,36,0,0,1-50.92,50.91ZM56,76A20,20,0,1,0,90.14,61.84h0A20,20,0,0,0,56,76ZM216,180a36,36,0,1,1-10.54-25.46h0A35.76,35.76,0,0,1,216,180Zm-16,0a20,20,0,1,0-5.86,14.14A19.87,19.87,0,0,0,200,180Z",
  coracao: "M178,40c-20.65,0-38.73,8.88-50,23.89C116.73,48.88,98.65,40,78,40a62.07,62.07,0,0,0-62,62c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,228.66,240,172,240,102A62.07,62.07,0,0,0,178,40ZM128,214.8C109.74,204.16,32,155.69,32,102A46.06,46.06,0,0,1,78,56c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,155.61,146.24,204.15,128,214.8Z",
  coracaoCheio: "M240,102c0,70-103.79,126.66-108.21,129a8,8,0,0,1-7.58,0C119.79,228.66,16,172,16,102A62.07,62.07,0,0,1,78,40c20.65,0,38.73,8.88,50,23.89C139.27,48.88,157.35,40,178,40A62.07,62.07,0,0,1,240,102Z",
  seta: "M221.66,133.66l-72,72a8,8,0,0,1-11.32-11.32L196.69,136H40a8,8,0,0,1,0-16H196.69L138.34,61.66a8,8,0,0,1,11.32-11.32l72,72A8,8,0,0,1,221.66,133.66Z",
  lixeira: "M216,48H176V40a24,24,0,0,0-24-24H104A24,24,0,0,0,80,40v8H40a8,8,0,0,0,0,16h8V208a16,16,0,0,0,16,16H192a16,16,0,0,0,16-16V64h8a8,8,0,0,0,0-16ZM96,40a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96Zm96,168H64V64H192ZM112,104v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm48,0v64a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Z"
};

function iconePreenchido(caminho, tamanho, extra = "") {
  return `<svg aria-hidden="true" focusable="false" width="${tamanho}" height="${tamanho}" viewBox="0 0 256 256" fill="currentColor"${extra}><path d="${caminho}"/></svg>`;
}

const ICONES = {
  whatsapp: (tamanho = 18) =>
    `<svg aria-hidden="true" focusable="false" width="${tamanho}" height="${tamanho}" viewBox="0 0 24 24" fill="currentColor"><path d="${CAMINHO_WHATSAPP}"/></svg>`,
  list: (tamanho = 18) => iconeTraco([[40, 128, 216, 128], [40, 64, 216, 64], [40, 192, 216, 192]], tamanho),
  x: (tamanho = 18) => iconeTraco([[200, 56, 56, 200], [200, 200, 56, 56]], tamanho),
  plus: (tamanho = 16) => iconeTraco([[40, 128, 216, 128], [128, 40, 128, 216]], tamanho),
  playFill: (tamanho = 24, extra) => iconePreenchido(CAMINHOS_PHOSPHOR.playFill, tamanho, extra),
  play: (tamanho = 18, extra) => iconePreenchido(CAMINHOS_PHOSPHOR.play, tamanho, extra),
  pause: (tamanho = 18, extra) => iconePreenchido(CAMINHOS_PHOSPHOR.pause, tamanho, extra),
  somLigado: (tamanho = 20, extra) => iconePreenchido(CAMINHOS_PHOSPHOR.somLigado, tamanho, extra),
  somDesligado: (tamanho = 20, extra) => iconePreenchido(CAMINHOS_PHOSPHOR.somDesligado, tamanho, extra),
  setaEsquerda: (tamanho = 20) => iconePreenchido(CAMINHOS_PHOSPHOR.setaEsquerda, tamanho),
  setaDireita: (tamanho = 20) => iconePreenchido(CAMINHOS_PHOSPHOR.setaDireita, tamanho),
  busca: (tamanho = 20) => iconePreenchido(CAMINHOS_PHOSPHOR.busca, tamanho),
  instagram: (tamanho = 20) => iconePreenchido(CAMINHOS_PHOSPHOR.instagram, tamanho),
  whatsappLinha: (tamanho = 28) => iconePreenchido(CAMINHOS_PHOSPHOR.whatsappLinha, tamanho),
  video: (tamanho = 28) => iconePreenchido(CAMINHOS_PHOSPHOR.videoCamera, tamanho),
  regua: (tamanho = 28) => iconePreenchido(CAMINHOS_PHOSPHOR.regua, tamanho),
  troca: (tamanho = 28) => iconePreenchido(CAMINHOS_PHOSPHOR.troca, tamanho),
  caminhao: (tamanho = 28) => iconePreenchido(CAMINHOS_PHOSPHOR.caminhao, tamanho),
  cartao: (tamanho = 28) => iconePreenchido(CAMINHOS_PHOSPHOR.cartao, tamanho),
  porcento: (tamanho = 28) => iconePreenchido(CAMINHOS_PHOSPHOR.porcento, tamanho),
  coracao: (tamanho = 20, extra) => iconePreenchido(CAMINHOS_PHOSPHOR.coracao, tamanho, extra),
  coracaoCheio: (tamanho = 20, extra) => iconePreenchido(CAMINHOS_PHOSPHOR.coracaoCheio, tamanho, extra),
  seta: (tamanho = 18) => iconePreenchido(CAMINHOS_PHOSPHOR.seta, tamanho),
  lixeira: (tamanho = 18) => iconePreenchido(CAMINHOS_PHOSPHOR.lixeira, tamanho)
};

// ---------- cores: derivação da família de neutros e do texto do botão ----------
// Mistura linear em RGB e contraste WCAG. Sem color-mix() no CSS por causa da WebView do Instagram.

function hexParaRgb(valor) {
  const hex = String(valor || "").trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(hex)) return hex.split("").map((c) => parseInt(c + c, 16));
  if (/^[0-9a-f]{6}$/i.test(hex) || /^[0-9a-f]{8}$/i.test(hex)) {
    return [hex.slice(0, 2), hex.slice(2, 4), hex.slice(4, 6)].map((c) => parseInt(c, 16));
  }
  return null;
}

function rgbParaHex(rgb) {
  return "#" + rgb.map((c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, "0")).join("");
}

function misturar(a, b, p) {
  return a.map((c, i) => c * (1 - p) + b[i] * p);
}

function luminancia(rgb) {
  const [r, g, b] = rgb.map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contraste(a, b) {
  const la = luminancia(a);
  const lb = luminancia(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function rgba(rgb, alfa) {
  return `rgba(${rgb.map(Math.round).join(", ")}, ${alfa})`;
}

function derivarCores(idt) {
  const avisos = [];
  const fundo = hexParaRgb(idt.corFundo) || hexParaRgb(CORES_PADRAO.fundo);
  const tinta = hexParaRgb(idt.corTinta) || hexParaRgb(CORES_PADRAO.tinta);
  let acento = hexParaRgb(idt.corAcento) || hexParaRgb(CORES_PADRAO.acento);

  if (luminancia(fundo) < luminancia(tinta)) {
    avisos.push("identidade.corFundo é mais escura que corTinta; tema escuro não é suportado nesta versão e os contrastes podem falhar.");
  }

  // Bege dos painéis e bege claro das fotos, tirados do próprio fundo: um pouco mais escuro e
  // com o tom do fundo reforçado (cada canal se afasta da média), para o bege nascer do creme
  // e não do cinza. Com um fundo neutro, sai um cinza claro neutro.
  const painel = realcarTom(fundo, 9, 0.6);
  const superficie = realcarTom(fundo, 4.5, 0.3);
  // Branco dos cartões (cartão das categorias, painel de favoritos): o fundo levado 80% ao branco.
  const cartao = misturar(fundo, [255, 255, 255], 0.8);
  const linha = misturar(fundo, tinta, 0.12);

  let pBorda = 0.5;
  let borda = misturar(fundo, tinta, pBorda);
  while (contraste(borda, fundo) < 3 && pBorda < 1) {
    pBorda = Math.min(1, pBorda + 0.05);
    borda = misturar(fundo, tinta, pBorda);
  }

  let pSuave = 0.7;
  let tintaSuave = misturar(fundo, tinta, pSuave);
  while (Math.min(contraste(tintaSuave, fundo), contraste(tintaSuave, superficie), contraste(tintaSuave, painel)) < 4.5 && pSuave < 1) {
    pSuave = Math.min(1, pSuave + 0.05);
    tintaSuave = misturar(fundo, tinta, pSuave);
  }

  let textoBotao;
  if (contraste(fundo, acento) >= 4.5) {
    textoBotao = fundo;
  } else if (contraste(tinta, acento) >= 4.5) {
    textoBotao = tinta;
  } else {
    const original = rgbParaHex(acento);
    let passos = 0;
    while (contraste(fundo, acento) < 4.5 && passos < 20) {
      acento = misturar(acento, tinta, 0.05);
      passos++;
    }
    textoBotao = fundo;
    avisos.push(`identidade.corAcento ${original} não dá contraste de 4,5:1 nem com o fundo nem com a tinta; o botão foi escurecido para ${rgbParaHex(acento)}.`);
  }

  const acentoForte = misturar(acento, tinta, 0.2);

  // Superfície escura (barra de topo e rodapé): a própria tinta, com texto no fundo; o texto
  // secundário sobe até 4,5:1 e a hairline é a tinta com 20% de fundo.
  const escuro = tinta;
  const escuroLinha = misturar(tinta, fundo, 0.2);
  let pSobreSuave = 0.68;
  let sobreEscuroSuave = misturar(tinta, fundo, pSobreSuave);
  while (contraste(sobreEscuroSuave, escuro) < 4.5 && pSobreSuave < 1) {
    pSobreSuave = Math.min(1, pSobreSuave + 0.04);
    sobreEscuroSuave = misturar(tinta, fundo, pSobreSuave);
  }

  return {
    hex: {
      fundo: rgbParaHex(fundo),
      superficie: rgbParaHex(superficie),
      painel: rgbParaHex(painel),
      cartao: rgbParaHex(cartao),
      linha: rgbParaHex(linha),
      borda: rgbParaHex(borda),
      tinta: rgbParaHex(tinta),
      tintaSuave: rgbParaHex(tintaSuave),
      acento: rgbParaHex(acento),
      acentoForte: rgbParaHex(acentoForte),
      textoBotao: rgbParaHex(textoBotao),
      escuro: rgbParaHex(escuro),
      escuroLinha: rgbParaHex(escuroLinha),
      sobreEscuroSuave: rgbParaHex(sobreEscuroSuave)
    },
    scrim: rgba(tinta, 0.6),
    // Véu sobre foto para texto claro (cards de "Compre por categoria"): 0,82 na base.
    veuForte: rgba(tinta, 0.82),
    veuZero: rgba(tinta, 0),
    sombraFixa: `0 -8px 24px ${rgba(tinta, 0.06)}`,
    // Sombra suave do cartão das categorias e do painel de favoritos, tingida pela tinta.
    sombraCartao: `0 12px 40px ${rgba(tinta, 0.08)}`,
    contrastes: {
      "texto do botão sobre acento": contraste(textoBotao, acento),
      "texto do botão sobre acento forte": contraste(textoBotao, acentoForte),
      "tinta sobre fundo": contraste(tinta, fundo),
      "tinta suave sobre fundo": contraste(tintaSuave, fundo),
      "tinta suave sobre superfície": contraste(tintaSuave, superficie),
      "tinta suave sobre painel": contraste(tintaSuave, painel),
      "borda sobre fundo": contraste(borda, fundo),
      "fundo sobre tinta (botão preto, rodapé)": contraste(fundo, escuro),
      "texto secundário sobre o rodapé": contraste(sobreEscuroSuave, escuro)
    },
    avisos
  };
}

// Tom do fundo reforçado: escurece cada canal e afasta cada um da média do fundo.
function realcarTom(cor, escurecer, realce) {
  const media = (cor[0] + cor[1] + cor[2]) / 3;
  return cor.map((c) => Math.max(0, Math.min(255, c - escurecer + (c - media) * realce)));
}

// Imprime os hex e contrastes uma vez por build (o layout roda uma vez por página).
let chaveImpressa = "";
function relatarCores(idt, cores) {
  const chave = JSON.stringify([idt.corFundo, idt.corTinta, idt.corAcento]);
  if (chave === chaveImpressa) return;
  chaveImpressa = chave;
  const personalizada = [idt.corFundo, idt.corTinta, idt.corAcento].some((v) => typeof v === "string" && v.trim());
  if (!personalizada && !cores.avisos.length) return;
  console.log("");
  console.log("Cores da identidade:");
  console.log(`  fundo ${cores.hex.fundo}, tinta ${cores.hex.tinta}, acento ${cores.hex.acento}, acento forte ${cores.hex.acentoForte}, texto do botão ${cores.hex.textoBotao}`);
  for (const [nome, valor] of Object.entries(cores.contrastes)) {
    console.log(`  contraste ${nome}: ${valor.toFixed(2).replace(".", ",")}:1`);
  }
  for (const a of cores.avisos) console.log(`  Aviso: ${a}`);
}

// ---------- utilidades ----------

// Separadores de linha Unicode (U+2028 e U+2029) quebram <script> inline; viram escapes.
const SEPARADORES_UNICODE = new RegExp("[" + String.fromCharCode(0x2028, 0x2029) + "]", "g");

// JSON seguro para dentro de <script>: "</script>" no conteúdo não fecha a tag.
function jsonSeguro(obj) {
  return JSON.stringify(obj)
    .replace(/</g, "\\u003c")
    .replace(SEPARADORES_UNICODE, (c) => "\\u" + c.charCodeAt(0).toString(16));
}

function ehTexto(v) {
  return typeof v === "string" && v.trim() !== "";
}

// Primeiros N caracteres de um texto, cortados no fim de uma frase quando possível.
function resumirTexto(texto, maximo = 150) {
  const limpo = String(texto || "").replace(/\s+/g, " ").trim();
  if (limpo.length <= maximo) return limpo;
  const corte = limpo.slice(0, maximo);
  const fimFrase = Math.max(corte.lastIndexOf(". "), corte.lastIndexOf("! "), corte.lastIndexOf("? "));
  if (fimFrase > maximo * 0.5) return corte.slice(0, fimFrase + 1);
  return corte.slice(0, corte.lastIndexOf(" ")) + "...";
}

function limparFamilia(nome) {
  return String(nome).trim().replace(/["<>{};]/g, "");
}

// Pilha CSS da família; com ajuste conhecido, inclui o fallback local "<Família> Fallback".
function familiaCss(nome) {
  const familia = limparFamilia(nome);
  const fallback = AJUSTE_FALLBACK[familia] ? `"${familia} Fallback", ` : "";
  return `"${familia}", ${fallback}${FAMILIAS_SERIFADAS.includes(familia) ? FALLBACK_SERIFA : FALLBACK_FONTE}`;
}

function fallbackFonteCss(nome) {
  const familia = limparFamilia(nome);
  const regra = AJUSTE_FALLBACK[familia];
  if (!regra) return "";
  const locais = regra.local === "Georgia" ? 'local("Georgia"),local("Times New Roman")' : 'local("Arial"),local("Helvetica")';
  return `@font-face{font-family:"${familia} Fallback";src:${locais};size-adjust:${regra.ajuste}}`;
}

// URL do Google Fonts: pesos 400, 500 e 600 (nunca outros: um peso inexistente derruba a folha),
// ou o eixo de EIXOS_TITULO quando a família de título estiver lá e não for também a de texto
// ("" = sem eixo, só o peso que a família tiver).
function urlGoogleFonts(titulo, texto) {
  const familia = (nome, eixos) => "family=" + encodeURIComponent(nome).replace(/%20/g, "+") + (eixos ? ":" + eixos : "");
  const eixosTitulo = Object.prototype.hasOwnProperty.call(EIXOS_TITULO, titulo) ? EIXOS_TITULO[titulo] : "wght@400;500;600";
  const pedidos = titulo === texto
    ? [familia(titulo, "wght@400;500;600")]
    : [familia(titulo, eixosTitulo), familia(texto, "wght@400;500;600")];
  return "https://fonts.googleapis.com/css2?" + pedidos.join("&") + "&display=swap";
}

// Valor seguro dentro de <style>: sem HTML-escape (aspas precisam sobreviver),
// mas sem caracteres que fechem a tag ou o bloco.
function cssSeguro(valor) {
  return String(valor).replace(/[<>{};]/g, "");
}

// Folha do Google só com os glifos do nome da marca e do @ (o Google devolve um subconjunto mínimo).
function urlFonteMarca(marca) {
  const glifos = Array.from(new Set(("@" + String(marca)).split(""))).sort().join("");
  return "https://fonts.googleapis.com/css2?family=" + encodeURIComponent(FONTE_MARCA.familia).replace(/%20/g, "+") +
    ":wght@" + FONTE_MARCA.pesos + "&text=" + encodeURIComponent(glifos) + "&display=swap";
}

// Recebe HTML já escapado e põe cada ocorrência do nome da marca num span com a face da marca.
// O nome é escapado do mesmo jeito antes da troca, então o HTML ao redor não muda.
function comMarca(ctx, htmlEscapado) {
  const nome = ctx.util.escapeHtml(ctx.config.marca);
  if (!nome) return htmlEscapado;
  return String(htmlEscapado).split(nome).join(`<span class="marca-nome">${nome}</span>`);
}

// Atalho para texto vindo dos dados: escapa e marca o nome.
function textoComMarca(ctx, texto) {
  return comMarca(ctx, ctx.util.escapeHtml(texto));
}

// "@ltmodasestilo" na face da marca (menu, rodapé, Sobre).
function arrobaInstagram(ctx) {
  return `<span class="marca-nome">@${ctx.util.escapeHtml(ctx.config.instagram)}</span>`;
}

// true quando nenhuma peça tem preço: os cards deixam de repetir "Preço pelo WhatsApp"
// e a coleção ganha uma frase única (seção 4.3 do DESIGN.md).
function nenhumPreco(ctx) {
  return (ctx.produtos || []).every((p) => !ctx.util.temPreco(p));
}

// ---------- componentes compartilhados ----------

// tipo: "geral" (mensagemGeral), "trocas" (mensagemTrocas), "medidas" (mensagemMedidas),
// "novidades" (mensagemNovidades), "busca" e "favoritas" (montadas pelo app.js)
// ou "produto" (mensagem da peça, recalculada pelo app.js quando o tamanho muda).
const TIPOS_WHATS = ["geral", "trocas", "medidas", "busca", "novidades", "favoritas"];
function atributoWhats(tipo) {
  if (tipo === "produto") return "data-whats-produto";
  return `data-whats="${TIPOS_WHATS.includes(tipo) ? tipo : "geral"}"`;
}

function botaoWhats(ctx, { href, classe = "", rotulo = ROTULOS.contato, tipo = "geral", icone = 18, extra = "" }) {
  const e = ctx.util.escapeHtml;
  return `<a class="btn btn--primario ${classe}" href="${e(href)}" target="_blank" rel="noopener" ${atributoWhats(tipo)}${extra ? " " + extra : ""}>${ICONES.whatsapp(icone)}<span data-rotulo>${e(rotulo)}</span></a>`;
}

function linkWhats(ctx, { href, classe = "", rotulo = ROTULOS.contato, tipo = "geral" }) {
  const e = ctx.util.escapeHtml;
  return `<a class="link ${classe}" href="${e(href)}" target="_blank" rel="noopener" ${atributoWhats(tipo)}>${ICONES.whatsapp(16)}<span data-rotulo>${e(rotulo)}</span></a>`;
}

function altFoto(p) {
  return p.cor ? `${p.nome} na cor ${p.cor}` : p.nome;
}

// ---------- imagens com tamanho real e srcset (dados vêm do build: ctx.imagens) ----------

function infoImagem(ctx, caminho) {
  const mapa = ctx.imagens || {};
  if (mapa[caminho]) return mapa[caminho];
  const src = imagens.ehLocal(caminho) ? "/" + imagens.caminhoRelativo(caminho) : caminho;
  return { src, largura: imagens.DIMENSOES_PADRAO.largura, altura: imagens.DIMENSOES_PADRAO.altura, miniatura: null };
}

// Versão leve da foto (miniatura de img/640 quando existir) para pôster, miniatura da galeria etc.
function srcLeve(ctx, caminho) {
  const info = infoImagem(ctx, caminho);
  return info.miniatura ? info.miniatura.src : info.src;
}

// carregamento: "lazy" (padrão), "normal", "prioridade" (LCP: fetchpriority alto, sem lazy, sem fade)
// ou "adiado" (data-src e data-srcset: nada é baixado até o app.js preencher; sem JS a foto não aparece).
function imagem(ctx, caminho, { alt = "", sizes = "100vw", classe = "", carregamento = "lazy", fade = true } = {}) {
  const e = ctx.util.escapeHtml;
  const info = infoImagem(ctx, caminho);
  const conjunto = imagens.srcset(info);
  const prioridade = carregamento === "prioridade";
  const prefixo = carregamento === "adiado" ? "data-" : "";
  const atributos = [
    classe ? `class="${e(classe)}"` : "",
    `${prefixo}src="${e(info.src)}"`,
    conjunto ? `${prefixo}srcset="${e(conjunto)}" sizes="${e(sizes)}"` : "",
    `alt="${e(alt)}"`,
    `width="${info.largura}" height="${info.altura}"`,
    prioridade ? 'fetchpriority="high" decoding="sync"' : 'decoding="async"',
    carregamento === "lazy" ? 'loading="lazy"' : "",
    fade && !prioridade ? "data-fade" : ""
  ].filter(Boolean).join(" ");
  return `<img ${atributos}>`;
}

// Dados para o <link rel="preload"> da imagem LCP, com o mesmo srcset e sizes do <img>.
function preloadImagem(ctx, caminho, sizes) {
  const info = infoImagem(ctx, caminho);
  return { href: info.src, srcset: imagens.srcset(info), sizes };
}

// Foto mais próxima de 9:16 entre as da peça (pôster dos cards de vídeo, que são 9:16).
function fotoMaisAlta(ctx, p) {
  return p.fotos.reduce((melhor, f) => {
    const a = infoImagem(ctx, f);
    const b = infoImagem(ctx, melhor);
    return a.altura / a.largura > b.altura / b.largura + 0.01 ? f : melhor;
  }, p.fotos[0]);
}

// Linha de preço da grade e dos cards de vídeo: valor (com riscado) ou "Preço pelo WhatsApp".
// Quando nenhuma peça tem preço, a linha some de todos os cards (a coleção avisa uma vez só).
function precoCurto(ctx, p, classe) {
  const { util } = ctx;
  const e = util.escapeHtml;
  if (!util.temPreco(p)) {
    return nenhumPreco(ctx) ? "" : `<span class="${classe} ${classe}--consulta">${ROTULOS.semPreco}</span>`;
  }
  const temAntigo = typeof p.precoAntigo === "number" && p.precoAntigo > p.preco;
  return `<span class="${classe}">${temAntigo ? `<s><span class="vo">de </span>${e(util.formatarPreco(p.precoAntigo))}</s> ` : ""}<b>${temAntigo ? '<span class="vo">por </span>' : ""}${e(util.formatarPreco(p.preco))}</b></span>`;
}

// Bolinha da cor + nome da cor (card, faixa de vídeos, página da peça). A cor vem de corHex,
// medida nas fotos; sem corHex, fica só o nome. A bolinha é decorativa: o nome já diz a cor.
// tag: "p" (página da peça, faixa de vídeos) ou "span" (dentro do link do card).
function corDaPeca(ctx, p, classe, tag = "p") {
  const e = ctx.util.escapeHtml;
  if (!ehTexto(p.cor)) return "";
  const hex = /^#[0-9a-f]{6}$/i.test(String(p.corHex || "")) ? p.corHex : "";
  const bolinha = hex ? `<span class="bolinha" style="background-color:${hex}" aria-hidden="true"></span>` : "";
  return `<${tag} class="${classe}">${bolinha}${e(p.cor)}</${tag}>`;
}

// Coração de favoritos (seção 3.12 do DESIGN.md): botão com aria-pressed, guardado pelo
// app.js no aparelho (localStorage). Sem JS ele não aparece (html:not(.js) no CSS).
function botaoFavorito(ctx, p, classe = "") {
  const e = ctx.util.escapeHtml;
  return `<button type="button" class="favorito${classe ? " " + classe : ""}" data-favorito="${e(p.slug)}" aria-pressed="false" aria-label="${ROTULOS.salvar}: ${e(p.nome)}">${ICONES.coracao(20, ' class="icone-vazio"')}${ICONES.coracaoCheio(20, ' class="icone-cheio"')}</button>`;
}

// Card de peça (seção 0 do DESIGN.md), usado na coleção, nas relacionadas e na 404.
// Um link só (foto, nome e preço) e, ao lado dele (nunca dentro), o coração de favoritos,
// que o CSS põe na linha do nome, à direita. A foto tem alt vazio (o nome está no mesmo link).
// A segunda foto (troca no hover) sai adiada: o app.js só a carrega em aparelho com hover,
// no primeiro pointerenter. Sobre a foto: o play discreto (peça com vídeo) e a tag, se houver.
// A cor não aparece no card (fica na página da peça), mas continua valendo na busca.
function cartao(ctx, p, opts = {}) {
  const { config, util } = ctx;
  const e = util.escapeHtml;
  const sizes = opts.sizes || TAMANHOS.grade;
  const href = `/p/${e(p.slug)}/`;
  const pix = util.temPreco(p) && config.pagamento && Number(config.pagamento.pixDesconto) > 0 ? util.precoPix(config, p.preco) : null;
  const foto2 = p.fotos[1];
  const busca = util.normalizarBusca([p.nome, p.cor, p.categoria].filter(ehTexto).join(" "));
  const atributos = [
    `class="${opts.classeItem || "item"}"`,
    opts.revelar ? "data-revelar" : "",
    opts.filtravel ? `data-busca="${e(busca)}"` : "",
    opts.filtravel && ehTexto(p.categoria) ? `data-categoria="${e(p.categoria)}"` : "",
    opts.alem ? "data-alem hidden" : ""
  ].filter(Boolean).join(" ");
  const preco = precoCurto(ctx, p, "cartao-preco");

  return `<li ${atributos}>
  <article class="cartao">
    <a class="cartao-link" href="${href}">
      <span class="cartao-foto${foto2 ? " cartao-foto--dupla" : ""}" data-foto>
        ${imagem(ctx, p.fotos[0], { sizes, carregamento: opts.lazy === false ? "normal" : "lazy" })}${foto2 ? `
        ${imagem(ctx, foto2, { sizes, classe: "cartao-foto-2", fade: false, carregamento: "adiado" })}` : ""}${ehTexto(p.tag) ? `
        <span class="selo selo--tag">${e(p.tag)}</span>` : ""}${ehTexto(p.video) ? `
        <span class="selo-video">${ICONES.playFill(10)}<span class="vo">Com vídeo</span></span>` : ""}
      </span>
      <span class="cartao-nome">${e(p.nome)}</span>${preco ? `
      ${preco}` : ""}${pix !== null ? `
      <span class="cartao-pix">${e(util.formatarPreco(pix))} no PIX</span>` : ""}
    </a>
    ${botaoFavorito(ctx, p, "favorito--cartao")}
  </article>
</li>`;
}

// Carrossel de vitrine (Novidades, "Você também pode gostar"): faixa com scroll-snap
// (arraste no celular) e setas no desktop com mouse, que o app.js mostra e desativa nas pontas.
// rotulo nomeia as setas para o leitor de tela ("Novidades: peças anteriores").
function carrossel(id, itensHtml, rotulo) {
  const r = escapeTexto(rotulo);
  return `<div class="carrossel" data-carrossel>
      <button type="button" class="btn btn--secundario btn--icone carrossel-seta carrossel-seta--anterior" data-carrossel-anterior aria-label="${r}: peças anteriores" hidden>${ICONES.setaEsquerda(20)}</button>
      <ul class="carrossel-faixa" id="${escapeTexto(id)}" data-carrossel-faixa>
${itensHtml}
      </ul>
      <button type="button" class="btn btn--secundario btn--icone carrossel-seta carrossel-seta--proxima" data-carrossel-proxima aria-label="${r}: próximas peças" hidden>${ICONES.setaDireita(20)}</button>
    </div>`;
}

function escapeTexto(t) {
  return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ---------- imagens de ambiente (Unsplash) ----------
// URL base vem de conteudo.ambientes; o tamanho de cada uso é pedido na própria URL
// (w, h, fit=crop), então largura e altura são conhecidas e o srcset tem a mesma proporção.

function urlAmbiente(base, largura, altura) {
  return `${base}?w=${largura}&h=${altura}&fit=crop&q=60&auto=format`;
}

function conjuntoAmbiente(base, proporcao, larguras) {
  return larguras.map((l) => `${urlAmbiente(base, l, Math.round(l * proporcao[1] / proporcao[0]))} ${l}w`).join(", ");
}

// <img> de ambiente (uma proporção só). Sempre lazy: imagem externa nunca é o LCP.
function imagemAmbiente(ctx, nome, { proporcao, larguras, sizes = "100vw", classe = "" }) {
  const e = ctx.util.escapeHtml;
  const amb = (ctx.conteudo.ambientes || {})[nome];
  if (!amb) return "";
  const l = larguras[larguras.length - 1];
  const a = Math.round(l * proporcao[1] / proporcao[0]);
  return `<img${classe ? ` class="${e(classe)}"` : ""} src="${e(urlAmbiente(amb.url, l, a))}" srcset="${e(conjuntoAmbiente(amb.url, proporcao, larguras))}" sizes="${e(sizes)}" width="${l}" height="${a}" alt="${e(amb.alt)}" loading="lazy" decoding="async" data-fade>`;
}

// Tabela de medidas (seção 3.5): cabeçalho em superfície, primeira coluna fixa com 5+ colunas.
function tabela(ctx, colunas, linhas, legenda) {
  const e = ctx.util.escapeHtml;
  const larga = colunas.length >= 5;
  return `<div class="tabela-rolagem${larga ? " tabela-rolagem--larga" : ""}">
  <table class="tabela">
    <thead><tr>${colunas.map((c) => `<th scope="col">${e(c)}</th>`).join("")}</tr></thead>
    <tbody>
${linhas.map((l) => `      <tr>${l.map((v, i) => (i === 0 ? `<th scope="row">${e(v)}</th>` : `<td>${e(v)}</td>`)).join("")}</tr>`).join("\n")}
    </tbody>
  </table>
</div>${ehTexto(legenda) ? `
<p class="tabela-legenda">${e(legenda)}</p>` : ""}`;
}

// Indicador de posição de uma faixa com scroll-snap (galeria, depoimentos).
function segmentos(id, quantidade) {
  if (quantidade < 2) return "";
  const itens = Array.from({ length: quantidade }, (_, i) => `<span${i === 0 ? ' class="ativo"' : ""}></span>`).join("");
  return `<div class="segmentos" data-segmentos="${id}" aria-hidden="true">${itens}</div>`;
}

function migalhas(ctx, itens) {
  const e = ctx.util.escapeHtml;
  const ultimo = itens.length - 1;
  return `<nav class="migalhas" aria-label="Você está em">
  <ol>
${itens.map((it, i) => (i === ultimo
    ? `    <li aria-current="page">${e(it.texto)}</li>`
    : `    <li><a href="${e(it.href)}">${e(it.texto)}</a></li>`)).join("\n")}
  </ol>
</nav>`;
}

// ---------- topo, menu, favoritos e rodapé ----------

// Nome da marca: logo (identidade.logo) ou o wordmark em texto, escrito como está no config,
// com a linha pequena de config.subtituloMarca embaixo ("MODA FEMININA").
function marcaHtml(ctx, classe, alturaLogo) {
  const { config, util } = ctx;
  const e = util.escapeHtml;
  const idt = config.identidade || {};
  if (ehTexto(idt.logo)) {
    const src = "/" + idt.logo.replace(/^\/+/, "");
    return `<a class="${classe} ${classe}--logo" href="/"><img src="${e(src)}" alt="${e(config.marca)}" height="${alturaLogo}"></a>`;
  }
  const sub = ehTexto(config.subtituloMarca) ? `<span class="marca-sub">${e(config.subtituloMarca)}</span>` : "";
  return `<a class="${classe}" href="/"><span class="wordmark">${e(config.marca)}</span>${sub}</a>`;
}

// Categorias das peças na ordem em que aparecem em produtos.js (ex: Conjuntos com short,
// Conjuntos com pantalona, Vestidos). Alimentam os chips, o rodapé e as relacionadas.
function categoriasDasPecas(ctx) {
  return (ctx.produtos || [])
    .map((p) => (ehTexto(p.categoria) ? p.categoria.trim() : ""))
    .filter((c, i, lista) => c && lista.indexOf(c) === i);
}

// Link que filtra a coleção da home por categoria. Funciona de qualquer página (o app.js lê
// ?categoria= ao carregar a home) e sem JS (leva à coleção, sem filtro).
function hrefCategoria(ctx, categoria) {
  return `/?categoria=${ctx.util.slugify(categoria)}#colecao`;
}

function temVideos(ctx) {
  return (ctx.produtos || []).some((p) => ehTexto(p.video));
}

// Links da navegação (conteudo.navegacao): "#x" é uma seção da home (fora dela, "/#x");
// "medidas" é o guia de medidas (na peça, a tabela da própria página).
const NAVEGACAO_PADRAO = [
  { texto: "Coleção", link: "#colecao" },
  { texto: "Medidas", link: "medidas" },
  { texto: "Trocas", link: "/trocas/" }
];

function hrefNavegacao(link, ehHome, ancoraMedidas) {
  if (link === "medidas") return ancoraMedidas || (ehHome ? "#medidas" : "/#medidas");
  if (link.charAt(0) === "#") return ehHome ? link : "/" + link;
  return link;
}

// Itens como [texto, href], sem o link de vídeos quando nenhuma peça tem vídeo.
function navegacaoLoja(ctx, ehHome, ancoraMedidas) {
  const lista = Array.isArray(ctx.conteudo.navegacao) && ctx.conteudo.navegacao.length ? ctx.conteudo.navegacao : NAVEGACAO_PADRAO;
  return lista
    .filter((n) => n && ehTexto(n.texto) && ehTexto(n.link))
    .filter((n) => n.link.trim() !== "#videos" || temVideos(ctx))
    .map((n) => [n.texto.trim(), hrefNavegacao(n.link.trim(), ehHome, ancoraMedidas)]);
}

// Barra fina preta no alto: frases verdadeiras e curtas. No celular, uma por vez (o app.js
// reveza a cada 4 s, pausa no foco e no hover e para com movimento reduzido); no desktop,
// lado a lado. aria-live="off": a troca não é anunciada (não é conteúdo novo).
function barraTopoHtml(ctx) {
  const { config, conteudo, util } = ctx;
  const e = util.escapeHtml;
  const frases = [
    ehTexto(config.aviso) ? config.aviso.trim() : "",
    ...(Array.isArray(conteudo.barraTopo) ? conteudo.barraTopo : BARRA_TOPO_PADRAO)
  ].filter(ehTexto);
  if (!frases.length) return "";
  return `<div class="barra-topo" data-barra-topo>
  <ul class="container barra-topo-lista" aria-live="off" aria-label="Avisos da loja">
    ${frases.map((f, i) => `<li${i === 0 ? ' class="ativa"' : ""}>${comMarca(ctx, e(f))}</li>`).join("\n    ")}
  </ul>
</div>`;
}

// Campo de busca, numa linha logo abaixo do cabeçalho (abre pela lupa). Sem JS fica sempre
// aberto e é um form GET que leva à home (/?busca=termo). Com JS, na home filtra a coleção
// na própria página; fora dela, vai para /?busca=termo#colecao.
function buscaHtml() {
  return `<div class="topo-busca">
    <form class="container busca" id="busca" role="search" action="/" method="get" data-busca-form>
      <label class="vo" for="busca-campo">Buscar peças por nome, cor ou categoria</label>
      <input class="busca-campo" id="busca-campo" type="search" name="busca" placeholder="Buscar por peça, cor ou categoria" autocomplete="off" enterkeyhint="search" data-busca-campo>
      <button type="submit" class="busca-enviar" aria-label="${ROTULOS.buscar}">${ICONES.busca(20)}</button>
    </form>
  </div>`;
}

// Cabeçalho claro (seção 3.3 do DESIGN.md). Na home ele fica transparente sobre o banner e
// ganha fundo quando a página rola (classe topo-solido no body, posta pelo app.js).
//   Celular: Menu, wordmark, Buscar, Favoritos e o ícone verde do WhatsApp.
//   Desktop de 1024 a 1279px: wordmark à esquerda, navegação no meio, ícones à direita.
//   Desktop a partir de 1280px: navegação à esquerda, wordmark no centro; Buscar, Favoritos,
//   Instagram e "Pedir no WhatsApp" à direita (como na referência AERIS).
function topoHtml(ctx, ehHome, whats, ancoraMedidas) {
  const { config, util } = ctx;
  const e = util.escapeHtml;
  const insta = ehTexto(config.instagram)
    ? `<a class="topo-icone topo-insta" href="https://instagram.com/${e(config.instagram)}" target="_blank" rel="noopener" aria-label="Instagram ${e(config.marca)}">${ICONES.instagram(22)}</a>`
    : "";
  const nav = navegacaoLoja(ctx, ehHome, ancoraMedidas)
    .map(([texto, href]) => `<li><a href="${e(href)}">${e(texto)}</a></li>`)
    .join("");
  return `<header class="topo">
  <div class="container topo-inner">
    <button type="button" class="topo-icone topo-menu" data-abrir-menu aria-expanded="false" aria-controls="menu" aria-label="${ROTULOS.menu}">${ICONES.list(22)}</button>
    ${marcaHtml(ctx, "topo-marca", 28)}
    <nav class="topo-nav" aria-label="Seções da loja">
      <ul>${nav}</ul>
    </nav>
    <div class="topo-acoes">
      <button type="button" class="topo-icone topo-buscar" data-abrir-busca aria-expanded="false" aria-controls="busca" aria-label="${ROTULOS.buscar}">${ICONES.busca(22)}</button>
      <button type="button" class="topo-icone topo-favoritos" data-abrir-favoritos aria-haspopup="dialog" aria-controls="favoritos" aria-label="${ROTULOS.favoritos}">${ICONES.coracao(22)}<span class="topo-contador" data-favoritos-contador aria-hidden="true" hidden></span></button>
      ${insta}
      ${botaoWhats(ctx, { href: whats.href, tipo: whats.tipo, classe: "btn--topo topo-whats", icone: 18 })}
      <a class="btn btn--primario btn--icone topo-whats-icone" href="${e(whats.href)}" target="_blank" rel="noopener" ${atributoWhats(whats.tipo)} aria-label="${ROTULOS.contato}">${ICONES.whatsapp(20)}</a>
    </div>
  </div>
  ${buscaHtml()}
</header>`;
}

function menuHtml(ctx, ehHome, whats, ancoraMedidas) {
  const { config, util } = ctx;
  const e = util.escapeHtml;
  const base = ehHome ? "" : "/";
  const loja = navegacaoLoja(ctx, ehHome, ancoraMedidas).filter(([, href]) => href !== "/trocas/");
  const institucional = [["Sobre", `${base}#sobre`], ["Dúvidas", `${base}#duvidas`], ["Trocas e devoluções", "/trocas/"]];
  const links = [...loja, ...institucional]
    .map(([texto, href]) => `<li><a href="${e(href)}">${e(texto)}</a></li>`)
    .join("\n        ");
  return `<dialog id="menu" class="menu" aria-label="Menu">
  <div class="menu-painel">
    <div class="menu-topo">
      <span class="topo-marca"><span class="wordmark">${e(config.marca)}</span></span>
      <button type="button" class="btn btn--secundario topo-menu-fechar" data-fechar-menu>${ICONES.x(18)}<span>${ROTULOS.fechar}</span></button>
    </div>
    <nav class="menu-nav" aria-label="Seções do site">
      <ul>
        ${links}
      </ul>
    </nav>
    ${ehTexto(config.instagram) ? `<a class="menu-insta" href="https://instagram.com/${e(config.instagram)}" target="_blank" rel="noopener">${ICONES.instagram(20)}<span>${arrobaInstagram(ctx)} no Instagram</span></a>` : ""}
    <div class="menu-base">
      ${botaoWhats(ctx, { href: whats.href, tipo: whats.tipo, classe: "btn--largo" })}
    </div>
  </div>
</dialog>`;
}

// Painel de favoritos (seção 3.12 do DESIGN.md): dialog nativo (showModal prende o foco,
// Esc fecha e o app.js devolve o foco ao coração do topo). A lista é montada pelo app.js
// com os dados de window.PECAS e o modelo <template> abaixo.
function favoritosHtml(ctx) {
  const { config, util } = ctx;
  const hrefGeral = util.linkWhats(config, config.mensagemGeral);
  return `<dialog id="favoritos" class="favoritos" aria-labelledby="favoritos-titulo" data-favoritos>
  <div class="favoritos-painel">
    <div class="favoritos-topo">
      <h2 id="favoritos-titulo">${ROTULOS.favoritos}</h2>
      <button type="button" class="btn btn--secundario btn--icone" data-fechar-favoritos aria-label="${ROTULOS.fechar}">${ICONES.x(18)}</button>
    </div>
    <p class="favoritos-vazio" data-favoritos-vazio>Toque no coração das peças para salvar aqui.</p>
    <ul class="favoritos-lista" data-favoritos-lista></ul>
    <div class="favoritos-base" data-favoritos-base hidden>
      ${botaoWhats(ctx, { href: hrefGeral, tipo: "favoritas", rotulo: ROTULOS.favoritas, classe: "btn--largo" })}
      <p class="favoritos-nota">As favoritas ficam salvas só neste aparelho.</p>
    </div>
  </div>
  <template data-favorito-modelo>
    <li class="favorito-item">
      <a class="favorito-link" href="">
        <span class="favorito-foto"><img src="" alt="" width="640" height="853" loading="lazy" decoding="async"></span>
        <span class="favorito-texto"><span class="favorito-nome"></span><span class="favorito-cor"><span class="bolinha" aria-hidden="true"></span><span class="favorito-cor-nome"></span></span></span>
      </a>
      <button type="button" class="favorito-remover" data-remover-favorito="">${ICONES.lixeira(18)}</button>
    </li>
  </template>
</dialog>`;
}

// Dados das peças para o painel de favoritos (o app.js monta a lista com eles).
function pecasParaFavoritos(ctx) {
  const { config, util } = ctx;
  return (ctx.produtos || []).map((p) => {
    const info = infoImagem(ctx, p.fotos[0]);
    const leve = info.miniatura || info;
    return {
      slug: p.slug,
      nome: p.nome,
      cor: ehTexto(p.cor) ? p.cor.trim() : "",
      corHex: /^#[0-9a-f]{6}$/i.test(String(p.corHex || "")) ? p.corHex : "",
      foto: leve.src,
      largura: leve.largura,
      altura: leve.altura,
      url: util.urlAbsoluta(config, `/p/${p.slug}/`)
    };
  });
}

// Rodapé preto (seção 3.14 do DESIGN.md): marca, frase e ícones sociais; Loja, Atendimento,
// Sobre e "Fique por dentro" (com o botão de novidades); © e crédito das imagens de ambiente.
// Formas de pagamento só entrariam se o config as listasse (hoje não lista).
function rodapeHtml(ctx, ehHome, whats, ancoraMedidas) {
  const { config, conteudo, util } = ctx;
  const e = util.escapeHtml;
  const base = ehHome ? "" : "/";
  const textoRodape = conteudo && conteudo.rodape && ehTexto(conteudo.rodape.texto) ? conteudo.rodape.texto : "";
  const lista = (itens) => itens.map(([texto, href]) => `<li><a href="${e(href)}">${texto}</a></li>`).join("\n          ");
  const insta = ehTexto(config.instagram) ? `https://instagram.com/${e(config.instagram)}` : "";

  const loja = lista([
    ["Coleção", `${base}#colecao`],
    ...categoriasDasPecas(ctx).map((c) => [e(c), hrefCategoria(ctx, c)]),
    temVideos(ctx) ? ["Vídeos", `${base}#videos`] : null
  ].filter(Boolean));
  const atendimento = [
    `<li><a href="${e(whats.href)}" target="_blank" rel="noopener" ${atributoWhats(whats.tipo)}><span data-rotulo>${ROTULOS.contato}</span></a></li>`,
    lista([["Guia de medidas", ancoraMedidas || `${base}#medidas`], ["Trocas e devoluções", "/trocas/"], ["Dúvidas", `${base}#duvidas`]]),
    ehTexto(config.email) ? `<li><a href="mailto:${e(config.email)}">${e(config.email)}</a></li>` : "",
    ehTexto(config.horario) ? `<li><span>${e(config.horario)}</span></li>` : "",
    ehTexto(config.cidade) ? `<li><span>${e(config.cidade)}</span></li>` : ""
  ].filter(Boolean).join("\n          ");
  const sobre = [
    `<li><a href="${base}#sobre"><span>Sobre a ${comMarca(ctx, e(config.marca))}</span></a></li>`,
    insta ? `<li><a href="${insta}" target="_blank" rel="noopener">Instagram</a></li>` : ""
  ].filter(Boolean).join("\n          ");
  const sociais = [
    insta ? `<li><a class="rodape-social" href="${insta}" target="_blank" rel="noopener" aria-label="Instagram ${e(config.marca)}">${ICONES.instagram(20)}</a></li>` : "",
    `<li><a class="rodape-social" href="${e(whats.href)}" target="_blank" rel="noopener" ${atributoWhats(whats.tipo)} aria-label="${ROTULOS.contato}">${ICONES.whatsapp(20)}</a></li>`
  ].filter(Boolean).join("\n          ");
  const nv = conteudo.novidades;
  const hrefNovidades = util.linkWhats(config, mensagemNovidades(config));
  const fique = `<div class="rodape-grupo rodape-fique">
        <h2 class="rodape-titulo">Fique por dentro</h2>
        ${nv && ehTexto(nv.texto) ? `<p>${textoComMarca(ctx, nv.texto)}</p>` : ""}
        ${botaoWhats(ctx, { href: hrefNovidades, tipo: "novidades", rotulo: ROTULOS.novidades, classe: "rodape-botao" })}
      </div>`;

  const linhaFinal = [
    ehTexto(config.razaoSocial) ? `<span>${e(config.razaoSocial)}</span>` : "",
    ehTexto(config.cnpj) ? `<span>CNPJ ${e(config.cnpj)}</span>` : "",
    ehTexto(config.politicaPrivacidade) ? `<a href="${e(config.politicaPrivacidade)}">Política de privacidade</a>` : ""
  ].filter(Boolean).join("\n      ");

  return `<footer class="rodape">
  <div class="container rodape-grade">
    <div class="rodape-marca">
      ${marcaHtml(ctx, "rodape-nome", 28)}
      ${textoRodape ? `<p class="rodape-texto">${textoComMarca(ctx, textoRodape)}</p>` : ""}
      ${ehTexto(config.slogan) ? `<p class="rodape-slogan">${textoComMarca(ctx, config.slogan)}</p>` : ""}
      <ul class="rodape-sociais">
          ${sociais}
      </ul>
    </div>
    <div class="rodape-grupo">
      <h2 class="rodape-titulo">Loja</h2>
      <ul>
          ${loja}
      </ul>
    </div>
    <div class="rodape-grupo">
      <h2 class="rodape-titulo">Atendimento</h2>
      <ul>
          ${atendimento}
      </ul>
    </div>
    <div class="rodape-grupo">
      <h2 class="rodape-titulo">Sobre</h2>
      <ul>
          ${sobre}
      </ul>
    </div>
    ${fique}
    ${linhaFinal ? `<div class="rodape-final">
      ${linhaFinal}
    </div>` : ""}
  </div>
</footer>`;
}

// ---------- documento ----------

function layout({ ctx, titulo, descricao, caminho, ogImagem, corpo, jsonLd, classeBody, preload, noindex, tituloCompleto, whats, ancoraMedidas }) {
  const { config, util } = ctx;
  const e = util.escapeHtml;
  const idt = config.identidade || {};
  const caminhoFinal = caminho || "/";
  const ehHome = caminhoFinal === "/";

  const canonical = util.urlAbsoluta(config, caminhoFinal);
  const og = ogImagem ? util.urlAbsoluta(config, ogImagem) : "";
  const favicon = ctx.favicon || (ehTexto(idt.favicon) ? "/favicon" + path.extname(idt.favicon).toLowerCase() : "/favicon.svg");
  const tituloFinal = tituloCompleto || (titulo ? `${titulo} | ${config.marca}` : config.marca);
  const desc = resumirTexto(descricao || config.slogan || "", 160);

  // Cores: derivadas da identidade; o bloco <style> só é gerado quando algo foi personalizado.
  const cores = derivarCores(idt);
  relatarCores(idt, cores);

  const personalizouCor = ["corFundo", "corTinta", "corAcento"].some((c) => ehTexto(idt[c]));
  const tokens = [];
  if (personalizouCor) {
    tokens.push(
      ["--cor-fundo", cores.hex.fundo],
      ["--cor-superficie", cores.hex.superficie],
      ["--cor-painel", cores.hex.painel],
      ["--cor-cartao", cores.hex.cartao],
      ["--cor-linha", cores.hex.linha],
      ["--cor-borda", cores.hex.borda],
      ["--cor-tinta", cores.hex.tinta],
      ["--cor-tinta-suave", cores.hex.tintaSuave],
      ["--cor-acento", cores.hex.acento],
      ["--cor-acento-forte", cores.hex.acentoForte],
      ["--cor-texto-botao", cores.hex.textoBotao],
      ["--cor-scrim", cores.scrim],
      ["--cor-escuro", cores.hex.escuro],
      ["--cor-escuro-linha", cores.hex.escuroLinha],
      ["--cor-sobre-escuro", cores.hex.fundo],
      ["--cor-sobre-escuro-suave", cores.hex.sobreEscuroSuave],
      ["--cor-veu-forte", cores.veuForte],
      ["--cor-veu-zero", cores.veuZero],
      ["--sombra-fixa", cores.sombraFixa],
      ["--sombra-cartao", cores.sombraCartao]
    );
  }
  if (ehTexto(idt.fonteTitulo)) tokens.push(["--fonte-titulo", familiaCss(idt.fonteTitulo)]);
  if (ehTexto(idt.fonteTexto)) tokens.push(["--fonte-texto", familiaCss(idt.fonteTexto)]);
  const fallbacks = [idt.fonteTitulo, idt.fonteTexto].filter(ehTexto).map(fallbackFonteCss).join("");
  const estiloTokens = tokens.length || fallbacks
    ? `\n  <style>${fallbacks}${tokens.length ? `:root{${tokens.map(([k, v]) => `${k}:${cssSeguro(v)}`).join(";")}}` : ""}</style>`
    : "";

  // Fontes do Google: famílias do DESIGN.md, sobrescritas pela identidade.
  const fonteTitulo = ehTexto(idt.fonteTitulo) ? limparFamilia(idt.fonteTitulo) : FONTES_PADRAO.titulo;
  const fonteTexto = ehTexto(idt.fonteTexto) ? limparFamilia(idt.fonteTexto) : FONTES_PADRAO.texto;
  const urlFontes = urlGoogleFonts(fonteTitulo, fonteTexto);

  const listaJsonLd = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];
  const scriptsJsonLd = listaJsonLd
    .map((item) => `\n  <script type="application/ld+json">${jsonSeguro(item)}</script>`)
    .join("");

  const configCliente = {
    base: ctx.base || "",
    whatsapp: config.whatsapp,
    mensagemGeral: config.mensagemGeral,
    mensagemProduto: config.mensagemProduto,
    mensagemProdutoSemPreco: mensagemSemPreco(config),
    mensagemEsgotado: ehTexto(config.mensagemEsgotado) ? config.mensagemEsgotado : MENSAGEM_ESGOTADO_PADRAO,
    mensagemTrocas: mensagemTrocas(config),
    mensagemMedidas: mensagemMedidas(config),
    mensagemBusca: MENSAGEM_BUSCA,
    mensagemNovidades: mensagemNovidades(config),
    mensagemFavoritas: mensagemFavoritas(config),
    pixelId: config.pixelId ? String(config.pixelId) : ""
  };
  const temLogo = ehTexto(idt.logo);

  const whatsPagina = whats && whats.href ? whats : { href: util.linkWhats(config, config.mensagemGeral), tipo: "geral" };
  // preload: um objeto ou uma lista (o banner da home tem uma foto por orientação de tela, com media).
  const preloadHtml = (Array.isArray(preload) ? preload : [preload])
    .filter((p) => p && p.href)
    .map((p) => `\n  <link rel="preload" as="image" href="${e(p.href)}"${p.srcset ? ` imagesrcset="${e(p.srcset)}" imagesizes="${e(p.sizes || "100vw")}"` : ""}${p.media ? ` media="${e(p.media)}"` : ""} fetchpriority="high">`)
    .join("");

  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <script>document.documentElement.className += " js";</script>
  <title>${e(tituloFinal)}</title>
  <meta name="description" content="${e(desc)}">${noindex ? `
  <meta name="robots" content="noindex">` : ""}
  <link rel="canonical" href="${e(canonical)}">
  <meta name="theme-color" content="${e(cores.hex.escuro)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="pt_BR">
  <meta property="og:site_name" content="${e(config.marca)}">
  <meta property="og:title" content="${e(tituloFinal)}">
  <meta property="og:description" content="${e(desc)}">
  <meta property="og:url" content="${e(canonical)}">${og ? `
  <meta property="og:image" content="${e(og)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${e(og)}">` : `
  <meta name="twitter:card" content="summary">`}
  <link rel="icon" href="${e(favicon)}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>${preloadHtml}
  <link rel="stylesheet" href="${e(urlFontes)}">${temLogo && !ehTexto(config.instagram) ? "" : `
  <link rel="stylesheet" href="${e(urlFonteMarca(config.marca))}">`}
  <link rel="stylesheet" href="/css/style.css">${estiloTokens}${scriptsJsonLd}
  <script>window.CONFIG_CLIENTE = ${jsonSeguro(configCliente)}; window.PECAS = ${jsonSeguro(pecasParaFavoritos(ctx))};</script>
  <script defer src="/js/app.js"></script>
</head>
<body class="${e(classeBody || "")}">
<a class="pular" href="#conteudo">Ir para o conteúdo</a>
${barraTopoHtml(ctx)}
${topoHtml(ctx, ehHome, whatsPagina, ancoraMedidas)}
<main id="conteudo">
${corpo}
</main>
${rodapeHtml(ctx, ehHome, whatsPagina, ancoraMedidas)}
${menuHtml(ctx, ehHome, whatsPagina, ancoraMedidas)}
${favoritosHtml(ctx)}
</body>
</html>
`;
}

// Mensagens padrão dos campos opcionais do config (o mesmo texto vale para o build e para o app.js).
const MENSAGEM_ESGOTADO_PADRAO = "Olá! A peça {produto}{cor} está esgotada no site. Pode me avisar quando voltar?";
const MENSAGEM_SEM_PRECO_PADRAO = "Olá! Quero saber o valor da peça {produto}{cor}{tamanho}. Ainda tem disponível?";
const MENSAGEM_TROCAS_PADRAO = "Olá! Preciso de ajuda com uma troca ou devolução. Número do pedido: ";
const MENSAGEM_MEDIDAS_PADRAO = "Olá! Quero ajuda para escolher o tamanho. Minhas medidas são: busto , cintura , quadril .";
const MENSAGEM_NOVIDADES_PADRAO = "Olá! Quero receber as novidades da loja.";
const MENSAGEM_FAVORITAS_PADRAO = "Olá! Gostei destas peças:\n{pecas}\nPodem me ajudar?";

function mensagemSemPreco(config) {
  return ehTexto(config.mensagemProdutoSemPreco) ? config.mensagemProdutoSemPreco : MENSAGEM_SEM_PRECO_PADRAO;
}

function mensagemTrocas(config) {
  return ehTexto(config.mensagemTrocas) ? config.mensagemTrocas : MENSAGEM_TROCAS_PADRAO;
}

function mensagemMedidas(config) {
  return ehTexto(config.mensagemMedidas) ? config.mensagemMedidas : MENSAGEM_MEDIDAS_PADRAO;
}

function mensagemNovidades(config) {
  return ehTexto(config.mensagemNovidades) ? config.mensagemNovidades : MENSAGEM_NOVIDADES_PADRAO;
}

function mensagemFavoritas(config) {
  return ehTexto(config.mensagemFavoritas) && config.mensagemFavoritas.includes("{pecas}") ? config.mensagemFavoritas : MENSAGEM_FAVORITAS_PADRAO;
}

module.exports = layout;
module.exports.ROTULOS = ROTULOS;
module.exports.ICONES = ICONES;
module.exports.TAMANHOS = TAMANHOS;
module.exports.jsonSeguro = jsonSeguro;
module.exports.resumirTexto = resumirTexto;
module.exports.derivarCores = derivarCores;
module.exports.mensagemTrocas = mensagemTrocas;
module.exports.mensagemSemPreco = mensagemSemPreco;
module.exports.mensagemMedidas = mensagemMedidas;
module.exports.mensagemNovidades = mensagemNovidades;
module.exports.MENSAGEM_ESGOTADO_PADRAO = MENSAGEM_ESGOTADO_PADRAO;
module.exports.carrossel = carrossel;
module.exports.componentes = {
  botaoWhats, linkWhats, cartao, corDaPeca, tabela, segmentos, migalhas, altFoto,
  imagem, preloadImagem, srcLeve, infoImagem, fotoMaisAlta, precoCurto,
  comMarca, textoComMarca, arrobaInstagram, nenhumPreco,
  imagemAmbiente, categoriasDasPecas, hrefCategoria, atributoWhats,
  botaoFavorito, hrefNavegacao, temVideos
};
