const ORDER_ENDPOINT='https://assistente-site.condlink.com.br/api/lead';
const ORDER_TIMEOUT=15000;
const orderForm=document.querySelector('#order-form');
const orderSteps=[...document.querySelectorAll('[data-order-step]')];
const orderProgress=[...document.querySelectorAll('.order-steps li')];
const orderResults=[...document.querySelectorAll('.order-result')];
const tvCount=orderForm.elements.tvs,unitCount=orderForm.elements.locais;
const orderSuccess=document.querySelector('#order-success');
const orderFailure=document.querySelector('#order-failure');
const orderSubmit=document.querySelector('#order-submit');
const orderRetry=document.querySelector('#order-retry');
const UTM_KEYS=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
const SEGMENT_ORIGIN_KEY='boxai:pagina_origem';
const SEGMENT_NAME_KEY='boxai:segmento_pagina';
// Apelidos aceitos no ?segmento= das páginas de segmento, no plural da pasta e no singular.
const SEGMENT_PARAM={'lojas-autonomas':'Lojas autônomas','loja-autonoma':'Lojas autônomas','lojas':'Loja','loja':'Loja','clinicas':'Clínica','clinica':'Clínica','academias':'Academia','academia':'Academia','condominios':'Condomínio','condominio':'Condomínio','empresas':'Empresa','empresa':'Empresa','franquias':'Franquia ou rede','franquia':'Franquia ou rede'};
// Módulos de interesse na ordem dos cards de #modulos, mais a saída sem escolha.
const ORDER_MODULOS=['Multimídia','Acesso','Acesso Facial','Acesso Facial Multimídia','Acesso Facial Multimídia Comunica','Acesso Facial Multimídia Interage','Ainda não sei'];
const ORDER_MODULO_SEM_ESCOLHA='Ainda não sei';
const ORDER_FIELDS=['segmento','tvs','locais','modulos','nome','empresa','cidade','whatsapp','email'];
const ORDER_FIELD_STEP={segmento:1,tvs:1,locais:1,modulos:1,nome:2,empresa:2,cidade:2,whatsapp:2,email:2};
const ORDER_MESSAGES={segmento:'Escolha o ambiente de uso.',tvs:'Informe de 1 a 999 TVs.',locais:'Informe a quantidade de locais, entre 1 e o total de TVs.',modulos:'Escolha pelo menos um módulo ou Ainda não sei.',nome:'Preencha seu nome.',empresa:'Preencha o nome da empresa ou espaço.',cidade:'Informe a cidade.',whatsapp:'Confira o WhatsApp com DDD. Exemplo: (11) 91234-5678.',email:'Confira o e-mail.'};
// Campos marcados em grupo: o erro vale para todos os inputs do mesmo nome.
const ORDER_GROUPS=['segmento','modulos'];
let orderStep=1;
let orderSending=false;
let orderRequestId='';

function newRequestId(){const c=globalThis.crypto;if(c&&typeof c.randomUUID==='function')return c.randomUUID();if(c&&typeof c.getRandomValues==='function'){const b=c.getRandomValues(new Uint8Array(16));b[6]=b[6]&15|64;b[8]=b[8]&63|128;const h=[...b].map(n=>n.toString(16).padStart(2,'0')).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20)}return 'montador-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10)}
function requestIdForOrder(){if(!orderRequestId)orderRequestId=newRequestId();return orderRequestId}
function readUtm(){const params=new URLSearchParams(location.search),utm={};for(const key of UTM_KEYS){const value=params.get(key);if(value)utm[key]=value}return utm}

