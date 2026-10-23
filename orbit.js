const universe=document.querySelector('#universo');
const satellites=[...document.querySelectorAll('.satellite')];
const toggle=document.querySelector('#orbit-toggle');
const motion=matchMedia('(prefers-reduced-motion: reduce)');
const mobile=matchMedia('(max-width: 760px)');

const svgNS='http://www.w3.org/2000/svg';
const network=document.createElementNS(svgNS,'svg');
network.classList.add('energy-network');network.setAttribute('aria-hidden','true');
// Each ray is one soft arc from the Box to its screen: a faint line that fades in from under the Box, plus a beam of light that glides along it.
function gradient(group,name,count){const node=document.createElementNS(svgNS,'linearGradient');node.id=name+'-'+rays.length;node.classList.add(name);node.setAttribute('gradientUnits','userSpaceOnUse');for(let j=0;j<count;j++){const stop=document.createElementNS(svgNS,'stop');stop.setAttribute('offset',String(j/(count-1)));node.appendChild(stop)}group.appendChild(node);return node}
const rays=[];
satellites.forEach(()=>{const group=document.createElementNS(svgNS,'g');group.classList.add('energy-ray');const fade=gradient(group,'ray-fade',3),beam=gradient(group,'ray-light',3);const paths=[['ray-line',fade],['ray-glow',beam],['ray-beam',beam]].map(([name,fill])=>{const path=document.createElementNS(svgNS,'path');path.classList.add(name);path.setAttribute('stroke',`url(#${fill.id})`);group.appendChild(path);return path});network.appendChild(group);rays.push({group,paths,fade,beam,from:[0,0],to:[0,0]})});
universe.prepend(network);
function aim(node,x1,y1,x2,y2){node.setAttribute('x1',x1.toFixed(1));node.setAttribute('y1',y1.toFixed(1));node.setAttribute('x2',x2.toFixed(1));node.setAttribute('y2',y2.toFixed(1))}
// The beam leaves from under the Box and slips under the screen; one every ~1.3 s, so the light never stops and never flashes.
let beamTime=0;const beamPeriod=6500;
function aimBeam(index){const ray=rays[index],[cx,cy]=ray.from,dx=ray.to[0]-cx,dy=ray.to[1]-cy;const t=((beamTime/beamPeriod)+index/rays.length)%1;const head=-.05+1.4*(.5-.5*Math.cos(Math.PI*t)),tail=head-.38;aim(ray.beam,cx+dx*tail,cy+dy*tail,cx+dx*head,cy+dy*head)}
function connectRay(index,x,y){const ray=rays[index],cx=universe.clientWidth/2,cy=universe.clientHeight/2;const dx=x-cx,dy=y-cy;
 // Every arc bows against the direction of travel, so the five read as one gentle swirl trailing the screens.
 const bend=.2,qx=cx+dx/2+dy*bend,qy=cy+dy/2-dx*bend;const d=`M${cx.toFixed(1)} ${cy.toFixed(1)}Q${qx.toFixed(1)} ${qy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;ray.paths.forEach(path=>path.setAttribute('d',d));
 ray.from=[cx,cy];ray.to=[x,y];aim(ray.fade,cx,cy,x,y);aimBeam(index)}
let running=!motion.matches,visible=true,angle=Math.PI/2,lastTime=0,elapsed=0,lockedUntil=0,activeIndex=-1,hovering=false,pointerNear=false;
function highlight(index){if(index===activeIndex)return;activeIndex=index;satellites.forEach((node,i)=>{node.classList.toggle('spotlight',i===index);node.querySelector('button').setAttribute('aria-pressed',String(i===index));rays[i].group.classList.toggle('active',i===index)});}
function updateToggle(){if(!toggle)return;toggle.setAttribute('aria-pressed',String(running));toggle.setAttribute('aria-label',running?'Pausar movimento das TVs':'Retomar movimento das TVs');toggle.innerHTML=running?'Ⅱ <span>Pausar TVs</span>':'▶ <span>Animar TVs</span>'}
toggle?.addEventListener('click',()=>{running=!running;updateToggle()});
function position(){if(mobile.matches){satellites.forEach(node=>{node.style.transform='';node.style.zIndex='';node.style.opacity=''});return}
 network.setAttribute('viewBox',`0 0 ${universe.clientWidth} ${universe.clientHeight}`);
 const rx=Math.min(universe.clientWidth*.36,435),ry=universe.clientHeight*.34,cy=universe.clientHeight/2;let nearest=0,best=-Infinity;
 satellites.forEach((node,i)=>{const phase=angle+i*Math.PI*2/satellites.length;const depth=Math.sin(phase);const scale=.83+(depth+1)*.085;connectRay(i,universe.clientWidth/2+Math.cos(phase)*rx,cy+depth*ry);rays[i].group.style.setProperty('--ray-depth',(.3+.35*(depth+1)).toFixed(2));node.style.transform=`translate(-50%,-50%) translate(${Math.cos(phase)*rx}px,${cy+depth*ry}px) scale(${scale})`;node.style.zIndex=depth>.12?'5':'1';node.style.opacity=String(.8+(depth+1)*.1);if(depth>best){best=depth;nearest=i}});
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
function frame(now){const dt=lastTime?Math.min(now-lastTime,50):0;lastTime=now;if(visible&&running&&!mobile.matches){beamTime+=dt;rays.forEach((ray,i)=>aimBeam(i))}if(visible&&running&&!hovering&&!pointerNear&&now>lockedUntil){elapsed+=dt;if(mobile.matches){highlight(Math.floor(elapsed/4500)%satellites.length)}else{angle+=dt*Math.PI*2/42000;position()}}requestAnimationFrame(frame)}
highlight(0);position();updateToggle();requestAnimationFrame(frame);
