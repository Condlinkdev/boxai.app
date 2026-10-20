const environments={
loja:{index:'01 / LOJAS AUTÔNOMAS',title:'Sua próxima campanha<br> tem lugar na tela.',copy:'Apresente novidades, divulgue promoções e compartilhe mensagens enquanto seu público está na loja.',tags:['Promoções','Lançamentos','Campanhas'],brand:'BOAS ESCOLHAS',category:'NOVIDADES POR AQUI',tv:'Novos favoritos.<br> Novas descobertas.',tvCopy:'Conheça as novidades da semana.',bottom:'DESCUBRA O QUE CHEGOU',color:'#60452e',alt:'Ambiente ilustrativo de uma loja'},
clinica:{index:'02 / CLÍNICAS',title:'A espera também<br> pode informar.',copy:'Aproveite a TV da recepção para compartilhar orientações, apresentar serviços e divulgar comunicados.',tags:['Orientações','Serviços','Comunicados'],brand:'BEM-ESTAR',category:'CUIDAR DE VOCÊ COMEÇA AQUI',tv:'Uma pausa.<br> Um cuidado com você.',tvCopy:'Conheça nossas orientações de bem-estar.',bottom:'INFORMAÇÃO TAMBÉM É CUIDADO',color:'#254d4e',alt:'Ambiente ilustrativo de uma recepção'},
academia:{index:'03 / ACADEMIAS',title:'Mais movimento.<br> Mais comunicação.',copy:'Leve horários de aulas, novidades e avisos para a TV que acompanha a rotina de quem treina.',tags:['Grade de aulas','Novidades','Avisos'],brand:'MOVIMENTO',category:'ENCONTRE SEU RITMO',tv:'Sua próxima aula.<br> Seu próximo desafio.',tvCopy:'Confira os horários e participe.',bottom:'CADA DIA, UM NOVO MOVIMENTO',color:'#3a4930',alt:'Ambiente ilustrativo de uma academia'},
condominio:{index:'04 / CONDOMÍNIOS',title:'O aviso certo.<br> No caminho de todos.',copy:'Transforme a TV das áreas comuns em um espaço para avisos da administração, eventos e informações aos moradores.',tags:['Avisos','Eventos','Informações'],brand:'NOSSO ESPAÇO',category:'A VIDA EM COMUNIDADE',tv:'Um lugar melhor.<br> Uma conversa mais perto.',tvCopy:'Avisos e novidades para quem vive aqui.',bottom:'FIQUE POR DENTRO DO SEU CONDOMÍNIO',color:'#3b5060',alt:'Ambiente ilustrativo de uma área comum residencial'}
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
function chooseEnvironment(key){const d=environments[key];tabs.forEach(b=>{const active=b.dataset.environment===key;b.setAttribute('aria-selected',String(active));b.tabIndex=active?0:-1});const panel=document.querySelector('#environment-panel');panel.setAttribute('aria-labelledby','tab-'+key);panel.classList.remove('changing');requestAnimationFrame(()=>panel.classList.add('changing'));applyEnvironmentPhoto(key);document.querySelector('.environment-scene .tv-wall').hidden=key==='loja';document.querySelector('.scene-label').lastChild.textContent=key==='loja'?' TV EM UM AMBIENTE REAL':' IMAGINE NESTE AMBIENTE';document.querySelector('.illustration-note').textContent=key==='loja'?'Imagem do site Box AI':'Composição e conteúdo ilustrativos';document.querySelector('#environment-photo').alt=key==='loja'?'TV de uma loja exibindo uma campanha acima das prateleiras':d.alt;document.querySelector('#story-index').textContent=d.index;document.querySelector('#story-title').innerHTML=d.title;document.querySelector('#story-copy').textContent=d.copy;document.querySelector('#story-tags').replaceChildren(...d.tags.map(t=>{const s=document.createElement('span');s.textContent=t;return s}));document.querySelector('#tv-brand').textContent=d.brand;document.querySelector('#tv-category').textContent=d.category;document.querySelector('#tv-title').innerHTML=d.tv;document.querySelector('#tv-copy').textContent=d.tvCopy;document.querySelector('#tv-bottom').textContent=d.bottom;document.querySelector('#tv-screen').style.background=d.color;}
tabs.forEach((button,i)=>{button.addEventListener('click',()=>chooseEnvironment(button.dataset.environment));button.addEventListener('keydown',e=>{let index;if(e.key==='ArrowRight')index=(i+1)%tabs.length;else if(e.key==='ArrowLeft')index=(i-1+tabs.length)%tabs.length;else if(e.key==='Home')index=0;else if(e.key==='End')index=tabs.length-1;else return;e.preventDefault();tabs[index].focus();chooseEnvironment(tabs[index].dataset.environment)})});

// Cada TV do topo abre a aba do seu segmento; os segmentos sem aba própria apontam para a mais próxima.
const segmentTabs={loja:'loja',clinica:'clinica',academia:'academia',condominio:'condominio',empresa:'condominio',franquia:'loja'};
function openEnvironmentTab(segment){
 const tab=tabs.find(button=>button.dataset.environment===segmentTabs[segment]);
 if(!tab)return false;
 chooseEnvironment(tab.dataset.environment);
 scrollToSection('#ambientes');
 tab.focus({preventScroll:true});
 return true;
}

// "Preços" aponta hoje para a pergunta de valores do FAQ, que precisa chegar aberta.
// Quando o id="precos" passar para uma seção de módulos e preços, este trecho segue valendo.
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
document.addEventListener('click',event=>{
 const link=event.target.closest('a[href^="#"]');
 if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
 const hash=link.getAttribute('href');
 if(hash.length<2||!document.getElementById(hash.slice(1)))return;
 event.preventDefault();
 if(location.hash!==hash)history.pushState(null,'',hash);
 scrollToSection(hash);
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

// Menu do cabeçalho: a 1440 px os itens ficam em linha; no celular abrem em painel sob o cabeçalho.
const menuToggle=document.querySelector('[data-menu-toggle]');
const siteMenu=document.querySelector('#site-menu');
const wideHeader=matchMedia('(min-width: 761px)');
const menuIsOpen=()=>menuToggle?.getAttribute('aria-expanded')==='true';
function setMenu(open){
 if(!menuToggle)return;
 menuToggle.setAttribute('aria-expanded',String(open));
 menuToggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
 document.body.classList.toggle('menu-open',open);
}
menuToggle?.addEventListener('click',()=>{
 const open=!menuIsOpen();
 setMenu(open);
 if(open)siteMenu?.querySelector('a[href]')?.focus();
});
// Ao escolher um item o painel fecha e o foco volta para o botão, sem sair do cabeçalho.
siteMenu?.addEventListener('click',event=>{
 if(!menuIsOpen()||!event.target.closest('a[href]'))return;
 setMenu(false);
 menuToggle?.focus({preventScroll:true});
});
document.addEventListener('keydown',event=>{
 if(event.key!=='Escape'||!menuIsOpen())return;
 setMenu(false);
 menuToggle?.focus({preventScroll:true});
});
document.addEventListener('pointerdown',event=>{
 if(!menuIsOpen()||event.target.closest('#site-menu, [data-menu-toggle]'))return;
 setMenu(false);
});
wideHeader.addEventListener('change',()=>{if(wideHeader.matches)setMenu(false)});
setMenu(false);
