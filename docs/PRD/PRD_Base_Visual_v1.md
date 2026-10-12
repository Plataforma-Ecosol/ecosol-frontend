# PRD — Base visual: ícones, fonte dos títulos, tons, data e menu

02/10/2026 · Jean Macedo

## Contexto e objetivo

Na reunião de 02/10, a equipe achou o visual do site amador e decidiu deixar a plataforma com "menos cara de genérico". O trabalho foi dividido em três cards. Este é a parte 1: a base visual que os outros dois reaproveitam.

**História:** como visitante, quero um site com identidade própria e informação fácil de achar, para confiar na rede e encontrar o que procuro rápido.

- **Card:** [\[Identidade visual\] Base visual: ícones, fonte dos títulos, tons, data e menu · 8 pts](https://trello.com/c/GRj5cVdC/75-identidade-visual-base-visual-%C3%ADcones-fonte-dos-t%C3%ADtulos-tons-data-e-menu-8-pts) (Sprint Backlog, Sprint 1)
- **Vitrine com antes e depois:** [Vitrine de melhorias da Plataforma ES](https://claude.ai/artifact/KKQw4WQSrecSUGkbtSrL7W), fichas 1 a 5 (Ícones, Fonte, Data, Menu e Tons)
- **PRDs anteriores:** paleta de cores (`docs/PRD/PRD_Paleta_de_Cores_v1.md`) e logo (`docs/PRD/PRD_Logo_Casa_Azul_v1.md`). Os seis tokens e o cabeçalho com a logo ficam como estão; este PRD só acrescenta.
- **Próximos cards:** [parte 2, componentes](https://trello.com/c/VAmieHmr/76-identidade-visual-componentes-busca-filtros-pagina%C3%A7%C3%A3o-e-contato-do-coletivo-5-pts) (busca, filtros, paginação e contato, com shadcn/ui) e [parte 3, fotos](https://trello.com/c/ZEjnd7dr/77-identidade-visual-fotos-cart%C3%A3o-do-coletivo-e-abertura-da-home-5-pts). A parte 2 depende dos ícones e dos tons deste card.
- **Escopo:** só o frontend Next.js (`apps/ecosol-frontend`). Nada muda na API nem no backend.

São cinco entregas, cada uma numa seção abaixo:

| # | Entrega | Onde mexe | Dependência nova |
| --- | --- | --- | --- |
| 1 | Ícones | Cartões de evento e coletivo, página do evento, perfil (contato) | `lucide-react` |
| 2 | Fonte dos títulos | `layout.tsx`, `globals.css` e títulos | `next/font` (já vem com o Next) |
| 3 | Tons da paleta | `globals.css` | Nenhuma |
| 4 | Data em calendário | `CartaoEvento`, `lib/datas.ts`, novo `BlocoDeData` | Nenhuma |
| 5 | Menu | `layout.tsx`, nova navegação de cliente | Nenhuma |

## 1. Ícones

Ícones ao lado de data, horário, local, bairro e contato. A informação é lida mais rápido e o site deixa de ser só texto.

- **Pacote:** `lucide-react` (versão atual: 1.50.0). Importar cada ícone pelo nome (`import { MapPin } from "lucide-react"`). O build leva só os ícones importados.
- **Sempre com texto ao lado.** O ícone nunca é a única informação. Por isso vai com `aria-hidden` e sem `title`.
- **Tamanho e cor:** `size-4` (16 px) e `shrink-0`, alinhado ao texto com `inline-flex items-center gap-1.5`. Cor `text-dourado-escuro` nos metadados, igual à vitrine. O dourado claro não passa no contraste como texto, mas ícone ao lado de texto conta como decoração.

Mapa dos ícones:

| Informação | Ícone | Onde aparece |
| --- | --- | --- |
| Data | `CalendarDays` | Página do evento (no cartão, a data vira o bloco da seção 4) |
| Horário | `Clock` | Cartão do evento e página do evento |
| Local / bairro | `MapPin` | Cartão do evento, cartão do coletivo, página do evento, perfil |
| Telefone | `Phone` | Perfil do coletivo, bloco Contato |
| E-mail | `Mail` | Perfil do coletivo, bloco Contato |
| Instagram | `AtSign` | Perfil do coletivo, bloco Contato |
| Site | `Globe` | Perfil do coletivo, bloco Contato |
| Menu do celular | `Menu` e `X` | Cabeçalho (seção 5) |

O lucide removeu os ícones de marca na versão 1.x. Não existe `Instagram` no pacote, por isso o `AtSign`. Não baixar SVG da marca nem instalar outro pacote só para isso.

**Regra de LGPD que continua valendo** (PRD do Frontend, seção 2, item 6): contato sem consentimento não deixa ícone órfão. O ícone fica **dentro** do mesmo `{coletivo.telefone && (...)}` que já protege o rótulo e o valor. Nunca fora dele.

No bloco Contato, o ícone entra só ao lado do rótulo (`dt`). O layout em botões é da parte 2; aqui não muda a estrutura do `dl`.

## 2. Fonte dos títulos

Uma fonte própria só nos títulos. O texto corrido continua na pilha de fontes do sistema, que já está no `globals.css`.

- **Fonte:** Bricolage Grotesque (escolha padrão da vitrine). As outras opções do card eram Baloo 2 e Fraunces. Trocar depois é trocar uma linha no `layout.tsx`.
- **Carregamento:** `next/font/google`, com `weight: "700"`, `subsets: ["latin"]`, `display: "swap"` e `variable: "--font-bricolage"`. Um peso só. A variável tem o nome da fonte; o token do tema (`--font-titulo`) aponta para ela. Se a fonte mudar, só a variável muda.
- **Onde aplica:** `h1`, `h2` e títulos de cartão. O título do cartão de evento é `h3`, então ele recebe a classe direto; os demais `h3` (lista de pontos do mapa) ficam na fonte do sistema.

Como ligar:

```ts
// src/app/layout.tsx
import { Bricolage_Grotesque } from "next/font/google";

const fonteDosTitulos = Bricolage_Grotesque({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

// <html lang="pt-BR" className={fonteDosTitulos.variable}>
```

```css
/* src/app/globals.css */
@theme inline {
  --font-titulo: var(--font-bricolage), system-ui, sans-serif;
}

@layer base {
  h1, h2 { font-family: var(--font-titulo); }
}
```

Com isso existe a classe `font-titulo` para o `h3` do cartão de evento. A regra do `h1, h2` fica **dentro** de `@layer base`, senão ela vence as classes do Tailwind (o mesmo problema já documentado no `globals.css` sobre o `body`).

**Peso:** só o 700 é baixado. Os títulos que hoje usam `font-medium` ou `font-semibold` passam para `font-bold`. Sem isso o navegador usa o 700 de qualquer jeito, mas a classe fica mentindo sobre o que aparece.

**Atenção no build:** o `next/font/google` baixa a fonte **durante o `next build`**, não no celular do visitante. O CI, o Dockerfile e a Vercel precisam de acesso a `fonts.googleapis.com` e `fonts.gstatic.com` no build. Se algum deles não tiver rede, trocar por `next/font/local` com o `.woff2` versionado em `src/app/fontes/`. O resultado na tela é o mesmo.

**Custo:** um arquivo `woff2` de poucas dezenas de KB, servido pelo próprio site, com `preload` automático. Nenhum pedido ao Google parte do navegador.

## 3. Tons da paleta

Hoje há seis cores e o resto sai por transparência (`text-texto/75`). Com tons claros e escuros de cada cor dá para criar fundos de seção, hover e selos sem sair da identidade. A parte 2 usa esses tons nos chips e na paginação.

Passo a passo:

1. Colar cada hex no [uicolors.app](https://uicolors.app): `#33469B` (azul), `#BD9D55` (dourado) e `#F65608` (laranja).
2. Exportar como Tailwind v4 e renomear para `azul-50` … `azul-950`, `dourado-50` … `dourado-950` e `laranja-50` … `laranja-950`.
3. Colar no `@theme` do `globals.css`, **abaixo** dos seis tokens atuais.

Regras:

- **Os seis tokens atuais não mudam.** `azul`, `bege`, `dourado`, `dourado-escuro`, `laranja` e `texto` continuam com os mesmos hex. Os tons são acréscimo. Assim nada do que já foi feito na paleta e na logo precisa ser revisto.
- O uicolors coloca o hex de entrada em algum degrau da escala (o azul deve cair entre 700 e 800). Esse degrau vai ter o mesmo valor do token base. Não é problema: o token base continua sendo o que se usa para "a cor da marca".
- `bege` não ganha escala. Ele já é fundo, e o `dourado-50`/`100` cobre os bege mais escuros.
- Nenhum componente usa hex solto. Vale a mesma regra do PRD da paleta.

**Contraste:** conferir no próprio uicolors (ou no WebAIM) **só os pares usados** e anotar o valor no PR. Os pares previstos neste card e na parte 2:

| Par | Uso previsto | Mínimo |
| --- | --- | --- |
| `azul-800` sobre `azul-50` | Selo e chip (parte 2) | 4,5 |
| `azul` sobre `azul-50` | Link ativo no menu do celular | 4,5 |
| `laranja-700` sobre `laranja-50` | Aviso pontual | 4,5 |
| `dourado-escuro` sobre branco | Dia da semana no bloco de data | 4,5 (já medido: 6,0) |
| `azul-900` sobre branco | Número do dia no bloco de data | 4,5 |

Os valores da vitrine são uma aproximação feita à mão. A escala real é a que sair da ferramenta.

**Lembrete do card:** mudou a escala de cores, repetir no `UNFOLD["COLORS"]` do Admin ([card de identidade visual no Admin](https://trello.com/c/mtbKqBUl/71-admin-identidade-visual-da-casa-azul-no-admin-2-pts)). O Unfold usa escala 50 a 950, então a do azul pode ir inteira para o `primary`.

## 4. Data em calendário

O dia em destaque à esquerda do cartão de evento. Quem rola a agenda acha a data sem ler o texto.

```
┌─────┐
│ OUT │  Formação: precificação justa
│ 20  │  [relógio] 14h   [pino] Casa Paul Singer, Centro
│ TER │
└─────┘
```

**Componente:** `src/componentes/BlocoDeData.tsx`, recebe o ISO de `data_inicio`.

| Parte | Formato | Estilo |
| --- | --- | --- |
| Mês | `OUT` (sem o ponto do `Intl`, em maiúsculas) | Faixa `bg-azul text-bege`, pequeno, negrito |
| Dia | `20` (`2-digit`) | `font-titulo`, grande, `text-azul-900` |
| Dia da semana | `TER` (sem o ponto, em maiúsculas) | Pequeno, `text-dourado-escuro` |

Caixa com `rounded-lg`, borda `border-azul-200`, fundo branco, largura fixa (~64 px). No cartão, grid de duas colunas: bloco à esquerda, conteúdo à direita.

**Datas em `lib/datas.ts`:** nova função `partesDaData(iso)` que devolve `{ mes, dia, diaDaSemana }` ou `null` se a data for inválida. Usa `Intl.DateTimeFormat` com o mesmo `FUSO` fixo do arquivo. Nunca o fuso de quem executa, pelo motivo já explicado no topo do `datas.ts` (o servidor roda em UTC).

Conferido no Node com `2026-10-21T01:30:00Z`: em São Paulo dá `out.`, `20`, `ter.`. É exatamente o caso que quebraria sem o fuso declarado (em UTC seria dia 21, quarta).

**Acessibilidade:** o bloco é visual e leva `aria-hidden`. A data lida pelo leitor de tela fica num `<time dateTime={evento.data_inicio}>` com classe `sr-only`, usando o `formatarDataCurta` que já existe. O `dateTime` com o ISO original continua no HTML, como hoje.

**Horário:** sai do topo do cartão e vai para a linha de metadados, com o ícone `Clock`, ao lado do local com `MapPin`. Evento sem horário de fim mostra só o início (`14h`); com fim no mesmo dia, `14h às 17h`. Evento de vários dias: o bloco mostra o dia de início e o texto mantém o `formatarQuando` completo na página do evento.

**Data inválida:** se `partesDaData` devolver `null`, o cartão não mostra o bloco e volta a exibir o texto cru, como o `formatarDataCurta` já faz. Um registro estranho não derruba a agenda.

**Fica de fora:** o selo de tipo ("Formação", "Feira") da vitrine. Só entra se o backend ganhar um campo de tipo de evento.

## 5. Menu

O menu mostra onde a pessoa está. No celular, os links vão para um painel lateral em vez de quebrar em duas linhas.

### Página atual

- Nova `src/componentes/NavegacaoPrincipal.tsx`, com `"use client"` para ler a rota com `usePathname`. O `layout.tsx` continua sendo servidor e só renderiza o componente.
- A lista `NAVEGACAO` sai do `layout.tsx` e vai para o componente.
- Regra de ativo: rota igual ao `href` recebe `aria-current="page"`. Subpágina da seção (`/coletivos/sementes-do-vale` dentro de Coletivos) recebe `aria-current="true"`, que tem o mesmo destaque visual. Na home nenhum link fica ativo.
- Estilo puxado pelo atributo, sem estado duplicado: `aria-[current]:bg-bege/15 aria-[current]:font-semibold`, mais o sublinhado `laranja` de 3 px embaixo do link (o laranja aqui é o acento pontual previsto na paleta).
- Links viram "pílulas" (`rounded-full px-3 py-1.5`), com `hover:bg-white/10`. O foco visível continua.

### Menu no celular

Abaixo de `sm` (640 px), os três links somem do cabeçalho e aparece um botão "Menu" com o ícone `Menu`. O botão abre um painel que entra pela direita.

**Decisão: o painel é um `<dialog>` nativo aberto com `showModal()`, sem o Sheet do shadcn.** O shadcn só é liberado no card da parte 2, e o Sheet dele traz o `@radix-ui/react-dialog`. O `<dialog>` modal já entrega o que o Sheet daria: foco preso dentro do painel, `Esc` fecha, o resto da página fica inerte e o foco volta ao botão ao fechar. Se a equipe preferir o Sheet, a troca pode ser feita na parte 2, sem mudar o comportamento.

Comportamento:

- Botão com `aria-haspopup="dialog"` e texto visível "Menu" (o ícone é `aria-hidden`).
- Painel: fundo branco, links em `text-azul`, o ativo com `bg-azul-50` e barra `laranja` à esquerda. Botão de fechar com o ícone `X` e `aria-label="Fechar menu"`.
- Fecha ao tocar num link, ao trocar de rota (efeito no `pathname`), ao tocar fora (no `::backdrop`) e com `Esc`.
- Fundo escurecido no `::backdrop` com `bg-azul-900/40`.
- Animação de entrada curta (até 200 ms) e desligada com `motion-reduce:`.

**Sem JavaScript:** o botão não abre nada. Para não deixar o celular sem menu, um `<noscript>` renderiza os três links em linha, como hoje. É o mesmo cuidado da busca, que funciona com `method="get"`.

**Desktop (a partir de `sm`):** igual a hoje, com o destaque da página atual. Logo e nome à esquerda, menu à direita.

## Requisitos de implementação

Uma branch saindo da `staging`, um commit por entrega, para a revisão poder ir por partes.

1. `npm i lucide-react` e registrar a versão instalada no PR.
2. **Tons:** gerar as escalas no uicolors e colar no `@theme` (seção 3). Anotar os contrastes no PR.
3. **Fonte:** `next/font/google` no `layout.tsx` e a regra em `@layer base` (seção 2). Trocar `font-medium`/`font-semibold` por `font-bold` nos títulos. Atualizar o comentário do `globals.css` que diz "sem nenhuma fonte externa": continua valendo para o texto corrido.
4. **Data:** `partesDaData` em `lib/datas.ts`, `BlocoDeData.tsx` e novo layout do `CartaoEvento` (seção 4).
5. **Ícones:** cartão de evento, cartão de coletivo (bairro), página do evento e bloco Contato do perfil (seção 1).
6. **Menu:** `NavegacaoPrincipal.tsx` com página atual e painel do celular (seção 5).
7. **PRD do Frontend** (`PRD_Implementacao_Frontend_Publico_v1.md`):
   - Seção 4.1: incluir `lucide-react` (ícones) e `next/font` (fonte dos títulos) na tabela da stack.
   - Seção 9: trocar "Nenhuma fonte externa" por "Uma fonte só nos títulos, via `next/font`, um peso e subset latino, servida pelo próprio site. Texto corrido na fonte do sistema."
   - Seção 12, item 7: as dependências permitidas passam a incluir `lucide-react`.
   - Citar este PRD como origem da mudança.
8. Rodar `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` até ficarem verdes. Conferir também o build do Dockerfile (por causa do download da fonte).
9. Lighthouse antes e depois (seção Acessibilidade e celular). Colar os números no PR.
10. Abrir o PR, colar o link no card e mover para Code Review.

## Testes

Os testes atuais de `CartaoEvento`, `CartaoColetivo` e `PerfilDoColetivo` buscam texto. Se algum quebrar porque a data saiu do topo do cartão, atualizar a busca, não apagar o teste.

Novos testes:

- **`datas.test.ts`:** `partesDaData("2026-10-21T01:30:00Z")` devolve `OUT`, `20`, `TER` (o caso da virada de dia em UTC). Data inválida devolve `null`.
- **`BlocoDeData`:** renderiza mês, dia e dia da semana, e o bloco tem `aria-hidden`.
- **`CartaoEvento`:** continua com `<time dateTime>` igual ao ISO original. Com data inválida, mostra o texto cru e não quebra.
- **`PerfilDoColetivo` (regressão de LGPD):** coletivo sem `telefone` não tem nenhum ícone de telefone no HTML. O mesmo para e-mail e Instagram.
- **`NavegacaoPrincipal`:** com `usePathname` simulado em `/eventos`, o link Agenda tem `aria-current="page"` e os outros não têm o atributo. Em `/coletivos/um-slug`, Coletivos tem `aria-current="true"`. Na home, nenhum.
- **Menu do celular:** o botão abre o painel e o `Esc` fecha. O jsdom não implementa `showModal()` por completo; se for o caso, simular `HTMLDialogElement.prototype.showModal` no `vitest.setup.ts` e testar só o que é do componente.

## Acessibilidade e celular

- **Ícones:** sempre `aria-hidden`, sempre com texto ao lado. Nenhum botão só com ícone sem `aria-label`.
- **Contraste:** os pares da seção 3 acima de 4,5:1. O sublinhado laranja do menu é detalhe, não texto.
- **Menu:** `aria-current` nos dois tamanhos de tela; foco preso no painel aberto; foco volta ao botão ao fechar; alvo de toque de pelo menos 44 px nos links do painel.
- **Celular (360 px):** cabeçalho numa linha só (logo, nome e botão "Menu"). Bloco de data e conteúdo do cartão lado a lado sem rolagem horizontal.
- **Movimento:** animação do painel desligada com `prefers-reduced-motion`.
- **Lighthouse:** medir antes de começar (`next build && next start`, aba anônima, modo celular) nas páginas `/`, `/eventos` e um perfil de coletivo. Depois, as mesmas páginas. Acessibilidade e Desempenho não podem cair.

## Critérios de aceite

- [ ] `lucide-react` instalado, importando só os ícones usados
- [ ] Ícones em data, horário, local, bairro e contato, sempre ao lado de texto e com `aria-hidden`
- [ ] Nenhum ícone de contato sem o dado correspondente (regressão de LGPD passando)
- [ ] Fonte dos títulos via `next/font`, um peso só, subset latino, só em `h1`, `h2` e títulos de cartão
- [ ] Texto corrido continua na fonte do sistema
- [ ] Escalas de azul, dourado e laranja no `@theme`, sem mudar os seis tokens atuais
- [ ] Contraste AA conferido e anotado no PR para os pares usados
- [ ] `BlocoDeData` nos cartões de evento, com fuso fixo de São Paulo
- [ ] Link da página atual com `aria-current` e destaque visual
- [ ] No celular, menu em painel lateral, sem quebrar em duas linhas
- [ ] PRD do Frontend atualizado (seções 4.1, 9 e 12)
- [ ] Funciona em celular e desktop
- [ ] Lighthouse sem queda em Acessibilidade e Desempenho (números no PR)
- [ ] Lint, typecheck, testes, `next build` e build do Docker verdes

## Fora do escopo

- Mapa: fundo novo e pino com cor por tipo (ficou para depois)
- Selo de tipo de evento ("Formação", "Feira"): depende de um campo de tipo no backend
- Busca, filtros, paginação e contato em botões, e o shadcn/ui (parte 2)
- Foto no cartão do coletivo e abertura nova da home (parte 3)
- Cores e fonte no Django Admin (card do Admin; ver lembrete na seção 3)
- Tema escuro

## Pontos para confirmar

- [ ] **Fonte:** Bricolage Grotesque, padrão da vitrine. Se a equipe preferir Baloo 2 ou Fraunces, decidir antes do commit da fonte.
- [ ] **Painel do celular com `<dialog>` nativo** em vez do Sheet do shadcn (motivo na seção 5).
- [ ] **Subpágina com `aria-current="true"`:** o card fala só em `page`. A proposta aqui é marcar também a seção quando se está num perfil de coletivo ou num evento.
