const universe=document.querySelector('#universo');
const satellites=[...document.querySelectorAll('.satellite')];
const toggle=document.querySelector('#orbit-toggle');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width: 760px)');

const svgNS='http://www.w3.org/2000/svg';
const network=document.createElementNS(svgNS,'svg');
network.classList.add('energy-network');network.setAttribute('aria-hidden','true');
const rays=satellites.map((node,i)=>{const group=document.createElementNS(svgNS,'g');group.classList.add('energy-ray');const paths=['ray-glow','ray-line','ray-pulse'].map(name=>{const path=document.createElementNS(svgNS,'path');path.classList.add(name);path.setAttribute('pathLength','100');path.style.animationDelay=(-i*.47)+'s';group.appendChild(path);return path});network.appendChild(group);return{group,paths}});
universe.prepend(network);
function connectRay(index,x,y){const cx=universe.clientWidth/2,cy=universe.clientHeight/2;const dx=x-cx,dy=y-cy,length=Math.hypot(dx,dy)||1;const nx=-dy/length,ny=dx/length;const points=[[cx,cy]];for(let j=1;j<7;j++){const t=j/7;const bend=(j%2?1:-1)*Math.min(7,length*.025)*Math.sin(t*Math.PI);points.push([cx+dx*t+nx*bend,cy+dy*t+ny*bend])}points.push([x,y]);const d=points.map((p,i)=>(i?'L':'M')+p.map(n=>n.toFixed(2)).join(' ')).join(' ');rays[index].paths.forEach(path=>path.setAttribute('d',d))}
let running=!motion.matches,visible=true,angle=Math.PI/2,lastTime=0,elapsed=0,lockedUntil=0,activeIndex=-1,hovering=false,pointerNear=false;
function highlight(index){if(index===activeIndex)return;activeIndex=index;satellites.forEach((node,i)=>{node.classList.toggle('spotlight',i===index);node.querySelector('button').setAttribute('aria-pressed',String(i===index));rays[i].group.classList.toggle('active',i===index)});}
function updateToggle(){if(!toggle)return;toggle.setAttribute('aria-pressed',String(running));toggle.setAttribute('aria-label',running?'Pausar movimento das TVs':'Retomar movimento das TVs');toggle.innerHTML=running?'Ⅱ <span>Pausar TVs</span>':'▶ <span>Animar TVs</span>'}
toggle?.addEventListener('click',()=>{running=!running;updateToggle()});
function position(){if(mobile.matches){satellites.forEach(node=>{node.style.transform='';node.style.zIndex='';node.style.opacity=''});return}
 network.setAttribute('viewBox',`0 0 ${universe.clientWidth} ${universe.clientHeight}`);
 const rx=Math.min(universe.clientWidth*.36,435),ry=universe.clientHeight*.34,cy=universe.clientHeight/2;let nearest=0,best=-Infinity;
 satellites.forEach((node,i)=>{const phase=angle+i*Math.PI/3;const depth=Math.sin(phase);const scale=.83+(depth+1)*.085;connectRay(i,universe.clientWidth/2+Math.cos(phase)*rx,cy+depth*ry);node.style.transform=`translate(-50%,-50%) translate(${Math.cos(phase)*rx}px,${cy+depth*ry}px) scale(${scale})`;node.style.zIndex=depth>.12?'5':'1';node.style.opacity=String(.8+(depth+1)*.1);if(depth>best){best=depth;nearest=i}});
 if(performance.now()>lockedUntil&&!hovering)highlight(nearest)
}
satellites.forEach((node,i)=>{const button=node.querySelector('button');button.addEventListener('click',()=>{lockedUntil=performance.now()+8000;highlight(i);openEnvironmentTab(button.dataset.satellite)});button.addEventListener('pointerenter',()=>{hovering=true;highlight(i)});button.addEventListener('pointerleave',()=>{hovering=false;lockedUntil=performance.now()+1000});button.addEventListener('focus',()=>{hovering=true;highlight(i)});button.addEventListener('blur',()=>{hovering=false})});
// Com o cursor sobre a órbita o giro para: nenhuma TV escapa de quem está mirando o clique.
universe.addEventListener('pointerenter',event=>{if(event.pointerType!=='touch')pointerNear=true});
universe.addEventListener('pointerdown',()=>{pointerNear=true});
universe.addEventListener('pointerleave',()=>{pointerNear=false});
new ResizeObserver(position).observe(universe);
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;lastTime=0}).observe(universe);
motion.addEventListener('change',()=>{running=!motion.matches;updateToggle()});
function frame(now){const dt=lastTime?Math.min(now-lastTime,50):0;lastTime=now;if(visible&&running&&!hovering&&!pointerNear&&now>lockedUntil){elapsed+=dt;if(mobile.matches){highlight(Math.floor(elapsed/4500)%satellites.length)}else{angle+=dt*Math.PI*2/42000;position()}}requestAnimationFrame(frame)}
highlight(0);position();updateToggle();requestAnimationFrame(frame);
