// Menu do cabeçalho, usado no /novo e nas páginas de segmento.
// A 1440 px os itens ficam em linha; no celular abrem em painel sob o cabeçalho.
// O item "Para quem" tem submenu: abre por clique ou Enter, fecha com Esc e com clique fora.
const menuToggle=document.querySelector('[data-menu-toggle]');
const siteMenu=document.querySelector('#site-menu');
const submenuToggle=document.querySelector('[data-submenu-toggle]');
const submenuGroup=submenuToggle?submenuToggle.closest('[data-menu-group]'):null;
const wideHeader=matchMedia('(min-width: 761px)');
const menuIsOpen=()=>menuToggle?.getAttribute('aria-expanded')==='true';
const submenuIsOpen=()=>submenuToggle?.getAttribute('aria-expanded')==='true';
function setSubmenu(open){
 if(!submenuToggle)return;
 submenuToggle.setAttribute('aria-expanded',String(open));
 submenuGroup?.classList.toggle('open',open);
}
function setMenu(open){
 if(!menuToggle)return;
 menuToggle.setAttribute('aria-expanded',String(open));
 menuToggle.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');
 document.body.classList.toggle('menu-open',open);
 if(!open)setSubmenu(false);
}
menuToggle?.addEventListener('click',()=>{
 const open=!menuIsOpen();
 setMenu(open);
 if(open)siteMenu?.querySelector('a[href]')?.focus();
});
submenuToggle?.addEventListener('click',()=>setSubmenu(!submenuIsOpen()));
// Ao escolher um item o painel fecha e o foco volta para o botão, sem sair do cabeçalho.
siteMenu?.addEventListener('click',event=>{
 if(!event.target.closest('a[href]'))return;
 setSubmenu(false);
 if(!menuIsOpen())return;
 setMenu(false);
 menuToggle?.focus({preventScroll:true});
});
document.addEventListener('keydown',event=>{
 if(event.key!=='Escape')return;
 if(submenuIsOpen()){setSubmenu(false);submenuToggle?.focus({preventScroll:true});return}
 if(!menuIsOpen())return;
 setMenu(false);
 menuToggle?.focus({preventScroll:true});
});
document.addEventListener('pointerdown',event=>{
 if(submenuIsOpen()&&!event.target.closest('[data-menu-group]'))setSubmenu(false);
 if(!menuIsOpen()||event.target.closest('#site-menu, [data-menu-toggle]'))return;
 setMenu(false);
});
// No celular o painel abre por cima do conteúdo. Sem isto, o Tab depois do
// botão do menu seguia para links escondidos atrás do painel: o foco sumia da
// tela. Enquanto o painel está aberto, o Tab dá a volta dentro do cabeçalho,
// que é a parte visível; Esc continua fechando e devolvendo o foco ao botão.
const cabecalho=menuToggle?menuToggle.closest('header'):null;
function focaveisDoCabecalho(){
 if(!cabecalho)return[];
 return[...cabecalho.querySelectorAll('a[href],button')].filter(node=>!node.hidden&&node.offsetParent!==null);
}
document.addEventListener('keydown',event=>{
 if(event.key!=='Tab'||!menuIsOpen())return;
 const itens=focaveisDoCabecalho();
 if(itens.length<2)return;
 const atual=itens.indexOf(document.activeElement);
 if(atual===-1)return;
 if(!event.shiftKey&&atual===itens.length-1){event.preventDefault();itens[0].focus()}
 else if(event.shiftKey&&atual===0){event.preventDefault();itens[itens.length-1].focus()}
});
wideHeader.addEventListener('change',()=>{if(wideHeader.matches)setMenu(false)});
setMenu(false);
