# PRD — Saiba mais: navegação entre subgrupos

25/11/2026 · Jean Macedo

## Contexto e objetivo

Com o frontend#72, o "Saiba mais" passou a ter três páginas de subgrupo (`/saiba-mais/casa-azul`, `/saiba-mais/economia-solidaria` e `/saiba-mais/ites-ifrj`). Para ir de uma à outra, porém, a única saída hoje é o link "← Saiba mais", que leva de volta à índice. Quem está lendo sobre a Casa e quer ler sobre a ITES precisa de dois cliques e de uma volta.

Este PRD cobre a navegação dentro das subpáginas: uma **trilha** ("Saiba mais › Casa Azul") e **pílulas** com os três subgrupos, a atual destacada. Com isso, a troca de subgrupo é feita na própria página.

**História:** como visitante do portal (sem login), na página de um subgrupo, no celular ou no computador, quero passar a outro subgrupo pela navegação da própria página, sem precisar voltar ao índice (HU22, cenário 3).

- **Card:** [Plataforma-Ecosol/ecosol-frontend#73](https://github.com/Plataforma-Ecosol/ecosol-frontend/issues/73), "[Institucional] Saiba mais: navegação entre subgrupos · 2 pts" (Sprint 3)
- **História-mãe:** [#71](https://github.com/Plataforma-Ecosol/ecosol-frontend/issues/71), "Subgrupos na aba Saiba mais · 12 pts"
- **Requisito / HU:** RF21 / HU22, cenário 3, na [especificação de requisitos](https://github.com/Plataforma-Ecosol/ecosol-docs/blob/main/docs/especificacao-requisitos/historias-de-usuario.md#hu22)
- **Release:** R3 · Área da equipe e Saiba mais
- **Escopo:** só o frontend Next.js. Nenhuma mudança no backend nem na API.
- **Ponto de partida:** a branch do frontend#72 (`feat/saiba-mais-rotas-indice`, PR #78), porque o cabeçalho que este card muda só existe lá. O PR deste card vai para a `staging` depois que o #78 entrar.

## Decisões

- **As "abas" do card são links, e não abas de ARIA.** O padrão `role="tablist"` serve para trocar painéis dentro da mesma página. Ele exige navegação pelas setas, e o leitor de tela anunciaria "aba 1 de 3", o que está errado aqui, porque cada subgrupo é outra página, com endereço próprio. O certo é um `<nav>` com três links, e `aria-current="page"` no atual. É o mesmo padrão dos períodos da agenda (`ABAS` em `app/eventos/page.tsx`). O critério de teclado sai de graça: Tab passa pelos links, e Enter abre.
- **Sem JavaScript.** O menu principal é um componente de cliente porque precisa de `usePathname` para saber a página atual. Aqui o subgrupo atual já vem do `params` da rota, então a trilha e as pílulas são componentes de servidor que recebem o slug atual por propriedade. As subpáginas continuam estáticas (●).
- **No celular, as pílulas quebram linha, sem rolagem horizontal.** "Casa Azul", "Economia Solidária" e "ITES/IFRJ" somam perto de 400 px com o estilo das pílulas da agenda. Em 360 px de tela sobram uns 328 px úteis. A rolagem horizontal esconderia a "ITES/IFRJ" fora da tela, e muita gente não percebe que dá para rolar. Com `flex-wrap`, ficam duas linhas no celular e uma a partir do `sm`.
- **Alvo de toque de 44 px.** As pílulas da agenda têm uns 40 px de altura (`py-2`). Aqui elas ganham `min-h-11`, como pedem os PRDs anteriores.
- **A trilha usa o nome curto.** O último item é "Casa Azul", e o `h1` continua com o nome oficial ("Casa da Economia Solidária Paul Singer"), como decidido no PRD do #72.
- **JSON-LD `BreadcrumbList` junto com a trilha.** É pouco código, e os dados já estão aqui. Com ele, o Google pode mostrar "Saiba mais › Casa Azul" no lugar do endereço no resultado da busca. Vai num `<script>` próprio, separado do `Organization` da Casa.
- **A índice não ganha trilha nem pílulas.** Os cartões já são a navegação dela, e ela é a raiz da trilha.
- **O link "← Saiba mais" do #72 sai.** A trilha faz o mesmo papel, com o primeiro item levando à índice.

## O que a subpágina mostra

```
┌──────────────────────────────────────────────────────────┐
│ Saiba mais › Casa Azul                  (nav: trilha)    │
│                                                          │
│ Casa da Economia Solidária Paul Singer           (h1)    │
│                                                          │
│ [Casa Azul] (Economia Solidária) (ITES/IFRJ)  (nav)      │
├──────────────────────────────────────────────────────────┤
│ conteúdo do subgrupo (#72)                               │
└──────────────────────────────────────────────────────────┘
```

No celular (360 px), as pílulas ficam em duas linhas:

```
[Casa Azul] (Economia Solidária)
(ITES/IFRJ)
```

`[ ]` é a pílula atual (cheia) e `( )`, as outras (contorno).

### Trilha

- `<nav aria-label="Trilha de navegação">` com uma `<ol>`. A lista é ordenada porque a ordem dos itens é o caminho.
- Item 1: `<Link href="/saiba-mais">Saiba mais</Link>`.
- Item 2: o `nome` do subgrupo, **sem link**, num `<span aria-current="page">`. Link para a própria página só confunde.
- Separador `›` entre os itens, num `<span aria-hidden>`, para o leitor de tela não ler "sinal de maior".
- Estilo: `text-sm`, primeiro item `text-azul underline underline-offset-4`, item atual `text-texto`. Alvo de toque do link com `min-h-11`, como o link de volta do #72.

### Pílulas dos subgrupos

- `<nav aria-label="Subgrupos do Saiba mais">` com uma `<ul className="flex flex-wrap gap-2">`, um `<li>` e um `<Link>` por item de `SUBGRUPOS`, na ordem da lista.
- Atual: `aria-current="page"` e estilo cheio, `bg-azul text-bege`.
- Outras: contorno, `border border-azul bg-white text-azul hover:bg-azul/10`.
- As duas com `inline-flex min-h-11 items-center rounded-full px-4`, e foco visível com `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul`.
- O destaque da atual não depende só da cor: muda o fundo, e o `aria-current` anuncia "página atual".

Os nomes acessíveis das duas navegações ("Trilha de navegação" e "Subgrupos do Saiba mais") são diferentes entre si e do menu "Principal". Assim o leitor de tela distingue as três na lista de regiões da página.

### JSON-LD `BreadcrumbList`

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Saiba mais", "item": "<site>/saiba-mais" },
    { "@type": "ListItem", "position": 2, "name": "Casa Azul", "item": "<site>/saiba-mais/casa-azul" }
  ]
}
```

- Endereços absolutos, com `urlAbsoluta` de `lib/site.ts`.
- `<` escapado no JSON, como no `Organization` da Casa, para um `</script>` num campo não fechar a tag antes da hora.

## Onde mora o quê

### `src/componentes/saiba-mais/TrilhaDoSaibaMais.tsx` (novo)

```tsx
export function TrilhaDoSaibaMais({ atual }: { atual: SlugDoSubgrupo }) { ... }
```

Monta a trilha e o JSON-LD `BreadcrumbList`. Busca o `nome` em `SUBGRUPOS`.

### `src/componentes/saiba-mais/NavegacaoDosSubgrupos.tsx` (novo)

```tsx
export function NavegacaoDosSubgrupos({ atual }: { atual: SlugDoSubgrupo }) { ... }
```

As três pílulas, a partir de `SUBGRUPOS` e de `caminhoDoSubgrupo`.

Os dois são componentes de servidor: sem `"use client"`, sem `usePathname`.

### `src/app/saiba-mais/[subgrupo]/page.tsx`

No `<header>`, nesta ordem: `<TrilhaDoSaibaMais atual={dados.slug} />`, o `h1`, o subtítulo da Casa (se houver) e `<NavegacaoDosSubgrupos atual={dados.slug} />`. O link "← Saiba mais" e o import de `ArrowLeft` saem.

### Sem mudança

- `src/lib/saiba-mais.ts`: `SUBGRUPOS` e `caminhoDoSubgrupo` já bastam.
- `src/app/saiba-mais/page.tsx` (índice).
- `NavegacaoPrincipal.tsx`: "Saiba mais" já fica ativo nas subpáginas.

## Requisitos de implementação

Branch `feat/saiba-mais-navegacao-subgrupos`, criada a partir de `feat/saiba-mais-rotas-indice` (#72). Commits aprovados pelo desenvolvedor.

1. `TrilhaDoSaibaMais.tsx`, com a trilha e o JSON-LD.
2. `NavegacaoDosSubgrupos.tsx`, com as pílulas.
3. Cabeçalho de `[subgrupo]/page.tsx` com os dois componentes, sem o link "← Saiba mais".
4. Testes (seção abaixo), incluindo o ajuste do teste da rota que hoje procura o link "Saiba mais" de volta.
5. `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` verdes. No log do build, as três subpáginas continuam geradas no build (●).
6. Conferir à mão, no `npm run start`:
   - em 360 px, as pílulas quebram linha sem rolagem horizontal;
   - só com o teclado (Tab e Enter), dá para ir de um subgrupo a outro e voltar à índice pela trilha, com o foco sempre visível.
7. Lighthouse no modo celular em `/saiba-mais/economia-solidaria`, no preview da Vercel, com os números no PR.
8. Se o #78 ainda não tiver entrado: esperar o merge, atualizar esta branch com a `staging` e só então abrir o PR para a `staging`, com "Closes #73" e o link no card.

## Testes

- **`TrilhaDoSaibaMais.test.tsx`:**
  - há um `navigation` com o nome "Trilha de navegação" e uma lista ordenada com dois itens;
  - o primeiro é um link "Saiba mais" para `/saiba-mais`;
  - o segundo é o nome do subgrupo, **sem link**, com `aria-current="page"`;
  - o separador tem `aria-hidden`;
  - para cada slug, o JSON-LD é JSON válido, `@type: "BreadcrumbList"`, com duas posições e os endereços absolutos terminando em `/saiba-mais` e em `/saiba-mais/<slug>`.
- **`NavegacaoDosSubgrupos.test.tsx`:**
  - há um `navigation` com o nome "Subgrupos do Saiba mais", com três links na ordem de `SUBGRUPOS` e os `href` de `caminhoDoSubgrupo`;
  - para cada slug, só o link dele tem `aria-current="page"`, e os outros não têm o atributo;
  - a lista tem `flex-wrap`, a guarda contra a rolagem horizontal no celular.
- **`[subgrupo]/page.test.tsx`** (ajuste):
  - o teste do "link de volta" passa a procurar o link "Saiba mais" dentro da trilha;
  - um caso novo: em cada subgrupo, aparecem a trilha e as pílulas, e os nomes das navegações são diferentes de "Principal";
  - a Casa Azul tem dois scripts JSON-LD (`Organization` e `BreadcrumbList`), e os outros dois subgrupos têm um.
- **`app/saiba-mais/page.test.tsx`** (índice): um caso novo, sem trilha e sem pílulas (nenhum `navigation` "Trilha de navegação" nem "Subgrupos do Saiba mais").
- **Regressão de LGPD:** nada muda. A navegação só tem nomes de subgrupos.

## Acessibilidade e celular

- Três regiões de navegação com nomes diferentes: "Principal", "Trilha de navegação" e "Subgrupos do Saiba mais".
- `aria-current="page"` no item atual da trilha e na pílula atual. O leitor anuncia "página atual".
- Ordem do foco: trilha, depois pílulas, depois conteúdo. É a mesma ordem visual.
- Foco visível em todos os links, com contorno azul.
- Alvos de toque de pelo menos 44 px.
- Em 360 px, as pílulas ficam em duas linhas, sem rolagem horizontal. A partir do `sm`, numa linha só.
- Contraste: só pares já medidos no PRD de componentes (`bege` sobre `azul` 7,4; `azul` sobre branco 8,4).
- Sem JavaScript, tudo funciona: são links.

## LGPD

Nada muda. A navegação só mostra nomes de subgrupos.

## Critérios de aceite

Os três do card:

- [ ] Abas ou submenu indicando o subgrupo atual
- [ ] Breadcrumb "Saiba mais > subgrupo"
- [ ] Navegável por teclado e usável em celular

E os deste PRD:

- [ ] As pílulas são links num `<nav>`, com `aria-current="page"` no atual, e não um `role="tablist"`
- [ ] Trilha em `<ol>`, com o item atual sem link
- [ ] JSON-LD `BreadcrumbList` válido em cada subpágina
- [ ] Sem `"use client"`: as subpáginas continuam estáticas (●)
- [ ] Em 360 px, sem rolagem horizontal; alvos de toque com pelo menos 44 px
- [ ] A índice sem trilha e sem pílulas
- [ ] Lighthouse no modo celular com 90 ou mais em Acessibilidade e Boas práticas (números no PR)
- [ ] Lint, typecheck, testes e `next build` verdes

## Fora do escopo

- **Navegação na página índice:** os cartões do #72 já cumprem esse papel.
- **Seções dentro de um subgrupo** (sumário ou âncoras para cada seção): só faz sentido quando a #75 trouxer várias seções da API por subgrupo.
- **Descrição própria e sitemap dos subgrupos:** #76.
- **Texto e imagens dos subgrupos:** #74.

## Riscos

- **Mudanças pedidas no review do #78** podem mexer no cabeçalho das subpáginas. Nesse caso, esta branch é atualizada com a do #72 antes de seguir.
- **O nome "Casa Azul" pode mudar** se a Casa Azul preferir "Casa Paul Singer" (pendência do PRD do #72). A trilha e as pílulas leem o nome de `SUBGRUPOS`, então a troca é feita num lugar só.