function readSessionValue(key){try{return sessionStorage.getItem(key)||''}catch{return ''}}
function foldSegment(text){return text.normalize('NFD').replace(/\p{M}/gu,'').trim().toLowerCase()}
// Quem chega pelo CTA de uma página de segmento já encontra o passo 1 marcado.
function applySegmentFromUrl(){
 const raw=new URLSearchParams(location.search).get('segmento');
 if(!raw)return;
 const key=foldSegment(raw);
 const radios=[...orderForm.querySelectorAll('input[name=segmento]')];
 const radio=radios.find(r=>r.value===SEGMENT_PARAM[key])||radios.find(r=>foldSegment(r.value)===key);
 if(radio)radio.checked=true;
}
function segmentoLabel(){const checked=orderForm.querySelector('input[name=segmento]:checked');const span=checked&&checked.closest('label').querySelector('span');return span?span.textContent.trim():''}
function readOrder(){const d=new FormData(orderForm);const marcados=new Set(d.getAll('modulos').map(String));return{segmento:String(d.get('segmento')||''),tvs:Number(d.get('tvs')),locais:Number(d.get('locais')),modulos:ORDER_MODULOS.filter(modulo=>marcados.has(modulo)),nome:String(d.get('nome')||'').trim(),empresa:String(d.get('empresa')||'').trim(),cidade:String(d.get('cidade')||'').trim(),whatsapp:String(d.get('whatsapp')||'').trim(),email:String(d.get('email')||'').trim()}}
function updateOrderSummary(){const d=readOrder();document.querySelector('#summary-environment').textContent=segmentoLabel();document.querySelector('#summary-tvs').textContent=Number.isInteger(d.tvs)&&d.tvs>0?d.tvs+(d.tvs===1?' TV':' TVs'):'—';document.querySelector('#summary-units').textContent=Number.isInteger(d.locais)&&d.locais>0?d.locais+(d.locais===1?' local':' locais'):'—';}

function fieldFor(name){const field=orderForm.elements[name];if(!field)return null;return!field.tagName&&typeof field.length==='number'?field[0]:field}
function groupInputs(name){return[...orderForm.querySelectorAll('input[name='+name+']')]}
function errorAnchor(name){if(name==='segmento')return orderForm.querySelector('.order-environments');if(name==='modulos')return orderForm.querySelector('.order-modules-grid');const field=fieldFor(name);return field?field.closest('.order-quantity')||field:null}
function errorElement(name){let el=document.querySelector('#error-'+name);if(!el){const anchor=errorAnchor(name);if(!anchor)return null;el=document.createElement('span');el.id='error-'+name;el.className='order-field-error';anchor.insertAdjacentElement('afterend',el)}return el}
function setFieldError(name,message){const el=errorElement(name);if(!el)return;el.textContent=message;el.hidden=false;const field=fieldFor(name);if(!field)return;if(ORDER_GROUPS.includes(name)){groupInputs(name).forEach(input=>{input.setAttribute('aria-invalid','true');input.setAttribute('aria-describedby',el.id)});return}field.setAttribute('aria-invalid','true');field.setAttribute('aria-describedby',el.id)}
function clearFieldError(name){const el=document.querySelector('#error-'+name);if(el){el.hidden=true;el.textContent=''}const nodes=ORDER_GROUPS.includes(name)?groupInputs(name):[fieldFor(name)];for(const node of nodes){if(!node)continue;node.removeAttribute('aria-invalid');node.removeAttribute('aria-describedby')}}
function clearOrderErrors(){ORDER_FIELDS.forEach(clearFieldError)}

function validateSpace(d){const errors=[];if(!d.segmento)errors.push('segmento');if(!Number.isInteger(d.tvs)||d.tvs<1||d.tvs>999)errors.push('tvs');if(!Number.isInteger(d.locais)||d.locais<1||d.locais>d.tvs)errors.push('locais');if(!d.modulos.length)errors.push('modulos');return errors}
function validateContact(d){const errors=[];if(d.nome.length<2||d.nome.length>80)errors.push('nome');if(d.empresa.length<2||d.empresa.length>100)errors.push('empresa');if(d.cidade.length<2||d.cidade.length>80)errors.push('cidade');let phone=d.whatsapp.replace(/\D/g,'');if(phone.length>11&&phone.startsWith('55'))phone=phone.slice(2);if(!/^[1-9]{2}\d{8,9}$/.test(phone))errors.push('whatsapp');if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email))errors.push('email');return errors}
function showOrderErrors(names){clearOrderErrors();const known=names.filter(name=>ORDER_FIELDS.includes(name));if(!known.length)return false;known.forEach(name=>setFieldError(name,ORDER_MESSAGES[name]));const first=known[0];const step=ORDER_FIELD_STEP[first];if(step!==orderStep||!orderResults.every(el=>el.hidden))changeOrderStep(step,false);const field=fieldFor(first);if(field)field.focus({preventScroll:false});return true}
function validOrderStep(){const d=readOrder();const errors=orderStep===1?validateSpace(d):orderStep===2?validateContact(d):[];if(errors.length){showOrderErrors(errors);return false}clearOrderErrors();return true}

