// "Fale com a gente" (#pedido), a captura que fecha a home.
// Campos mínimos da copy: nome, WhatsApp, cidade e o que pediu
// (só Box AI | TV corporativa | Interativa | acesso | ambos). A origem vai junto:
// página, UTMs, a página de segmento de onde a pessoa veio e o ?segmento= dela.
// Envia para o mesmo endpoint do montador antigo, com origem 'home'.
const CONTATO_ENDPOINT='https://assistente-site.condlink.com.br/api/lead';
const CONTATO_TIMEOUT=15000;
const contatoForm=document.querySelector('#contato-form');
const contatoEtapa=contatoForm.querySelector('[data-contato-etapa]');
const contatoSucesso=document.querySelector('#contato-sucesso');
const contatoFalha=document.querySelector('#contato-falha');
const contatoEnviar=document.querySelector('#contato-enviar');
const contatoRepetir=document.querySelector('#contato-repetir');
const CONTATO_UTM=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
// Escritos por segmento.js quando a pessoa segue de uma página de segmento para cá.
const CONTATO_ORIGEM_KEY='boxai:pagina_origem';
const CONTATO_SEGMENTO_KEY='boxai:segmento_pagina';
// Apelidos aceitos no ?segmento= das páginas de segmento, com os mesmos valores do montador antigo.
const CONTATO_SEGMENTO_PARAM={'lojas-autonomas':'Lojas autônomas','loja-autonoma':'Lojas autônomas','lojas':'Loja','loja':'Loja','clinicas':'Clínica','clinica':'Clínica','academias':'Academia','academia':'Academia','condominios':'Condomínio','condominio':'Condomínio','empresas':'Empresa','empresa':'Empresa','franquias':'Franquia ou rede','franquia':'Franquia ou rede'};
const CONTATO_PEDIDOS=['só Box AI','TV corporativa','Interativa','acesso','ambos'];
const CONTATO_CAMPOS=['nome','whatsapp','cidade','o_que_pediu'];
const CONTATO_MENSAGENS={nome:'Preencha seu nome.',whatsapp:'Confira o WhatsApp com DDD. Exemplo: (11) 91234-5678.',cidade:'Informe a cidade.',o_que_pediu:'Escolha uma opção.'};
let contatoEnviando=false;
let contatoRequestId='';

function novoRequestId(){const c=globalThis.crypto;if(c&&typeof c.randomUUID==='function')return c.randomUUID();if(c&&typeof c.getRandomValues==='function'){const b=c.getRandomValues(new Uint8Array(16));b[6]=b[6]&15|64;b[8]=b[8]&63|128;const h=[...b].map(n=>n.toString(16).padStart(2,'0')).join('');return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20)}return 'home-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,10)}
// O mesmo id vale para as novas tentativas do mesmo contato; o serviço não duplica o lead.
function requestIdDoContato(){if(!contatoRequestId)contatoRequestId=novoRequestId();return contatoRequestId}
function lerSessao(key){try{return sessionStorage.getItem(key)||''}catch{return ''}}
function lerUtm(){const params=new URLSearchParams(location.search),utm={};for(const key of CONTATO_UTM){const value=params.get(key);if(value)utm[key]=value}return utm}
function dobrar(texto){return texto.normalize('NFD').replace(/\p{M}/gu,'').trim().toLowerCase()}
function segmentoDaUrl(){const raw=new URLSearchParams(location.search).get('segmento');return raw?CONTATO_SEGMENTO_PARAM[dobrar(raw)]||'':''}

function lerContato(){const d=new FormData(contatoForm);return{nome:String(d.get('nome')||'').trim(),whatsapp:String(d.get('whatsapp')||'').trim(),cidade:String(d.get('cidade')||'').trim(),o_que_pediu:String(d.get('o_que_pediu')||'')}}
function validarContato(d){const erros=[];if(d.nome.length<2||d.nome.length>80)erros.push('nome');let fone=d.whatsapp.replace(/\D/g,'');if(fone.length>11&&fone.startsWith('55'))fone=fone.slice(2);if(!/^[1-9]{2}\d{8,9}$/.test(fone))erros.push('whatsapp');if(d.cidade.length<2||d.cidade.length>80)erros.push('cidade');if(!CONTATO_PEDIDOS.includes(d.o_que_pediu))erros.push('o_que_pediu');return erros}

