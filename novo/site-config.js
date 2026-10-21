// Dados cadastrais da Condlink usados no rodapé.
// Razão social, CNPJ e endereço são públicos e aparecem no rodapé. O endereço
// exibido é o que enderecoExibido nomeia em enderecos: hoje 'escritorio'; use
// 'cartaoCnpj' para o endereço do Cartão CNPJ ou '' para voltar a ocultar.
// Depois de trocar, atualize o ?v= de site-config.js e footer.js no HTML das
// seis páginas.
window.SITE_CONFIG = {
  razaoSocial: 'CONDLINK DESENVOLVIMENTO DE SISTEMAS LTDA',
  cnpj: '14.345.289/0001-95',
  enderecos: {
    cartaoCnpj: 'Av. Comendador Alfredo Maffei, 1400, Sala B, Jardim São Carlos, São Carlos - SP, 13561-270',
    escritorio: 'R. Aquidaban, 1, Sala 07, Centro, São Carlos - SP, 13560-120 (oNovoLab)'
  },
  enderecoExibido: 'escritorio',
  // Prazo de resposta do pedido, ainda sem definição da Condlink. Vazio = a
  // tela de obrigado fica sem prazo; preenchido (ex.: 'um dia útil') a frase
  // vira "Nossa equipe responde em um dia útil, pelo WhatsApp ou e-mail que
  // você informou.". Depois de trocar, atualize o ?v= de site-config.js e de
  // order.js no HTML das páginas que os carregam.
  prazoResposta: '',
  // Linhas do comparativo que esperam a confirmação da Condlink. Cada linha só
  // aparece com a flag em true; a do número de TVs precisa também do texto em
  // numeroTvsTexto. Depois de trocar, atualize o ?v= de site-config.js e de
  // comparativo.js no HTML das seis páginas.
  comparativo: {
    contaUnica: false,
    suporteAcesso: false,
    numeroTvs: false,
    numeroTvsTexto: ''
  },
  // Pilotos onde a Box AI já está funcionando, mostrados na seção "Onde a Box
  // AI já está funcionando" do /novo. A seção só aparece com ativo em true e
  // com autorizacao.data preenchida: a autorização de cada local vem antes da
  // publicação, conforme o termo em prova-social-autorizacao.md. Os campos de
  // autorizacao ficam só aqui, como registro; não vão para a tela.
  // Em cada piloto: id casa com o data-piloto do cartão no HTML; segmento e
  // cidade são editáveis aqui (cidade vazia some da tela); status é o texto da
  // tarja ('Em uso' aparece em verde, qualquer outro em contorno tracejado);
  // texto é a linha do que roda no local. foto: null deixa o espaço neutro de
  // "Foto do local em breve". Com foto, src é o caminho da imagem sem o
  // tamanho e sem a extensão, alt é a descrição para quem não vê a imagem e
  // fonte é o crédito sobre a foto. tamanhos, tipos, largura e altura são
  // opcionais e, sem eles, valem -400 e -700 em avif e webp, a 700x525.
  // Um piloto com duas fotos usa fotos: [principal, segunda] no lugar de foto;
  // a segunda aparece menor, embaixo da primeira, e o crédito sai da primeira.
  // video é a media principal do cartão e empurra a foto para o lugar menor,
  // embaixo dele: src é o arquivo .mp4, poster a capa mostrada antes de tocar,
  // alt o nome do vídeo para quem não o vê, fonte o crédito e largura/altura o
  // tamanho do arquivo. Sem video, o cartão volta a mostrar a foto no lugar
  // principal. legenda é a linha escrita embaixo da media, quando houver.
  // A ordem da lista é a ordem da tela: lojas autônomas primeiro.
  // Depois de trocar, atualize o ?v= de site-config.js e de prova-social.js no
  // HTML das páginas que os carregam.
  provaSocial: {
    ativo: true,
    autorizacao: {
      data: '2026-10-21',
      documento: 'OK do Vantuir no grupo Box AI – Site, 21/10/2026 10:03; termo escrito pendente'
    },
    pilotos: [
      {
        id: 'mercado-do-vila',
        nome: 'Mercado do Vila',
        segmento: 'Loja autônoma',
        cidade: 'São Carlos (SP)',
        status: 'Em uso',
        texto: 'Box AI na TV da loja, com promoções e conteúdo trocados pelo painel. A porta abre por leitura facial e por QR Code, e a TV recebe o cliente pelo nome desde 18 de outubro de 2026.',
        legenda: 'Alguém chega, o acesso facial libera a porta e a TV recebe pelo nome.',
        video: {
          src: 'assets/pilotos/mercado-do-vila-chegada.mp4',
          poster: 'assets/pilotos/mercado-do-vila-chegada-poster.webp',
          largura: 478,
          altura: 850,
          alt: 'Vídeo no Mercado do Vila: o cliente chega, o leitor facial abre a porta e a TV da loja diz Olá, Denis e mostra as ofertas',
          fonte: 'Vídeo: Condlink'
        },
        foto: {
          src: 'assets/pilotos/mercado-do-vila-fachada',
          alt: 'Fachada do Mercado do Vila: loja em contêiner escuro, com o letreiro Mercado e a entrada de vidro',
          fonte: 'Foto: Condlink'
        }
      },
      {
        id: 'damha',
        nome: 'Damha1',
        segmento: 'Condomínio',
        cidade: '',
        status: 'Em instalação',
        texto: 'Box AI em instalação para levar os avisos e a comunicação com os moradores para a TV.',
        foto: null
      },
      {
        id: 'onovolab',
        nome: 'oNovoLab',
        segmento: 'Condomínio de empresas e hub de startups',
        cidade: 'São Carlos (SP)',
        status: 'Em uso',
        texto: 'Box AI nas TVs do hub, com o conteúdo trocado pelo painel, e o controle de acesso facial integrado. A TV e o acesso já estão funcionando.',
        legenda: 'oNovoLab, São Carlos: condomínio de empresas e hub de startups, com a Box AI nas TVs e o acesso facial integrado',
        fotos: [
          {
            src: 'assets/pilotos/onovolab-tv-ligada',
            tipos: ['webp'],
            tamanhos: [600, 1200],
            largura: 1200,
            altura: 645,
            alt: 'oNovoLab, São Carlos: condomínio de empresas e hub de startups, com a Box AI nas TVs e o acesso facial integrado. TV ligada com a chamada “Fique por dentro”, ao lado do auditório.',
            fonte: 'Foto: Condlink (Vantuir), 21/10/2026'
          },
          {
            src: 'assets/pilotos/onovolab-tv-membership',
            tipos: ['webp'],
            tamanhos: [600, 1200],
            largura: 1200,
            altura: 746,
            alt: 'oNovoLab, São Carlos: condomínio de empresas e hub de startups, com a Box AI nas TVs e o acesso facial integrado. Na tela, o convite de membership do oNovoLab com QR Code.'
          }
        ]
      }
    ]
  }
};