function reviewOrder(){const d=readOrder();const entries=[['Ambiente',segmentoLabel()],['TVs e locais',`${d.tvs} ${d.tvs===1?'TV':'TVs'} em ${d.locais} ${d.locais===1?'local':'locais'}`],['Módulos de interesse',d.modulos.join(', ')],['Nome',d.nome],['Empresa ou espaço',d.empresa],['Cidade',d.cidade],['WhatsApp',d.whatsapp],['E-mail',d.email]];const list=document.createElement('dl');for(const [label,value]of entries){const row=document.createElement('div'),dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=value;row.append(dt,dd);list.append(row)}document.querySelector('#order-review').replaceChildren(list);}
function scrollOrderIntoView(){const top=orderForm.getBoundingClientRect().top;if(top<0)orderForm.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
function focusOrderTitle(container){const title=container.querySelector('h3');if(!title)return;title.tabIndex=-1;title.focus({preventScroll:true})}
// Contagem anônima do funil (funil.js): cada passo conta no máximo uma vez por
// carregamento, então voltar e avançar de novo não repete a contagem. Só o
// número do passo é enviado; nenhum valor do formulário sai daqui. Sem
// funil.js carregado o montador funciona do mesmo jeito.
const FUNNEL_STEP_EVENT={1:'pedido_passo_1',2:'pedido_passo_2',3:'pedido_passo_3'};
const funnelCountedSteps=new Set();
function countFunnelStep(step){
 const evento=FUNNEL_STEP_EVENT[step];
 if(!evento||funnelCountedSteps.has(step))return;
 funnelCountedSteps.add(step);
 const funil=window.boxaiFunil;
 if(funil&&typeof funil.enviar==='function')funil.enviar(evento);
}
// O passo 1 já está na tela desde o começo: conta quando o montador aparece
// pela primeira vez ou na primeira interação, o que vier antes.
function watchFunnelFirstStep(){
 const contar=()=>countFunnelStep(1);
 for(const tipo of ['focusin','input','change','click'])orderForm.addEventListener(tipo,contar,{once:true});
 if(typeof IntersectionObserver!=='function')return;
 const observer=new IntersectionObserver(entries=>{
  if(!entries.some(entry=>entry.isIntersecting))return;
  observer.disconnect();
  contar();
 });
 observer.observe(orderForm);
}

function changeOrderStep(next,focusTitle=true){countFunnelStep(next);orderStep=next;orderResults.forEach(el=>el.hidden=true);orderSteps.forEach(e=>e.hidden=Number(e.dataset.orderStep)!==next);orderProgress.forEach((e,i)=>{e.classList.toggle('current',i+1===next);e.classList.toggle('completed',i+1<next);if(i+1===next)e.setAttribute('aria-current','step');else e.removeAttribute('aria-current')});if(next===3)reviewOrder();if(focusTitle)focusOrderTitle(orderSteps[next-1]);scrollOrderIntoView();}
function showOrderResult(container){orderSteps.forEach(e=>e.hidden=true);orderResults.forEach(el=>el.hidden=el!==container);focusOrderTitle(container);scrollOrderIntoView();}
function showOrderSuccess(){orderProgress.forEach(e=>{e.classList.remove('current');e.classList.add('completed');e.removeAttribute('aria-current')});showOrderResult(orderSuccess)}
function showOrderFailure(){showOrderResult(orderFailure)}

function setButtonBusy(button,busy,busyLabel,idleLabel){if(!button)return;button.disabled=busy;if(busy)button.setAttribute('aria-busy','true');else button.removeAttribute('aria-busy');const label=button.querySelector('[data-order-label]');if(label)label.textContent=busy?busyLabel:idleLabel}
function setOrderSending(busy){orderSending=busy;setButtonBusy(orderSubmit,busy,'Enviando…','Peça sua proposta');setButtonBusy(orderRetry,busy,'Enviando…','Tentar de novo')}

function orderPayload(){const d=readOrder();const body={origem:'montador',segmento:d.segmento,tvs:d.tvs,locais:d.locais,modulos:d.modulos,nome:d.nome,empresa:d.empresa,cidade:d.cidade,whatsapp:d.whatsapp,email:d.email};const jaOpera=orderForm.elements.ja_opera;if(jaOpera)body.ja_opera=jaOpera.type==='checkbox'?jaOpera.checked:jaOpera.value;body.pagina=location.href;const origem=readSessionValue(SEGMENT_ORIGIN_KEY);if(origem)body.pagina_origem=origem;const segmentoPagina=readSessionValue(SEGMENT_NAME_KEY);if(segmentoPagina)body.segmento_pagina=segmentoPagina;Object.assign(body,readUtm());body.request_id=requestIdForOrder();return body}
async function postOrder(body){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),ORDER_TIMEOUT);try{return await fetch(ORDER_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal})}finally{clearTimeout(timer)}}
async function readJson(response){try{return await response.json()}catch{return null}}

