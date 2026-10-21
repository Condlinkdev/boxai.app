// Seção dos pilotos onde a Box AI já está funcionando, lida de site-config.js
// (SITE_CONFIG.provaSocial). Os três cartões já vêm escritos no HTML com os
// mesmos dados do config, então sem JavaScript a seção aparece do mesmo jeito.
// Aqui o script só confere o config: esconde a seção e o link do menu quando
// ativo não é true ou quando falta a data da autorização, esconde o cartão que
// não tiver dados no config e repõe nome, segmento, cidade, status, texto,
// legenda e fotos de cada um. Depois de trocar os valores, atualize o ?v= de
// site-config.js e de prova-social.js no HTML das páginas que os carregam.
(function () {
  const config = (window.SITE_CONFIG && window.SITE_CONFIG.provaSocial) || {};
  const secao = document.querySelector('[data-prova-social]');
  if (!secao) return;
  const links = document.querySelectorAll('[data-prova-social-link]');
  const cartoes = secao.querySelectorAll('[data-piloto]');
  // A medida que o navegador usa para escolher o tamanho de cada foto, igual à
  // do <picture> escrito no HTML: a principal ocupa o cartão inteiro e a
  // segunda, 58% dele.
  const TAMANHOS = '(max-width:760px) calc(100vw - 40px), (max-width:1100px) 44vw, 374px';
  const TAMANHOS_SEGUNDA = '(max-width:760px) calc((100vw - 40px) * 0.58), (max-width:1100px) 25.5vw, 217px';
  // Valores de quem não declara nada no config, que é a foto do Mercado do Vila.
  const TIPOS_PADRAO = ['avif', 'webp'];
  const LARGURAS_PADRAO = [400, 700];
  const LARGURA_PADRAO = 700;
  const ALTURA_PADRAO = 525;

  function text(value) {
    return typeof value === 'string' ? value.trim() : '';
  }
  function lista(valor, padrao) {
    return Array.isArray(valor) && valor.length ? valor : padrao;
  }
  function esconder() {
    secao.hidden = true;
    links.forEach(function (link) {
      link.hidden = true;
    });
  }
  function piloto(id) {
    const pilotos = Array.isArray(config.pilotos) ? config.pilotos : [];
    for (let i = 0; i < pilotos.length; i += 1) {
      if (pilotos[i] && text(pilotos[i].id) === id) return pilotos[i];
    }
    return null;
  }
  // Um piloto pode trazer foto (uma só) ou fotos (a principal e a segunda).
  function fotos(dados) {
    const varias = Array.isArray(dados.fotos) ? dados.fotos : [];
    if (varias.length) return varias.slice(0, 2);
    return dados.foto ? [dados.foto] : [];
  }
  function escrever(cartao, seletor, valor) {
    const alvo = cartao.querySelector(seletor);
    if (!alvo) return;
    alvo.textContent = valor;
    alvo.hidden = !valor;
  }
  function srcset(base, tipo, larguras) {
    return larguras
      .map(function (largura) {
        return base + '-' + largura + '.' + tipo + ' ' + largura + 'w';
      })
      .join(', ');
  }
  // Refaz as <source> de um <picture> para acompanhar os formatos e tamanhos do
  // config, sem trocar o <img>: assim o navegador não baixa a mesma foto de novo.
  function montarPicture(picture, foto, medida) {
    const base = text(foto.src);
    const tipos = lista(foto.tipos, TIPOS_PADRAO);
    const larguras = lista(foto.tamanhos, LARGURAS_PADRAO);
    const maior = larguras[larguras.length - 1];
    const ultimo = tipos[tipos.length - 1];
    let img = picture.querySelector('img');
    if (!img) {
      img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      picture.appendChild(img);
    }
    picture.querySelectorAll('source').forEach(function (source) {
      source.remove();
    });
    tipos.forEach(function (tipo) {
      const source = document.createElement('source');
      source.type = 'image/' + tipo;
      source.srcset = srcset(base, tipo, larguras);
      source.sizes = medida;
      picture.insertBefore(source, img);
    });
    img.width = Number(foto.largura) || LARGURA_PADRAO;
    img.height = Number(foto.altura) || ALTURA_PADRAO;
    const endereco = base + '-' + maior + '.' + ultimo;
    if (img.getAttribute('src') !== endereco) img.src = endereco;
    img.alt = text(foto.alt);
  }
  function criarFigura() {
    const figura = document.createElement('figure');
    figura.className = 'pilot-photo';
    figura.appendChild(document.createElement('picture'));
    figura.appendChild(document.createElement('figcaption'));
    return figura;
  }
  function criarSegunda() {
    const bloco = document.createElement('div');
    bloco.className = 'pilot-photo-extra';
    bloco.appendChild(document.createElement('picture'));
    return bloco;
  }
  function criarLegenda() {
    const legenda = document.createElement('p');
    legenda.className = 'pilot-legend';
    return legenda;
  }
  function criarVazio(aviso) {
    const vazio = document.createElement('p');
    vazio.className = 'pilot-empty';
    vazio.textContent = aviso;
    return vazio;
  }
  // As fotos são montadas a partir de src e alt; sem foto (ou sem alt) fica o
  // espaço neutro, nunca uma imagem de outro lugar. Quando o HTML já traz as
  // mesmas fotos, os nós são reaproveitados e nada é baixado de novo.
  function aplicarFotos(cartao, dados) {
    const media = cartao.querySelector('[data-piloto-media]');
    if (!media) return;
    const validas = fotos(dados).filter(function (foto) {
      return foto && text(foto.src) && text(foto.alt);
    });
    if (!validas.length) {
      if (!media.querySelector('.pilot-empty')) {
        media.replaceChildren(criarVazio('Foto do local em breve'));
      }
      return;
    }
    const vazio = media.querySelector('.pilot-empty');
    if (vazio) vazio.remove();

    let figura = media.querySelector('.pilot-photo');
    if (!figura) {
      figura = criarFigura();
      media.prepend(figura);
    }
    montarPicture(figura.querySelector('picture'), validas[0], TAMANHOS);
    const creditoTexto = text(validas[0].fonte);
    const credito = figura.querySelector('figcaption');
    if (credito) {
      credito.textContent = creditoTexto;
      credito.hidden = !creditoTexto;
    }

    let segunda = media.querySelector('.pilot-photo-extra');
    if (validas[1]) {
      if (!segunda) {
        segunda = criarSegunda();
        figura.after(segunda);
      }
      montarPicture(segunda.querySelector('picture'), validas[1], TAMANHOS_SEGUNDA);
    } else if (segunda) {
      segunda.remove();
    }

    const legendaTexto = text(dados.legenda);
    let legenda = media.querySelector('.pilot-legend');
    if (legendaTexto) {
      if (!legenda) {
        legenda = criarLegenda();
        media.appendChild(legenda);
      }
      legenda.textContent = legendaTexto;
    } else if (legenda) {
      legenda.remove();
    }
  }

  if (config.ativo !== true || !text(config.autorizacao && config.autorizacao.data)) {
    esconder();
    return;
  }
  let visiveis = 0;
  cartoes.forEach(function (cartao) {
    const dados = piloto(cartao.getAttribute('data-piloto'));
    if (!dados) {
      cartao.hidden = true;
      return;
    }
    const cidade = text(dados.cidade);
    const segmento = text(dados.segmento);
    escrever(cartao, '[data-piloto-nome]', text(dados.nome));
    escrever(cartao, '[data-piloto-meta]', [segmento, cidade].filter(Boolean).join(' · '));
    escrever(cartao, '[data-piloto-texto]', text(dados.texto));
    const status = cartao.querySelector('[data-piloto-status]');
    const emUso = text(dados.status).toLowerCase() === 'em uso';
    if (status) {
      status.textContent = text(dados.status);
      status.hidden = !text(dados.status);
      status.classList.toggle('is-proven', emUso);
      status.classList.toggle('is-pending', !emUso);
    }
    aplicarFotos(cartao, dados);
    cartao.hidden = false;
    visiveis += 1;
  });
  if (!visiveis) esconder();
})();
