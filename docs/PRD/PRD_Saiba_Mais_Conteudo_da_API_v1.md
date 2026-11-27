# PRD — Saiba mais: conteúdo vindo da API

27/11/2026 · Jean Macedo

## Contexto e objetivo

Hoje os textos das três páginas de subgrupo são fixos no código (`lib/casa.ts` e os componentes `Conteudo*`). Para trocar uma vírgula, alguém da ITES precisa abrir um PR. O backend já resolveu a outra metade: as seções do "Saiba mais" são editadas no Admin e publicadas em `GET /api/saiba-mais/` (backend#60 a #63, já na `staging`).

Este PRD liga as duas pontas. Cada página de subgrupo passa a mostrar as seções publicadas no Admin, com ISR. Se a API não responder, a página continua de pé com o conteúdo fixo de hoje.

**História:** como integrante da equipe da Casa Azul, quero editar e publicar os textos do "Saiba mais" pelo Admin e ver a mudança no site, sem depender de um PR.

- **Card:** [Plataforma-Ecosol/ecosol-frontend#75](https://github.com/Plataforma-Ecosol/ecosol-frontend/issues/75), "[Institucional] Saiba mais: consumir conteúdo da API · 3 pts" (Sprint 3)
- **História-mãe:** [#71](https://github.com/Plataforma-Ecosol/ecosol-frontend/issues/71), "Subgrupos na aba Saiba mais · 12 pts"
- **Dependência:** [backend#60](https://github.com/Plataforma-Ecosol/ecosol-backend/issues/60) (modelo, Admin e endpoint), já na `staging` do backend
- **Requisito / HU:** RF21 / HU22
- **Release:** R3 · Área da equipe e Saiba mais
- **Escopo:** só o frontend Next.js. Nenhuma mudança no backend.
- **Ponto de partida:** a branch do frontend#76 (`feat/saiba-mais-metadata-sitemap`), que parte da do #73. O PR deste card vai para a `staging` depois que os dois entrarem.

## O contrato da API

`GET /api/saiba-mais/`, sem parâmetros e sem paginação (README do backend, seção "Saiba mais"):

```json
{
  "subgrupos": [
    { "slug": "casa-azul", "nome": "Casa Azul", "secoes": [
      { "id": 1, "slug": "quem-somos", "subgrupo": "casa-azul", "titulo": "Quem somos",
        "texto": "…\n\n…", "imagem": null, "imagem_descricao": "",
        "atualizado_em": "2026-11-20T10:00:00-03:00" }
    ] },
    { "slug": "economia-solidaria", "nome": "Economia Solidária", "secoes": [ … ] },
    { "slug": "ites-ifrj", "nome": "ITES/IFRJ", "secoes": [] }
  ]
}
```

- Os três subgrupos vêm sempre, mesmo sem seção publicada (`secoes: []`).
- Só sai seção publicada, na ordem definida no Admin.
- O texto é simples, com parágrafos separados por linha em branco. Sem HTML nem Markdown.
- `imagem` é uma URL absoluta ou `null`.
- Uma URL só, de propósito: o ISR guarda uma entrada de cache, e as três páginas revalidam juntas.

## Decisões

- **ISR de 5 minutos, com as páginas continuando estáticas (●).** O `fetch` usa `next: { revalidate: 300 }`, o mesmo tempo das páginas de detalhe (`REVALIDACAO_DETALHE`). Uma seção despublicada no Admin some do site em até 5 minutos. A chamada **não** passa pelo `buscar()` de `lib/api.ts`, porque ele chama `connection()`, o que tornaria as páginas dinâmicas, e transforma um 404 em `notFound()`, o que derrubaria a página do subgrupo.
- **O que vem do Admin e o que continua fixo.** Do Admin vêm os textos dos subgrupos: título, texto e imagem de cada seção. Continua fixo o que não é texto editorial:
  - na Casa Azul, o bloco "Fale com a Casa" (`lib/casa.ts`) e o JSON-LD `Organization`;
  - na Economia Solidária, os botões "Conheça os coletivos" e "Veja a agenda";
  - na ITES/IFRJ, o bloco de crédito, licença, GitHub e endereço, como o comentário do `ConteudoItesIfrj` já previa.
- **Conteúdo fixo como reserva, mas só no build.** Esta é a decisão mais importante do card:
  - **No `next build`**, se a API não responder, a página é gerada com o conteúdo fixo de hoje. É o caso do CI, que não sobe backend, e de um deploy feito durante uma queda.
  - **Na revalidação, com o site no ar**, a falha da API lança erro. O Next então continua servindo a última página gerada com sucesso e tenta de novo na próxima visita (guia de ISR do Next 16, "error handling").

  O motivo: se a revalidação capturasse o erro e gerasse a página com o conteúdo fixo, esse conteúdo **substituiria** o que veio do Admin. Um backend que demora a acordar faria o site alternar entre os textos do Admin e os do código, e uma seção despublicada poderia reaparecer. Assim, o pior caso é o site mostrar o conteúdo de alguns minutos antes. A página nunca quebra, porque já existe uma versão gerada no build.
- **Tempo-limite de 10 s.** Sem ele, um backend parado seguraria o build. Ao passar do limite, vale a regra acima: conteúdo fixo no build, erro na revalidação.
- **Resposta fora do contrato conta como falha.** Se vier JSON sem a lista `subgrupos`, o caso é tratado como API fora do ar, e não como "nenhuma seção".
- **API no ar e subgrupo sem seção publicada:** a página mostra só a parte fixa (o contato, os botões ou o crédito), sem o texto de reserva. É o que faz "seção despublicada some do site" valer também para a última seção do subgrupo.
- **Imagem com `next/image`.** A seção com imagem mostra a figura antes do texto, com `alt` vindo de `imagem_descricao` (o backend já exige a descrição quando há imagem). Ela ocupa a largura do texto, com altura automática e `sizes` para baixar o tamanho certo no celular. Os hosts do Supabase e do Django local já estão em `remotePatterns`. O `src` é a URL como a API devolve, sem `urlPublicaDeMidia`, pela regra do comentário em `lib/api.ts`.
- **O texto mantém a forma de hoje:** `whitespace-pre-line`, como o backend recomenda, com `text-lg leading-relaxed`.
- **A índice não muda.** Os cartões usam o `resumo` fixo de `SUBGRUPOS` e não precisam da API.

## O que muda

### `src/tipos/api.ts`

```ts
export interface SecaoDoSaibaMais {
  id: number;
  slug: string;
  subgrupo: string;
  titulo: string;
  texto: string;
  imagem: string | null;
  imagem_descricao: string;
  atualizado_em: string;
}

export interface SubgrupoDoSaibaMais {
  slug: string;
  nome: string;
  secoes: SecaoDoSaibaMais[];
}

export interface RespostaDoSaibaMais {
  subgrupos: SubgrupoDoSaibaMais[];
}
```

### `src/lib/api.ts`

`buscarSaibaMais()`: `fetch` de `/api/saiba-mais/` com `next: { revalidate: 300 }` e tempo-limite de 10 s, sem `connection()`. Lança `ErroDaApi` em resposta não-ok e em resposta fora do contrato.

### `src/lib/saiba-mais.ts`

`secoesDoSubgrupo(slug)`: busca a lista e devolve as seções do subgrupo.
- API no ar: devolve a lista do subgrupo, que pode vir vazia.
- API fora do ar no build: devolve `null`, e o componente usa o conteúdo fixo.
- API fora do ar fora do build: relança o erro, para o Next manter a última página boa.

O build é reconhecido por `process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD` (`next/constants`).

### `src/componentes/saiba-mais/SecoesDoSaibaMais.tsx` (novo)

Componente de servidor que mostra uma lista de seções: um `<section>` por seção, com `h2` (o título), a imagem (se houver) e o texto.

### Componentes de conteúdo

`ConteudoCasaAzul`, `ConteudoEconomiaSolidaria` e `ConteudoItesIfrj` recebem `secoes: SecaoDoSaibaMais[] | null`:
- `null`: o conteúdo fixo de hoje, sem mudança;
- lista: `<SecoesDoSaibaMais>` no lugar do texto fixo, mais a parte fixa do subgrupo.

Na Casa Azul, a grade de duas colunas a partir do `md` continua: as seções à esquerda e o contato à direita.

### `src/app/saiba-mais/[subgrupo]/page.tsx`

A página chama `secoesDoSubgrupo(dados.slug)` e passa o resultado ao componente do subgrupo.

## Requisitos de implementação

Branch `feat/saiba-mais-conteudo-da-api`, criada a partir de `feat/saiba-mais-metadata-sitemap` (#76). Commits aprovados pelo desenvolvedor.

1. Tipos, `buscarSaibaMais` e `secoesDoSubgrupo`.
2. `SecoesDoSaibaMais` e os três componentes de conteúdo com a propriedade `secoes`.
3. A página do subgrupo buscando as seções.
4. Testes (seção abaixo).
5. `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` verdes, **com o backend desligado**. No log do build, as três subpáginas continuam geradas no build (●) e saem com o conteúdo fixo.
6. Conferir à mão, com o backend local ligado e `npm run build` + `npm run start`:
   - as páginas mostram as seções da API;
   - ao despublicar uma seção no Admin, ela some depois da revalidação;
   - ao desligar o backend, a página continua mostrando a última versão boa, e não volta para o conteúdo fixo.
7. Se o #79 e o #76 ainda não tiverem entrado: esperar os merges, atualizar esta branch com a `staging` e só então abrir o PR, com "Closes #75" e o link no card.

## Testes

- **`lib/api` (`buscarSaibaMais`):** chama `/api/saiba-mais/` com `revalidate: 300` e com `signal`; lança em resposta não-ok; lança em JSON sem `subgrupos`; não chama `connection()`.
- **`lib/saiba-mais` (`secoesDoSubgrupo`):** devolve as seções do slug pedido, na ordem da API; devolve `[]` para subgrupo sem seção; devolve `null` quando a API falha no build; relança quando a API falha fora do build.
- **`SecoesDoSaibaMais`:** um `h2` por seção, na ordem; o texto com os parágrafos; a imagem com o `alt` da descrição; nenhuma imagem quando `imagem` é `null`.
- **Componentes de conteúdo**, para cada um:
  - com `null`, o conteúdo fixo de hoje (os testes atuais continuam valendo);
  - com seções, os títulos da API aparecem e o texto fixo não;
  - com lista vazia, nem texto fixo nem seção, só a parte fixa (o contato, os botões ou o crédito);
  - a parte fixa aparece nos três casos. Na Casa Azul, o JSON-LD também.
- **`[subgrupo]/page.test.tsx`:** com `secoesDoSubgrupo` simulado, a página passa as seções ao componente certo.
- **Regressão de LGPD:** o endpoint é público e só tem texto editorial. Um teste confere que o componente só mostra `titulo`, `texto` e `imagem`, e não os outros campos, como `id`, `slug` ou `atualizado_em`.

## Acessibilidade e celular

- Cada seção é um `<section>` com `h2`, abaixo do `h1` da página: a hierarquia de títulos continua certa.
- Imagem com `alt` vindo do Admin, onde a descrição é obrigatória quando há imagem.
- Texto em `text-lg` e `whitespace-pre-line`, como hoje.
- A imagem ocupa a largura do texto e não causa rolagem horizontal em 360 px. A altura fica reservada pelas dimensões declaradas, para evitar salto de layout.

## LGPD

O endpoint é público e só tem o texto editorial que a equipe publicou. Nenhum dado de pessoa passa por aqui.

## Critérios de aceite

Os três do card:

- [ ] Páginas buscam as seções do endpoint público com ISR
- [ ] Fallback para o conteúdo fixo se a API não responder
- [ ] Seção despublicada no Admin some do site depois da revalidação

E os deste PRD:

- [ ] As subpáginas continuam estáticas (●), e o build passa com o backend desligado
- [ ] Na revalidação, uma falha da API mantém a última página boa, sem voltar ao conteúdo fixo
- [ ] Contato, botões e crédito da ITES continuam fixos
- [ ] Imagens das seções com `next/image` e `alt`
- [ ] Lint, typecheck, testes e `next build` verdes

## Fora do escopo

- **Revalidação sob demanda** (o Admin avisar o site ao publicar, com `revalidateTag`): exigiria um gatilho no backend. Os 5 minutos de ISR atendem o card.
- **`lastModified` das subpáginas no sitemap**, a partir do `atualizado_em` das seções: fica para quando o sitemap puder chamar a API sem atrasar a geração.
- **Textos novos dos subgrupos e a correção de autoria** ("A Casa mantém esta plataforma…", "junto com a Casa…"): #74. Depois deste card, essa correção nos textos da API é feita no Admin, sem código.
- **Página por seção:** o detalhe `/api/saiba-mais/{slug}/` existe, mas a seção é um bloco dentro da página do subgrupo.

## Riscos

- **`NEXT_PHASE` no build.** A regra "conteúdo fixo no build, erro na revalidação" depende de o Next 16 definir `NEXT_PHASE` durante o `next build`. A primeira tarefa da implementação é confirmar isso com o backend desligado. Se não funcionar, a alternativa é sempre usar o conteúdo fixo em caso de falha. Ela cumpre o card, mas tem o problema de alternância descrito nas decisões, e isso ficaria registrado no PR.
- **Backend dormindo.** Se o backend em produção dorme quando fica parado, a primeira revalidação depois disso pode passar dos 10 s. Pela decisão acima, o site continua com a última versão boa e acerta na visita seguinte.
- **Textos da carga inicial.** Quando este card entrar, o site passa a mostrar os textos da carga inicial do backend. Um deles, o da ITES, divide com a Casa a autoria da plataforma. A correção é feita no Admin, junto com o #74.
