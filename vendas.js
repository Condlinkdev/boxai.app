// /vendas (27/11/2026): o formulário "Peça o seu kit" envia o pedido ao /api/lead do assistente do site
// no formato do montador (origem 'montador'), que avisa a equipe por e-mail (suporte@ e comercial@).
// O kit e a quantidade vão em `modulos`, `tvs` e nas UTMs (utm_source=vendas, utm_content=kit x quantidade).
(function () {
  var f = document.getElementById('vform'); if (!f) return;
  var API = 'https://assistente-site.condlink.com.br/api/lead';
  var KITS = {
    '1': { nome: 'Kit 1 · Imagens, Publicidades e Anúncios', modulos: ['Multimídia'] },
    '2': { nome: 'Kit 2 · Controle de acesso', modulos: ['Acesso Facial'] },
    '3': { nome: 'Kit 3 · Completo (Kit 1 + Kit 2)', modulos: ['Acesso Facial Multimídia Comunica'] }
  };
  var NOMES = { kit: 'o kit', qtd: 'a quantidade', nome: 'o seu nome', empresa: 'a loja ou empresa', segmento: 'o tipo de negócio',
    cidade: 'a cidade', whatsapp: 'o WhatsApp com DDD', email: 'o e-mail', tvs: 'a quantidade', locais: 'a quantidade' };
  var erro = document.getElementById('verro'), ok = document.getElementById('vok'), botao = f.querySelector('button[type=submit]');
  var requestId = null, enviando = false;
  function uuid() {
    var c = window.crypto;
    if (c && c.randomUUID) return c.randomUUID();
    var b = c.getRandomValues(new Uint8Array(16)); b[6] = b[6] & 15 | 64; b[8] = b[8] & 63 | 128;
    var h = Array.prototype.map.call(b, function (x) { return (x + 256).toString(16).slice(1); }).join('');
    return h.slice(0, 8) + '-' + h.slice(8, 12) + '-' + h.slice(12, 16) + '-' + h.slice(16, 20) + '-' + h.slice(20);
  }
  function mostraErro(campos) {
    var lista = campos.map(function (c) { return NOMES[c] || c; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
    erro.textContent = 'Confira ' + lista.join(', ') + '.'; erro.hidden = false; ok.hidden = true;
  }
  f.addEventListener('input', function () { requestId = null; });
  f.addEventListener('submit', function (e) {
    e.preventDefault(); if (enviando) return;
    var v = function (n) { return f.elements[n].value.trim(); };
    var qtd = parseInt(v('qtd'), 10), kit = KITS[v('kit')];
    var falta = [];
    if (!kit) falta.push('kit'); if (!(qtd >= 1 && qtd <= 999)) falta.push('qtd');
    ['nome', 'empresa', 'segmento', 'whatsapp', 'email'].forEach(function (n) { if (!v(n)) falta.push(n); });
    if (falta.length) { mostraErro(falta); return; }
    erro.hidden = true;
    if (!requestId) requestId = uuid();
    var corpo = { origem: 'montador', request_id: requestId, segmento: v('segmento'), tvs: qtd, locais: 1, modulos: kit.modulos,
      nome: v('nome'), empresa: v('empresa'), cidade: v('cidade'), whatsapp: v('whatsapp'), email: v('email'), pagina: location.href,
      utm_source: 'vendas', utm_medium: 'pagina-vendas', utm_campaign: 'kits', utm_content: kit.nome + ' x ' + qtd };
    enviando = true; botao.disabled = true; botao.textContent = 'Enviando…';
    fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) })
      .then(function (r) {
        if (r.ok) { f.reset(); requestId = null; ok.textContent = 'Pedido enviado. A nossa equipe vai falar com você em breve.'; ok.hidden = false; return; }
        return r.json().catch(function () { return null; }).then(function (d) {
          if (r.status === 400 && d && Array.isArray(d.campos)) mostraErro(d.campos.map(String));
          else { erro.textContent = 'Não foi possível enviar agora. Tente de novo ou fale com a gente pelo WhatsApp.'; erro.hidden = false; }
        });
      })
      .catch(function () { erro.textContent = 'Não foi possível enviar agora. Tente de novo ou fale com a gente pelo WhatsApp.'; erro.hidden = false; })
      .then(function () { enviando = false; botao.disabled = false; botao.textContent = 'Enviar'; });
  });
})();
