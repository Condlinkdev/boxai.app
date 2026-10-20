import * as THREE from 'three';
import {OrbitControls} from './vendor/OrbitControls.js';
import {RoomEnvironment} from './vendor/RoomEnvironment.js';
import {RoundedBoxGeometry} from './vendor/RoundedBoxGeometry.js';
const canvas=document.querySelector('#scene'),stage=document.querySelector('#stage');
let renderer;
try{renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,preserveDrawingBuffer:false});}catch(e){document.querySelector('#loading').textContent='Seu navegador precisa de WebGL para mostrar o produto 3D.';throw e;}
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.setClearColor(0x000000,0);renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.0;renderer.outputColorSpace=THREE.SRGBColorSpace;
const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(32,1,.1,200);camera.position.set(16,14,20);
const pmrem=new THREE.PMREMGenerator(renderer);scene.environmentIntensity=.65;scene.environment=pmrem.fromScene(new RoomEnvironment(),.04).texture;pmrem.dispose();
scene.add(new THREE.AmbientLight(0xe5ffe7,.5));
function area(color,intensity,x,y,z){const a=new THREE.DirectionalLight(color,intensity);a.position.set(x,y,z);scene.add(a);return a;}
const key=area(0xf2ffe7,2,-8,14,8);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-15;key.shadow.camera.right=15;key.shadow.camera.top=15;key.shadow.camera.bottom=-15;key.shadow.normalBias=.05;key.shadow.bias=-.0001;area(0xb5d8c8,1.2,12,5,-8);area(0xffffff,.8,-12,3,-6);
const model=new THREE.Group();scene.add(model);model.position.y=.7;
const black=new THREE.MeshStandardMaterial({color:0x111513,roughness:.7,metalness:.08});
const side=new THREE.MeshPhysicalMaterial({color:0x204631,roughness:.37,metalness:.14,clearcoat:.35,clearcoatRoughness:.4});
const top=new THREE.MeshPhysicalMaterial({roughness:.43,metalness:.08,clearcoat:.28,clearcoatRoughness:.4});
const body=new THREE.Mesh(new RoundedBoxGeometry(9.6,2.1,9.6,6,.65),[side,side,top,black,side,side]);body.position.y=1.3;body.castShadow=true;body.receiveShadow=true;model.add(body);
const base=new THREE.Mesh(new RoundedBoxGeometry(9.35,.27,9.35,4,.12),black);base.position.y=.28;base.castShadow=true;model.add(base);
const dark=new THREE.MeshStandardMaterial({color:0x050807,roughness:.55}),metal=new THREE.MeshStandardMaterial({color:0x7b807e,metalness:.9,roughness:.28});
function block(w,h,d,mat,x,y,z,r=.04){const m=new THREE.Mesh(new RoundedBoxGeometry(w,h,d,3,Math.min(r,h/3,d/3)),mat);m.position.set(x,y,z);model.add(m);return m;}
// Port apertures are illustrative surface recesses; no dimensional tooling is implied.
const backPanel=block(7.95,1.32,.035,black,0,1.15,-4.786,.025);
function backPort(x,w,h,name){const shell=block(w,h,.07,metal,x,1.1,-4.82);block(w-.12,h-.12,.09,dark,x,1.1,-4.88);return shell;}
backPort(-1.22,1.24,.5,'HDMI');backPort(.58,1.05,.83,'LAN');backPort(-2.65,.7,.7,'OPTICAL');
function socket(x){const ring=new THREE.Mesh(new THREE.CylinderGeometry(.29,.29,.09,32),metal);ring.rotation.x=Math.PI/2;ring.position.set(x,1.1,-4.85);model.add(ring);const hole=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.1,32),dark);hole.rotation.x=Math.PI/2;hole.position.set(x,1.1,-4.91);model.add(hole);}
socket(-3.58);socket(2.63);
for(let i=0;i<8;i++)block(.045,.26,.1,metal,.25+i*.09,1.3,-4.94,.005);
for(const z of [-1.45,.25]){block(.06,.53,1.3,metal,4.79,1.1,z);block(.08,.36,1.12,dark,4.84,1.1,z);block(.09,.1,.86,black,4.89,1.08,z);}
block(.07,.13,.93,dark,4.8,1.05,2);const reset=new THREE.Mesh(new THREE.SphereGeometry(.09,16,16),dark);reset.position.set(4.8,1.05,3);model.add(reset);
for(let x of [-3.5,3.5])for(let z of [-3.5,3.5]){const foot=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,.18,32),black);foot.position.set(x,.08,z);model.add(foot);}
const ledMat=new THREE.MeshStandardMaterial({color:0xc7f9a7,emissive:0x94d868,emissiveIntensity:1.2});block(.7,.045,.035,ledMat,0,.97,4.79,.01);
// Fine tone-on-tone signature on the front edge.
function canvasTex(c){const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
function label(text,w,h,size=52){const c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d');ctx.fillStyle='#9da89d';ctx.font=`500 ${size}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,w/2,h/2);const mat=new THREE.MeshBasicMaterial({map:canvasTex(c),transparent:true,depthWrite:false});return mat;}
const frontLogo=new THREE.Mesh(new THREE.PlaneGeometry(1.25,.25),label('Box AI',512,100,66));frontLogo.position.set(-2.7,1.16,4.805);model.add(frontLogo);
const portLabels=new THREE.Mesh(new THREE.PlaneGeometry(7.5,.27),label('12V       OPTICAL       HDMI        LAN          AV',1500,70,37));portLabels.rotation.y=Math.PI;portLabels.position.set(-.4,1.75,-4.82);model.add(portLabels);
const bottomLabel=new THREE.Mesh(new THREE.PlaneGeometry(3.6,2),label('BoxAI / CONDLINK',800,400,70));bottomLabel.rotation.x=Math.PI/2;bottomLabel.position.y=.12;model.add(bottomLabel);
const floorMat=new THREE.ShadowMaterial({opacity:.27});const floor=new THREE.Mesh(new THREE.PlaneGeometry(200,200),floorMat);floor.rotation.x=-Math.PI/2;floor.position.y=-.06;floor.receiveShadow=true;scene.add(floor);
const textureCanvas=document.createElement('canvas');textureCanvas.width=textureCanvas.height=2048;const ctx=textureCanvas.getContext('2d');ctx.fillStyle='#22564e';ctx.fillRect(0,0,2048,2048);ctx.strokeStyle='#8ac4a1';ctx.lineWidth=2;ctx.globalAlpha=.22;for(let i=0;i<23;i++){ctx.beginPath();ctx.ellipse(1920,100,740+i*27,1000+i*25,-.55,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=.1;for(let i=0;i<12;i++){ctx.beginPath();ctx.ellipse(-150,2130,500+i*35,700+i*38,.5,0,Math.PI*2);ctx.stroke();}ctx.globalAlpha=1;ctx.save();ctx.translate(420,810);ctx.strokeStyle='#eff5e8';ctx.lineWidth=24;ctx.lineCap='round';ctx.beginPath();ctx.roundRect(0,0,235,160,40);ctx.stroke();ctx.beginPath();ctx.moveTo(80,200);ctx.lineTo(155,200);ctx.stroke();ctx.fillStyle='#8bebcf';ctx.globalAlpha=.25;ctx.beginPath();ctx.arc(170,100,40,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;ctx.beginPath();ctx.arc(170,100,23,0,Math.PI*2);ctx.fill();ctx.fillStyle='#eff5e8';ctx.textAlign='left';ctx.textBaseline='middle';ctx.font='bold 246px Arial';ctx.fillText('Box AI',320,80);const brandWidth=ctx.measureText('Box AI').width;ctx.fillStyle='#8bebcf';ctx.beginPath();ctx.arc(320+brandWidth+30,155,16,0,Math.PI*2);ctx.fill();ctx.fillStyle='#c6ded0';ctx.font='80px Arial';ctx.fillText('por Condlink',330,260);ctx.restore();top.map=canvasTex(textureCanvas);top.needsUpdate=true;side.color.set('#22564e');
const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.065;controls.target.set(0,1.2,0);controls.enableZoom=false;controls.enablePan=false;controls.minPolarAngle=.3;controls.maxPolarAngle=Math.PI*.7;controls.autoRotateSpeed=.55;controls.update();camera.position.set(14.5,15.2,20);controls.update();
const phoneView=matchMedia('(max-width: 760px)'),reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
let manuallyPaused=false;
function syncAutoRotation(){controls.autoRotate=phoneView.matches&&!reducedMotion.matches&&!manuallyPaused;}
phoneView.addEventListener('change',()=>{manuallyPaused=false;syncAutoRotation()});reducedMotion.addEventListener('change',syncAutoRotation);syncAutoRotation();
const rotate=document.querySelector('#rotate');rotate?.addEventListener('click',()=>{controls.autoRotate=!controls.autoRotate;rotate?.setAttribute('aria-pressed',String(controls.autoRotate));});controls.addEventListener('start',()=>{manuallyPaused=true;controls.autoRotate=false;rotate?.setAttribute('aria-pressed','false')});
canvas.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;e.preventDefault();const off=camera.position.clone().sub(controls.target);const sph=new THREE.Spherical().setFromVector3(off);if(e.key==='ArrowLeft')sph.theta-=.15;if(e.key==='ArrowRight')sph.theta+=.15;if(e.key==='ArrowUp')sph.phi=Math.max(.3,sph.phi-.12);if(e.key==='ArrowDown')sph.phi=Math.min(Math.PI*.7,sph.phi+.12);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(sph));controls.update()});
function resize(){const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}new ResizeObserver(resize).observe(canvas);resize();document.querySelector('#loading').remove();let visible=true;new IntersectionObserver(entries=>{visible=entries[0].isIntersecting}).observe(stage);let lastFrame=0;function animate(time=0){requestAnimationFrame(animate);const delta=lastFrame?Math.min((time-lastFrame)/1000,.05):0;lastFrame=time;if(!visible)return;controls.update(delta);renderer.render(scene,camera)}animate();document.body.dataset.ready='true';
