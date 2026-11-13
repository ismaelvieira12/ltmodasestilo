// Página /trocas/: política completa em coluna de leitura, com CTA para o WhatsApp.
// Assinatura do contrato: renderTrocas(ctx) -> string

"use strict";

const layout = require("./layout.js");

const { ROTULOS, mensagemTrocas } = layout;
const { botaoWhats, migalhas, textoComMarca } = layout.componentes;

module.exports = function renderTrocas(ctx) {
  const { config, conteudo, util } = ctx;
  const t = conteudo.trocas;
  // Só o botão do fim da política fala de troca (outra intenção, outro rótulo: "Falar sobre uma troca").
  // Topo, menu e rodapé continuam com a mensagem geral, como no resto do site.
  const hrefTrocas = util.linkWhats(config, mensagemTrocas(config));

  const secoes = t.secoes.map((s, i) => `    <section class="leitura-secao" aria-labelledby="trocas-secao-${i + 1}">
      <h2 id="trocas-secao-${i + 1}">${textoComMarca(ctx, s.titulo)}</h2>
      ${s.paragrafos.map((p) => `<p>${textoComMarca(ctx, p)}</p>`).join("\n      ")}
    </section>`).join("\n");

  const corpo = `<div class="container">
  ${migalhas(ctx, [{ texto: "Início", href: "/" }, { texto: "Trocas e devoluções" }])}
  <article class="leitura">
    <p class="rotulo">Política da loja</p>
    <h1>Trocas e devoluções</h1>
    <p class="leitura-abertura">${textoComMarca(ctx, t.resumo)}</p>
${secoes}
    <div class="leitura-acoes">
      ${botaoWhats(ctx, { href: hrefTrocas, tipo: "trocas", rotulo: ROTULOS.troca })}
      <a class="link" href="/#colecao">${ROTULOS.catalogo}</a>
    </div>
  </article>
</div>`;

  return layout({
    ctx,
    titulo: "Trocas e devoluções",
    descricao: t.resumo,
    caminho: "/trocas/",
    ogImagem: conteudo.hero.foto,
    corpo,
    classeBody: "pagina-trocas"
  });
};
