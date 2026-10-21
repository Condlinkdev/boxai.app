// Dados cadastrais da Condlink usados no rodapé.
// Razão social e CNPJ são públicos e aparecem no rodapé. O endereço fica
// pronto aqui, mas só é exibido quando enderecoExibido apontar para uma chave
// de enderecos: use '' para manter oculto, 'cartaoCnpj' para o endereço do
// Cartão CNPJ ou 'escritorio' para o do escritório. Depois de trocar, atualize
// o ?v= de site-config.js e footer.js no HTML das seis páginas.
window.SITE_CONFIG = {
  razaoSocial: 'CONDLINK DESENVOLVIMENTO DE SISTEMAS LTDA',
  cnpj: '14.345.289/0001-95',
  enderecos: {
    cartaoCnpj: 'Av. Comendador Alfredo Maffei, 1400, Sala B, Jardim São Carlos, São Carlos - SP, 13561-270',
    escritorio: 'R. Aquidaban, 1, Sala 1, Centro, São Carlos - SP, 13560-120'
  },
  enderecoExibido: ''
};
