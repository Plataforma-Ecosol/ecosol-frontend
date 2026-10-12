# PRD — Logo da Casa Azul na plataforma

02/10/2026 · Jean Macedo

## Contexto e objetivo

A logo da Casa da Economia Solidária Paul Singer (Casa Azul) entra no cabeçalho, no rodapé, no favicon e na prévia de links. É a prioridade 2 pedida pela Casa Azul na reunião de alinhamento, logo depois das cores.

**História:** como visitante, quero ver a logo da Casa Azul no site e na prévia dos links para saber que a plataforma é da rede.

- **Card:** [\[Identidade visual\] Aplicar a logo da Casa Azul · 2 pts](https://trello.com/c/4asSmBEk/61-identidade-visual-aplicar-a-logo-da-casa-azul-2-pts) (Em Andamento)
- **Origem:** [\[Identidade visual\] Definir paleta, tipografia e logo da Casa Azul](https://trello.com/c/xqT5CSnP/54-identidade-visual-definir-paleta-tipografia-e-logo-da-casa-azul-2-pts) (Concluído, Sprint 1)
- **PRD anterior:** paleta de cores (`docs/PRD/PRD_Paleta_de_Cores_v1.md`). A logo deve ficar bem sobre os fundos definidos lá: branco, `bege` e `azul`.
- **Escopo:** frontend Next.js. O Admin reaproveita os mesmos arquivos no card [\[Admin\] Identidade visual da Casa Azul no Admin](https://trello.com/c/mtbKqBUl/71-admin-identidade-visual-da-casa-azul-no-admin-2-pts).

## Arquivo da logo

A logo é o retrato de Paul Singer dentro de um círculo branco (`melhorado.png`, enviado pelo Jean em 02/10). Ela substitui o primeiro arquivo, que era o retrato dentro de um pino de mapa.

| Item | Valor | Impacto |
| --- | --- | --- |
| Formato | PNG, RGB, sem transparência | O círculo é recortado com fundo transparente para o cabeçalho e o rodapé |
| Tamanho | 150×150 px; o círculo recortado tem 118×118 | Bom até ~59 px de altura na tela (telas retina dobram). Para 180×180 e 512×512 teria que ampliar, e fica borrado |
| Fundo | Quadrado azul em volta do círculo | O quadrado inteiro serve para os ícones; no site, só o círculo |
| Conteúdo | Retrato no círculo branco, sem o texto "CASA DA ECONOMIA SOLIDÁRIA / PAUL SINGER" | No cabeçalho, o nome vai escrito ao lado, em texto |

O casaco do retrato é azul e encosta na borda do círculo, embaixo à direita. Sobre o azul do cabeçalho e do rodapé, essa parte se mistura ao fundo.

Pedido à Casa Azul: arquivo maior (mínimo 512×512, ideal SVG).

**Decisões de 02/10:**

- **Retrato no círculo, no lugar do pino:** o Jean trocou a logo pelo `melhorado.png`.
- **Sem contorno:** a logo vai direto sobre o azul, sem círculo bege em volta. A intenção é que o casaco azul se misture às cores do cabeçalho. Isso substitui a decisão anterior do círculo bege, que existia porque o pino azul sumia no fundo azul. Agora o branco do círculo sobre o `azul` dá 8,4:1, bem acima de 3:1.
- **Nome ao lado da logo:** no cabeçalho, "Casa Paul Singer" vai escrito ao lado do retrato, e os dois formam o link para a home. No rodapé, só o retrato, porque o texto do rodapé já traz o nome completo.
- **Menu à direita:** Coletivos, Agenda e Mapa ficam juntos no lado direito do cabeçalho; a logo e o nome ficam sozinhos à esquerda.
- **Tamanho:** por enquanto, usar o PNG de 150×150 como está e manter os tamanhos da seção seguinte. A troca vem quando a Casa Azul mandar um arquivo maior.

## Onde a logo aparece

Cinco lugares, todos alimentados pelo mesmo arquivo de origem.

| Lugar | Versão | Tamanho | Observação |
| --- | --- | --- | --- |
| Cabeçalho | Círculo recortado + "Casa Paul Singer" em texto | 44 px no celular, 52 px a partir de 640 px | Direto sobre o `azul`, sem contorno |
| Rodapé | Círculo recortado | 40 px | Direto sobre o `azul`, sem contorno |
| Favicon e ícones | Quadrado inteiro (círculo sobre azul) | 16, 32 e 48 (`.ico`), 180×180 (Apple) e 512×512 | Como o arquivo foi enviado |
| Imagem Open Graph | Círculo sobre fundo `bege` | 1200×630 px | Prévia no WhatsApp e redes sociais |
| Admin (outro card) | Círculo + favicon | — | Reaproveita os arquivos de `public/` |

## Requisitos de implementação

Um componente `Logo` único, usado no cabeçalho e no rodapé; ícones e Open Graph pelas convenções de arquivo do App Router.

1. Guardar o círculo recortado, com fundo transparente, em `public/brand/logo.png`. Se chegar em SVG, `logo.svg` substitui.
2. Criar `src/componentes/Logo.tsx` (pasta `componentes`, a convenção do repositório) com `next/image`, `alt` fixo e `preload` no cabeçalho (no Next 16, `priority` foi descontinuado). O lugar vem por prop (`cabecalho` ou `rodape`).
3. Trocar o texto ou ícone atual do cabeçalho e do rodapé pelo componente, sem contorno e com link para `/`. No cabeçalho, o nome "Casa Paul Singer" vai ao lado, com `aria-hidden` para não ser lido duas vezes.
4. Copiar `public/` para a imagem no `Dockerfile`. Sem isso, a logo dá 404 no container e na homologação, sem erro no build.
5. Ícones pela convenção do App Router: `app/favicon.ico`, `app/icon.png` (512×512) e `app/apple-icon.png` (180×180). O Next gera as tags no `<head>` sozinho.
6. Open Graph: `app/opengraph-image.png` (1200×630). Conferir se o `metadataBase` está definido no `layout.tsx`, senão a URL da imagem sai relativa e o WhatsApp não mostra.
7. Rodar testes e `next build`. Se houver teste do cabeçalho buscando o texto antigo, trocar para buscar a imagem pelo `alt`.
8. Abrir o PR, colar o link no card e mover para Code Review.

Como não há SVG, os ícones e a imagem Open Graph são gerados a partir do PNG. Os PNGs dentro do `favicon.ico` precisam ser RGBA: com RGB, o Next recusa o arquivo e a página inteira dá erro. Se o SVG chegar depois, basta trocar os arquivos em `public/brand/` e `app/`, sem mexer no código.

## Acessibilidade e celular

A logo precisa de `alt` descritivo, contraste de 3:1 contra o fundo e boa leitura em 360 px de largura.

- **Alt:** `alt="Casa da Economia Solidária Paul Singer"`. Se a logo for o link para a home, o nome acessível do link é esse mesmo texto; não repetir "logo" nem "imagem".
- **Contraste:** o círculo branco sobre o `azul` dá 8,4:1. Só o trecho em que o casaco azul encosta na borda se mistura ao fundo, e isso é intencional (ver seção Arquivo da logo).
- **Celular (360 px):** no cabeçalho, o retrato com 44 px de altura. A logo, o nome e o menu não cabem numa linha só, e o menu desce para uma segunda linha, alinhado à direita.
- **Nitidez:** com o círculo de 118 px, não passar de ~59 px de altura na tela para não borrar em telas retina.
- **Conferir:** Lighthouse (Acessibilidade) e o modo responsivo do navegador em 360 px.

## Critérios de aceite

- [ ] Logo no cabeçalho e no rodapé, com `alt` descritivo e link para a home
- [ ] Logo sem contorno sobre o azul; no cabeçalho, "Casa Paul Singer" ao lado e o menu à direita
- [ ] Logo carregando no container do `Dockerfile` (pasta `public/` copiada)
- [ ] Favicon e ícones (`favicon.ico`, `icon.png`, `apple-icon.png`) gerados a partir da logo
- [ ] Imagem Open Graph padrão com a logo, testada na prévia do WhatsApp
- [ ] Boa leitura no celular (360 px)
- [ ] Testes e `next build` verdes

## Fora do escopo

- Logo e favicon no Django Admin (card próprio, reaproveita estes arquivos)
- Versão da logo com o texto desenhado na imagem (no cabeçalho, o nome vai em texto HTML)
- Fonte da marca

## Pendências com a Casa Azul

- [ ] Arquivo maior da logo: mínimo 512×512, ideal SVG

Enquanto o arquivo maior não chega, o PNG de 150 px atende: cabeçalho, rodapé e favicon ficam bons. O `apple-icon`, o `icon.png` grande e o Open Graph ficam provisórios até chegar o arquivo maior.
