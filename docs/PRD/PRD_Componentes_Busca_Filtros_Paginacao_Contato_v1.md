# PRD — Componentes: busca, filtros, paginação e contato do coletivo

12/10/2026 · Jean Macedo

## Contexto e objetivo

Na reunião de 02/10, a equipe decidiu deixar a plataforma com "menos cara de genérico". O trabalho foi dividido em três cards. Este é a parte 2: os componentes que a pessoa usa para achar um coletivo e falar com ele. A parte 1 (base visual) e a parte 3 (fotos) já foram implementadas, e este card usa o que elas trouxeram: os ícones do `lucide-react`, as escalas `azul-50` … `azul-950`, a `font-titulo` e o `CartaoColetivo` novo, com foto e link esticado.

**História:** como visitante, quero buscar, filtrar e entrar em contato com um coletivo sem esforço, principalmente pelo celular.

- **Card:** [\[Identidade visual\] Componentes: busca, filtros, paginação e contato do coletivo · 5 pts](https://trello.com/c/VAmieHmr/76-identidade-visual-componentes-busca-filtros-pagina%C3%A7%C3%A3o-e-contato-do-coletivo-5-pts) (Em Andamento)
- **Vitrine com antes e depois:** [Vitrine de melhorias da Plataforma ES](https://claude.ai/artifact/KKQw4WQSrecSUGkbtSrL7W), fichas "Busca, filtros e paginação" e "Contato do coletivo com botões"
- **PRDs anteriores:** base visual (`docs/PRD/PRD_Base_Visual_v1.md`) e fotos (`docs/PRD/PRD_Fotos_Cartao_e_Abertura_v1.md`). Nada do que foi feito lá muda aqui, a não ser o estilo dos chips de categoria (seção 3).
- **Escopo:** o frontend Next.js (`apps/ecosol-frontend`) e, para o painel de filtros, uma mudança pequena na API do backend (`apps/ecosol-backend`, PR próprio): o endpoint de opções dos filtros e a combinação de categorias (seção 3).
- **Revisão de 12/10, depois da primeira versão:** a pedido do desenvolvedor, entram neste mesmo card a busca automática (seção 2) e o painel de filtros com mais de uma categoria (seção 3). Os pontos para confirmar foram resolvidos com as recomendações (fim do documento).
- **Ponto de partida:** a `staging` já com o card 77. Este card mexe no `CartaoColetivo` e no `PerfilDoColetivo`, os mesmos arquivos do card 77. A branch sai da `staging` depois desse merge.

São cinco entregas, cada uma numa seção abaixo:

| # | Entrega | Onde mexe | Dependência nova |
| --- | --- | --- | --- |
| 1 | shadcn/ui no projeto | `components.json`, `src/componentes/ui/`, `src/lib/utils.ts` | `class-variance-authority`, utilitário `cn`, `Slot` do Radix |
| 2 | Busca automática | `FormularioDeBusca` (coletivos e agenda) | Nenhuma além da entrega 1 |
| 3 | Painel de filtros, filtros ativos e chips de categoria | `PainelDeFiltros`, `CamposDeFiltro`, `FiltrosAtivos`, novo `lib/filtros.ts`, `CartaoColetivo`, `PerfilDoColetivo` (coletivos e agenda) | Endpoint `/api/filtros/` e categoria múltipla no backend |
| 4 | Paginação | `Paginacao`, novo `lib/paginacao.ts` (coletivos e agenda) | Nenhuma além da entrega 1 |
| 5 | Contato do coletivo | `PerfilDoColetivo`, novo `BotaoCopiar`, `lib/contatos.ts` | Nenhuma além da entrega 1 |

## 1. shadcn/ui no projeto

O shadcn/ui não é instalado como pacote. O CLI copia o código de cada componente para dentro do projeto, e a partir daí o código é nosso para editar. Entram só os quatro que este card usa: `input`, `button`, `badge` e `pagination`.

### Base: Radix

O shadcn hoje oferece duas bases para os componentes: Radix e Base UI. A escolha aqui é **Radix**, por causa do `asChild`.

Quase tudo que este card chama de botão é, na verdade, um link: o chip que remove o filtro, os números da paginação, os botões de Instagram, e-mail e site. Com o Radix, `<Button asChild><Link …/></Button>` aplica o visual do botão e mantém o elemento como `<a>`, com papel de link para o leitor de tela. A própria documentação do shadcn avisa que o `Button` da Base UI força `role="button"` e não deve ser usado para links.

### Por que não rodar o `init` como ele vem

O `shadcn init` foi feito para projeto novo. Aqui ele faria três coisas que o projeto já decidiu não ter:

1. **Reescreve o `globals.css`** com variáveis próprias (`--primary`, `--background`…) e uma regra de cor no `body`. O `globals.css` tem a paleta como fonte única e explica, no comentário do topo, por que não existe regra de cor no `body`.
2. **Acrescenta um bloco `.dark`** com o tema escuro. O tema escuro está fora de escopo (PRD do Frontend, seção 2), e meio tema escuro já quebrou o site uma vez.
3. **Instala `tw-animate-css` e importa `shadcn/tailwind.css`.** Nenhum dos quatro componentes tem animação nem usa as variantes `data-open:` que esse arquivo traz.

Por isso o `init` roda, mas só o `components.json` e o `src/lib/utils.ts` ficam. O resto é desfeito antes do primeiro commit.

### Passo a passo

1. `npx shadcn@latest init -t next -b radix -p nova --no-css-variables --no-monorepo --no-rtl`. Sem `-p`, o CLI pergunta o preset; o `nova` usa os ícones do Lucide, os mesmos do projeto.
2. Conferir o `git status` e desfazer o que não fica:
   - `git checkout -- src/app/globals.css src/app/layout.tsx`. Na execução, o `init` também trocou a fonte do `layout.tsx` (pôs a Geist no `<html>`), e criou `src/components/ui/button.tsx`, que deve ser apagado.
   - `npm uninstall tw-animate-css shadcn`, se o `init` tiver instalado algum dos dois.
   - Conferir que o `package-lock.json` não perdeu os campos `libc`. O npm 11 os apagava; o npm 12 os preserva, e o `npm ci` do Docker (npm 10) aceita o resultado.
3. Ajustar o `components.json`:
   - `"rsc": true` (o projeto usa Server Components).
   - `"tailwind.css": "src/app/globals.css"`.
   - Aliases para a pasta do projeto:

     ```json
     "aliases": {
       "components": "@/componentes",
       "ui": "@/componentes/ui",
       "utils": "@/lib/utils",
       "lib": "@/lib",
       "hooks": "@/hooks"
     }
     ```
4. Ver antes de gravar: `npx shadcn@latest add input button badge pagination --dry-run`. A saída lista os arquivos e as dependências.
5. Rodar o mesmo comando sem `--dry-run`.
6. `git diff -- src/app/globals.css` tem que sair vazio. Se o `add` tiver mexido nele, desfazer de novo.

O valor de `style` no `components.json` varia com a versão do CLI. Manter o que o `init` gerou.

**O que o `add` entrega não serve como está.** Com `--no-css-variables`, o CLI escreveu as cores como `bg-oklch(0.205 0 0)`, que não é classe válida do Tailwind, e importou o `cn` direto do pacote, e não de `@/lib/utils`. Os quatro arquivos são reescritos na adaptação à paleta (abaixo), e o teste de guarda barra também `oklch(`, `rgb(` e `hsl(`.

### Onde os arquivos ficam

- `src/componentes/ui/input.tsx`, `button.tsx`, `badge.tsx` e `pagination.tsx`
- `src/lib/utils.ts`, com a função `cn`

Os componentes do projeto continuam em português e em PascalCase (`FormularioDeBusca.tsx`). A pasta `ui/` mantém os nomes do shadcn. Assim um `npx shadcn@latest add button --diff` continua conseguindo comparar com a versão nova, se um dia a equipe quiser.

Cada arquivo de `ui/` ganha um comentário no topo com a origem e o que mudou:

```tsx
/**
 * Origem: shadcn/ui (base Radix), copiado em <data> pelo PRD de componentes.
 * Alterado: cores da paleta no lugar das do shadcn, sem `dark:`, foco com
 * `outline-azul`. Ver `docs/PRD/PRD_Componentes_Busca_Filtros_Paginacao_Contato_v1.md`.
 */
```

### Dependências

Ficam as que o CLI instalar para os quatro componentes. O esperado:

- `class-variance-authority` (as variantes do botão e do badge)
- o utilitário `cn` (`clsx` com `tailwind-merge`, ou o pacote `cn` nas versões mais novas do CLI)
- o `Slot` do Radix (`radix-ui` ou `@radix-ui/react-slot`, conforme a versão)

Registrar no PR o nome e a versão de cada um. Qualquer outra coisa que aparecer no `package.json` é sinal de parar e conferir.

### A paleta no lugar das cores do shadcn

Os componentes chegam com as cores genéricas do shadcn. Elas são trocadas pelas da paleta **direto nas classes**. Não entra uma camada de nomes como `--primary` apontando para o azul: seria um segundo nome para a mesma cor, e o PRD da paleta pede uma fonte só.

Ficam só as variantes que este card usa. As outras saem do arquivo.

**Button**

| Variante | Uso | Classes |
| --- | --- | --- |
| `default` | Primeiro botão de contato, Ver resultados do painel | `bg-azul text-bege hover:bg-azul-700` |
| `outline` | Demais botões de contato, Copiar | `border border-azul-200 bg-white text-azul hover:border-azul hover:bg-azul-50` |
| `ghost` | Números da paginação, Anterior e Próxima | `text-azul hover:bg-azul-50` |
| `link` | Limpar tudo | `text-azul underline underline-offset-4 hover:text-azul-900` |

| Tamanho | Uso | Classes |
| --- | --- | --- |
| `default` | Botões de contato, botões do painel de filtros | `min-h-11 px-4` (44 px, alvo de toque) |
| `sm` | Copiar | `min-h-9 px-3 text-sm` |
| `icon` | Números da paginação | `size-10` |

O `hover:bg-azul-700` é o mesmo dos botões da abertura da home (card 77).

**Badge**

| Variante | Uso | Classes |
| --- | --- | --- |
| `default` | Filtro ativo | `bg-azul text-bege hover:bg-azul-900` |
| `secondary` | Categoria no cartão e no perfil | `bg-azul-50 text-azul-800 hover:bg-azul hover:text-bege` |

Tamanho do badge: `min-h-8 rounded-full px-3 text-sm font-medium`. O padrão do shadcn é bem menor que isso.

**Em todos os quatro:**

- **Foco:** `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul`, no lugar do `ring` do shadcn. Dá 7,4:1 sobre o bege e 8,4:1 sobre o branco.
- **Sem nenhuma classe `dark:`.** No Tailwind 4, `dark:` sem configuração segue o modo escuro do sistema (`prefers-color-scheme`). Deixar essas classes faria partes dos componentes escurecerem no celular de quem usa modo escuro, enquanto o resto do site continua claro. É o mesmo defeito de "meio tema escuro" que o PRD do Frontend registra na seção 2.
- **Sem `aria-invalid:` nem `destructive`.** Nenhum desses campos tem validação.
- **Sem as classes de gancho `cn-*`** (como `cn-pagination-previous`), se vierem. Sem o CSS do shadcn elas não fazem nada.
- Nenhum hex solto. Vale a mesma regra do PRD da paleta.

### Pagination com o `Link` do Next

O `PaginationLink` do shadcn renderiza um `<a>`. A documentação do shadcn manda trocar pelo `Link` do Next dentro do próprio `pagination.tsx`, e é o que se faz aqui. Os textos em inglês ("Previous", "Next", "Go to previous page", "More pages") passam para português. A seção 4 diz quais.

## 2. Busca

O mesmo `FormularioDeBusca` serve a `/coletivos` e a `/eventos`. As duas listagens ganham a busca nova, e ela **busca sozinha enquanto a pessoa digita**.

```
┌──────────────────────────────────────────────────────┐
│ [lupa]  Buscar por nome ou descrição                 │
└──────────────────────────────────────────────────────┘
```

### Visual

- **Campo:** `Input` do shadcn com `type="search"`, dentro de um `div` `relative min-w-0 flex-1`.
- **Lupa:** ícone `Search` com `aria-hidden`, `pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-azul-500`. O campo ganha `pl-10` para o texto não passar por cima dela.
- **Classes do campo:** `h-11 rounded-lg border-azul-500 bg-white text-base placeholder:text-texto/60`. Foco com a regra da seção 1 e `focus-visible:border-azul`.
- **Sem botão Buscar** (decisão do desenvolvedor, depois da busca automática). O Enter envia na hora: formulário com um campo de texto só é enviado pelo Enter mesmo sem botão (o "envio implícito" do HTML), com ou sem JavaScript. Por isso o formulário não pode ganhar um segundo campo visível. No celular, `enterKeyHint="search"` põe a tecla "Buscar" no teclado.
- **Largura toda**, também no celular. O `<form>` leva `role="search"`, que marca a região para quem navega por pontos de referência no leitor de tela.

Três detalhes que fogem da vitrine, de propósito:

- **Borda `azul-500`, e não `azul-100`.** O contorno é o que mostra onde o campo está. O WCAG pede 3:1 para isso, e o `azul-500` dá 3,6:1 sobre branco. O `azul-200` daria 1,4:1, e o `azul-100` menos ainda: o campo sumiria no fundo.
- **`text-base` (16 px) também no celular.** O `Input` do shadcn vem com `md:text-sm`, que fica, mas o tamanho no celular não pode ser menor que 16 px. Abaixo disso, o Safari do iPhone dá zoom na página quando a pessoa toca no campo.
- **Placeholder em `texto/60`:** 4,6:1 sobre branco. O `texto/50` daria 3,4:1.

### Busca automática

**Continua sendo navegação, e não `fetch` no navegador.** O formulário passa a ser o `<Form>` do Next (`next/form`), que é um `<form>` GET: enviar troca o `?q=` da URL, e o servidor renderiza o resultado como antes. A página continua indexável, o resultado compartilhável, o "voltar" funcionando e o backend sem CORS. O JavaScript só acrescenta o envio automático, chamando `requestSubmit()` no próprio formulário.

Para não pesar quando a rede crescer:

1. **Espera a pessoa parar de digitar** (400 ms). "alimentação" vira uma busca, e não onze.
2. **Não busca com uma letra só.** Apagar tudo busca, para a lista voltar inteira. O que já está na URL não é buscado de novo.
3. **`replace`, e não `push`.** Cada pausa na digitação não vira uma entrada no histórico.
4. **O resto vem do Next e do cache:** uma navegação nova descarta a anterior, e o `fetch` da listagem tem cache de 60 s por URL.

O campo é componente de cliente montado na mesma posição da página, então não perde o foco nem o texto quando o resultado chega. Quando o `q` da URL muda por "voltar" ou "avançar", o campo se atualiza, a não ser que a pessoa esteja digitando nele.

**Leitor de tela:** a frase com o total ("12 coletivos.") ganha `aria-live="polite"` nas duas listagens. Com a busca automática, o resultado muda sem a pessoa sair do campo, e é isso que avisa quantos foram achados.

**O que não muda:** os filtros em campos ocultos (uma entrada por valor, com as categorias repetidas), `page` fora dos campos ocultos, o `label` com `sr-only` ligado ao `id="q"`.

**Custo:** o `FormularioDeBusca` vira componente de cliente (`"use client"`). É uma ilha pequena, e sem JavaScript ele continua sendo o formulário de antes.

**Volume grande:** o limite seria o backend. A busca é `icontains` em nome e descrição, que no Postgres aguenta bem alguns milhares de registros. Muito além disso, o caminho é um índice `pg_trgm` no backend, num card próprio.

## 3. Painel de filtros, filtros ativos e chips de categoria

Os filtros combinam com **"e"**: cada um estreita o resultado. Com duas categorias marcadas, aparecem só os coletivos que estão nas duas.

| Listagem | Filtros do painel |
| --- | --- |
| `/coletivos` | Categorias (mais de uma) e bairro |
| `/eventos` | Intervalo de datas (`de` e `ate`) e bairro, somados à aba Próximos/Já aconteceram |

### O que muda no backend

A API não tinha de onde tirar as opções, e é por isso que o PRD do Frontend (seção 10.6) tinha decidido pelo filtro só por clique no cartão. Com o painel, o backend passa a oferecer (PR próprio no `ecosol-backend`):

- **`GET /api/filtros/coletivos/`** → `{ "categorias": [{id, nome, slug}], "bairros": ["Centro", …] }`
- **`GET /api/filtros/eventos/`** → `{ "bairros": [...] }`
- Só o que está em uso por algum registro ativo, em ordem alfabética. Uma categoria sem coletivo nenhum levaria a um resultado vazio de propósito. Os bairros vêm sem repetição por maiúscula ou minúscula.
- **`?categoria=1&categoria=3`** em `/api/coletivos/`: coletivos que estão em **todas** as categorias pedidas. Uma categoria só continua funcionando como antes. Texto continua respondendo `400`, e um teto de categorias por consulta evita uma consulta com junções sem fim.

Um endpoint por listagem, e não `/api/categorias/` e `/api/bairros/` soltos: a página faz uma chamada só, e o nome diz para que ele serve. Fora de `/api/coletivos/` de propósito: `/api/coletivos/filtros/` esconderia o perfil de um coletivo cujo slug fosse `filtros`.

### Painel de filtros

```
[⚙ Filtros 2]  ( Categoria: Alimentação ⊗ )  ( Bairro: Centro ⊗ )  Limpar tudo
```

- **Botão** `Button` `outline` com o ícone `SlidersHorizontal` e, com filtros em vigor, um contador (`bg-azul text-bege`) com "ativos" em `sr-only`.
- **`<dialog>` nativo com `showModal()`**, como o menu do celular: foco preso, `Esc` fecha, o resto da página fica inerte, o foco volta ao botão, e um clique fora fecha. No celular sobe de baixo, com até 85% da altura; do `sm` para cima abre na lateral direita, com 384 px. Sem o Sheet do shadcn, pelo mesmo motivo do menu.
- **Formulário GET** (`next/form`, `action` = a rota). Checkboxes com o mesmo `name` já geram `?categoria=1&categoria=3`, e o campo `type="date"` já entrega `AAAA-MM-DD`, o único formato que a API aceita.
- **Aplica ao clicar em "Ver resultados"**, e não a cada marcação: com várias categorias, cada clique no meio do caminho seria uma consulta à toa. "Limpar" tira só as chaves do painel e mantém a busca (e a aba da agenda).
- **Campos ocultos:** o resto da URL (`q`, `periodo`) vai junto; `page` fica de fora, porque filtro novo muda o tamanho do resultado.
- **Categorias:** lista de checkboxes (`size-5 accent-azul`, linha com 44 px), com a frase "Com mais de uma marcada, aparecem só os coletivos que estão em todas."
- **Bairro:** `<select>` com "Todos os bairros" e as opções da API. O bairro da URL é comparado sem diferenciar maiúscula, como o filtro da API. Se não houver opção igual, ele entra na lista, para que aplicar outro filtro não apague o bairro sem aviso.
- **Datas (agenda):** "A partir de" e "Até", com `min` e `max` cruzados para evitar o intervalo invertido. Data fora do formato na URL é ignorada, e não repassada: a API responderia `400` e a agenda inteira viraria página de erro.
- **Sem as opções** (API fora do ar, ou frontend publicado antes do backend): o painel mostra um aviso no lugar de categoria e bairro, e a listagem segue de pé. As datas da agenda continuam, porque não dependem da API. A busca das opções não passa pelo `notFound()`.
- **Rótulos envolvem o campo**, em vez de `id`: os campos são renderizados duas vezes (no `<dialog>` e na versão sem JavaScript).
- **Sem JavaScript:** o botão não abre nada, e o mesmo formulário aparece num `<details>` dentro de `<noscript>`, como os links do menu.

### Filtros ativos

- **Um chip por valor:** cada categoria tem o seu. O texto continua "Categoria: Alimentação" e "Bairro: Centro"; na agenda, "A partir de 01/10/2026" e "Até 31/10/2026".
- **Nome da categoria:** vem das opções do painel; sem elas, dos cartões da página. Se não estiver em nenhum dos dois, o chip mostra o id.
- **Chip:** `<Badge asChild>` com o `Link`, variante `default`. O `href` tira só aquele valor e a `page`: com duas categorias, remover uma mantém a outra.
- **O ×:** ícone `X` (`size-3.5`) dentro de um círculo `size-5 rounded-full bg-bege/20`, com `aria-hidden`. O `<span className="sr-only">(remover este filtro)</span>` continua.
- **"Limpar tudo":** link com a variante `link` do `Button`. Tira os filtros e a `page`, e mantém a busca (`q`) e a aba da agenda. Só aparece com dois filtros ou mais; com um só, o próprio chip já faz isso.
- **Sem o rótulo "Filtros:"**: os chips ficam na mesma linha do botão "Filtros", que já diz o que eles são.
- A regra de cada chip fica em `lib/filtros.ts` (`filtrosAtivosDeColetivos`, `filtrosAtivosDeEventos`), fora do HTML, para poder ser testada sozinha. O mesmo número alimenta o contador do botão.
- **Agenda:** passa a ter chips, porque passa a ter filtros.

### Chips de categoria

Os chips de categoria do `CartaoColetivo` e do `PerfilDoColetivo` são os botões que aplicam o filtro, então passam a ser o mesmo componente: `<Badge asChild variant="secondary">` com o `Link`.

- No cartão, o link continua com `relative z-10`, para ficar por cima do link esticado do card 77. O `cn` junta essa classe com as do badge.
- **No cartão, a categoria clicada soma às já marcadas**, em vez de trocá-las. O cartão está no resultado justamente por ter as categorias marcadas, então somar a dele estreita a lista sem esvaziá-la. No perfil, que não tem filtro em vigor, o link filtra só por aquela categoria.
- O link do bairro continua como texto, com o ícone `MapPin`.

## 4. Paginação

```
Desktop:  [‹ Anterior]  1  …  4  (5)  6  …  20  [Próxima ›]
Celular:  [‹]  1  …  (5)  …  20  [›]
```

### Que números aparecem

Nova função `paginasVisiveis(atual, total, vizinhos)` em `src/lib/paginacao.ts`. Ela devolve a lista de números e reticências (`(number | "…")[]`) e não sabe nada de HTML, o que deixa a regra fácil de testar.

Regras:

1. Se o total cabe sem cortar (`total <= 2 * vizinhos + 5`), aparecem todas as páginas.
2. Senão, aparecem sempre a primeira e a última, a atual e `vizinhos` páginas de cada lado dela.
3. Um buraco de uma página só mostra o número, e não "…". Trocar um número por reticências não economiza espaço e esconde uma página à toa.
4. `atual` fora do intervalo é trazido para dentro (1 ou `total`). Na prática a API responde 404 antes, mas a função não quebra.

Com isso a lista tem no máximo 7 itens com `vizinhos = 1` e 5 com `vizinhos = 0`, sempre o mesmo tamanho. A paginação não muda de largura ao trocar de página.

Conferido com um script:

| Atual / total | `vizinhos = 1` (desktop) | `vizinhos = 0` (celular) |
| --- | --- | --- |
| 3 / 5 | 1 2 3 4 5 | 1 2 3 4 5 |
| 4 / 7 | 1 2 3 4 5 6 7 | 1 … 4 … 7 |
| 1 / 20 | 1 2 … 20 | 1 … 20 |
| 3 / 20 | 1 2 3 4 … 20 | 1 2 3 … 20 |
| 4 / 20 | 1 2 3 4 5 … 20 | 1 … 4 … 20 |
| 5 / 20 | 1 … 4 5 6 … 20 | 1 … 5 … 20 |
| 17 / 20 | 1 … 16 17 18 19 20 | 1 … 17 … 20 |
| 20 / 20 | 1 … 19 20 | 1 … 20 |

### Celular e desktop

No celular de 360 px sobram 328 px (16 px de cada lado). Com `vizinhos = 1`, a paginação teria até 9 itens: 9 × 40 px mais os espaços passa de 390 px. Por isso:

- **Celular (abaixo de `sm`):** `vizinhos = 0`, e Anterior e Próxima só com o ícone. São no máximo 7 itens: 7 × 40 + 6 × 4 = 304 px.
- **Desktop:** `vizinhos = 1`, e Anterior e Próxima com texto.

O componente renderiza as duas listas: uma com `flex sm:hidden`, a outra com `hidden sm:flex`. O `display: none` tira a lista escondida da árvore de acessibilidade e da ordem do Tab, então o leitor de tela encontra uma só. É um trecho de HTML duplicado em troca de não depender de JavaScript para medir a tela.

O texto de Anterior e Próxima usa `sr-only sm:not-sr-only`. No celular a palavra some da tela, mas continua sendo o nome do link.

### Elementos

- **`nav`** com `aria-label="Paginação"`, centralizado (`justify-center`).
- **Página atual:** continua um `<span aria-current="page">`, e não um link, pelo motivo que já está no comentário do componente. Estilo `size-10 rounded-lg bg-azul text-bege font-semibold tabular-nums`. O `PaginationLink` do shadcn, quando ativo, renderiza um link; essa parte é adaptada.
- **Outras páginas:** `Link` com a variante `ghost`, tamanho `icon` e `aria-label="Página 3"`. Sem o `aria-label`, o leitor de tela anunciaria só "3, link".
- **Reticências:** `aria-hidden`, sem texto para o leitor de tela. Não é ação nenhuma. O "More pages" do shadcn sai.
- **Anterior e Próxima:** ícones `ChevronLeft` e `ChevronRight` com `aria-hidden`, `rel="prev"` e `rel="next"`. Na primeira página não existe Anterior, e na última não existe Próxima: nada de botão desabilitado (mesmo motivo de hoje, no comentário do componente).
- **O que não muda:** `POR_PAGINA = 20`, os links montados com `comParametros` (os outros filtros vêm junto, inclusive as categorias repetidas, e só `page` muda), o `next`/`previous` do envelope sem uso, e nada na tela quando há uma página só.

## 5. Contato do coletivo

```
┌ Fale com o coletivo ─────────────────────────────────────┐
│ [@ @sementesdovale]  [✉ contato@sementesdovale.org]       │
│ [globo sementesdovale.org]                               │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ [tel] (21) 99999-0000                       [Copiar] │ │
│ └──────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────┘
```

- **Bloco:** `rounded-xl border border-dourado-200 bg-white p-5`, o mesmo acabamento do cartão do card 77. Título `h2` "Fale com o coletivo".
- **A regra de LGPD não muda** (PRD do Frontend, seção 5.2): o bloco só existe se houver algum contato, e cada botão, ícone e rótulo vive dentro da condição do seu campo. O `BotaoCopiar` fica dentro do `{coletivo.telefone && (...)}`.

### Botões de Instagram, e-mail e site

- A lista de botões é montada só com os contatos presentes, nesta ordem: Instagram, e-mail, site. **O primeiro da lista é o `default` (azul cheio) e os outros são `outline`.** Assim o destaque nunca fica num contato que o coletivo não autorizou.
- Cada um é `<Button asChild>` com um `<a>` comum (são links para fora do site, não `Link`). Ícone com `aria-hidden`: `AtSign`, `Mail` e `Globe`, os mesmos da base visual.
- **Texto do botão é o próprio contato:** `@sementesdovale`, `contato@sementesdovale.org` e `sementesdovale.org`. A vitrine mostra "Instagram", "E-mail" e "Site". Com o endereço escrito, quem está no computador sem programa de e-mail configurado ainda consegue ler e copiar o contato. E quem quer achar o coletivo no aplicativo do Instagram vê o @. Ver "Pontos para confirmar".
- **E-mail longo:** o botão aceita quebra de linha (`h-auto min-h-11 py-2 text-left break-all`). Nada de rolagem horizontal no celular.
- **Instagram e site:** `target="_blank"`, `rel="noopener noreferrer"` e `<span className="sr-only">(abre em nova aba)</span>`.
- **E-mail:** `mailto:`, como hoje.

A normalização continua em `lib/contatos.ts`: `urlDoInstagram`, `arrobaDoInstagram` e `urlDoSite`. Entra uma função nova:

- **`textoDoSite(url)`:** tira o esquema, o `www.` e a barra do fim. `https://www.sementesdovale.org/` vira `sementesdovale.org`; `https://linktr.ee/sementes` vira `linktr.ee/sementes`. O caminho fica porque, num link de agregador, ele é a parte que identifica o coletivo. Se o `URL` não conseguir ler o valor, devolve o texto como veio.

### Telefone

- **Continua texto, sem `tel:`.** A decisão está registrada no código: o campo aceita formato livre, e montar o link exigiria adivinhar DDI e DDD.
- **Linha:** `flex flex-wrap items-center gap-3 rounded-lg bg-azul-50 px-3 py-2`.
- **Ícone `Phone`** com `aria-hidden`, em `text-azul`, e `<span className="sr-only">Telefone: </span>` antes do número. Sem esse texto, o leitor de tela leria só o número solto.
- **Número:** `font-semibold tabular-nums text-azul-900 select-all`. O `select-all` faz um toque selecionar o número inteiro, o que já ajuda a copiar mesmo sem o botão.
- **Botão Copiar** à direita (`ml-auto`).

### `BotaoCopiar`

Novo `src/componentes/BotaoCopiar.tsx`, com `"use client"`. Recebe o texto a copiar e o nome do que é copiado (`texto="(21) 99999-0000"`, `rotulo="telefone"`).

- **Só aparece quando o navegador consegue copiar.** Depois de montar, confere `window.isSecureContext` e `navigator.clipboard?.writeText`. Antes disso, e se não der, não renderiza nada. Sem JavaScript, ou acessando o servidor de desenvolvimento pelo IP da rede local, a página não fica com um botão que não faz nada. O número continua selecionável.
- **Copia o texto exatamente como foi cadastrado.** Sem formatar nem limpar, pelo mesmo motivo do `tel:`.
- **Deu certo:** o ícone troca de `Copy` para `Check` e o texto de "Copiar" para "Copiado" por 2 segundos.
- **Deu errado** (permissão negada, por exemplo): "Não deu para copiar" por 2 segundos.
- **Aviso para o leitor de tela:** um `<span role="status" className="sr-only">` recebe "Telefone copiado" ou "Não foi possível copiar o telefone". Só trocar o texto do botão nem sempre é anunciado.
- O temporizador é limpo quando o componente sai da tela.
- `Button` com a variante `outline` e o tamanho `sm`. O fundo branco destaca o botão sobre o `azul-50` da linha.

Sem toast: exigiria mais uma biblioteca (o `sonner`, no caso do shadcn), e o aviso no próprio botão resolve.

É a terceira ilha de cliente do site, depois do mapa e do menu do celular. Ela é pequena e só existe no perfil.

## 6. PRD do Frontend

Atualizar o `PRD_Implementacao_Frontend_Publico_v1.md`, citando este PRD como origem:

- **Seção 4.1:** nova linha na tabela da stack: "Componentes de interface | **shadcn/ui** (base Radix), copiado para `src/componentes/ui/` | Só Input, Button, Badge e Pagination, com as cores da paleta e sem `dark:`. Não é pacote: o código é do projeto. Origem: PRD de componentes". A frase "Nenhuma biblioteca de componentes, …" passa a ser: "Nenhuma biblioteca de componentes instalada como pacote. O shadcn/ui é a exceção, porque o código fica no projeto. Nenhum gerenciador de estado, nenhum cliente HTTP (o `fetch` nativo basta)."
- **Seção 5.2:** a regra continua igual, com um acréscimo: "Vale também para o botão de contato e para o botão Copiar: os dois vivem dentro da mesma condição do campo."
- **Seção 7.3:** "Não instalar … biblioteca de componentes" passa a "… biblioteca de componentes em pacote (MUI, Chakra, Mantine e similares). Componente novo do shadcn passa pelo mesmo cuidado do PRD de componentes: cores da paleta e nenhuma classe `dark:`."
- **Seção 12, item 7:** as dependências permitidas passam a incluir as do shadcn/ui (seção 1 deste PRD).
- **Seção 2**, na nota "O que NÃO faz parte do pronto": acrescentar "(biblioteca de componentes revista pelo PRD de componentes)". No item 3, a categoria passa a aceitar mais de um valor.
- **Seção 3.3:** `categoria` aceita repetição (combinação com "e"), e o parágrafo "Não há endpoint de catálogo" dá lugar ao `/api/filtros/coletivos/` e ao `/api/filtros/eventos/`.
- **Seções 4.4 e 10.2:** o mapa deixa de ser a única ilha de cliente. A busca e o painel de filtros também são, só para enviar o formulário sem recarregar a página, e funcionam sem JavaScript.
- **Seção 10.6:** a decisão é revista. O clique no cartão continua, e o painel de filtros se soma a ele, com as opções vindas da API.

## Requisitos de implementação

Uma branch criada pelo desenvolvedor a partir da `staging`, já com o card 77 (regra do `CLAUDE.md` da raiz). Um commit por entrega, cada um com aval do desenvolvedor, para a revisão poder ir por partes.

1. **shadcn/ui:** `init`, desfazer o que não fica, ajustar o `components.json` e rodar o `add` dos quatro componentes (seção 1). Registrar no PR as dependências e versões.
2. **Paleta nos componentes:** trocar as cores, tirar `dark:`, `aria-invalid:`, `destructive` e `cn-*`, aplicar o foco e as variantes da seção 1. Pagination com o `Link` e em português. Teste de guarda da pasta `ui/` (ver "Testes").
3. **Busca:** `FormularioDeBusca` com `Input`, lupa, `Button` e envio automático (seção 2).
4. **Filtros:** `PainelDeFiltros` e `CamposDeFiltro` nas duas listagens, `lib/filtros.ts`, `FiltrosAtivos` com `Badge` e "Limpar tudo", e os chips de categoria do cartão e do perfil (seção 3).
   - **Backend (PR próprio):** `/api/filtros/coletivos/`, `/api/filtros/eventos/` e `categoria` repetida combinando com "e", com testes e o README da API atualizado. O backend vai para o ar antes do frontend; do contrário, o painel mostra o aviso de opções indisponíveis.
5. **Paginação:** `lib/paginacao.ts` e o `Paginacao` novo (seção 4).
6. **Contato:** `textoDoSite`, `BotaoCopiar` e o bloco "Fale com o coletivo" (seção 5).
7. **PRD do Frontend** (seção 6).
8. `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` verdes. Conferir também o build do Dockerfile.
9. **Lighthouse** antes e depois (seção "Acessibilidade e celular"). Números no PR.
10. O desenvolvedor abre o PR com o `template_pr.md`, cola o link no card e move para Code Review.

**Para ver a paginação na tela:** o backend local precisa de mais de 20 coletivos (mais de 140 para aparecerem as reticências no desktop). Criar pelo `manage.py shell` no ambiente local. Nunca na homologação. A importação por planilha no Admin, que facilitaria isto, é um card à parte.

## Testes

Os testes atuais do `PerfilDoColetivo` procuram o link pelo nome (`@sementesdovale`, `contato@sementesdovale.org`) e os ícones pela classe (`.lucide-phone`, `.lucide-mail`…). Como o texto dos botões é o próprio contato, eles devem passar sem mudança. Se algum quebrar, atualizar a busca, não apagar o teste.

Novos testes:

- **`paginacao.test.ts`:** os oito casos da tabela da seção 4, com os dois valores de `vizinhos`. Mais `atual` acima do total (`30 / 20` dá o mesmo que `20 / 20`) e o tamanho máximo da lista (7 e 5).
- **`Paginacao.test.tsx`:**
  - Com 20 itens ou menos, nada é renderizado.
  - Na página 1 não há link "Anterior"; na última não há "Próxima".
  - A página atual tem `aria-current="page"` e não é link.
  - Os links mantêm `q` e `categoria` e trocam só `page`.
  - As reticências têm `aria-hidden`.
  - O jsdom não aplica CSS, então as duas listas (celular e desktop) estão no DOM ao mesmo tempo. Usar `within` em cada lista, ou `getAllBy…`, em vez de esperar um resultado só.
- **`FormularioDeBusca.test.tsx`:** formulário GET; campos ocultos para `categoria` (um por valor) e `bairro`; nenhum campo oculto para `page` nem para `q`; campo `type="search"` com `name="q"` e o valor atual; `label` ligado ao campo; lupa com `aria-hidden`. Envio automático, com `vi.useFakeTimers` e espião no `requestSubmit`: espera 400 ms depois da última tecla e envia uma vez; não envia com uma letra; apagar tudo envia; não reenvia o que já está na URL; enviar com Enter cancela o envio pendente; sem botão, com um campo de texto só e `enterkeyhint="search"`.
- **`filtros.test.ts`:** um filtro por categoria, mais o bairro; id quando o nome não está nas opções; busca e página não são filtro; datas no formato da tela; data fora do formato ignorada; `dataDoFiltro` só com dia que existe.
- **`FiltrosAtivos.test.tsx`:**
  - Sem filtro, nada é renderizado.
  - Com um filtro: um chip, sem "Limpar tudo".
  - O `href` do chip tira só o seu filtro e a `page`; com duas categorias, remover uma mantém a outra.
  - "Limpar tudo" tira os filtros e a `page` e mantém `q`; na agenda, mantém a aba.
  - Cada chip tem o texto "(remover este filtro)".
- **`PainelDeFiltros.test.tsx`:** começa fechado; abre pelo botão e fecha pelo X e ao aplicar; contador "Filtros 2 ativos"; campos ocultos só com o que não é do painel nem `page`; "Limpar" mantém a busca; categorias da URL marcadas, todas com `name="categoria"`; bairro selecionado com outra grafia, e mantido quando não está na lista; aviso sem as opções; datas com `min` e `max` cruzados, e data fora do formato ignorada.
- **`api.test.ts` e `api.respostas.test.ts`:** lista vira chave repetida no `montarUrl`; as opções dos filtros voltam `null`, e não `notFound()`, com `404` ou backend fora do ar.
- **`consulta.test.ts`:** `todos()`, e `comParametros` mantendo e escrevendo chave repetida.
- **`CartaoColetivo`:** o link de categoria continua com `relative z-10` e soma a categoria às já marcadas.
- **`PerfilDoColetivo`:**
  - Sem consentimento: além do que já é testado, nenhum "Fale com o coletivo" e nenhum `.lucide-copy`.
  - Com os três contatos, a ordem dos links é Instagram, e-mail, site.
  - O site aparece como `sementesdovale.org`, com o `href` completo.
  - Instagram e site têm o texto "(abre em nova aba)".
  - Só com telefone: nenhum link de contato, e a linha do telefone com "Telefone:" em `sr-only`.
- **`BotaoCopiar.test.tsx`:** o jsdom não tem `navigator.clipboard`. Simular com `Object.defineProperty` (e `isSecureContext`).
  - Sem a API, nada é renderizado.
  - Com a API, o clique chama `writeText` com o texto exato, mostra "Copiado" e o `status` anuncia "Telefone copiado".
  - Com `writeText` rejeitando: "Não deu para copiar".
  - Com `vi.useFakeTimers`, depois de 2 segundos o texto volta a "Copiar".
- **`contatos.test.ts`:** `textoDoSite` com `www` e barra no fim, com caminho, e com valor que não é URL.
- **`src/componentes/ui/paleta.test.ts`** (guarda): lê os arquivos da pasta `ui/` e falha se encontrar:
  - `dark:`;
  - cor do Tailwind fora da paleta (`neutral-`, `zinc-`, `slate-`, `gray-`, `stone-`);
  - nome de cor do shadcn (`bg-primary`, `text-muted-foreground`, `border-input`, `ring-ring` e similares);
  - hex solto.

  É barato, e pega o caso de alguém rodar `shadcn add` de novo no futuro e esquecer da adaptação.

## Acessibilidade e celular

- **Foco:** contorno `azul` de 2 px em todos os componentes novos.
- **Contraste:** conferir no PR os pares abaixo. Os valores foram calculados com os hex do `globals.css`.

  | Par | Uso | Mínimo | Medido |
  | --- | --- | --- | --- |
  | `bege` sobre `azul` | Chip ativo, página atual, botão principal, contador do botão Filtros | 4,5 | 7,4 |
  | `bege` sobre `azul-700` | Hover do botão principal | 4,5 | 5,6 |
  | `azul` sobre branco | Botões `outline` e `ghost`, Limpar tudo | 4,5 | 8,4 |
  | `azul-800` sobre `azul-50` | Chip de categoria | 4,5 | 7,9 |
  | `azul-900` sobre `azul-50` | Número do telefone | 4,5 | 9,7 |
  | `texto/60` sobre branco | Placeholder da busca | 4,5 | 4,6 |
  | `azul-500` sobre branco | Borda do campo de busca | 3 | 3,6 |
  | `azul` sobre `bege` | Contorno de foco | 3 | 7,4 |

- **Alvos de toque:** campo de busca, botão Filtros e botões de contato com 44 px; números da paginação com 40 px; chips com 32 px e Copiar com 36 px, todos acima dos 24 px do WCAG 2.5.8 e com pelo menos 8 px entre eles.
- **Celular (360 px):** busca numa linha só; paginação em até 304 px; botões de contato quebram de linha; e-mail longo quebra dentro do botão. Nada de rolagem horizontal.
- **Sem JavaScript:** busca, filtros e paginação continuam funcionando (são formulário GET e links). A busca só não sai sozinha: envia com Enter, e o painel de filtros aparece como `<details>`. O botão Copiar não aparece, e o número continua selecionável.
- **Leitor de tela:** o total de resultados em `aria-live`; "Filtros 2 ativos" no botão; o painel com o título "Filtros"; "Página 3" nos números; a página atual anunciada como atual; "(remover este filtro)" nos chips; "(abre em nova aba)" no Instagram e no site; "Telefone:" antes do número; a cópia anunciada pelo `role="status"`.
- **Lighthouse:** medir antes de começar (`next build && next start`, aba anônima, modo celular) em `/coletivos`, `/coletivos?page=2`, `/eventos` e no perfil de um coletivo com os três contatos. Depois, as mesmas páginas. Acessibilidade e Desempenho não podem cair. As dependências novas são pequenas, mas o `BotaoCopiar` leva o `Button` e o `cn` para o navegador: olhar o peso do JavaScript da página de perfil.

## Critérios de aceite

- [ ] shadcn/ui com só Input, Button, Badge e Pagination, em `src/componentes/ui/`
- [ ] `globals.css` sem nenhuma mudança vinda do shadcn; sem `tw-animate-css` nem o pacote `shadcn` no `package.json`
- [ ] Componentes com as cores da paleta, sem `dark:` e com o foco em `outline-azul` (teste de guarda passando)
- [ ] Busca com lupa, foco visível, borda com 3:1 e texto de 16 px no celular
- [ ] Busca automática com espera de 400 ms, mínimo de 2 letras e `replace` no histórico, sem botão Buscar (Enter envia)
- [ ] Formulário de busca continua GET, sem JavaScript obrigatório
- [ ] Painel de filtros nas duas listagens: categorias (mais de uma, com "e") e bairro em coletivos; datas e bairro na agenda
- [ ] Painel acessível (foco preso, `Esc`, foco volta ao botão) e funcionando sem JavaScript
- [ ] Endpoint de opções e categoria múltipla no backend, com testes e README
- [ ] Filtros ativos em chips com botão de remover, um por valor, e "Limpar tudo" com dois filtros ou mais
- [ ] Chips de categoria do cartão e do perfil com o mesmo componente, ainda clicáveis por cima do link esticado
- [ ] Paginação com números, página atual destacada, reticências, Anterior e Próxima
- [ ] Paginação lendo e gravando `page` na URL e preservando os outros filtros
- [ ] Paginação cabe em 360 px
- [ ] Contato com botões de ícone para Instagram, e-mail e site, cada um só quando o campo vem na API
- [ ] Telefone como texto, sem `tel:`, com botão Copiar que só aparece quando o navegador consegue copiar
- [ ] Regressão de LGPD passando (nenhum botão, ícone ou rótulo de contato sem o dado)
- [ ] PRD do Frontend atualizado (seções 2, 4.1, 5.2, 7.3 e 12)
- [ ] Funciona em celular e desktop
- [ ] Lighthouse sem queda em Acessibilidade e Desempenho (números no PR)
- [ ] Lint, typecheck, testes, `next build` e build do Docker verdes

## Fora do escopo

- **Abas da agenda** ("Próximos" e "Já aconteceram") no estilo do `Button`. É uma troca simples depois, com o `buttonVariants`.
- **Sheet do shadcn no menu do celular.** O PRD da base visual decidiu pelo `<dialog>` nativo.
- **Combinação com "ou"** entre categorias. Os filtros combinam com "e", por decisão do desenvolvedor.
- **Mais de um bairro.** Um coletivo tem um bairro só, e com "e" dois bairros sempre dariam vazio.
- **Importação de coletivos por planilha no Django Admin** (`django-import-export`). Card próprio no Trello.
- **Índice `pg_trgm` para a busca.** Só faz falta com muito mais registros do que a rede tem hoje.
- **Link `tel:` e botão de WhatsApp.** Os dois dependeriam de um telefone em formato padronizado, o que pede mudança no cadastro.
- **Toast** para o aviso de cópia.
- **Cor por categoria nos chips.**
- **Tema escuro.**

## Pontos confirmados

Todos seguiram a recomendação, por decisão do desenvolvedor em 12/10:

- [x] **Base Radix** em vez de Base UI (seção 1). O motivo é o `asChild` com links.
- [x] **Paleta direto nas classes**, sem a camada de nomes do shadcn (`--primary` e similares).
- [x] **Texto dos botões de contato é o próprio contato** (@, e-mail e domínio do site), e não "Instagram", "E-mail" e "Site" como na vitrine (seção 5).
- [x] **"Limpar tudo" só com dois filtros ou mais**, e mantendo a busca digitada (seção 3).
- [x] **Chip com o tipo do filtro** ("Categoria: Alimentação"). A vitrine mostra só o valor ("Alimentação").
- [x] **Chips de categoria do cartão e do perfil também como `Badge`.**
- [x] **Botão Copiar só aparece quando o navegador consegue copiar** (seção 5).

Acrescentados na revisão:

- [x] **Busca automática** enquanto a pessoa digita, sem deixar o site lento (seção 2).
- [x] **Painel de filtros** com mais de uma categoria, combinando com **"e"**: categorias e bairro em coletivos; intervalo de datas e bairro na agenda (seção 3).
