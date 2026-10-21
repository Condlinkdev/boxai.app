// Campos cadastrais do rodapé: cada um só aparece quando houver valor em
// site-config.js. Sem valor, o elemento permanece com hidden.
(function () {
  const config = window.SITE_CONFIG || {};
  function fill(attribute, key, prefix) {
    const value = String(config[key] || '').trim();
    if (!value) return;
    document.querySelectorAll('[' + attribute + ']').forEach(function (element) {
      element.textContent = prefix + value;
      element.hidden = false;
    });
  }
  fill('data-site-cnpj', 'cnpj', 'CNPJ ');
  fill('data-site-endereco', 'endereco', '');
})();
