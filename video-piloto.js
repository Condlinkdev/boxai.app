// Vídeo dos cartões de piloto, na seção "Onde a Box AI já está funcionando".
// O vídeo já vem no HTML com autoplay, muted, playsinline e preload="auto".
// O script mantém a reprodução sem som e pausa quando o cartão sai da tela.
// Quando o navegador tem IntersectionObserver e o sistema não pede menos
// movimento, este script troca os controles nativos por dois botões escritos
// (pausar/reproduzir e ligar/desligar o som) e toca o vídeo sem som só
// enquanto ele está na tela, parando assim que sai. Quem pausa no botão manda:
// o vídeo só volta a tocar quando a pessoa pedir.
// Se o navegador recusar tocar sozinho, os controles nativos voltam.
// Depois de mexer aqui, atualize o ?v= de video-piloto.js no HTML.
(function () {
  const figuras = document.querySelectorAll('[data-piloto-video]');
  if (!figuras.length) return;
  const menosMovimento = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  // A preferência por menos movimento desliga também o autoplay do HTML.
  if (menosMovimento && menosMovimento.matches) {
    figuras.forEach(function (figura) {
      const video = figura.querySelector('video');
      if (video) { video.autoplay = false; video.pause(); }
    });
    return;
  }
  // Sem o observador, ficam o autoplay e os controles nativos do HTML.
  if (!('IntersectionObserver' in window)) return;

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
    video.preload = 'auto';
    video.autoplay = true;
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
        tentativa.catch(voltarAosControles);
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
    atualizarBotoes();
  });
})();
