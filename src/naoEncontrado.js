// Página 404: mensagem curta, ações e as quatro primeiras peças da coleção,
// para quem chega por um link antigo de anúncio não sair sem ver produto.
// Assinatura do contrato: render404(ctx) -> string

"use strict";

const layout = require("./layout.js");

const { ROTULOS, TAMANHOS, ICONES } = layout;
const { linkWhats, cartao } = layout.componentes;

module.exports = function render404(ctx) {
  const { config, conteudo, produtos, util } = ctx;
  const e = util.escapeHtml;
  const hrefGeral = util.linkWhats(config, config.mensagemGeral);
  const primeiras = produtos.slice(0, 4);

  const corpo = `<div class="container">
  <article class="leitura leitura--404">
    <p class="rotulo">Erro 404</p>
    <h1>Página não encontrada</h1>
    <p class="leitura-abertura">O endereço pode ter mudado ou a peça saiu do ar.</p>
    <div class="leitura-acoes">
      <a class="btn btn--tinta" href="/#colecao">${e(ROTULOS.catalogo)}${ICONES.seta(18)}</a>
      ${linkWhats(ctx, { href: hrefGeral })}
    </div>
  </article>
  ${primeiras.length ? `<section class="pecas-404" aria-labelledby="pecas-404-titulo">
    <div class="cabeca-secao">
      <div class="cabeca-titulos">
        <p class="rotulo">Coleção</p>
        <h2 id="pecas-404-titulo">Peças da coleção</h2>
      </div>
    </div>
    <ul class="grade grade--quatro">
${primeiras.map((p) => cartao(ctx, p, { sizes: TAMANHOS.quatro })).join("\n")}
    </ul>
  </section>` : ""}
</div>`;

  return layout({
    ctx,
    titulo: "Página não encontrada",
    descricao: `Esta página não existe mais. Veja a coleção ${config.marca}.`,
    caminho: "/404.html",
    ogImagem: conteudo.hero.foto,
    corpo,
    noindex: true,
    classeBody: "pagina-404"
  });
};