async function sendOrder(){if(orderSending)return;const d=readOrder();const errors=[...validateSpace(d),...validateContact(d)];if(errors.length){showOrderErrors(errors);return}clearOrderErrors();setOrderSending(true);try{const response=await postOrder(orderPayload());if(response.ok){showOrderSuccess();return}if(response.status===400){const data=await readJson(response);if(data&&data.error==='lead_invalido'&&Array.isArray(data.campos)){const names=data.campos.map(String);setOrderSending(false);if(showOrderErrors(names))return}}showOrderFailure()}catch{showOrderFailure()}finally{setOrderSending(false)}}

orderForm.addEventListener('input',updateOrderSummary);orderForm.addEventListener('change',updateOrderSummary);
orderForm.querySelectorAll('input[name=segmento]').forEach(radio=>radio.addEventListener('change',()=>clearFieldError('segmento')));
// "Ainda não sei" não convive com módulo escolhido: marcar um lado limpa o outro.
function applyModuloExclusivo(changed){if(!changed.checked)return;const semEscolha=changed.value===ORDER_MODULO_SEM_ESCOLHA;groupInputs('modulos').forEach(input=>{if(input===changed)return;if(semEscolha||input.value===ORDER_MODULO_SEM_ESCOLHA)input.checked=false})}
function checkModulo(valor){const input=groupInputs('modulos').find(item=>item.value===valor);if(!input)return;input.checked=true;applyModuloExclusivo(input);clearFieldError('modulos');updateOrderSummary()}
groupInputs('modulos').forEach(input=>input.addEventListener('change',()=>{applyModuloExclusivo(input);clearFieldError('modulos')}));
// Cada card de #modulos leva ao pedido já com o módulo dele marcado.
document.querySelectorAll('[data-modulo]').forEach(link=>link.addEventListener('click',()=>checkModulo(link.dataset.modulo)));
orderForm.querySelectorAll('[data-quantity]').forEach(b=>b.addEventListener('click',()=>{const n=Number(tvCount.value);tvCount.value=String(Math.max(1,Math.min(999,(Number.isFinite(n)?n:1)+Number(b.dataset.quantity))));if(Number(unitCount.value)>Number(tvCount.value))unitCount.value=tvCount.value;clearFieldError('tvs');clearFieldError('locais');updateOrderSummary()}));
orderForm.querySelectorAll('[data-unit-quantity]').forEach(b=>b.addEventListener('click',()=>{const n=Number(unitCount.value);unitCount.value=String(Math.max(1,Math.min(999,(Number.isFinite(n)?n:1)+Number(b.dataset.unitQuantity))));clearFieldError('locais');updateOrderSummary()}));
orderForm.querySelectorAll('[data-order-next]').forEach(b=>b.addEventListener('click',()=>{if(validOrderStep())changeOrderStep(orderStep+1)}));orderForm.querySelectorAll('[data-order-back]').forEach(b=>b.addEventListener('click',()=>changeOrderStep(orderStep-1)));
orderForm.addEventListener('submit',e=>{e.preventDefault();if(orderSending)return;if(orderStep<3){if(validOrderStep())changeOrderStep(orderStep+1);return}sendOrder()});
if(orderRetry)orderRetry.addEventListener('click',()=>sendOrder());
orderForm.querySelectorAll('[data-order-restart]').forEach(b=>b.addEventListener('click',()=>{orderRequestId='';orderForm.reset();clearOrderErrors();previousPhone=orderForm.elements.whatsapp.value;updateOrderSummary();changeOrderStep(1)}));

