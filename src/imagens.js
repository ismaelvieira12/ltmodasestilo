// Fotos locais: largura e altura reais lidas do cabeçalho do arquivo (JPEG e PNG,
// Node puro) e versões menores de img/640 e img/828 para o srcset, quando existirem.
// Usado pelo build.js (validação e mapa de imagens) e pelo layout.js (atributos do <img>).

"use strict";

const fs = require("fs");
const path = require("path");

// Pastas geradas por scripts/miniaturas.ps1 (npm run fotos). A de 640 é a "leve" (pôster,
// miniatura da galeria); a de 828 só existe para fotos com mais de 911px de largura.
const PASTAS_MINIATURAS = ["640", "828"];
const PASTA_MINIATURAS = PASTAS_MINIATURAS[0];
// Fotos externas (URL) e arquivos que não deu para ler entram como 3:4, o formato do catálogo.
const DIMENSOES_PADRAO = { largura: 1200, altura: 1600 };

function ehLocal(caminho) {
  return /^\/?img\//.test(String(caminho || ""));
}

// "img/foto1.jpeg" ou "/img/foto1.jpeg" -> "img/foto1.jpeg" (relativo à raiz do projeto)
function caminhoRelativo(caminho) {
  return String(caminho).replace(/^\/+/, "");
}

function dimensoesPng(buf) {
  if (buf.length < 24 || buf.toString("ascii", 12, 16) !== "IHDR") return null;
  return { largura: buf.readUInt32BE(16), altura: buf.readUInt32BE(20) };
}

// Orientação gravada pela câmera (tag 0x0112 do bloco EXIF). 5 a 8 = foto girada 90 graus.
function orientacaoExif(buf, inicio, fim) {
  if (buf.toString("ascii", inicio, inicio + 4) !== "Exif") return 1;
  const tiff = inicio + 6;
  const littleEndian = buf.toString("ascii", tiff, tiff + 2) === "II";
  const u16 = (o) => (littleEndian ? buf.readUInt16LE(o) : buf.readUInt16BE(o));
  const u32 = (o) => (littleEndian ? buf.readUInt32LE(o) : buf.readUInt32BE(o));
  const ifd = tiff + u32(tiff + 4);
  if (ifd + 2 > fim) return 1;
  const entradas = u16(ifd);
  for (let i = 0; i < entradas; i++) {
    const entrada = ifd + 2 + i * 12;
    if (entrada + 12 > fim) break;
    if (u16(entrada) === 0x0112) return u16(entrada + 8);
  }
  return 1;
}

// Percorre os marcadores do JPEG até o SOF (início do quadro), onde estão altura e largura.
function dimensoesJpeg(buf) {
  const SEM_TAMANHO = [0xd8, 0x01, 0xd0, 0xd1, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7];
  const NAO_SOF = [0xc4, 0xc8, 0xcc];
  let i = 2;
  let orientacao = 1;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marcador = buf[i + 1];
    if (marcador === 0xff) { i++; continue; }
    if (SEM_TAMANHO.includes(marcador)) { i += 2; continue; }
    const tamanho = buf.readUInt16BE(i + 2);
    if (marcador === 0xe1) orientacao = orientacaoExif(buf, i + 4, i + 2 + tamanho);
    if (marcador >= 0xc0 && marcador <= 0xcf && !NAO_SOF.includes(marcador)) {
      const altura = buf.readUInt16BE(i + 5);
      const largura = buf.readUInt16BE(i + 7);
      return orientacao >= 5 ? { largura: altura, altura: largura } : { largura, altura };
    }
    i += 2 + tamanho;
  }
  return null;
}

function lerDimensoes(arquivo) {
  const buf = fs.readFileSync(arquivo);
  if (buf.length > 8 && buf[0] === 0x89 && buf.toString("ascii", 1, 4) === "PNG") return dimensoesPng(buf);
  if (buf.length > 4 && buf[0] === 0xff && buf[1] === 0xd8) return dimensoesJpeg(buf);
  return null;
}

// "img/foto1.2.jpeg" -> "img/640/foto1.2.jpg" (mesmo nome gerado por scripts/miniaturas.ps1)
function caminhoMiniatura(relativo, pasta = PASTA_MINIATURAS) {
  const partes = path.posix.parse(relativo);
  return path.posix.join(partes.dir, pasta, partes.name + ".jpg");
}

// Versões menores que existem em disco e são mais estreitas que o original, da menor para a maior.
function versoesMenores(raiz, relativo, larguraOriginal) {
  return PASTAS_MINIATURAS.map((pasta) => {
    const rel = caminhoMiniatura(relativo, pasta);
    const arquivo = path.join(raiz, rel);
    if (!fs.existsSync(arquivo)) return null;
    const dim = lerDimensoes(arquivo);
    return dim && dim.largura < larguraOriginal ? { src: "/" + rel, largura: dim.largura } : null;
  }).filter(Boolean).sort((a, b) => a.largura - b.largura);
}

// Descreve uma foto para o HTML: src absoluto, dimensões reais, miniatura de 640 (ou null)
// e todas as versões menores (versoes) para o srcset.
// avisos recebe o que não impede o build (miniatura faltando, formato não lido).
function analisarImagem(raiz, caminho, avisos) {
  if (!ehLocal(caminho)) {
    return { src: caminho, largura: DIMENSOES_PADRAO.largura, altura: DIMENSOES_PADRAO.altura, miniatura: null, versoes: [] };
  }
  const relativo = caminhoRelativo(caminho);
  let dimensoes = null;
  try {
    dimensoes = lerDimensoes(path.join(raiz, relativo));
  } catch (erro) {
    dimensoes = null;
  }
  if (!dimensoes) {
    avisos.push(`Não foi possível ler largura e altura de "${relativo}" (use JPEG ou PNG); usando 3:4.`);
    dimensoes = DIMENSOES_PADRAO;
  }

  const versoes = versoesMenores(raiz, relativo, dimensoes.largura);
  const relMiniatura = caminhoMiniatura(relativo);
  const miniatura = versoes.find((v) => v.src === "/" + relMiniatura) || null;
  if (!miniatura && dimensoes.largura > Number(PASTA_MINIATURAS) && !fs.existsSync(path.join(raiz, relMiniatura))) {
    avisos.push(`"${relativo}" está sem miniatura em ${path.posix.dirname(relMiniatura)}/. Rode "npm run fotos" no Windows para gerar.`);
  }

  return { src: "/" + relativo, largura: dimensoes.largura, altura: dimensoes.altura, miniatura, versoes };
}

// Mapa { caminho como está nos dados: descrição } de todas as fotos usadas.
function mapearImagens(raiz, caminhos, avisos) {
  const mapa = {};
  for (const caminho of caminhos) {
    if (!mapa[caminho]) mapa[caminho] = analisarImagem(raiz, caminho, avisos);
  }
  return mapa;
}

// "/img/640/x.jpg 640w, /img/828/x.jpg 828w, /img/x.jpeg 1200w" (larguras reais lidas dos arquivos).
function srcset(info) {
  const versoes = info.versoes || (info.miniatura ? [info.miniatura] : []);
  if (!versoes.length) return "";
  return [...versoes, { src: info.src, largura: info.largura }].map((v) => `${v.src} ${v.largura}w`).join(", ");
}

module.exports = { ehLocal, caminhoRelativo, lerDimensoes, analisarImagem, mapearImagens, srcset, DIMENSOES_PADRAO };
