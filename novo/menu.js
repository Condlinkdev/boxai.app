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
wideHeader.addEventListener('change',()=>{if(wideHeader.matches)setMenu(false)});
setMenu(false);
