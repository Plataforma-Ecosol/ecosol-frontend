# PRD — Saiba mais: metadata e sitemap dos subgrupos

27/11/2026 · Jean Macedo

## Contexto e objetivo

As três páginas de subgrupo (`/saiba-mais/casa-azul`, `/saiba-mais/economia-solidaria` e `/saiba-mais/ites-ifrj`) já têm `title` e `canonical` próprios desde o frontend#72. Faltam três coisas para elas serem bem indexadas e bem compartilhadas:

1. **Descrição própria.** Hoje as três herdam a descrição padrão do layout ("Conheça os coletivos, as feiras e a agenda…"), que não fala do subgrupo. É ela que aparece embaixo do título no resultado do Google.
2. **Entrada no sitemap.** O `sitemap.ts` lista só o `/saiba-mais`. O buscador chega às subpáginas pelos links da índice, mas o sitemap é a lista que ele usa para conferir o que existe.
3. **Prévia de link com o subgrupo.** Sem `openGraph` próprio, um link de subgrupo colado no WhatsApp mostra o título e a descrição genéricos do site.

**História:** como pessoa que busca a Casa Paul Singer, a economia solidária de Niterói ou a ITES no Google, quero achar a página certa do "Saiba mais", com uma descrição que diga do que ela trata.

