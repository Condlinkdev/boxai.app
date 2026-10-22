// Linhas do comparativo que dependem da confirmação da Condlink.
// As flags ficam em site-config.js, em SITE_CONFIG.comparativo. A linha só
// perde o hidden quando a flag é exatamente true; a do número de TVs precisa
// também de numeroTvsTexto preenchido. Sem JS, as três continuam ocultas.
(function () {
  const config = (window.SITE_CONFIG && window.SITE_CONFIG.comparativo) || {};
  function text(value) {
    return typeof value === 'string' ? value.trim() : '';
  }
  function mostrar(chave, conteudo) {
    document.querySelectorAll('[data-comparativo="' + chave + '"]').forEach(function (linha) {
      if (conteudo) {
        const celula = linha.querySelector('[data-comparativo-texto]');
        if (!celula) return;
        celula.textContent = conteudo;
      }
      linha.hidden = false;
    });
  }
  if (config.contaUnica === true) mostrar('contaUnica');
  if (config.suporteAcesso === true) mostrar('suporteAcesso');
  const numeroTvsTexto = text(config.numeroTvsTexto);
  if (config.numeroTvs === true && numeroTvsTexto) mostrar('numeroTvs', numeroTvsTexto);
})();
