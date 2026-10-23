// Vídeo dos cartões de piloto, na seção "Onde a Box AI já está funcionando".
// O vídeo já vem no HTML com os controles nativos e com preload="none", então
// sem JavaScript dá para tocar na mão e nada é baixado antes disso. Com menos
// movimento pedido no sistema fica igual: nada toca sozinho e o arquivo
// (2,8 MB) só é baixado se a pessoa tocar.
// Quando o navegador tem IntersectionObserver, este script troca os controles
// nativos por dois botões escritos (pausar/reproduzir e ligar/desligar o som),
// começa a baixar o vídeo uma tela antes de ele aparecer e o toca sem som, em
// loop, enquanto ele está na tela, parando assim que sai. Quem pausa no botão
// manda: o vídeo só volta a tocar quando a pessoa pedir.
// Se o navegador recusar tocar sozinho, os controles nativos voltam.
// Depois de mexer aqui, atualize o ?v= de video-piloto.js no HTML.
(function () {
  const figuras = document.querySelectorAll('[data-piloto-video]');
  if (!figuras.length) return;
  const menosMovimento = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  // Com menos movimento, nada toca sozinho e nada é baixado antes do toque:
  // ficam os controles nativos e o preload="none" do HTML.
  if (menosMovimento && menosMovimento.matches) return;
  // Sem o observador não dá para saber quando o vídeo está na tela: ele toca
  // sozinho e sem som, com os controles nativos.
  if (!('IntersectionObserver' in window)) {
    figuras.forEach(function (figura) {
      const video = figura.querySelector('video');
      if (!video) return;
      video.defaultMuted = true;
      video.muted = true;
      video.autoplay = true;
      video.preload = 'auto';
    });
    return;
  }

  figuras.forEach(function (figura) {
    const video = figura.querySelector('video');
    if (!video || typeof video.play !== 'function') return;
    let pausadoPelaPessoa = false;

    const acoes = document.createElement('div');
    acoes.className = 'pilot-video-actions';
    const botaoTocar = document.createElement('button');
    botaoTocar.type = 'button';
    botaoTocar.className = 'pilot-video-button';
    const botaoSom = document.createElement('button');
    botaoSom.type = 'button';
    botaoSom.className = 'pilot-video-button';
    acoes.appendChild(botaoTocar);
    acoes.appendChild(botaoSom);
    figura.appendChild(acoes);
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.controls = false;

    function atualizarBotoes() {
      botaoTocar.textContent = video.paused ? 'Reproduzir' : 'Pausar';
      botaoSom.textContent = video.muted ? 'Ativar som' : 'Desativar som';
      botaoSom.setAttribute('aria-pressed', video.muted ? 'false' : 'true');
    }
    // Navegador que recusa tocar sozinho volta aos controles nativos, para que
    // ninguém fique sem conseguir ver o vídeo.
    function voltarAosControles() {
      acoes.remove();
      video.controls = true;
    }
    function tocar() {
      const tentativa = video.play();
      if (tentativa && typeof tentativa.catch === 'function') {
        tentativa.catch(function (erro) {
          // AbortError é um pause() chegando antes de o vídeo começar (ele saiu
          // da tela enquanto carregava), não uma recusa do navegador: os botões
          // ficam e ele volta a tocar quando reaparecer.
          if (erro && erro.name === 'AbortError') return;
          voltarAosControles();
        });
      }
    }

    botaoTocar.addEventListener('click', function () {
      if (video.paused) {
        pausadoPelaPessoa = false;
        tocar();
      } else {
        pausadoPelaPessoa = true;
        video.pause();
      }
    });
    // Ligar o som é um toque da pessoa, então também serve para começar o
    // vídeo quando ele estiver parado.
    botaoSom.addEventListener('click', function () {
      video.muted = !video.muted;
      if (!video.muted && video.paused) {
        pausadoPelaPessoa = false;
        tocar();
      }
      atualizarBotoes();
    });
    video.addEventListener('play', atualizarBotoes);
    video.addEventListener('pause', atualizarBotoes);
    video.addEventListener('volumechange', atualizarBotoes);

    // Um quarto do vídeo visível já basta para tocar; ao sair, ele para.
    const observador = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting && entrada.intersectionRatio >= 0.25) {
            if (!pausadoPelaPessoa && video.paused) tocar();
          } else if (!video.paused) {
            video.pause();
          }
        });
      },
      { threshold: [0, 0.25] }
    );
    observador.observe(video);
    // Uma tela antes de o vídeo aparecer o arquivo começa a baixar, para ele
    // já tocar quando chegar; quem não rola até os pilotos não baixa nada.
    const aproximacao = new IntersectionObserver(
      function (entradas) {
        if (!entradas.some(function (entrada) { return entrada.isIntersecting; })) return;
        video.preload = 'auto';
        aproximacao.disconnect();
      },
      { rootMargin: '100% 0px' }
    );
    aproximacao.observe(video);
    atualizarBotoes();
  });
})();
