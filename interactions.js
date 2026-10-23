// Cada TV do topo é um dos nichos de "Feita pro dia a dia do seu negócio" (#pra-quem):
// o clique leva ao cartão do nicho e põe o foco no link dele.
// orbit.js chama openEnvironmentTab no clique de cada TV; o nome ficou o mesmo.
const nichoCards={clinica:'nicho-clinica',comercio:'nicho-comercio',condominio:'nicho-condominio',academia:'nicho-academia'};
function openEnvironmentTab(segment){
 const card=document.getElementById(nichoCards[segment]);
 if(!card)return false;
 scrollToSection('#pra-quem');
 card.querySelector('a')?.focus({preventScroll:true});
 card.classList.remove('is-targeted');
 requestAnimationFrame(()=>card.classList.add('is-targeted'));
 clearTimeout(openEnvironmentTab.timer);
 openEnvironmentTab.timer=setTimeout(()=>card.classList.remove('is-targeted'),3000);
 return true;
}

// Align in-page navigation with the actual section content, not its outer padding.
function scrollToSection(hash,behavior='smooth'){
 const section=document.getElementById(hash.slice(1));
 if(!section)return;
 const target=section.querySelector('.section-heading')||section;
 const top=hash==='#inicio'||hash==='#principal'?0:Math.max(0,window.scrollY+target.getBoundingClientRect().top-24);
 window.scrollTo({top,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':behavior});
}
// O clique em link interno roda por aqui, com preventDefault, e por isso o
// navegador não move mais o ponto de partida do Tab. Para o "Pular para o
// conteúdo" isso esvazia o atalho: a página rolava, mas o próximo Tab voltava
// para o topo. O foco vai para o <main>, que leva tabindex="-1" no HTML.
function entregarFocoDoAtalho(hash){
 if(hash!=='#principal')return;
 const principal=document.getElementById('principal');
 if(principal)principal.focus({preventScroll:true});
}
document.addEventListener('click',event=>{
 const link=event.target.closest('a[href^="#"]');
 if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const hash=link.getAttribute('href');
 if(hash.length<2||!document.getElementById(hash.slice(1)))return;
 event.preventDefault();
 if(location.hash!==hash)history.pushState(null,'',hash);
 scrollToSection(hash);
 entregarFocoDoAtalho(hash);
});
window.addEventListener('popstate',()=>scrollToSection(location.hash||'#inicio','instant'));
window.addEventListener('hashchange',()=>scrollToSection(location.hash||'#inicio','instant'));
// Ao abrir o endereço com um hash o navegador começa a própria rolagem suave até o alvo.
// Cancelamos esse movimento e miramos a seção (as páginas de segmento chegam em #pedido).
window.addEventListener('load',()=>{
 if(!location.hash)return;
 window.scrollTo({top:window.scrollY,behavior:'instant'});
 scrollToSection(location.hash,'instant');
 requestAnimationFrame(()=>scrollToSection(location.hash,'instant'));
});

// On phones, offer the next step immediately after the Box, before the TVs.
const compactHero=matchMedia('(max-width: 760px)');
const heroActions=document.querySelector('.hero-actions');
const heroUniverse=document.querySelector('#universo');
function positionHeroAction(){
 if(compactHero.matches)heroUniverse.insertBefore(heroActions,heroUniverse.querySelector('.satellites'));
 else heroUniverse.after(heroActions);
}
compactHero.addEventListener('change',positionHeroAction);
positionHeroAction();

// O menu do cabeçalho vive em menu.js, compartilhado com as páginas de segmento.
// "Conversar com a assistente" abre o painel do chat. Ao lado dele, "Suporte 24h"
// é um link comum para o login do painel (admin.boxai.app), sem JavaScript.
const assistantScript=document.querySelector('script[src*="widget.js"]');

function showAssistantPanel(){
 const api=window.BoxAIAssistant;
 if(!api||typeof api.open!=='function')return false;
 api.open();
 return true;
}
// Se o widget estiver bloqueado ou fora do ar, o convite não morre:
// o "Fale com a gente" assume a conversa, com o foco no primeiro campo.
function offerOrderInstead(){
 scrollToSection('#pedido');
 document.querySelector('#contato-form input')?.focus({preventScroll:true});
}
let waitingForAssistant=false;
function openAssistant(){
 if(showAssistantPanel()||waitingForAssistant)return;
 // O widget entra com defer: pode ainda não ter carregado no primeiro clique.
 waitingForAssistant=true;
 const settle=()=>{
  if(!waitingForAssistant)return;
  waitingForAssistant=false;
  clearTimeout(timer);
  if(!showAssistantPanel())offerOrderInstead();
 };
 const timer=setTimeout(settle,5000);
 assistantScript?.addEventListener('load',settle,{once:true});
}
document.querySelectorAll('[data-abrir-conversa]').forEach(button=>button.addEventListener('click',openAssistant));

// O formulário de "Fale com a gente" vive em contato.js.
