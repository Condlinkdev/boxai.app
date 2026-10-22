// Campos cadastrais do rodapé, lidos de site-config.js.
// A linha de identificação junta razão social e CNPJ, cada um só se tiver
// valor. O endereço só aparece quando enderecoExibido nomeia uma chave de
// enderecos com conteúdo; em qualquer outro caso o elemento continua hidden.
(function () {
  const config = window.SITE_CONFIG || {};
  function show(attribute, value) {
    if (!value) return;
    document.querySelectorAll('[' + attribute + ']').forEach(function (element) {
      element.textContent = value;
      element.hidden = false;
    });
  }
  function text(value) {
    return typeof value === 'string' ? value.trim() : '';
  }
  function enderecoExibido() {
    const enderecos = config.enderecos;
    const chave = text(config.enderecoExibido);
    if (!chave || !enderecos || !Object.prototype.hasOwnProperty.call(enderecos, chave)) return '';
    return text(enderecos[chave]);
  }
  const razaoSocial = text(config.razaoSocial);
  const cnpj = text(config.cnpj);
  const identificacao = [razaoSocial, cnpj && 'CNPJ ' + cnpj].filter(Boolean).join(' · ');
  show('data-site-cnpj', identificacao);
  show('data-site-endereco', enderecoExibido());
})();
