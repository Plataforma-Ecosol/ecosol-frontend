# PRD — Saiba mais: rotas dos subgrupos e página índice

25/11/2026 · Jean Macedo

## Contexto e objetivo

Hoje o "Saiba mais" é uma página só (`/saiba-mais`), com quatro blocos: "Quem somos", "Fale com a Casa", "A Rede de Economia Solidária de Niterói" e "Quem faz a plataforma" ([PRD da página Saiba mais](PRD_Pagina_Saiba_Mais_e_Contato_da_Casa_v1.md)). A Casa Azul pediu que essas informações fiquem separadas em três subgrupos: a Casa Paul Singer, a Economia Solidária e a ITES/IFRJ.

Este PRD cobre a **primeira parte** dessa mudança: criar as três rotas e transformar `/saiba-mais` numa página índice. O conteúdo existente **só muda de lugar**, sem ser reescrito, para que nenhuma informação saia do ar entre um card e outro.

**História:** como visitante do portal (sem login), quero encontrar separadas as informações sobre a Casa Paul Singer, a Economia Solidária e a ITES/IFRJ, para achar mais rápido o que procuro.

- **Card:** [Plataforma-Ecosol/ecosol-frontend#72](https://github.com/Plataforma-Ecosol/ecosol-frontend/issues/72), "[Institucional] Saiba mais: rotas dos subgrupos e página índice · 3 pts" (Sprint 3)
- **História-mãe:** [#71](https://github.com/Plataforma-Ecosol/ecosol-frontend/issues/71), "Subgrupos na aba Saiba mais · 12 pts"
- **Requisito / HU:** RF21 / HU22 (cenários 1, 2 e 5), na [especificação de requisitos](https://github.com/Plataforma-Ecosol/ecosol-docs/blob/main/docs/especificacao-requisitos/historias-de-usuario.md#hu22)
- **Release:** R3 · Área da equipe e Saiba mais
- **Escopo:** só o frontend Next.js. Nenhuma mudança no backend nem na API.
- **Ponto de partida:** a `staging` com o frontend#77 (barra final) e o backend#64 (seções por subgrupo) já mesclados.

### Os outros cards da história

Este card prepara a estrutura que eles usam:

| Card | O que faz | O que precisa deste |
| --- | --- | --- |
| #73 | Abas ou submenu e breadcrumb entre os subgrupos | A lista `SUBGRUPOS` e as três rotas |
| #74 | Conteúdo inicial validado pela Casa Azul e imagens | Um componente de conteúdo por subgrupo, para trocar o texto |
| #75 | Conteúdo vindo de `/api/saiba-mais/` com ISR | Os slugs iguais aos do backend |
| #76 | Descrição própria e sitemap dos subgrupos | `generateStaticParams` e a lista `SUBGRUPOS` |

## Decisões

- **Slugs iguais aos do backend.** As rotas são `/saiba-mais/casa-azul`, `/saiba-mais/economia-solidaria` e `/saiba-mais/ites-ifrj`, exatamente os valores de `SecaoSaibaMais.Subgrupo` no backend (`rede/models/secao_saiba_mais.py`). No #75, o slug da URL é o mesmo `slug` que a API devolve, sem nenhuma tabela de conversão.
- **Uma rota dinâmica, e não três pastas.** `src/app/saiba-mais/[subgrupo]/page.tsx`, com `generateStaticParams` e `dynamicParams = false`. As três páginas saem estáticas no build, e qualquer outro slug responde 404 sem código extra (HU22, cenário 5). Também deixa o #75 e o #76 trabalharem sobre uma lista só.
- **O conteúdo atual só muda de lugar.** Cada bloco vai inteiro para o seu subgrupo, com o mesmo texto, os mesmos componentes e os mesmos testes:

  | Bloco atual | Vai para |
  | --- | --- |
  | Quem somos | `casa-azul` |
  | Fale com a Casa (`id="contato"`) e JSON-LD `Organization` | `casa-azul` |
  | A Rede de Economia Solidária de Niterói, com os botões | `economia-solidaria` |
  | Quem faz a plataforma (ITES, CNPq, GPLv3, GitHub, endereço do campus) | `ites-ifrj` |

  Reescrever, completar e validar os textos fica para o #74.
- **A página índice mantém um contato curto, com `id="contato"`.** O endereço `/saiba-mais#contato` está no rodapé de todas as páginas e pode estar salvo fora do site. O fragmento (`#contato`) nunca chega ao servidor, então não dá para redirecioná-lo. Se a índice não tiver esse `id`, o link antigo abre a página, mas no topo e sem o contato. A índice mostra então telefone e e-mail, com um link para o contato completo. Quem abre o "Saiba mais" pelo celular quase sempre quer só isso.
- **O rodapé passa a apontar direto para `/saiba-mais/casa-azul#contato`.** O contato curto da índice serve só para os links antigos.
- **Nome dos subgrupos:** "Casa Azul", "Economia Solidária" e "ITES/IFRJ", os mesmos rótulos do backend, que a API devolve em `nome` (ver "Pendências"). O `h1` da página da Casa continua sendo o nome oficial, "Casa da Economia Solidária Paul Singer", como no PRD anterior: o leitor de tela anuncia o que a página é, e não o apelido.
- **Volta para a índice por um link simples.** As subpáginas ganham só um link "Saiba mais" acima do `h1`. O #73 troca esse link pelo breadcrumb e pelas abas.
- **Metadados mínimos.** Este card dá a cada subpágina o próprio `title` e o próprio `canonical`. Descrição própria e sitemap ficam para o #76. Até lá vale a descrição padrão do layout.

## Onde mora o quê

### `src/lib/saiba-mais.ts` (novo)

Lista única dos subgrupos, usada pela índice, pela rota, pelo #73 (navegação) e pelo #76 (sitemap):

```ts
/** Os mesmos valores de `SecaoSaibaMais.Subgrupo` no backend. */
export type SlugDoSubgrupo = "casa-azul" | "economia-solidaria" | "ites-ifrj";

export type Subgrupo = {
  slug: SlugDoSubgrupo;
  /** O mesmo rótulo que a API devolve em `nome`. */
  nome: string;
  /** Uma frase para o cartão da índice. */
  resumo: string;
};

/** Nesta ordem na índice e na navegação. */
export const SUBGRUPOS: readonly Subgrupo[] = [
  {
    slug: "casa-azul",
    nome: "Casa Azul",
    resumo: "Quem somos, contato, endereço e horário de atendimento da Casa Paul Singer.",
  },
  {
    slug: "economia-solidaria",
    nome: "Economia Solidária",
    resumo: "O que é a economia solidária e como funciona a rede de Niterói.",
  },
  {
    slug: "ites-ifrj",
    nome: "ITES/IFRJ",
    resumo: "A incubadora do IFRJ Campus Niterói que desenvolve esta plataforma.",
  },
];

export function buscarSubgrupo(slug: string): Subgrupo | undefined;
export function caminhoDoSubgrupo(slug: SlugDoSubgrupo): string; // "/saiba-mais/casa-azul"
```

Os resumos são rascunhos e vão para a validação da Casa Azul junto com os textos do #74. Eles só descrevem o que já está em cada página, sem informação nova.

### `src/componentes/saiba-mais/` (novo)

Um componente de servidor por subgrupo, com o JSX recortado da `page.tsx` atual **sem mudança de texto, classe ou ordem**:

- `ConteudoCasaAzul.tsx`: "Quem somos", "Fale com a Casa" e o JSON-LD;
- `ConteudoEconomiaSolidaria.tsx`: "A Rede de Economia Solidária de Niterói" e os botões "Conheça os coletivos" e "Veja a agenda";
- `ConteudoItesIfrj.tsx`: "Quem faz a plataforma".

O que é usado por mais de um componente sai da página e vai para `src/componentes/saiba-mais/comum.tsx`: `NOVA_ABA`, `AvisoDeNovaAba` e o tipo `BotaoDeContato`. `ENDERECO_DO_ITES` vai junto com o bloco do ITES.

No JSON-LD, a `url` da organização passa a ser `urlAbsoluta("/saiba-mais/casa-azul")`.

`src/lib/casa.ts` não muda.

### `src/app/saiba-mais/[subgrupo]/page.tsx` (novo)

```tsx
export const dynamicParams = false;

export function generateStaticParams() {
  return SUBGRUPOS.map(({ slug }) => ({ subgrupo: slug }));
}

export async function generateMetadata({ params }): Promise<Metadata> {
  const { subgrupo } = await params;
  const dados = buscarSubgrupo(subgrupo);
  if (!dados) return {};
  return {
    title: dados.nome,
    alternates: { canonical: caminhoDoSubgrupo(dados.slug) },
  };
}

const CONTEUDO: Record<SlugDoSubgrupo, () => React.ReactNode> = {
  "casa-azul": ConteudoCasaAzul,
  "economia-solidaria": ConteudoEconomiaSolidaria,
  "ites-ifrj": ConteudoItesIfrj,
};
```

- `params` é uma `Promise` no Next 16, por isso o `await`.
- `dynamicParams` vale porque o projeto não liga o `cacheComponents` no `next.config.ts`. No Next 16, ligar o Cache Components remove essa opção, como diz `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/index.md`. Se um dia o projeto ligar, o 404 dos slugs desconhecidos passa a vir de `notFound()`.
- `buscarSubgrupo` devolver `undefined` não deveria acontecer com `dynamicParams = false`. Mesmo assim, a página chama `notFound()` nesse caso, por segurança.
- `h1`: na Casa Azul, `CASA.nome`. Nos outros dois, o `nome` do subgrupo.
- Acima do `h1`, o link `<Link href="/saiba-mais">Saiba mais</Link>`, que o #73 substitui.
- O `<article>` e o espaçamento (`space-y-10`) continuam os da página atual.

### `src/app/saiba-mais/page.tsx` (reescrita como índice)

```
┌──────────────────────────────────────────────────────────┐
│ Saiba mais                                      (h1)     │
│ Conheça quem está por trás da rede e da plataforma.      │
├──────────────────┬──────────────────┬────────────────────┤
│ Casa Azul   (h2) │ Economia         │ ITES/IFRJ    (h2)  │
│ resumo           │ Solidária   (h2) │ resumo             │
│                  │ resumo           │                    │
├──────────────────┴──────────────────┴────────────────────┤
│ Fale com a Casa                  (h2, id="contato")      │
│ [tel] (21) 2717-8350  [Copiar]                           │
│ [✉ coordenaecosol@gmail.com]                             │
│ Endereço, horário e redes sociais →                      │
└──────────────────────────────────────────────────────────┘
```

- **Cartões:** uma `<ul>` com um `<li>` por subgrupo. O link fica no `h2` (`<Link>`), e o cartão inteiro é clicável por um `::after` absoluto sobre o `<li>` com `relative`. O leitor de tela anuncia um link só, com o nome do subgrupo, e não o cartão inteiro como link. Mesmo acabamento dos cartões do site: `rounded-xl border border-dourado-200 bg-white p-5`, e foco visível no cartão (`focus-within:ring`).
- **Grade:** uma coluna no celular e três a partir do `md`.
- **Contato curto:** só aparece se `temContato(CASA)`. Mostra o telefone (com `tel:` e o `BotaoCopiar`, como hoje) e o e-mail (`mailto:`), sem `<address>`: o contato completo e oficial fica na página da Casa. Termina com o link "Endereço, horário e redes sociais" para `/saiba-mais/casa-azul#contato`.
- **Metadados:** `title: "Saiba mais"`, `canonical: "/saiba-mais"` e uma descrição nova: "Informações sobre a Casa Paul Singer, a economia solidária em Niterói e a ITES/IFRJ, que desenvolve a plataforma."
- **Estática, sem API**, como hoje.

### Outros arquivos

- **`src/app/layout.tsx`:** o link "Fale com a Casa" do rodapé passa a ser `temContato(CASA) ? "/saiba-mais/casa-azul#contato" : "/saiba-mais/casa-azul"`.
- **`NavegacaoPrincipal.tsx`:** sem mudança. `estadoDoLink` já marca "Saiba mais" como ativo em `/saiba-mais/...`, pelo `startsWith`.
- **`sitemap.ts`:** sem mudança neste card. `/saiba-mais` continua lá, e os subgrupos entram no #76.
- **`next.config.ts`:** sem mudança. Desde o frontend#77, `/saiba-mais/casa-azul/` já responde 308 para o endereço sem barra.

## Requisitos de implementação

Branch `feat/saiba-mais-rotas-indice` a partir da `staging`, com commits aprovados pelo desenvolvedor.

1. `src/lib/saiba-mais.ts`, com o tipo, a lista e as duas funções.
2. `src/componentes/saiba-mais/`, com os três componentes de conteúdo e o `comum.tsx`. **Mover o JSX sem reescrever.** O diff deve mostrar o mesmo texto saindo da página e entrando nos componentes.
3. `src/app/saiba-mais/[subgrupo]/page.tsx`, com `dynamicParams = false`, `generateStaticParams`, `generateMetadata` e o link de volta.
4. `src/app/saiba-mais/page.tsx` como índice, com os três cartões e o contato curto.
5. Link do rodapé em `layout.tsx`.
6. Testes (seção abaixo). Os testes atuais de `saiba-mais/page.test.tsx` **mudam de lugar, e não de conteúdo**: cada `describe` vai para o teste do componente do seu bloco.
7. `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` verdes. No log do build, `/saiba-mais` deve aparecer como estática (○), e `/saiba-mais/[subgrupo]` como gerada no build (●), com os três caminhos.
8. Conferir à mão, no `npm run start`:
   - `/saiba-mais`, as três subpáginas e `/saiba-mais/nao-existe` (404);
   - `/saiba-mais#contato`, que deve rolar até o contato curto;
   - `/saiba-mais/casa-azul/`, que deve responder 308 para o endereço sem barra.
9. Lighthouse em `/saiba-mais` e `/saiba-mais/casa-azul`, no modo celular, com os números no PR.
10. Abrir o PR com o template, com "Closes #72" e o link no card, e mover o card para Code Review.

## Testes

- **`lib/saiba-mais.test.ts`:**
  - os slugs são exatamente `casa-azul`, `economia-solidaria` e `ites-ifrj`, nesta ordem. É a guarda contra o frontend divergir do backend;
  - os slugs não se repetem, e todo `nome` e todo `resumo` estão preenchidos;
  - `buscarSubgrupo` acha os três e devolve `undefined` para `"nao-existe"` e para `""`;
  - `caminhoDoSubgrupo("ites-ifrj")` é `/saiba-mais/ites-ifrj`.
- **`app/saiba-mais/page.test.tsx` (índice):**
  - `h1` "Saiba mais";
  - três links, com `href` `/saiba-mais/casa-azul`, `/saiba-mais/economia-solidaria` e `/saiba-mais/ites-ifrj`, nessa ordem, com o nome do subgrupo como nome acessível;
  - existe um elemento `#contato` com `tel:+552127178350`, `mailto:coordenaecosol@gmail.com` e um link para `/saiba-mais/casa-azul#contato`;
  - com o mock de `casa.ts` sem nenhum contato, nada de `#contato` na tela, e os cartões continuam.
- **`app/saiba-mais/[subgrupo]/page.test.tsx`:**
  - `generateStaticParams` devolve os três slugs, e `dynamicParams` é `false`;
  - cada slug mostra o `h1` certo (o nome oficial na Casa Azul) e o link de volta para `/saiba-mais`;
  - `casa-azul` tem `#contato` e o JSON-LD, e os outros dois não têm;
  - `economia-solidaria` tem os botões para `/coletivos` e `/eventos`;
  - `ites-ifrj` tem "Incubadora Tecnológica de Empreendimentos Solidários" e o endereço do campus;
  - `generateMetadata` devolve o `title` e o `canonical` de cada slug.
- **Testes dos componentes de conteúdo:** os `describe` que hoje estão em `saiba-mais/page.test.tsx` passam para cá sem mudança nas asserções: dado ausente não aparece, WhatsApp entre o e-mail e o Instagram, primeiro botão cheio, JSON-LD válido e sem chave vazia. A única asserção alterada é a `url` do JSON-LD.
- **`NavegacaoPrincipal.test.tsx`:** um caso novo, em que a rota `/saiba-mais/casa-azul` marca "Saiba mais" com `aria-current` e mais nada.
- **Rodapé:** "Fale com a Casa" aponta para `/saiba-mais/casa-azul#contato`.
- **Regressão de LGPD:** nenhum teste muda. Nenhuma página nova lê a API.

## Acessibilidade e celular

- Um `h1` por página. Na índice, um `h2` por cartão e um no contato curto.
- O cartão é clicável inteiro, mas expõe um link só, com o nome do subgrupo. O resumo fica fora do nome acessível, e o foco é visível no cartão.
- Alvos de toque de pelo menos 44 px nos cartões e no link de volta.
- Em 360 px, os cartões ficam em uma coluna, e o contato curto vem logo depois deles, sem rolagem horizontal.
- Sem JavaScript, tudo funciona: as páginas são estáticas, e só o botão Copiar não aparece.
- Lighthouse acima de 90 em Acessibilidade, SEO e Boas práticas.

## LGPD

Nada muda. O único contato do "Saiba mais" continua sendo o institucional da Casa (`casa.ts`), e nenhuma página nova lê a API.

## Critérios de aceite

Os três do card:

- [ ] Rotas `/saiba-mais/casa-azul`, `/saiba-mais/economia-solidaria` e `/saiba-mais/ites-ifrj`
- [ ] `/saiba-mais` vira índice, com um cartão para cada subgrupo
- [ ] Links antigos de `/saiba-mais` continuam funcionando, inclusive `/saiba-mais#contato`

E os deste PRD:

- [ ] Slugs iguais aos de `SecaoSaibaMais.Subgrupo` no backend, garantido por teste
- [ ] Subgrupo inexistente responde 404 (HU22, cenário 5)
- [ ] Todo o conteúdo atual continua no ar, cada bloco no seu subgrupo, com o mesmo texto
- [ ] Rodapé apontando para `/saiba-mais/casa-azul#contato`
- [ ] "Saiba mais" ativo no menu também nas subpáginas
- [ ] `title` e `canonical` próprios em cada subpágina
- [ ] Páginas estáticas no build (○ e ●)
- [ ] Funciona em 360 px e no desktop; Lighthouse acima de 90 (números no PR)
- [ ] Lint, typecheck, testes, `next build` e build do Docker verdes

## Fora do escopo

- **Abas, submenu e breadcrumb:** #73.
- **Texto novo, validação dos textos com a Casa Azul e imagens com `next/image`:** #74.
- **Conteúdo vindo da API:** #75. Até lá, nada aqui chama a API.
- **Descrição própria e sitemap dos subgrupos:** #76.

## Riscos

- **Links externos para `/saiba-mais#contato`.** Se o contato curto da índice for removido no futuro, esses links passam a abrir no topo da página. O teste do `#contato` na índice existe para impedir isso.
- **Conflito com o #74.** Os dois cards mexem nos mesmos componentes de conteúdo. O melhor é fazer o merge deste antes de começar o #74.

## Pendências com a Casa Azul

Seguem junto com a validação dos textos do #74:

- [ ] Nome exibido do primeiro subgrupo: "Casa Azul" (o rótulo do backend, usado aqui) ou "Casa Paul Singer". Se mudar, a troca é feita no backend (`Subgrupo.CASA_AZUL`) e em `SUBGRUPOS`, e o slug `casa-azul` continua o mesmo.
- [ ] Os três resumos dos cartões da índice.
