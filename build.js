#!/usr/bin/env node
// ============================================================
//  BUILD ESTÁTICO DO CATÁLOGO
//  Uso: node build.js [--dados <pasta>]
//
//  1. Carrega dados/config.js, dados/produtos.js e dados/conteudo.js
//  2. Valida tudo e para com mensagens claras se algo estiver errado
//  3. Renderiza as páginas de src/ e grava em dist/
//  4. Gera sitemap.xml, robots.txt e favicon
//  5. Copia assets/css, assets/js e img/ para dist/
//
//  Só usa módulos nativos do Node (fs, path, process). Funciona de qualquer pasta.
// ============================================================

"use strict";

const fs = require("fs");
const path = require("path");

const RAIZ = __dirname;
const DIST = path.join(RAIZ, "dist");
const util = require(path.join(RAIZ, "src", "util.js"));
const imagens = require(path.join(RAIZ, "src", "imagens.js"));

// ---------- saída de erro ----------

function falhar(mensagens) {
  console.error("");
  console.error("Erro no build. Corrija os pontos abaixo e rode de novo:");
  for (const m of mensagens) console.error("  - " + m);
  console.error("");
  process.exit(1);
}

// ---------- argumentos ----------

function lerArgumentos(argv) {
  const args = { dados: path.join(RAIZ, "dados") };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--dados") {
      if (!argv[i + 1]) falhar(["A opção --dados precisa do caminho de uma pasta. Ex: node build.js --dados ./meus-dados"]);
      args.dados = path.resolve(process.cwd(), argv[i + 1]);
      i++;
    } else if (a.startsWith("--dados=")) {
      args.dados = path.resolve(process.cwd(), a.slice("--dados=".length));
    } else if (a === "--ajuda" || a === "-h" || a === "--help") {
      console.log("Uso: node build.js [--dados <pasta>]");
      console.log("  --dados <pasta>  usa outra pasta com config.js, produtos.js e conteudo.js (padrão: dados/)");
      process.exit(0);
    } else {
      falhar([`Opção desconhecida: ${a}. Use: node build.js [--dados <pasta>]`]);
    }
  }
  return args;
}

// ---------- carga de módulos ----------

function carregarModulo(arquivo, rotulo) {
  if (!fs.existsSync(arquivo)) throw new Error(`Arquivo não encontrado: ${arquivo}`);
  const resolvido = require.resolve(arquivo);
  delete require.cache[resolvido];
  try {
    return require(resolvido);
  } catch (erro) {
    throw new Error(`Não foi possível carregar ${rotulo}: ${erro.message}`);
  }
}

// ---------- validação ----------

function ehTexto(v) { return typeof v === "string" && v.trim() !== ""; }
function ehNumero(v) { return typeof v === "number" && Number.isFinite(v); }
function ehLista(v) { return Array.isArray(v); }
function ehObjeto(v) { return v !== null && typeof v === "object" && !Array.isArray(v); }
function ehListaDeTextos(v) { return ehLista(v) && v.length > 0 && v.every(ehTexto); }
function contarPalavras(t) { return String(t).trim().split(/\s+/).filter(Boolean).length; }
function resumir(t, max = 60) { const s = String(t).replace(/\s+/g, " ").trim(); return s.length > max ? s.slice(0, max) + "..." : s; }