function campo(nome){const field=contatoForm.elements[nome];if(!field)return null;return!field.tagName&&typeof field.length==='number'?field[0]:field}
function opcoesDoPedido(){return[...contatoForm.querySelectorAll('input[name=o_que_pediu]')]}
function ancoraDoErro(nome){return nome==='o_que_pediu'?contatoForm.querySelector('.contato-opcoes'):campo(nome)}
function elementoDoErro(nome){let el=document.querySelector('#erro-contato-'+nome);if(!el){const ancora=ancoraDoErro(nome);if(!ancora)return null;el=document.createElement('span');el.id='erro-contato-'+nome;el.className='contato-erro';ancora.insertAdjacentElement('afterend',el)}return el}
function marcarErro(nome){const el=elementoDoErro(nome);if(!el)return;el.textContent=CONTATO_MENSAGENS[nome];el.hidden=false;const alvos=nome==='o_que_pediu'?opcoesDoPedido():[campo(nome)];alvos.forEach(node=>{if(!node)return;node.setAttribute('aria-invalid','true');node.setAttribute('aria-describedby',el.id)})}
function limparErro(nome){const el=document.querySelector('#erro-contato-'+nome);if(el){el.hidden=true;el.textContent=''}const alvos=nome==='o_que_pediu'?opcoesDoPedido():[campo(nome)];alvos.forEach(node=>{if(!node)return;node.removeAttribute('aria-invalid');node.removeAttribute('aria-describedby')})}
function limparErros(){CONTATO_CAMPOS.forEach(limparErro)}
function mostrarErros(nomes){limparErros();const conhecidos=nomes.filter(nome=>CONTATO_CAMPOS.includes(nome));if(!conhecidos.length)return false;conhecidos.forEach(marcarErro);mostrarEtapa();campo(conhecidos[0])?.focus();return true}

function rolarAteOFormulario(){if(contatoForm.getBoundingClientRect().top<0)contatoForm.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})}
function focarTitulo(container){const titulo=container.querySelector('h3');if(!titulo)return;titulo.tabIndex=-1;titulo.focus({preventScroll:true})}
function mostrarEtapa(){contatoEtapa.hidden=false;contatoSucesso.hidden=true;contatoFalha.hidden=true}
function mostrarResultado(container){contatoEtapa.hidden=true;contatoSucesso.hidden=container!==contatoSucesso;contatoFalha.hidden=container!==contatoFalha;focarTitulo(container);rolarAteOFormulario()}

function ocupar(botao,ocupado,rotuloOcupado,rotuloLivre){if(!botao)return;botao.disabled=ocupado;if(ocupado)botao.setAttribute('aria-busy','true');else botao.removeAttribute('aria-busy');const rotulo=botao.querySelector('[data-contato-rotulo]');if(rotulo)rotulo.textContent=ocupado?rotuloOcupado:rotuloLivre}
function marcarEnviando(ocupado){contatoEnviando=ocupado;ocupar(contatoEnviar,ocupado,'Enviando…','Quero falar com a Box AI');ocupar(contatoRepetir,ocupado,'Enviando…','Tentar de novo')}

function corpoDoContato(){const d=lerContato();const corpo={origem:'home',o_que_pediu:d.o_que_pediu,nome:d.nome,whatsapp:d.whatsapp,cidade:d.cidade,pagina:location.href};const segmento=segmentoDaUrl();if(segmento)corpo.segmento=segmento;const origem=lerSessao(CONTATO_ORIGEM_KEY);if(origem)corpo.pagina_origem=origem;const segmentoPagina=lerSessao(CONTATO_SEGMENTO_KEY);if(segmentoPagina)corpo.segmento_pagina=segmentoPagina;Object.assign(corpo,lerUtm());corpo.request_id=requestIdDoContato();return corpo}
async function postar(corpo){const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),CONTATO_TIMEOUT);try{return await fetch(CONTATO_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(corpo),signal:controller.signal})}finally{clearTimeout(timer)}}
async function lerJson(response){try{return await response.json()}catch{return null}}

async function enviarContato(){
 if(contatoEnviando)return;
 const erros=validarContato(lerContato());
 if(erros.length){mostrarErros(erros);return}
 limparErros();marcarEnviando(true);
 try{
  const response=await postar(corpoDoContato());
  if(response.ok){mostrarResultado(contatoSucesso);return}
  if(response.status===400){const data=await lerJson(response);if(data&&data.error==='lead_invalido'&&Array.isArray(data.campos)){marcarEnviando(false);if(mostrarErros(data.campos.map(String)))return}}
  mostrarResultado(contatoFalha);
 }catch{mostrarResultado(contatoFalha)}
 finally{marcarEnviando(false)}
}

// Os CTAs da página já dizem o que a pessoa pediu: o do topo marca "só Box AI",
// o da TV corporativa marca "TV corporativa", o da Interativa marca "Interativa" e o do
// controle de acesso marca "acesso". Ela pode trocar no formulário.
function marcarPedido(valor){const opcao=opcoesDoPedido().find(input=>input.value===valor);if(!opcao)return;opcao.checked=true;limparErro('o_que_pediu')}
document.querySelectorAll('a[data-pedido]').forEach(link=>link.addEventListener('click',()=>marcarPedido(link.dataset.pedido)));

