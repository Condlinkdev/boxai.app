# Verificação do Markdown

Sirva a raiz do repositório com `python3 -m http.server 8000` e abra `http://127.0.0.1:8000/tests/chat-markdown.html` no navegador. O resultado esperado é “10 verificações passaram”.

A página verifica formatação, links, conteúdo inseguro, acumulação dos deltas de streaming, preservação exata do histórico e mensagens do usuário sem formatação. Não chama o backend nem envia mensagens.

O layout principal também foi conferido por emulação de viewport em 320 × 740, 390 × 844 e 430 × 932, além de 390 × 480 para espaço vertical reduzido. Isso não substitui um teste em aparelho físico com teclado virtual.