// Fotos locais (img/...) precisam existir; URLs externas passam sem srcset.
function validarFoto(caminho, rotulo, erros) {
  if (/^https?:\/\//i.test(caminho)) return;
  if (!imagens.ehLocal(caminho)) {
    erros.push(`${rotulo} deve estar na pasta img/ (ex: "img/foto1.jpeg") ou ser um endereço https://. Valor atual: "${caminho}"`);
  } else if (!fs.existsSync(path.join(RAIZ, imagens.caminhoRelativo(caminho)))) {
    erros.push(`${rotulo} aponta para "${caminho}", mas o arquivo não existe na pasta img/.`);
  }
}

function listaOuVazia(v) { return ehLista(v) ? v : []; }

// Todas as fotos locais usadas no site, para o mapa de dimensões e srcset.
function todasAsFotos(produtos, conteudo) {
  const estilos = ehObjeto(conteudo.estilos) ? listaOuVazia(conteudo.estilos.cards) : [];
  return [
    conteudo.hero.foto,
    ...listaOuVazia(conteudo.hero.fotos),
    conteudo.sobre.foto,
    ...listaOuVazia(conteudo.paineis).map((p) => p && p.foto).filter(ehTexto),
    ...listaOuVazia(conteudo.categorias).map((c) => c && c.foto).filter(ehTexto),
    ...estilos.map((m) => m && m.foto).filter(ehTexto),
    ehObjeto(conteudo.novidades) ? conteudo.novidades.foto : "",
    ...produtos.flatMap((p) => p.fotos)
  ].filter(ehTexto);
}

const ICONES_BENEFICIO = ["whatsapp", "video", "regua", "troca"];

// Blocos da home (todos opcionais): barra de topo, navegação, destaques do topo, categorias,
// estilos, painéis, coleção, benefícios, novidades e imagens de ambiente.
function validarVitrine(conteudo, erros) {
  const ambientes = ehObjeto(conteudo.ambientes) ? conteudo.ambientes : {};
  for (const [nome, a] of Object.entries(ambientes)) {
    if (!ehObjeto(a) || !ehTexto(a.url) || !/^https:\/\/images\.unsplash\.com\/photo-[\w-]+$/.test(a.url)) {
      erros.push(`conteudo.js: "ambientes.${nome}.url" deve ser o endereço base de uma foto do Unsplash, ex: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d" (sem o "?" e o que vem depois).`);
    }
    if (!ehObjeto(a) || !ehTexto(a.alt)) erros.push(`conteudo.js: "ambientes.${nome}.alt" é obrigatório (descrição da imagem).`);
  }
  const ambienteValido = (nome, rotulo) => {
    if (nome === undefined || nome === "") return;
    if (!ehTexto(nome) || !ambientes[nome]) erros.push(`conteudo.js: ${rotulo} usa o ambiente "${nome}", que não existe no bloco "ambientes".`);
  };

  if (conteudo.barraTopo !== undefined && !(ehLista(conteudo.barraTopo) && conteudo.barraTopo.every(ehTexto))) {
    erros.push('conteudo.js: "barraTopo" deve ser uma lista de frases curtas.');
  }
  listaOuVazia(conteudo.navegacao).forEach((n, i) => {
    if (!ehObjeto(n) || !ehTexto(n.texto) || !ehTexto(n.link)) erros.push(`conteudo.js: "navegacao[${i}]" precisa de texto e link.`);
  });

  const hero = ehObjeto(conteudo.hero) ? conteudo.hero : {};
  if (hero.rotulo !== undefined && typeof hero.rotulo !== "string") erros.push('conteudo.js: "hero.rotulo" deve ser um texto curto (ou "").');
  if (hero.fotos !== undefined && !ehLista(hero.fotos)) erros.push('conteudo.js: "hero.fotos" deve ser uma lista de fotos da pasta img/.');
  listaOuVazia(hero.fotos).forEach((f, i) => validarFoto(f, `conteudo.js: "hero.fotos[${i}]"`, erros));
  if (listaOuVazia(hero.fotos).length > 2) erros.push('conteudo.js: "hero.fotos" aceita até 2 fotos (com a foto principal, são 3 no topo).');
  listaOuVazia(hero.destaques).forEach((d, i) => {
    if (!ehObjeto(d) || !ehTexto(d.titulo) || !ehTexto(d.texto) || !ICONES_BENEFICIO.includes(d.icone)) {
      erros.push(`conteudo.js: "hero.destaques[${i}]" precisa de titulo, texto e icone (${ICONES_BENEFICIO.join(", ")}).`);
    }
  });

  listaOuVazia(conteudo.categorias).forEach((c, i) => {
    const r = `conteudo.js: "categorias[${i}]"`;
    if (!ehObjeto(c) || !ehTexto(c.nome) || !ehTexto(c.filtro)) {
      erros.push(`${r} precisa de nome e filtro.`);
      return;
    }
    if (c.filtro === "videos") return;
    if (!ehTexto(c.foto)) {
      erros.push(`${r} precisa de foto.`);
      return;
    }
    validarFoto(c.foto, `${r}.foto`, erros);
    if (c.rosto !== undefined && !(ehLista(c.rosto) && c.rosto.length === 2 && c.rosto.every(ehNumero))) {
      erros.push(`${r}.rosto deve ser [esquerda, cima] em %, ex: [45, 18].`);
    }
    if (c.zoom !== undefined && (!ehNumero(c.zoom) || c.zoom < 1 || c.zoom > 4)) erros.push(`${r}.zoom deve ser um número de 1 a 4.`);
  });

  if (conteudo.estilos !== undefined) {
    const est = conteudo.estilos;
    if (!ehObjeto(est) || !ehTexto(est.titulo) || !ehLista(est.cards)) {
      erros.push('conteudo.js: "estilos" precisa de titulo e cards.');
    } else {
      est.cards.forEach((m, i) => {
        if (!ehObjeto(m) || !ehTexto(m.titulo) || !ehTexto(m.filtro) || !ehTexto(m.foto)) {
          erros.push(`conteudo.js: "estilos.cards[${i}]" precisa de titulo, filtro e foto.`);
          return;
        }
        validarFoto(m.foto, `conteudo.js: "estilos.cards[${i}].foto"`, erros);
      });
    }
  }

  listaOuVazia(conteudo.paineis).forEach((p, i) => {
    const r = `conteudo.js: "paineis[${i}]"`;
    if (!ehObjeto(p) || !ehTexto(p.titulo) || !ehTexto(p.botao) || !ehTexto(p.link)) {
      erros.push(`${r} precisa de titulo, botao e link.`);
      return;
    }
    if (ehTexto(p.foto)) validarFoto(p.foto, `${r}.foto`, erros);
    else if (ehTexto(p.ambiente)) ambienteValido(p.ambiente, r);
    else erros.push(`${r} precisa de "foto" (foto de peça) ou de "ambiente".`);
  });

  if (conteudo.colecao !== undefined && (!ehObjeto(conteudo.colecao) || !ehTexto(conteudo.colecao.titulo))) {
    erros.push('conteudo.js: "colecao" precisa de titulo.');
  }

  listaOuVazia(conteudo.beneficios).forEach((b, i) => {
    if (!ehObjeto(b) || !ehTexto(b.titulo) || !ehTexto(b.texto) || !ICONES_BENEFICIO.includes(b.icone)) {
      erros.push(`conteudo.js: "beneficios[${i}]" precisa de titulo, texto e icone (${ICONES_BENEFICIO.join(", ")}).`);
    }
  });

  if (conteudo.novidades !== undefined) {
    const nv = conteudo.novidades;
    if (!ehObjeto(nv) || !ehTexto(nv.titulo) || !ehTexto(nv.texto) || !ehTexto(nv.foto)) erros.push('conteudo.js: "novidades" precisa de titulo, texto e foto.');
    else validarFoto(nv.foto, 'conteudo.js: "novidades.foto"', erros);
  }
  if (ehObjeto(conteudo.sobre)) ambienteValido(conteudo.sobre.ambiente, '"sobre"');
  if (ehObjeto(conteudo.trocas)) ambienteValido(conteudo.trocas.ambiente, '"trocas"');
}

// Aviso em destaque no fim do build: peças que estão saindo com "Preço pelo WhatsApp".
function avisarSemPreco(produtos) {
  const semPreco = produtos.filter((p) => !util.temPreco(p));
  if (!semPreco.length) return;
  const linha = "=".repeat(64);
  console.log("");
  console.log(linha);
  console.log(`  ATENÇÃO: ${semPreco.length} de ${produtos.length} peça(s) sem preço.`);
  console.log('  O site mostra "Preço pelo WhatsApp" no lugar do valor delas.');
  console.log('  Preencha "preco" em dados/produtos.js e rode o build de novo:');
  for (const p of semPreco) console.log(`    ${(p.sku || p.slug).padEnd(8)} ${p.nome}`);
  console.log(linha);
}

function validarConfig(config, erros, avisos) {
  if (!ehObjeto(config)) {
    erros.push("config.js precisa exportar um objeto: module.exports = { marca: ..., whatsapp: ..., ... }");
    return;
  }
  if (!ehTexto(config.marca)) erros.push('config.js: o campo "marca" é obrigatório (nome da marca).');

  if (!ehTexto(config.dominio)) {
    erros.push('config.js: o campo "dominio" é obrigatório, sem barra no final. Ex: "https://suamarca.vercel.app"');
  } else if (!/^https?:\/\/[^\s/?#]+$/i.test(config.dominio.replace(/\/+$/, ""))) {
    erros.push(`config.js: "dominio" precisa ser só o endereço do site, começando com https:// e sem caminho. Valor atual: "${config.dominio}"`);
  } else if (/\/$/.test(config.dominio)) {
    avisos.push('config.js: "dominio" termina com barra; ela será ignorada.');
  }

  if (!ehTexto(config.whatsapp)) {
    erros.push('config.js: o campo "whatsapp" é obrigatório. Use só dígitos: 55 + DDD + número. Ex: "5511999998888"');
  } else if (!/^55\d{10,11}$/.test(config.whatsapp)) {
    erros.push(`config.js: "whatsapp" deve ter só dígitos no formato 55 + DDD + número (12 ou 13 dígitos). Valor atual: "${config.whatsapp}"`);
  }

  if (config.instagram !== undefined && typeof config.instagram !== "string") {
    erros.push('config.js: "instagram" deve ser um texto (o usuário sem o @) ou "".');
  } else if (ehTexto(config.instagram) && /^@/.test(config.instagram)) {
    erros.push(`config.js: "instagram" deve ser o usuário sem o @. Valor atual: "${config.instagram}"`);
  }

  if (config.pixelId !== undefined && config.pixelId !== "" && !/^\d+$/.test(String(config.pixelId))) {
    erros.push('config.js: "pixelId" deve conter só números (ID do Pixel da Meta) ou ficar "".');
  }

  for (const campo of ["slogan", "email", "cnpj", "cidade", "aviso", "subtituloMarca"]) {
    if (config[campo] !== undefined && typeof config[campo] !== "string") {
      erros.push(`config.js: "${campo}" deve ser um texto (use "" para deixar vazio).`);
    }
  }

  if (!ehObjeto(config.pagamento)) {
    erros.push('config.js: o campo "pagamento" é obrigatório. Ex: pagamento: { pixDesconto: 10, parcelas: 3, semJuros: true }');
  } else {
    const pg = config.pagamento;
    if (!ehNumero(pg.pixDesconto) || pg.pixDesconto < 0 || pg.pixDesconto >= 100) {
      erros.push('config.js: "pagamento.pixDesconto" deve ser um número de 0 a 99 (porcentagem de desconto no PIX; 0 = sem desconto).');
    }
    if (!Number.isInteger(pg.parcelas) || pg.parcelas < 1) {
      erros.push('config.js: "pagamento.parcelas" deve ser um número inteiro maior ou igual a 1.');
    }
    if (pg.semJuros !== undefined && typeof pg.semJuros !== "boolean") {
      erros.push('config.js: "pagamento.semJuros" deve ser true ou false.');
    }
  }

  if (config.frete !== undefined) {
    if (!ehObjeto(config.frete)) {
      erros.push('config.js: "frete" deve ser um objeto. Ex: frete: { gratisAcima: 199, prazoTexto: "Postamos em até 2 dias úteis" }');
    } else {
      const f = config.frete;
      if (f.gratisAcima !== undefined && f.gratisAcima !== null && (!ehNumero(f.gratisAcima) || f.gratisAcima < 0)) {
        erros.push('config.js: "frete.gratisAcima" deve ser um número em reais (ou null para não ter frete grátis).');
      }
      if (f.prazoTexto !== undefined && typeof f.prazoTexto !== "string") {
        erros.push('config.js: "frete.prazoTexto" deve ser um texto.');
      }
    }
  }

  if (!ehTexto(config.mensagemGeral)) {
    erros.push('config.js: o campo "mensagemGeral" é obrigatório (mensagem dos botões gerais de WhatsApp).');
  }
  if (!ehTexto(config.mensagemProduto)) {
    erros.push('config.js: o campo "mensagemProduto" é obrigatório (mensagem do botão de cada peça).');
  } else if (!config.mensagemProduto.includes("{produto}")) {
    erros.push('config.js: "mensagemProduto" precisa conter {produto} para o nome da peça entrar na mensagem.');
  }
  for (const campo of ["mensagemTrocas", "mensagemEsgotado", "mensagemProdutoSemPreco", "mensagemMedidas", "mensagemNovidades", "mensagemFavoritas"]) {
    if (config[campo] !== undefined && typeof config[campo] !== "string") {
      erros.push(`config.js: "${campo}" deve ser um texto (ou remova a linha para usar o padrão).`);
    }
  }
  if (ehTexto(config.mensagemFavoritas) && !config.mensagemFavoritas.includes("{pecas}")) {
    erros.push('config.js: "mensagemFavoritas" precisa conter {pecas} para a lista das peças salvas entrar na mensagem.');
  }

  if (config.identidade !== undefined) {
    if (!ehObjeto(config.identidade)) {
      erros.push('config.js: "identidade" deve ser um objeto com logo, favicon, corAcento, corFundo, corTinta, fonteTitulo e fonteTexto (todos podem ficar "").');
    } else {
      const idt = config.identidade;
      for (const campo of ["logo", "favicon", "corAcento", "corFundo", "corTinta", "fonteTitulo", "fonteTexto"]) {
        if (idt[campo] !== undefined && typeof idt[campo] !== "string") {
          erros.push(`config.js: "identidade.${campo}" deve ser um texto (use "" para o padrão).`);
        }
      }
      for (const campo of ["corAcento", "corFundo", "corTinta"]) {
        if (ehTexto(idt[campo]) && !/^(#[0-9a-f]{3,8}|rgb|hsl)/i.test(idt[campo].trim())) {
          avisos.push(`config.js: "identidade.${campo}" não parece uma cor CSS válida ("${idt[campo]}"). Use hexadecimal, ex: "#0e7a41".`);
        }
      }
      for (const campo of ["logo", "favicon"]) {
        if (ehTexto(idt[campo])) {
          const arquivo = path.join(RAIZ, idt[campo]);
          if (!fs.existsSync(arquivo)) {
            erros.push(`config.js: o arquivo de "identidade.${campo}" não foi encontrado: ${arquivo}`);
          } else if (campo === "favicon" && !/\.(svg|png|ico)$/i.test(arquivo)) {
            erros.push(`config.js: "identidade.favicon" deve ser um arquivo .svg, .png ou .ico. Valor atual: "${idt[campo]}"`);
          }
        }
      }
    }
  }
}

function validarProdutos(produtos, erros, avisos) {
  if (!ehLista(produtos)) {
    erros.push("produtos.js precisa exportar uma lista: module.exports = [ { nome: ..., preco: ..., ... }, ... ]");
    return;
  }
  if (produtos.length === 0) erros.push("produtos.js: a lista de produtos está vazia. Cadastre pelo menos uma peça.");

  produtos.forEach((p, i) => {
    const n = i + 1;
    if (!ehObjeto(p)) {
      erros.push(`Produto ${n} não é um objeto { ... }.`);
      return;
    }
    const rotulo = ehTexto(p.nome) ? `Produto ${n} ("${p.nome}")` : `Produto ${n}`;

    if (!ehTexto(p.nome)) erros.push(`Produto ${n} está sem o campo nome.`);

    // Preço é opcional: null ou ausente mostra "Preço pelo WhatsApp" (o build lista essas peças no fim).
    const semPreco = p.preco === undefined || p.preco === null;
    if (!semPreco && (!ehNumero(p.preco) || p.preco <= 0)) {
      erros.push(`${rotulo}: "preco" deve ser um número maior que zero, com ponto decimal (ex: 159.9), ou null enquanto não tiver preço. Valor atual: ${JSON.stringify(p.preco)}`);
    }

    if (p.precoAntigo !== undefined && p.precoAntigo !== null) {
      if (!ehNumero(p.precoAntigo) || p.precoAntigo <= 0) {
        erros.push(`${rotulo}: "precoAntigo" deve ser um número maior que zero ou ser removido.`);
      } else if (semPreco) {
        erros.push(`${rotulo}: tem "precoAntigo" mas está sem "preco". Preencha o preço atual ou remova o preço antigo.`);
      } else if (ehNumero(p.preco) && p.precoAntigo <= p.preco) {
        avisos.push(`${rotulo}: "precoAntigo" (${p.precoAntigo}) não é maior que "preco" (${p.preco}); o preço riscado vai parecer errado.`);
      }
    }

    if (p.slug !== undefined && !ehTexto(p.slug)) erros.push(`${rotulo}: "slug" deve ser um texto ou ser removido (o build gera a partir do nome).`);
    if (p.tag !== undefined && typeof p.tag !== "string") erros.push(`${rotulo}: "tag" deve ser um texto curto, ex: "Novo".`);
    if (p.destaque !== undefined && typeof p.destaque !== "boolean") erros.push(`${rotulo}: "destaque" deve ser true ou false.`);
    if (p.cor !== undefined && typeof p.cor !== "string") erros.push(`${rotulo}: "cor" deve ser um texto.`);
    if (p.corHex !== undefined && p.corHex !== "" && !/^#[0-9a-f]{6}$/i.test(String(p.corHex))) {
      erros.push(`${rotulo}: "corHex" deve ser uma cor em código com 6 dígitos, ex: "#489bfd". Valor atual: ${JSON.stringify(p.corHex)}`);
    }
    if (p.categoria !== undefined && typeof p.categoria !== "string") erros.push(`${rotulo}: "categoria" deve ser um texto, ex: "Vestidos".`);

    if (!ehListaDeTextos(p.tamanhos)) {
      erros.push(`${rotulo} está sem o campo tamanhos (lista com pelo menos um tamanho, ex: ["P", "M", "G"]).`);
    }

    if (!ehListaDeTextos(p.fotos)) {
      erros.push(`${rotulo} está sem o campo fotos (lista com 1 a 5 endereços de imagem; a primeira é a principal).`);
    } else {
      if (p.fotos.length > 5) avisos.push(`${rotulo} tem ${p.fotos.length} fotos; o contrato prevê até 5, as extras podem não aparecer.`);
      p.fotos.forEach((f, j) => validarFoto(f, `${rotulo}: a foto ${j + 1}`, erros));
    }

    if (p.video !== undefined && p.video !== null && p.video !== "") {
      if (!ehTexto(p.video)) {
        erros.push(`${rotulo}: "video" deve ser o caminho de um arquivo .mp4 na pasta img/, ex: "img/video-foto1.mp4".`);
      } else if (!/\.mp4$/i.test(p.video) || !imagens.ehLocal(p.video)) {
        erros.push(`${rotulo}: "video" deve ser um arquivo .mp4 dentro da pasta img/, ex: "img/video-foto1.mp4". Valor atual: "${p.video}"`);
      } else if (!fs.existsSync(path.join(RAIZ, imagens.caminhoRelativo(p.video)))) {
        erros.push(`${rotulo}: o vídeo "${p.video}" não existe na pasta img/.`);
      }
    }

    if (!ehTexto(p.descricao)) erros.push(`${rotulo} está sem o campo descricao (2 a 3 frases sobre a peça).`);

    if (p.detalhes !== undefined && !(ehLista(p.detalhes) && p.detalhes.every(ehTexto))) {
      erros.push(`${rotulo}: "detalhes" deve ser uma lista de textos, ex: ["Tecido com elastano", "Alças ajustáveis"].`);
    }
    for (const campo of ["composicao", "cuidados", "modelo"]) {
      if (p[campo] !== undefined && typeof p[campo] !== "string") erros.push(`${rotulo}: "${campo}" deve ser um texto.`);
    }

    if (p.medidas !== undefined) {
      if (!ehObjeto(p.medidas)) {
        erros.push(`${rotulo}: "medidas" deve ser um objeto com uma chave por tamanho, ex: { P: { busto: 84, cintura: 66 } }.`);
      } else {
        const tamanhos = ehLista(p.tamanhos) ? p.tamanhos : [];
        for (const [tam, med] of Object.entries(p.medidas)) {
          if (!tamanhos.includes(tam)) {
            erros.push(`${rotulo}: "medidas" tem o tamanho "${tam}", que não está em "tamanhos" (${tamanhos.join(", ")}).`);
          }
          if (!ehObjeto(med)) {
            erros.push(`${rotulo}: "medidas.${tam}" deve ser um objeto com números em cm, ex: { busto: 84, cintura: 66 }.`);
            continue;
          }
          for (const [parte, valor] of Object.entries(med)) {
            if (!ehNumero(valor)) erros.push(`${rotulo}: "medidas.${tam}.${parte}" deve ser um número em cm. Valor atual: ${JSON.stringify(valor)}`);
          }
        }
      }
    }
  });
}

function validarConteudo(conteudo, erros, avisos) {
  if (!ehObjeto(conteudo)) {
    erros.push("conteudo.js precisa exportar um objeto: module.exports = { hero, sobre, depoimentos, guiaMedidas, faq, trocas, rodape }");
    return;
  }

  if (!ehObjeto(conteudo.hero)) {
    erros.push('conteudo.js: o bloco "hero" é obrigatório ({ titulo, subtitulo, foto, ctaTexto }).');
  } else {
    const h = conteudo.hero;
    if (!ehTexto(h.titulo)) erros.push('conteudo.js: "hero.titulo" é obrigatório.');
    if (!ehTexto(h.subtitulo)) erros.push('conteudo.js: "hero.subtitulo" é obrigatório.');
    else if (contarPalavras(h.subtitulo) > 20) avisos.push(`conteudo.js: "hero.subtitulo" tem ${contarPalavras(h.subtitulo)} palavras; o ideal são até 20.`);
    if (!ehTexto(h.foto)) erros.push('conteudo.js: "hero.foto" é obrigatório (ex: "img/hero.jpg" ou uma URL).');
    else validarFoto(h.foto, 'conteudo.js: "hero.foto"', erros);
    if (h.ctaTexto !== undefined && !ehTexto(h.ctaTexto)) erros.push('conteudo.js: "hero.ctaTexto" deve ser um texto curto, ex: "Ver a coleção".');
  }

  if (!ehObjeto(conteudo.sobre)) {
    erros.push('conteudo.js: o bloco "sobre" é obrigatório ({ titulo, paragrafos, foto }).');
  } else {
    const s = conteudo.sobre;
    if (!ehTexto(s.titulo)) erros.push('conteudo.js: "sobre.titulo" é obrigatório.');
    if (!ehListaDeTextos(s.paragrafos)) erros.push('conteudo.js: "sobre.paragrafos" deve ser uma lista com pelo menos um parágrafo.');
    if (!ehTexto(s.foto)) erros.push('conteudo.js: "sobre.foto" é obrigatório (ex: "img/sobre.jpg" ou uma URL).');
    else validarFoto(s.foto, 'conteudo.js: "sobre.foto"', erros);
  }

  if (!ehLista(conteudo.depoimentos)) {
    erros.push('conteudo.js: "depoimentos" deve ser uma lista (pode ser vazia: [] para esconder a seção).');
  } else {
    conteudo.depoimentos.forEach((d, i) => {
      const n = i + 1;
      if (!ehObjeto(d)) {
        erros.push(`conteudo.js: depoimento ${n} não é um objeto { nome, cidade, texto, peca }.`);
        return;
      }
      if (!ehTexto(d.nome)) erros.push(`conteudo.js: depoimento ${n} está sem o campo nome.`);
      if (!ehTexto(d.texto)) erros.push(`conteudo.js: depoimento ${n} está sem o campo texto.`);
      for (const campo of ["cidade", "peca"]) {
        if (d[campo] !== undefined && typeof d[campo] !== "string") erros.push(`conteudo.js: depoimento ${n}: "${campo}" deve ser um texto.`);
      }
    });
  }

  if (!ehObjeto(conteudo.guiaMedidas)) {
    erros.push('conteudo.js: o bloco "guiaMedidas" é obrigatório ({ intro, comoMedir, tabela }).');
  } else {
    const g = conteudo.guiaMedidas;
    if (!ehTexto(g.intro)) erros.push('conteudo.js: "guiaMedidas.intro" é obrigatório.');
    if (!ehLista(g.comoMedir) || g.comoMedir.length === 0) {
      erros.push('conteudo.js: "guiaMedidas.comoMedir" deve ser uma lista de { parte, instrucao }.');
    } else {
      g.comoMedir.forEach((item, i) => {
        if (!ehObjeto(item) || !ehTexto(item.parte) || !ehTexto(item.instrucao)) {
          erros.push(`conteudo.js: "guiaMedidas.comoMedir[${i}]" precisa de parte e instrucao.`);
        }
      });
    }
    if (!ehObjeto(g.tabela)) {
      erros.push('conteudo.js: "guiaMedidas.tabela" é obrigatório ({ colunas, linhas }).');
    } else {
      if (!ehListaDeTextos(g.tabela.colunas)) {
        erros.push('conteudo.js: "guiaMedidas.tabela.colunas" deve ser uma lista de textos, ex: ["Tamanho", "Busto", "Cintura", "Quadril"].');
      }
      if (!ehLista(g.tabela.linhas) || g.tabela.linhas.length === 0) {
        erros.push('conteudo.js: "guiaMedidas.tabela.linhas" deve ser uma lista de linhas, ex: [["P", "82-86", "62-66", "90-94"]].');
      } else if (ehLista(g.tabela.colunas)) {
        g.tabela.linhas.forEach((linha, i) => {
          if (!ehLista(linha)) {
            erros.push(`conteudo.js: "guiaMedidas.tabela.linhas[${i}]" deve ser uma lista de valores.`);
          } else if (linha.length !== g.tabela.colunas.length) {
            erros.push(`conteudo.js: "guiaMedidas.tabela.linhas[${i}]" tem ${linha.length} valores, mas a tabela tem ${g.tabela.colunas.length} colunas.`);
          }
        });
      }
    }
  }

  if (!ehLista(conteudo.faq) || conteudo.faq.length === 0) {
    erros.push('conteudo.js: "faq" deve ser uma lista de { pergunta, resposta } (6 a 8 itens).');
  } else {
    conteudo.faq.forEach((f, i) => {
      if (!ehObjeto(f) || !ehTexto(f.pergunta) || !ehTexto(f.resposta)) {
        erros.push(`conteudo.js: "faq[${i}]" precisa de pergunta e resposta.`);
      }
    });
    if (conteudo.faq.length < 6 || conteudo.faq.length > 8) {
      avisos.push(`conteudo.js: "faq" tem ${conteudo.faq.length} itens; o ideal são de 6 a 8.`);
    }
  }

  if (!ehObjeto(conteudo.trocas)) {
    erros.push('conteudo.js: o bloco "trocas" é obrigatório ({ resumo, secoes }).');
  } else {
    const t = conteudo.trocas;
    if (!ehTexto(t.resumo)) erros.push('conteudo.js: "trocas.resumo" é obrigatório (1 parágrafo para a home).');
    if (!ehLista(t.secoes) || t.secoes.length === 0) {
      erros.push('conteudo.js: "trocas.secoes" deve ser uma lista de { titulo, paragrafos }.');
    } else {
      t.secoes.forEach((s, i) => {
        if (!ehObjeto(s) || !ehTexto(s.titulo) || !ehListaDeTextos(s.paragrafos)) {
          erros.push(`conteudo.js: "trocas.secoes[${i}]" precisa de titulo e paragrafos (lista com pelo menos um parágrafo).`);
        }
      });
    }
  }

  if (conteudo.rodape !== undefined) {
    if (!ehObjeto(conteudo.rodape)) {
      erros.push('conteudo.js: "rodape" deve ser um objeto, ex: { texto: "" }.');
    } else if (conteudo.rodape.texto !== undefined && typeof conteudo.rodape.texto !== "string") {
      erros.push('conteudo.js: "rodape.texto" deve ser um texto (use "" para vazio).');
    }
  }
}

// Regra do projeto: nenhum travessão ou meio-traço em texto visível.
// Varre todos os textos dos dados e aponta onde aparecem.
// Os dois caracteres são montados pelo código Unicode (U+2013 e U+2014) para não aparecerem neste arquivo.
const REGEX_TRACOS_PROIBIDOS = new RegExp("[" + String.fromCharCode(0x2013, 0x2014) + "]");

// prefixo: de onde vem o dado (ex: 'conteudo.js' ou 'Produto 3 ("Camisa")'); caminho: campo dentro dele.
function procurarTracos(valor, prefixo, erros, caminho = "") {
  if (typeof valor === "string") {
    if (REGEX_TRACOS_PROIBIDOS.test(valor)) {
      erros.push(`${prefixo}: ${caminho || "texto"} contém travessão ou meio-traço, que são proibidos no projeto. Troque por vírgula, ponto, dois-pontos ou hífen simples (-). Trecho: "${resumir(valor)}"`);
    }
  } else if (ehLista(valor)) {
    valor.forEach((v, i) => procurarTracos(v, prefixo, erros, `${caminho}[${i}]`));
  } else if (ehObjeto(valor)) {
    for (const [k, v] of Object.entries(valor)) procurarTracos(v, prefixo, erros, caminho ? `${caminho}.${k}` : k);
  }
}

// ---------- preparação dos produtos ----------

function resolverSlugs(produtos, avisos) {
  const usados = new Set();
  return produtos.map((p, i) => {
    let base = util.slugify(p.slug || p.nome);
    if (!base) base = "peca-" + (i + 1);
    let slug = base;
    let n = 2;
    while (usados.has(slug)) slug = `${base}-${n++}`;
    if (slug !== base) avisos.push(`Produto ${i + 1} ("${p.nome}"): o slug "${base}" já estava em uso; usando "${slug}".`);
    usados.add(slug);
    return { ...p, slug };
  });
}

// Destaques primeiro, mantendo a ordem do arquivo dentro de cada grupo.
function ordenarProdutos(produtos) {
  return produtos
    .map((p, i) => ({ p, i }))
    .sort((a, b) => Number(b.p.destaque === true) - Number(a.p.destaque === true) || a.i - b.i)
    .map((x) => x.p);
}

// ---------- gravação e cópia ----------

function gravar(relativo, conteudo) {
  const destino = path.join(DIST, relativo);
  fs.mkdirSync(path.dirname(destino), { recursive: true });
  fs.writeFileSync(destino, conteudo, "utf8");
  return Buffer.byteLength(conteudo, "utf8");
}

function contarArquivos(pasta) {
  if (!fs.existsSync(pasta)) return 0;
  let total = 0;
  for (const item of fs.readdirSync(pasta, { withFileTypes: true })) {
    total += item.isDirectory() ? contarArquivos(path.join(pasta, item.name)) : 1;
  }
  return total;
}

function copiarPasta(origem, destino, rotulo) {
  if (!fs.existsSync(origem)) {
    console.log(`  --  ${rotulo}: pasta ${origem} não existe, nada copiado.`);
    return;
  }
  fs.cpSync(origem, destino, {
    recursive: true,
    filter: (src) => path.extname(src).toLowerCase() !== ".txt"
  });
  console.log(`  OK  ${rotulo}: ${contarArquivos(destino)} arquivo(s) copiado(s) para ${path.relative(RAIZ, destino)}`);
}

function formatarTamanho(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1).replace(".", ",")} KB`;
}

// ---------- favicon, sitemap, robots ----------

function gerarFavicon(config) {
  const idt = config.identidade || {};
  if (ehTexto(idt.favicon)) {
    const origem = path.join(RAIZ, idt.favicon);
    const nome = "favicon" + path.extname(origem).toLowerCase();
    fs.copyFileSync(origem, path.join(DIST, nome));
    return nome;
  }
  // Tinta com a inicial no fundo, como os botões pretos e o rodapé (o verde fica só no WhatsApp).
  const { derivarCores } = require(path.join(RAIZ, "src", "layout.js"));
  const cores = derivarCores(idt).hex;
  const inicial = (config.marca.trim().charAt(0) || "M").toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">` +
    `<rect width="64" height="64" rx="8" fill="${util.escapeHtml(cores.tinta)}"/>` +
    `<text x="32" y="45" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="36" font-weight="700" fill="${util.escapeHtml(cores.fundo)}">${util.escapeHtml(inicial)}</text>` +
    `</svg>\n`;
  gravar("favicon.svg", svg);
  return "favicon.svg";
}

function gerarSitemap(config, caminhos) {
  const hoje = new Date().toISOString().slice(0, 10);
  const itens = caminhos
    .map((c) => `  <url>\n    <loc>${util.escapeHtml(util.urlAbsoluta(config, c))}</loc>\n    <lastmod>${hoje}</lastmod>\n  </url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${itens}\n</urlset>\n`;
}

function gerarRobots(config) {
  return `User-agent: *\nAllow: /\n\nSitemap: ${util.urlAbsoluta(config, "sitemap.xml")}\n`;
}

// ---------- fluxo principal ----------

function main() {
  const inicio = process.hrtime.bigint();
  const args = lerArgumentos(process.argv.slice(2));

  console.log("Build do catálogo");
  console.log(`  dados: ${args.dados}`);
  console.log(`  saída: ${DIST}`);

  // 1. carregar dados
  let config, produtos, conteudo;
  try {
    config = carregarModulo(path.join(args.dados, "config.js"), "config.js");
    produtos = carregarModulo(path.join(args.dados, "produtos.js"), "produtos.js");
    conteudo = carregarModulo(path.join(args.dados, "conteudo.js"), "conteudo.js");
  } catch (erro) {
    falhar([erro.message]);
  }

  // 2. validar
  const erros = [];
  const avisos = [];
  validarConfig(config, erros, avisos);
  validarProdutos(produtos, erros, avisos);
  validarConteudo(conteudo, erros, avisos);
  if (ehObjeto(conteudo)) validarVitrine(conteudo, erros);
  procurarTracos(config, "config.js", erros);
  if (ehLista(produtos)) {
    produtos.forEach((p, i) => {
      const rotulo = ehObjeto(p) && ehTexto(p.nome) ? `Produto ${i + 1} ("${p.nome}")` : `Produto ${i + 1}`;
      procurarTracos(p, rotulo, erros);
    });
  }
  procurarTracos(conteudo, "conteudo.js", erros);
  if (erros.length) falhar(erros);

  const lista = ordenarProdutos(resolverSlugs(produtos, avisos));
  const mapaImagens = imagens.mapearImagens(RAIZ, todasAsFotos(lista, conteudo), avisos);
  for (const a of avisos) console.log(`  Aviso: ${a}`);

  // 3. carregar renderizadores
  let renderHome, renderProduto, renderTrocas, render404;
  try {
    renderHome = carregarModulo(path.join(RAIZ, "src", "home.js"), "src/home.js");
    renderProduto = carregarModulo(path.join(RAIZ, "src", "produto.js"), "src/produto.js");
    renderTrocas = carregarModulo(path.join(RAIZ, "src", "trocas.js"), "src/trocas.js");
    render404 = carregarModulo(path.join(RAIZ, "src", "naoEncontrado.js"), "src/naoEncontrado.js");
  } catch (erro) {
    falhar([erro.message]);
  }

  // 4. limpar dist/
  try {
    fs.rmSync(DIST, { recursive: true, force: true });
    fs.mkdirSync(DIST, { recursive: true });
  } catch (erro) {
    falhar([`Não foi possível limpar a pasta dist/ (${erro.message}). Feche programas que estejam usando a pasta e tente de novo.`]);
  }

  // 5. renderizar
  const ctx = { config, conteudo, produtos: lista, util, imagens: mapaImagens };
  const nomeFavicon = gerarFavicon(config);
  ctx.favicon = "/" + nomeFavicon;

  const paginas = [];
  function renderizar(rotulo, relativo, fn) {
    let html;
    try {
      html = fn();
    } catch (erro) {
      falhar([`Erro ao renderizar ${rotulo}: ${erro.stack || erro.message}`]);
    }
    if (typeof html !== "string" || !html.trim()) falhar([`O renderizador de ${rotulo} não devolveu HTML (string).`]);
    paginas.push({ rotulo, relativo, bytes: gravar(relativo, html) });
  }

  renderizar("home", "index.html", () => renderHome(ctx));
  for (const p of lista) {
    renderizar(`peça "${p.nome}"`, path.join("p", p.slug, "index.html"), () => renderProduto(ctx, p));
  }
  renderizar("trocas", path.join("trocas", "index.html"), () => renderTrocas(ctx));
  renderizar("404", "404.html", () => render404(ctx));

  // 6. sitemap e robots
  const caminhos = ["/", "/trocas/", ...lista.map((p) => `/p/${p.slug}/`)];
  gravar("sitemap.xml", gerarSitemap(config, caminhos));
  gravar("robots.txt", gerarRobots(config));

  // 7. copiar arquivos estáticos
  console.log("");
  console.log("Arquivos estáticos:");
  copiarPasta(path.join(RAIZ, "assets", "css"), path.join(DIST, "css"), "css");
  copiarPasta(path.join(RAIZ, "assets", "js"), path.join(DIST, "js"), "js");
  copiarPasta(path.join(RAIZ, "img"), path.join(DIST, "img"), "img");

  // 8. resumo
  console.log("");
  console.log("Páginas geradas:");
  for (const pg of paginas) {
    const url = "/" + pg.relativo.split(path.sep).join("/");
    console.log(`  OK  ${url}  (${formatarTamanho(pg.bytes)})`);
  }
  console.log(`  OK  /sitemap.xml (${caminhos.length} endereços), /robots.txt, /${nomeFavicon}`);

  const ms = Number(process.hrtime.bigint() - inicio) / 1e6;
  console.log("");
  console.log(`Build concluído: ${paginas.length} páginas em ${ms.toFixed(0)} ms.`);
  avisarSemPreco(lista);
}

try {
  main();
} catch (erro) {
  falhar([`Erro inesperado: ${erro.stack || erro.message}`]);
}
