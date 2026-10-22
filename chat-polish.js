// Camada visual local sobre o widget: mantém conversa, voz e envio no código original.
(() => {
  const cssUrl = new URL('chat-polish.css?v=20261022-mobile-markdown', document.currentScript.src);
  const css = fetch(cssUrl).then(response => {
    if (!response.ok) throw new Error('Tema indisponível');
    return response.text();
  }).catch(() => '');
  const waiting = new MutationObserver(attach);
  waiting.observe(document.body, { childList: true });
  attach();

  function attach() {
    const host = document.getElementById('boxai-assistente');
    const root = host?.shadowRoot;
    if (!root?.querySelector('.panel')) return;
    waiting.disconnect();
    css.then(text => {
      if (!text || root.querySelector('[data-chat-polish]')) return;
      const style = document.createElement('style');
      style.dataset.chatPolish = '';
      style.textContent = text;
      root.append(style);
      const heading = root.querySelector('header h2');
      const status = document.createElement('span');
      status.className = 'chat-state';
      heading?.append(status);
      const input = root.querySelector('textarea');
      const orb = root.querySelector('.orb');
      function syncStatus() {
        const busy = input?.disabled || !!root.querySelector('#boxai-typing');
        const voice = orb?.dataset.state;
        const label = voice === 'listening' ? 'Estou ouvindo…' : voice === 'speaking' ? 'Falando com você' : busy || voice === 'thinking' ? 'Preparando resposta…' : 'Pode perguntar';
        if (status.textContent !== label) status.textContent = label;
        host.toggleAttribute('data-chat-busy', !!busy);
      }
      const states = new MutationObserver(syncStatus);
      if (input) states.observe(input, { attributes: true, attributeFilter: ['disabled'] });
      if (orb) states.observe(orb, { attributes: true, attributeFilter: ['data-state'] });
      const log = root.querySelector('.log');
      if (log) {
        states.observe(log, { childList: true });
        import('./chat-markdown.js?v=20261022-markdown').then(({enhanceMarkdown}) => {
          if (log.isConnected) enhanceMarkdown(log);
        }).catch(() => { /* O widget continua a mostrar o texto se o módulo não carregar. */ });
      }
      syncStatus();
    });
  }
})();