- **Card:** [Plataforma-Ecosol/ecosol-frontend#76](https://github.com/Plataforma-Ecosol/ecosol-frontend/issues/76), "[SEO] Saiba mais: metadata e sitemap dos subgrupos · 1 pt" (Sprint 3)
- **História-mãe:** [#71](https://github.com/Plataforma-Ecosol/ecosol-frontend/issues/71), "Subgrupos na aba Saiba mais · 12 pts"
- **Requisito / HU:** RF21 / HU22; RNF20 (SEO)
- **Release:** R3 · Área da equipe e Saiba mais
- **Escopo:** só o frontend Next.js. Nenhuma mudança no backend nem na API.
- **Ponto de partida:** a branch do frontend#73 (`feat/saiba-mais-navegacao-subgrupos`, PR #79), porque as duas mexem em `[subgrupo]/page.tsx`. O PR deste card vai para a `staging` depois que o #79 entrar.

## Decisões

- **A descrição é um campo novo, `descricao`, em `SUBGRUPOS`, e não o `resumo` do cartão.** O resumo foi escrito para ser lido dentro da índice, abaixo do nome do subgrupo, e começa no meio da ideia ("Quem somos, contato, endereço…"). No Google ele aparece sozinho, sem o contexto da página, então precisa dizer quem é e onde fica. As duas frases moram lado a lado, na mesma lista, e são validadas juntas com a Casa Azul.
- **Até 160 caracteres**, o que o Google costuma mostrar sem cortar. Um teste trava esse limite.
- **A descrição da Casa não lista os contatos.** Dizer "telefone, e-mail e endereço" prometeria algo que some da página quando um dado sai de `lib/casa.ts` (a regra do `temContato`). Fica "quem somos e como falar com a Casa".
- **`openGraph` próprio em cada subgrupo**, com título, descrição, `url` e a logo da Casa (`IMAGEM_DE_COMPARTILHAMENTO`). Declarar `openGraph` na página substitui o do layout por inteiro, imagem inclusive. Sem a constante, a prévia ficaria sem imagem, o defeito que o `compartilhamento.test.ts` já trava para o perfil e o evento.
- **O sitemap gera as três entradas a partir de `SUBGRUPOS`**, logo depois do `/saiba-mais`, com a mesma frequência (`monthly`) e prioridade (0,5) dele. Assim um subgrupo novo entra no sitemap sem ninguém lembrar.
- **Sem `lastModified` nas três.** As páginas fixas do sitemap também não têm. Inventar `new Date()` faria o buscador achar que elas mudam a cada geração, o problema que o comentário do `sitemap.ts` já descreve. Quando o conteúdo vier da API (frontend#75), a data da última edição da seção pode entrar aqui.
- **O `title` continua o nome curto** ("Casa Azul"), como decidido no #72. O `og:title` segue o mesmo valor.

## O que muda

### `src/lib/saiba-mais.ts`

`Subgrupo` ganha `descricao: string`. Rascunhos, para validar com a Casa Azul junto com os textos do #74:

| Subgrupo | `descricao` |
| --- | --- |
| Casa Azul | A Casa da Economia Solidária Paul Singer é o centro público de referência da economia solidária em Niterói. Conheça a Casa e saiba como falar com ela. |
| Economia Solidária | O que é a economia solidária e como funciona a Rede de Economia Solidária de Niterói, com seus coletivos, feiras e eventos. |
| ITES/IFRJ | A ITES, Incubadora Tecnológica de Empreendimentos Solidários do IFRJ Campus Niterói, é quem desenvolve esta plataforma. |

**Quem faz o quê:** a ITES desenvolve a plataforma sozinha, e a equipe de desenvolvimento é da ITES. A Casa Azul é consultada e aprova as mudanças, mas não desenvolve. A descrição da ITES diz só isso, sem dividir a autoria com a Casa.

### `src/app/saiba-mais/[subgrupo]/page.tsx`

`generateMetadata` passa a devolver:

```ts
{
  title: dados.nome,
  description: dados.descricao,
  alternates: { canonical },
  openGraph: {
    title: dados.nome,
    description: dados.descricao,
    url: canonical,
    type: "website",
    images: [IMAGEM_DE_COMPARTILHAMENTO],
  },
}
```

### `src/app/sitemap.ts`

Depois da entrada do `/saiba-mais`:

```ts
...SUBGRUPOS.map(({ slug }) => ({
  url: urlAbsoluta(caminhoDoSubgrupo(slug)),
  changeFrequency: "monthly" as const,
  priority: 0.5,
})),
```

### Sem mudança

- A índice `/saiba-mais`, que já tem descrição e canônico próprios.
- `robots.ts` e a regra do `SITE_INDEXAVEL`: a homologação continua `noindex`, e nenhuma página nova define `robots`.

## Requisitos de implementação

Branch `feat/saiba-mais-metadata-sitemap`, criada a partir de `feat/saiba-mais-navegacao-subgrupos` (#73). Commits aprovados pelo desenvolvedor.

1. Campo `descricao` em `Subgrupo` e nos três itens de `SUBGRUPOS`.
2. `generateMetadata` com `description` e `openGraph`.
3. As três entradas no `sitemap.ts`.
4. Testes (seção abaixo).
5. `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` verdes. No log do build, as três subpáginas continuam geradas no build (●).
6. Conferir à mão, no `npm run start`: o `<meta name="description">` e as `og:*` no HTML de cada subpágina, e as três URLs no `/sitemap.xml`.
7. Se o #79 ainda não tiver entrado: esperar o merge, atualizar esta branch com a `staging` e só então abrir o PR, com "Closes #76" e o link no card.

## Testes

- **`lib/saiba-mais.test.ts`:** cada subgrupo tem `descricao` não vazia, com no máximo 160 caracteres e diferente do `resumo`; as três descrições são diferentes entre si.
- **`[subgrupo]/page.test.tsx`** (metadados): para cada slug, `description` igual à `descricao` do subgrupo; `openGraph` com o mesmo título, a mesma descrição, a `url` do canônico e a imagem de compartilhamento.
- **`compartilhamento.test.ts`:** um caso novo, "a página de um subgrupo leva a logo da Casa".
- **`sitemap.test.ts`:** o teste das páginas fixas passa a esperar as três subpáginas logo depois do `/saiba-mais`, com endereço absoluto e sem `lastModified`.

## SEO e acessibilidade

- Cada subpágina passa a ter título, descrição e canônico próprios, e entra no sitemap (RNF20).
- A prévia de link mostra o nome do subgrupo e a descrição dele, com a logo da Casa.
- Nada muda na tela: as mudanças ficam no `<head>` e no `/sitemap.xml`.

## LGPD

Nada muda. As descrições só falam dos subgrupos.

## Critérios de aceite

Os dois do card:

- [ ] Title e description próprios em cada subgrupo
- [ ] Subgrupos incluídos no sitemap

E os deste PRD:

- [ ] Descrições com no máximo 160 caracteres, diferentes entre si e do resumo do cartão
- [ ] `openGraph` próprio em cada subgrupo, com a imagem de compartilhamento
- [ ] Entradas do sitemap geradas de `SUBGRUPOS`, sem `lastModified` inventado
- [ ] As subpáginas continuam estáticas (●)
- [ ] Lint, typecheck, testes e `next build` verdes

## Fora do escopo

- **`lastModified` das subpáginas no sitemap:** depende do conteúdo vir da API (#75).
- **`openGraph` da índice `/saiba-mais`:** ela já tem título e descrição próprios. A prévia de link segue a do layout.
- **Dados estruturados novos:** o `Organization` da Casa e o `BreadcrumbList` (#73) já existem.
- **Textos do site que dividem a autoria com a Casa.** Dois textos já publicados contradizem o "quem faz o quê" acima: "A Casa mantém esta plataforma…", no "Quem somos" da Casa (`lib/casa.ts` e a carga inicial do backend), e "desenvolve esta plataforma junto com a Casa…", na seção da ITES da carga inicial do backend. A correção fica para o #74 (conteúdo dos subgrupos), junto com a validação da Casa Azul.

## Riscos

- **Textos das descrições:** são rascunhos. Se a Casa Azul pedir outra redação, a troca é feita em `SUBGRUPOS`, num lugar só, e o teste de 160 caracteres avisa se passar do limite.
- **Conflito com o #79:** as duas branches mexem em `[subgrupo]/page.tsx`, em funções diferentes. Esta parte da branch do #79 para não haver conflito. Se o #79 mudar no review, esta branch é atualizada antes do PR.
