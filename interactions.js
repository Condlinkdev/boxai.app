const environments={
loja:{index:'01 / LOJAS AUTÔNOMAS',title:'Sua próxima campanha<br> tem lugar na tela.',copy:'Apresente novidades, divulgue promoções e compartilhe mensagens enquanto seu público está na loja.',tags:['Promoções','Lançamentos','Campanhas'],brand:'BOAS ESCOLHAS',category:'NOVIDADES POR AQUI',tv:'Novos favoritos.<br> Novas descobertas.',tvCopy:'Conheça as novidades da semana.',bottom:'DESCUBRA O QUE CHEGOU',color:'#60452e',page:'para-quem/lojas-autonomas/',pageLabel:'lojas autônomas',alt:'Ambiente ilustrativo de uma loja'},
clinica:{index:'02 / CLÍNICAS',title:'A espera também<br> pode informar.',copy:'Aproveite a TV da recepção para compartilhar orientações, apresentar serviços e divulgar comunicados.',tags:['Orientações','Serviços','Comunicados'],brand:'BEM-ESTAR',category:'CUIDAR DE VOCÊ COMEÇA AQUI',tv:'Uma pausa.<br> Um cuidado com você.',tvCopy:'Conheça nossas orientações de bem-estar.',bottom:'INFORMAÇÃO TAMBÉM É CUIDADO',color:'#254d4e',page:'para-quem/clinicas/',pageLabel:'clínicas',alt:'Ambiente ilustrativo de uma recepção'},
academia:{index:'03 / ACADEMIAS',title:'Mais movimento.<br> Mais comunicação.',copy:'Leve horários de aulas, novidades e avisos para a TV que acompanha a rotina de quem treina.',tags:['Grade de aulas','Novidades','Avisos'],brand:'MOVIMENTO',category:'ENCONTRE SEU RITMO',tv:'Sua próxima aula.<br> Seu próximo desafio.',tvCopy:'Confira os horários e participe.',bottom:'CADA DIA, UM NOVO MOVIMENTO',color:'#3a4930',page:'para-quem/academias/',pageLabel:'academias',alt:'Ambiente ilustrativo de uma academia'},
condominio:{index:'04 / CONDOMÍNIOS',title:'O aviso certo.<br> No caminho de todos.',copy:'Transforme a TV das áreas comuns em um espaço para avisos da administração, eventos e informações aos moradores.',tags:['Avisos','Eventos','Informações'],brand:'NOSSO ESPAÇO',category:'A VIDA EM COMUNIDADE',tv:'Um lugar melhor.<br> Uma conversa mais perto.',tvCopy:'Avisos e novidades para quem vive aqui.',bottom:'FIQUE POR DENTRO DO SEU CONDOMÍNIO',color:'#3b5060',page:'para-quem/condominios/',pageLabel:'condomínios',alt:'Ambiente ilustrativo de uma área comum residencial'}
};
// Each environment photo ships in three widths and three formats; swap every candidate together.
const photos={loja:{file:'loja-real',widths:[400,700,1400],width:1600,height:1200},
clinica:{file:'clinica',widths:[400,700,1100],width:1100,height:749},
academia:{file:'academia',widths:[400,700,1100],width:1100,height:733},
condominio:{file:'condominio',widths:[400,700,1100],width:1100,height:748}};
function applyEnvironmentPhoto(key){const photo=photos[key];
 const candidates=format=>photo.widths.map(width=>`assets/${photo.file}-${width}.${format} ${width}w`).join(', ');
 document.querySelector('#environment-avif').srcset=candidates('avif');
 document.querySelector('#environment-webp').srcset=candidates('webp');
 const image=document.querySelector('#environment-photo');
 image.width=photo.width;image.height=photo.height;image.src=`assets/${photo.file}.jpg`;}
const tabs=[...document.querySelectorAll('[data-environment]')];
function chooseEnvironment(key){const d=environments[key];tabs.forEach(b=>{const active=b.dataset.environment===key;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1});const panel=document.querySelector('#environment-panel');panel.setAttribute('aria-labelledby','tab-'+key);panel.classList.remove('changing');requestAnimationFrame(()=>panel.classList.add('changing'));applyEnvironmentPhoto(key);document.querySelector('.environment-scene .tv-wall').hidden=key==='loja';document.querySelector('.scene-label').lastChild.textContent=key==='loja'?' TV EM UM AMBIENTE REAL':' IMAGINE NESTE AMBIENTE';document.querySelector('.illustration-note').textContent=key==='loja'?'Imagem do site Box AI':'Composição e conteúdo ilustrativos';document.querySelector('#environment-photo').alt=key==='loja'?'TV de uma loja exibindo uma campanha acima das prateleiras':d.alt;document.querySelector('#story-index').textContent=d.index;document.querySelector('#story-title').innerHTML=d.title;document.querySelector('#story-copy').textContent=d.copy;document.querySelector('#story-tags').replaceChildren(...d.tags.map(t=>{const s=document.createElement('span');s.textContent=t;return s}));document.querySelector('#tv-brand').textContent=d.brand;document.querySelector('#tv-category').textContent=d.category;document.querySelector('#tv-title').innerHTML=d.tv;document.querySelector('#tv-copy').textContent=d.tvCopy;document.querySelector('#tv-bottom').textContent=d.bottom;document.querySelector('#tv-screen').style.background=d.color;const pageLink=document.querySelector('#story-page-link');if(pageLink){pageLink.href=d.page;pageLink.firstElementChild.textContent='Ver exemplos para '+d.pageLabel}}
tabs.forEach((button,i)=>{button.addEventListener('click',()=>chooseEnvironment(button.dataset.environment));button.addEventListener('keydown',e=>{let index;if(e.key==='ArrowRight')index=(i+1)%tabs.length;else if(e.key==='ArrowLeft')index=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=tabs.length-1;else return;e.preventDefault();tabs[index].focus();chooseEnvironment(tabs[index].dataset.environment)})});