// Contagem anônima do funil (funil.js): o formulário conta uma vez por carregamento,
// quando aparece na tela ou na primeira interação. Nenhum valor do formulário sai daqui.
let funilContado=false;
function contarFunil(){if(funilContado)return;funilContado=true;const funil=window.boxaiFunil;if(funil&&typeof funil.enviar==='function')funil.enviar('pedido_passo_1')}
for(const tipo of ['focusin','input','change'])contatoForm.addEventListener(tipo,contarFunil,{once:true});
if(typeof IntersectionObserver==='function'){const observer=new IntersectionObserver(entries=>{if(!entries.some(entry=>entry.isIntersecting))return;observer.disconnect();contarFunil()});observer.observe(contatoForm)}

contatoForm.addEventListener('submit',event=>{event.preventDefault();enviarContato()});
contatoRepetir?.addEventListener('click',()=>enviarContato());
contatoForm.querySelectorAll('[data-contato-recomecar]').forEach(botao=>botao.addEventListener('click',()=>{contatoRequestId='';contatoForm.reset();limparErros();foneAnterior=foneCampo.value;mostrarEtapa();campo('nome')?.focus()}));
opcoesDoPedido().forEach(input=>input.addEventListener('change',()=>limparErro('o_que_pediu')));

function textoDoResumo(){const d=lerContato();const marcada=opcoesDoPedido().find(input=>input.checked);const pedido=marcada&&marcada.nextElementSibling?marcada.nextElementSibling.textContent:d.o_que_pediu;return `Fale com a gente — Box AI\n\nO que pediu: ${pedido}\nNome: ${d.nome}\nWhatsApp: ${d.whatsapp}\nCidade: ${d.cidade}`}
contatoForm.querySelectorAll('[data-contato-copiar]').forEach(botao=>botao.addEventListener('click',async()=>{const texto=textoDoResumo();const status=contatoFalha.querySelector('[data-contato-copia-status]');try{await navigator.clipboard.writeText(texto);status.textContent='Resumo copiado.'}catch{const area=document.createElement('textarea');area.value=texto;area.readOnly=true;area.setAttribute('aria-label','Resumo para copiar');status.replaceChildren(area);area.focus();area.select()}}));

function formatarFone(valor){let digitos=valor.replace(/\D/g,'');const pais=valor.trim().startsWith('+55')||(digitos.length>11&&digitos.startsWith('55'));if(pais)digitos=digitos.slice(2);digitos=digitos.slice(0,11);const prefixo=pais?'+55 ':'';if(!digitos)return pais?'+55':'';if(digitos.length<=2)return prefixo+'('+digitos;const local=digitos.slice(2);const corte=digitos.length>10?5:4;return prefixo+'('+digitos.slice(0,2)+') '+local.slice(0,corte)+(local.length>corte?'-'+local.slice(corte):'')}
const foneCampo=contatoForm.elements.whatsapp;
let foneAnterior=foneCampo.value;
foneCampo.addEventListener('input',event=>{let bruto=foneCampo.value;const cursor=foneCampo.selectionStart??bruto.length;let digitosAntes=bruto.slice(0,cursor).replace(/\D/g,'').length;if(event.inputType==='deleteContentBackward'&&bruto.replace(/\D/g,'').length===foneAnterior.replace(/\D/g,'').length&&digitosAntes>0){const digitos=bruto.replace(/\D/g,'');bruto=digitos.slice(0,digitosAntes-1)+digitos.slice(digitosAntes);digitosAntes--}foneCampo.value=formatarFone(bruto);let caret=0,conta=0;while(caret<foneCampo.value.length&&conta<digitosAntes){if(/\d/.test(foneCampo.value[caret]))conta++;caret++}if(cursor===bruto.length)caret=foneCampo.value.length;foneCampo.setSelectionRange(caret,caret);foneAnterior=foneCampo.value;limparErro('whatsapp')});
for(const nome of ['nome','cidade']){const field=contatoForm.elements[nome];field.addEventListener('blur',()=>{field.value=field.value.trim().replace(/\s{2,}/g,' ')});field.addEventListener('input',()=>limparErro(nome))}

// O prazo de resposta vem de site-config.js; vazio deixa a frase sem prazo.
function aplicarPrazo(){const alvo=contatoSucesso.querySelector('[data-contato-prazo]');if(!alvo)return;const config=window.SITE_CONFIG||{};const prazo=typeof config.prazoResposta==='string'?config.prazoResposta.trim():'';alvo.textContent=prazo?'Alguém da Box AI retorna em '+prazo+', pelo WhatsApp que você informou.':'Em breve alguém da Box AI retorna pelo WhatsApp que você informou.'}
aplicarPrazo();
