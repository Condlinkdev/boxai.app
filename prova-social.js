// Seção dos pilotos onde a Box AI já está funcionando, lida de site-config.js
// (SITE_CONFIG.provaSocial). Os três cartões já vêm escritos no HTML com os
// mesmos dados do config, então sem JavaScript a seção aparece do mesmo jeito.
// Aqui o script só confere o config: esconde a seção e o link do menu quando
// ativo não é true ou quando falta a data da autorização, esconde o cartão que
// não tiver dados no config e repõe nome, segmento, cidade, status, texto,
// legenda, vídeo e fotos de cada um. O cartão que tem vídeo no config mostra o
// vídeo no lugar principal e a foto do local embaixo, menor; quem toca o vídeo
// é video-piloto.js. Depois de trocar os valores, atualize o ?v= de
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
  // Tamanho do vídeo em pé, usado quando o config não declara largura/altura.
  const LARGURA_VIDEO = 478;
  const ALTURA_VIDEO = 850;

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
  // O vídeo do piloto só entra com arquivo e com a descrição de quem não o vê.
  function videoDoPiloto(dados) {
    const declarado = dados.video;
    if (!declarado || !text(declarado.src) || !text(declarado.alt)) return null;
    return declarado;
  }
  // O crédito é a tarja escrita sobre a media, igual à das fotos. Sem texto,
  // a tarja fica escondida em vez de mostrar um crédito vazio.
  function aplicarCredito(bloco, texto) {
    let credito = bloco.querySelector('figcaption');
    if (!texto) {
      if (credito) credito.hidden = true;
      return;
    }
    if (!credito) {
      credito = document.createElement('figcaption');
      bloco.appendChild(credito);
    }
    credito.textContent = texto;
    credito.hidden = false;
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
    const bloco = document.createElement('figure');
    bloco.className = 'pilot-photo-extra';
    bloco.appendChild(document.createElement('picture'));
    return bloco;
  }
  function criarVideo() {
    const figura = document.createElement('figure');
    figura.className = 'pilot-video';
    figura.setAttribute('data-piloto-video', '');
    const tela = document.createElement('video');
    // Sem o video-piloto.js ficam os controles nativos, então dá para tocar na
    // mão; quem decide quando baixar e tocar sozinho é o video-piloto.js.
    tela.controls = true;
    tela.muted = true;
    tela.defaultMuted = true;
    tela.loop = true;
    tela.playsInline = true;
    tela.preload = 'none';
    tela.setAttribute('muted', '');
    tela.appendChild(document.createElement('source'));
    figura.appendChild(tela);
    figura.appendChild(document.createElement('figcaption'));
    return figura;
  }
  // Repõe o arquivo, a capa e o tamanho do vídeo a partir do config. O endereço
  // só é trocado quando muda, para não recomeçar o que já estiver tocando.
  function montarVideo(figura, dados) {
    const tela = figura.querySelector('video');
    if (!tela) return;
    let fonte = tela.querySelector('source');
    if (!fonte) {
      fonte = document.createElement('source');
      tela.appendChild(fonte);
    }
    fonte.type = 'video/mp4';
    const endereco = text(dados.src);
    if (fonte.getAttribute('src') !== endereco) {
      fonte.setAttribute('src', endereco);
      tela.load();
    }
    const capa = text(dados.poster);
    if (tela.getAttribute('poster') !== capa) tela.setAttribute('poster', capa);
    tela.width = Number(dados.largura) || LARGURA_VIDEO;
    tela.height = Number(dados.altura) || ALTURA_VIDEO;
    tela.setAttribute('aria-label', text(dados.alt));
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
  // A media de cada cartão é montada a partir do config: o vídeo, quando
  // houver, fica no lugar principal, e as fotos vêm de src e alt. Sem nada
  // válido fica o espaço neutro, nunca uma imagem de outro lugar. Quando o HTML
  // já traz a mesma media, os nós são reaproveitados: nada é baixado de novo,
  // e o vídeo que já estiver tocando não é trocado nem recomeça.
  function aplicarMedia(cartao, dados) {
    const media = cartao.querySelector('[data-piloto-media]');
    if (!media) return;
    const filme = videoDoPiloto(dados);
    const validas = fotos(dados).filter(function (foto) {
      return foto && text(foto.src) && text(foto.alt);
    });
    // Com vídeo, ele é a media principal e a primeira foto desce para o espaço
    // menor, o mesmo da segunda foto de quem tem duas.
    const principal = filme ? null : validas[0];
    const segundaFoto = filme ? validas[0] : validas[1];
    if (!filme && !principal) {
      if (!media.querySelector('.pilot-empty')) {
        media.replaceChildren(criarVazio('Foto do local em breve'));
      }
      return;
    }
    const vazio = media.querySelector('.pilot-empty');
    if (vazio) vazio.remove();

    let video = media.querySelector('[data-piloto-video]');
    if (filme) {
      if (!video) {
        video = criarVideo();
        media.prepend(video);
      }
      montarVideo(video, filme);
      aplicarCredito(video, text(filme.fonte));
    } else if (video) {
      video.remove();
      video = null;
    }

    let figura = media.querySelector('.pilot-photo');
    if (principal) {
      if (!figura) {
        figura = criarFigura();
        media.prepend(figura);
      }
      montarPicture(figura.querySelector('picture'), principal, TAMANHOS);
      aplicarCredito(figura, text(principal.fonte));
    } else if (figura) {
      figura.remove();
      figura = null;
    }

    let segunda = media.querySelector('.pilot-photo-extra');
    if (segundaFoto) {
      if (!segunda) {
        segunda = criarSegunda();
        const anterior = figura || video;
        if (anterior) anterior.after(segunda);
        else media.prepend(segunda);
      }
      montarPicture(segunda.querySelector('picture'), segundaFoto, TAMANHOS_SEGUNDA);
      aplicarCredito(segunda, text(segundaFoto.fonte));
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
    aplicarMedia(cartao, dados);
    cartao.hidden = false;
    visiveis += 1;
  });
  if (!visiveis) esconder();
})();
