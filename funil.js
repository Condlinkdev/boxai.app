// Contagem anônima do funil de boxai.app/novo. Não há cookie, localStorage,
// identificador de pessoa ou de sessão, fingerprint nem biblioteca de
// terceiros: cada evento é só mais um número numa contagem do próprio serviço
// da Condlink (POST /api/evento, resposta 204).
//
// O corpo tem o nome do evento, o caminho da página (sem query string e sem
// fragmento), o segmento e as UTMs da própria URL. Nada do formulário entra
// aqui: nome, e-mail, WhatsApp, empresa e cidade não passam por este arquivo.
//
// Quem pede para não ser rastreado não é contado: com
// navigator.globalPrivacyControl === true nada é enviado, nem a visita.
//
// Três eventos NÃO saem daqui. pedido_enviado e chat_contato são contados no
// servidor, no instante em que o lead e o contato de fato entram — o navegador
// pode recarregar ou perder a resposta, e a contagem ficaria torta; por isso o
// serviço recusa os dois com 400. chat_aberto é contado pelo widget da
// assistente, que é quem sabe quando o painel abriu.
//
// Falha de rede, serviço fora do ar ou origem recusada são ignorados em
// silêncio: a contagem é acessório e nunca segura um clique ou uma navegação.
(function () {
 const ORIGEM_API = 'https://assistente-site.condlink.com.br';
 // As mesmas chaves que o montador (order.js) já lê da URL.
 const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
 // Escrito por segmento.js quando a pessoa segue de uma página de segmento
 // para o montador. É um rótulo de ambiente, não um identificador.
 const SEGMENT_NAME_KEY = 'boxai:segmento_pagina';
 // CTAs de proposta: os marcados de propósito e os âncoras que levam ao
 // montador, tanto em /novo (`#pedido`) quanto nas páginas de segmento
 // (`../../?segmento=…#pedido`).
 const CTA_SELECTOR = '[data-funil="proposta"],a[href$="#pedido"]';
 const SEGMENT_PATH = /\/para-quem\/([a-z0-9-]+)\/(?:index\.html)?$/;

 const desligado = navigator.globalPrivacyControl === true;

 // Nas páginas de segmento vale o slug da pasta; no montador, o ambiente que a
 // pessoa escolheu antes de vir para cá, se houver.
 function segmentoDaPagina() {
  const daPasta = SEGMENT_PATH.exec(location.pathname);
  if (daPasta) return daPasta[1];
  try { return sessionStorage.getItem(SEGMENT_NAME_KEY) || ''; } catch { return ''; }
 }

 function utmsDaUrl() {
  const params = new URLSearchParams(location.search), utm = {};
  for (const key of UTM_KEYS) { const value = params.get(key); if (value) utm[key] = value; }
  return utm;
 }

 function enviarEvento(evento) {
  if (desligado) return;
  try {
   const corpo = { evento: evento, pagina: location.pathname };
   const segmento = segmentoDaPagina();
   if (segmento) corpo.segmento = segmento;
   Object.assign(corpo, utmsDaUrl());
   // text/plain dispensa preflight; o conteúdo é JSON do mesmo jeito.
   fetch(ORIGEM_API + '/api/evento', {
    method: 'POST',
    body: JSON.stringify(corpo),
    headers: { 'Content-Type': 'text/plain' },
    keepalive: true,
    credentials: 'omit',
    mode: 'cors'
   }).catch(() => {});
  } catch { /* sem fetch, sem rede, sem contagem: a página segue igual */ }
 }

 window.boxaiFunil = { enviar: enviarEvento };

 // Um clique, uma contagem. A delegação na fase de captura pega também o CTA
 // que algum outro script venha a montar depois, e nunca impede a navegação.
 document.addEventListener('click', event => {
  const alvo = event.target;
  if (!alvo || typeof alvo.closest !== 'function') return;
  if (alvo.closest(CTA_SELECTOR)) enviarEvento('clique_proposta');
 }, true);

 enviarEvento('visita');
})();
