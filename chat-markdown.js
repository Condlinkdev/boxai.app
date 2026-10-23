import { Marked } from './vendor/marked.esm.js';
import DOMPurify from './vendor/purify.es.mjs';

const escapeHTML = text => text.replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const parser = new Marked({
  gfm: true,
  breaks: true,
  renderer: { html: ({text}) => escapeHTML(text) }
});
const styles = `
:host{display:block;min-width:0;max-width:100%;font:inherit;color:inherit;white-space:normal;overflow-wrap:anywhere;line-height:1.55}
*,*:before,*:after{box-sizing:border-box}
p,ul,ol,pre,blockquote,table{margin:0 0 .75em}p:last-child,ul:last-child,ol:last-child,pre:last-child,blockquote:last-child{margin-bottom:0}
h1,h2,h3,h4,h5,h6{font-family:inherit;font-size:1.05em;font-weight:600;line-height:1.35;margin:.9em 0 .5em}h1:first-child,h2:first-child,h3:first-child{margin-top:0}
strong{font-weight:700}em{font-style:italic}del{opacity:.7}
a{color:#8bebcf;text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere}a:focus-visible{outline:2px solid #8bebcf;outline-offset:3px;border-radius:2px}
ul,ol{padding-inline-start:1.35em}li+li{margin-top:.35em}li>ul,li>ol{margin-top:.35em}
blockquote{padding:.1em 0 .1em .8em;border-left:3px solid #8bebcf70;color:#c2d7d5}
code{font: .86em/1.5 ui-monospace,SFMono-Regular,Consolas,monospace;background:#0003;border:1px solid #8bebcf17;border-radius:5px;padding:.08em .3em}
pre{padding:12px;background:#061c24;border:1px solid #8bebcf20;border-radius:10px;overflow:auto;max-width:100%;white-space:pre}
pre code{background:none;border:0;border-radius:0;padding:0;white-space:pre;overflow-wrap:normal}
.markdown-table{max-width:100%;overflow-x:auto;margin-bottom:.75em;border:1px solid #8bebcf25;border-radius:8px}
table{border-collapse:collapse;min-width:100%;font-size:.9em;margin:0}th,td{padding:8px 10px;text-align:left;border-bottom:1px solid #8bebcf20;min-width:95px}th{background:#8bebcf0d}tr:last-child td{border-bottom:0}
hr{border:0;border-top:1px solid #8bebcf25;margin:.9em 0}
`;

export function markdownFragment(source) {
  const html = parser.parse(String(source));
  const fragment = DOMPurify.sanitize(html, {
    RETURN_DOM_FRAGMENT: true,
    ALLOWED_TAGS: ['p','br','strong','em','del','ul','ol','li','h1','h2','h3','h4','h5','h6','a','pre','code','blockquote','hr','table','thead','tbody','tr','th','td'],
    ALLOWED_ATTR: ['href','title','start','class'],
    ALLOW_DATA_ATTR: false
  });
  fragment.querySelectorAll('a').forEach(link => {
    try {
      const url = new URL(link.getAttribute('href') || '', location.href);
      if (!/^https?:$/.test(url.protocol) || !link.hasAttribute('href')) {
        link.replaceWith(...link.childNodes);
        return;
      }
      link.href = url.href;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    } catch {
      link.replaceWith(...link.childNodes);
    }
  });
  fragment.querySelectorAll('table').forEach(table => {
    const scroll = document.createElement('div');
    scroll.className = 'markdown-table';
    scroll.tabIndex = 0;
    scroll.setAttribute('role', 'region');
    scroll.setAttribute('aria-label', 'Tabela da resposta, role para ver todas as colunas');
    table.replaceWith(scroll);
    scroll.append(table);
  });
  return fragment;
}

// O widget acumula os deltas e monta o histórico usando bubble.textContent.
// O texto original permanece no light DOM; a apresentação vive em outro shadow
// root e não entra nesse textContent. Assim, a formatação nunca duplica nem perde
// os próximos deltas e os endereços completos continuam no histórico.
export function enhanceMarkdown(log) {
  const rendered = new WeakMap();
  let frame = 0;
  const observe = () => observer.observe(log, {childList:true,subtree:true,characterData:true});
  function draw() {
    frame = 0;
    const follow = log.scrollHeight - log.scrollTop - log.clientHeight < 80;
    observer.disconnect();
    try {
      log.querySelectorAll('.bubble.assistant:not(.notice)').forEach(bubble => {
        if (bubble.id === 'boxai-typing') return;
        const raw = bubble.textContent || '';
        const previous = rendered.get(bubble);
        if (!raw || (previous?.raw === raw && previous.view.parentNode === bubble)) return;
        const source = document.createElement('span');
        source.hidden = true;
        source.textContent = raw;
        const view = document.createElement('span');
        view.dataset.markdownView = '';
        const root = view.attachShadow({mode:'open'});
        const style = document.createElement('style');
        style.textContent = styles;
        root.append(style, markdownFragment(raw));
        bubble.replaceChildren(source, view);
        rendered.set(bubble, {raw, view});
      });
      if (follow) log.scrollTop = log.scrollHeight;
    } finally {
      observe();
    }
  }
  const observer = new MutationObserver(() => {
    if (!frame) frame = requestAnimationFrame(draw);
  });
  draw();
  return () => { observer.disconnect(); cancelAnimationFrame(frame); };
}
