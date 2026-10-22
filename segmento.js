// Páginas de segmento: ao seguir para o montador, guardamos de onde a pessoa veio.
// O montador (order.js) lê isso e manda no pedido como pagina_origem e segmento_pagina.
const SEGMENT_ORIGIN_KEY='boxai:pagina_origem';
const SEGMENT_NAME_KEY='boxai:segmento_pagina';
function segmentOriginPath(){return location.pathname.replace(/index\.html$/,'')}
function rememberSegmentOrigin(segmento){
 try{
  sessionStorage.setItem(SEGMENT_ORIGIN_KEY,segmentOriginPath());
  if(segmento)sessionStorage.setItem(SEGMENT_NAME_KEY,segmento);
 }catch{/* navegação anônima sem sessionStorage: o pedido segue sem a origem */}
}
document.querySelectorAll('[data-segmento-cta]').forEach(link=>{
 link.addEventListener('click',()=>rememberSegmentOrigin(link.dataset.segmentoCta));
});