// Cada TV do topo mostra a mesma funcionalidade em um ambiente diferente; o clique abre a aba daquele ambiente.
// Empresas não tem aba na seção de ambientes: a TV de avisos leva até a seção sem trocar a aba escolhida.
const segmentTabs={qrcode:'loja',facial:'condominio',recepcao:'clinica',midia:'academia',avisos:null};
function openEnvironmentTab(segment){
 if(!(segment in segmentTabs))return false;
 const key=segmentTabs[segment];
 const tab=key?tabs.find(button=>button.dataset.environment===key):null;
 if(tab)chooseEnvironment(key);
 scrollToSection('#ambientes');
 (tab||tabs.find(button=>button.getAttribute('aria-selected')==='true')||tabs[0])?.focus({preventScroll:true});
 return true;
}

// "Preços" aponta para o bloco de preços dentro da seção de módulos, que não é um details.
// A abertura segue aqui para o caso de o id="precos" voltar a cair sobre uma pergunta do FAQ.
function openPriceDetails(){
 const target=document.getElementById('precos');
 if(target&&target.tagName==='DETAILS')target.open=true;
}

// Align in-page navigation with the actual section content, not its outer padding.
function scrollToSection(hash,behavior='smooth'){
 if(hash==='#precos')openPriceDetails();
 const section=document.getElementById(hash.slice(1));
 if(!section)return;
 const target=section.querySelector('.section-heading')||section;
 const top=hash==='#inicio'||hash==='#principal'?0:Math.max(0,window.scrollY+target.getBoundingClientRect().top-24);
 window.scrollTo({top,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':behavior});
}
// O link discreto de cada TV leva ao card do módulo que prova a funcionalidade:
// o título recebe o foco e o card fica destacado por um instante.
function focusModuleCard(hash){
 const card=document.getElementById(hash.slice(1));
 if(!card||!card.classList.contains('module-card'))return;
 document.querySelectorAll('.module-card.is-targeted').forEach(node=>node.classList.remove('is-targeted'));
 card.querySelector('h3')?.focus({preventScroll:true});
 card.classList.add('is-targeted');
 clearTimeout(focusModuleCard.timer);
 focusModuleCard.timer=setTimeout(()=>card.classList.remove('is-targeted'),3000);
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
 focusModuleCard(hash);
 entregarFocoDoAtalho(hash);
});
window.addEventListener('popstate',()=>scrollToSection(location.hash||'#inicio','instant'));
window.addEventListener('hashchange',()=>scrollToSection(location.hash||'#inicio','instant'));
// Ao abrir o endereço com um hash o navegador começa a própria rolagem suave até o alvo.
// Cancelamos esse movimento e miramos a seção, senão a chegada em #precos para fora da pergunta.
window.addEventListener('load',()=>{
 if(!location.hash)return;
 window.scrollTo({top:window.scrollY,behavior:'instant'});
 scrollToSection(location.hash,'instant');
 requestAnimationFrame(()=>scrollToSection(location.hash,'instant'));
});

// On phones, offer the next step immediately after the Box, before the six TVs.
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

// O vídeo e a conversa são caminhos diferentes, cada um com o seu botão.
// "Conversar com a assistente" abre o painel do chat; "Assistir ao vídeo" leva ao vídeo de #em-cena.
// Nenhum dos dois faz o papel do outro.
const assistantScript=document.querySelector('script[src*="widget.js"]');
const demoVideo=document.querySelector('#em-cena-video');
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)');

function showAssistantPanel(){
 const api=window.BoxAIAssistant;
 if(!api||typeof api.open!=='function')return false;
 api.open();
 return true;
}
// Se o widget estiver bloqueado ou fora do ar, o convite não morre:
// o montador de pedido assume a conversa, com o foco no primeiro campo.
function offerOrderInstead(){
 scrollToSection('#pedido');
 document.querySelector('#order-form input,#order-form select,#order-form textarea')?.focus({preventScroll:true});
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

// O vídeo começa sem som, como sempre: quem quiser ouvir liga pelos controles.
// Com movimento reduzido só levamos até lá, sem dar play.
function watchDemoVideo(){
 if(!demoVideo)return;
 scrollToSection('#em-cena-video');
 demoVideo.focus({preventScroll:true});
 if(reduceMotion.matches)return;
 demoVideo.play()?.catch(()=>{/* o visitante usa os controles */});
}
const videoLink=document.querySelector('[data-assistir-video]');
if(videoLink){
 videoLink.addEventListener('click',event=>{event.preventDefault();watchDemoVideo()});
 // Um link responde ao Enter; a barra de espaço fica por nossa conta.
 videoLink.addEventListener('keydown',event=>{
  if(event.key!==' '&&event.key!=='Spacebar')return;
  event.preventDefault();
  watchDemoVideo();
 });
}

// Os acordeões do FAQ são <details> nativos: Chrome, Firefox e Safari atuais
// já anunciam o estado. O aria-expanded fica em dia pelo evento toggle para
// quem usa leitor de tela ou navegador antigo, que não lê o estado nativo.
document.querySelectorAll('.faq-list details').forEach(details=>{
 const resumo=details.querySelector('summary');
 if(!resumo)return;
 const sincronizar=()=>resumo.setAttribute('aria-expanded',String(details.open));
 sincronizar();
 details.addEventListener('toggle',sincronizar);
});