function orderSummaryText(){const d=readOrder();return `Pedido de proposta — Box AI\n\nAmbiente: ${segmentoLabel()}\nTVs: ${d.tvs}\nLocais: ${d.locais}\nMódulos de interesse: ${d.modulos.join(', ')}\nNome: ${d.nome}\nEmpresa/espaço: ${d.empresa}\nCidade: ${d.cidade}\nWhatsApp: ${d.whatsapp}\nE-mail: ${d.email}\n\nGostaria de conversar sobre equipamentos, instalação, valores e condições para esta configuração.`}
orderForm.querySelectorAll('[data-copy-order]').forEach(button=>button.addEventListener('click',async()=>{const text=orderSummaryText();const status=button.closest('.order-step,.order-result').querySelector('[data-copy-status]');try{await navigator.clipboard.writeText(text);status.textContent='Resumo copiado.'}catch{const area=document.createElement('textarea');area.value=text;area.readOnly=true;area.setAttribute('aria-label','Resumo do pedido para copiar');status.replaceChildren(area);area.focus();area.select()}}));

function formatOrderPhone(value){let digits=value.replace(/\D/g,'');const country=value.trim().startsWith('+55')||(digits.length>11&&digits.startsWith('55'));if(country)digits=digits.slice(2);digits=digits.slice(0,11);const prefix=country?'+55 ':'';if(!digits)return country?'+55':'';if(digits.length<=2)return prefix+'('+digits;const local=digits.slice(2);const split=digits.length>10?5:4;return prefix+'('+digits.slice(0,2)+') '+local.slice(0,split)+(local.length>split?'-'+local.slice(split):'')}
const phoneField=orderForm.elements.whatsapp;
let previousPhone=phoneField.value;
phoneField.addEventListener('input',event=>{let raw=phoneField.value;const cursor=phoneField.selectionStart??raw.length;let digitsBefore=raw.slice(0,cursor).replace(/\D/g,'').length;if(event.inputType==='deleteContentBackward'&&raw.replace(/\D/g,'').length===previousPhone.replace(/\D/g,'').length&&digitsBefore>0){const digits=raw.replace(/\D/g,'');raw=digits.slice(0,digitsBefore-1)+digits.slice(digitsBefore);digitsBefore--}phoneField.value=formatOrderPhone(raw);let caret=0,count=0;const targetDigits=digitsBefore;while(caret<phoneField.value.length&&count<targetDigits){if(/\d/.test(phoneField.value[caret]))count++;caret++}if(cursor===raw.length)caret=phoneField.value.length;phoneField.setSelectionRange(caret,caret);previousPhone=phoneField.value;clearFieldError('whatsapp')});
orderForm.elements.email.addEventListener('input',()=>clearFieldError('email'));
for(const name of ['nome','empresa','cidade']){const field=orderForm.elements[name];field.addEventListener('blur',()=>{field.value=field.value.trim().replace(/\s{2,}/g,' ')});field.addEventListener('input',()=>clearFieldError(name))}

// O prazo de resposta vem de site-config.js; vazio deixa a frase sem prazo.
function applyPrazoResposta(){const alvo=orderSuccess&&orderSuccess.querySelector('[data-order-prazo]');if(!alvo)return;const config=window.SITE_CONFIG||{};const prazo=typeof config.prazoResposta==='string'?config.prazoResposta.trim():'';alvo.textContent=prazo?'Nossa equipe responde em '+prazo+', pelo WhatsApp ou e-mail que você informou.':'Nossa equipe responde pelo WhatsApp ou e-mail que você informou.'}

applySegmentFromUrl();
applyPrazoResposta();
updateOrderSummary();
watchFunnelFirstStep();
