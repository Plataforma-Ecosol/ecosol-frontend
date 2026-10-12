# PRD — Paleta de cores da plataforma

01/10/2026 · Jean Macedo

## Contexto e objetivo

A plataforma troca o visual verde/pedra (`emerald`, `stone`) pelas cores da Casa da Economia Solidária Paul Singer: azul, bege e dourado. É a prioridade 1 pedida pela Casa Azul na reunião de alinhamento, e deve entrar antes de qualquer tela nova.

**História:** como visitante, quero reconhecer as cores da Casa da Economia Solidária no site para saber que a plataforma é da rede.

- **Card:** [\[Identidade visual\] Adotar as cores azul, bege e dourado · 3 pts](https://trello.com/c/CNjDoiKZ/57-identidade-visual-adotar-as-cores-azul-bege-e-dourado-3-pts) (Em Andamento)
- **Origem das cores:** [\[Identidade visual\] Definir paleta, tipografia e logo da Casa Azul](https://trello.com/c/xqT5CSnP/54-identidade-visual-definir-paleta-tipografia-e-logo-da-casa-azul-2-pts) (Concluído, Sprint 1)
- **Por que agora:** o visual foi validado há pouco. Trocar agora é barato; fazer duas vezes depois é caro.
- **Escopo:** frontend Next.js com Tailwind 4. O Django Admin fica para o card [\[Admin\] Identidade visual da Casa Azul no Admin](https://trello.com/c/mtbKqBUl/71-admin-identidade-visual-da-casa-azul-no-admin-2-pts), que deve reaproveitar os mesmos valores.

## Paleta

Seis tokens entram agora: as cinco cores da marca e um token para o texto escuro. Não existe manual oficial da marca; a orientação da Casa Azul foi passada pessoalmente. Por isso, os hex extraídos da logo em 22/09 passam a ser a referência do projeto.

| Token | Hex | Onde aparece / origem | Papel |
| --- | --- | --- | --- |
| `azul` | `#33469B` | Pino e "PAUL SINGER" | Dominante: marca e ações |
| `bege` | `#F6F0DC` | Fundo claro | Dominante: fundos |
| `dourado` | `#BD9D55` | "CASA DA ECONOMIA SOLIDÁRIA" | Apoio: só detalhes |
| `dourado-escuro` | `#7A6028` | Variação criada para texto, passa no contraste | Apoio: texto dourado |
| `laranja` | `#F65608` | Moldura da imagem recebida | Acento: uso pontual, não dominante |
| `texto` | `#1C1917` | Mesmo valor do `stone-900` atual | Texto principal |

Bloco a colocar em `globals.css`:

```css
@theme {
  --color-azul: #33469B;
  --color-bege: #F6F0DC;
  --color-dourado: #BD9D55;
  --color-dourado-escuro: #7A6028;
  --color-laranja: #F65608;
  --color-texto: #1C1917;
}
```

Com isso o Tailwind 4 gera as classes `bg-azul`, `text-azul`, `border-dourado`, `text-dourado-escuro`, `bg-bege`, `bg-laranja`, `text-texto` e afins.

## Uso das cores

Azul é a cor de ação e de marca; bege é fundo; dourado é só enfeite. Regras do card:

- **Texto principal:** `texto` sobre branco ou bege
- **Links, botões e cabeçalho:** azul, ou bege sobre azul
- **Dourado original:** só em detalhes (bordas, divisores, ícones), nunca em texto
- **Texto dourado:** sempre `dourado-escuro`
- **Laranja:** acento pontual, sem dominar a tela. Ex.: selo de destaque, ícone de alerta, detalhe de borda. Em texto, só título grande (3,4:1 sobre branco)

Aplicação sugerida por componente (todos estão na lista de revisão do card):

| Componente | Fundo | Texto / ícone | Detalhe |
| --- | --- | --- | --- |
| Cabeçalho | `azul` | `bege` | Linha inferior `dourado` |
| Botão primário | `azul` | Branco ou `bege` | — |
| Botão secundário | Branco ou `bege` | `azul` | Borda `azul` |
| Links | — | `azul` | Sublinhado no hover |
| Cartões | Branco | Escuro; título `azul` | Borda ou divisor `dourado` |
| Filtros | Branco ou `bege` | Escuro | Selecionado em `azul` |
| Paginação | — | `azul` | Página atual: fundo `azul`, texto `bege` |
| Mapa (pino) | — | Pino `azul` | Contorno `dourado` |
| Rodapé | `azul` ou `bege` | `bege` sobre azul, ou escuro sobre bege | Divisor `dourado` |
| Fundo da página | Branco ou `bege` | Escuro | — |

A tabela é uma proposta para a implementação; o card fixa só as regras acima.

## Requisitos de implementação

Tudo passa pelos tokens do `@theme`; nenhum componente usa hex solto.

1. Adicionar o bloco `@theme` da seção Paleta em `globals.css` (Tailwind 4).
2. Buscar e trocar todas as classes `emerald-*` e `stone-*` pelos tokens novos. Ponto de partida: `grep -rnE "emerald|stone" src/`.
3. Revisar componente por componente: cabeçalho, cartões, filtros, paginação, pino do mapa e rodapé.
4. O pino do mapa pode estar definido fora do Tailwind (SVG ou opção da biblioteca de mapa). Nesse caso, ler a cor da variável CSS `--color-azul` em vez de repetir o hex.
5. Manter um tema só, claro, conforme a decisão do PR #7. Sem `dark:`.
6. Rodar os testes e o `next build` até ficarem verdes. Se houver snapshot com classe antiga, atualizar.
7. Abrir o PR, colar o link no card e mover para Code Review.

Os mesmos seis hex devem ir depois para `UNFOLD["COLORS"]` no Django (card do Admin). Vale deixar os valores num só lugar documentado para os dois lados não divergirem.

## Acessibilidade e contraste

Nenhum texto pode ficar abaixo de 4,5:1 (WCAG AA para texto normal; 3:1 vale só para texto grande). Valores do card, recalculados e confirmados:

| Combinação | Contraste | Uso permitido |
| --- | --- | --- |
| Azul sobre branco | 8,4 | Qualquer texto |
| Azul sobre bege | 7,4 | Qualquer texto |
| Bege sobre azul | 7,4 | Qualquer texto (botões, cabeçalho) |
| Dourado-escuro sobre branco | 6,0 | Qualquer texto |
| Dourado-escuro sobre bege | 5,2 | Qualquer texto |
| Laranja sobre branco | 3,4 | Só título grande ou detalhe |
| Dourado sobre azul | 3,3 | Só título grande |
| Dourado sobre branco | 2,6 | Nunca em texto |
| Dourado sobre bege | 2,3 | Nunca em texto |

Para conferir na hora do PR: Lighthouse (aba Acessibilidade) ou a extensão axe DevTools nas páginas principais.

## Critérios de aceite

- [ ] Tokens no `@theme` do Tailwind 4 em `globals.css`, substituindo `emerald` e `stone`
- [ ] Nenhuma classe `emerald-*` ou `stone-*` restante no código
- [ ] Nenhum texto abaixo de 4,5 de contraste
- [ ] Um tema só, claro (PR #7)
- [ ] Revisados: cabeçalho, cartões, filtros, paginação, pino do mapa e rodapé
- [ ] Testes e `next build` verdes

## Fora do escopo

- Logo, favicon e imagem Open Graph (próximo PRD, card "Aplicar a logo da Casa Azul")
- Cores do Django Admin (card próprio, depende deste)
- Tema escuro
- Fonte da marca, enquanto não for definida

## Decisões confirmadas

- Laranja: faz parte da identidade, mas como cor de acento, não dominante.
- Manual da marca: não existe. A orientação foi passada pessoalmente, e os hex deste PRD são a referência.
- Texto escuro: token `--color-texto` com `#1C1917` (mesmo valor do `stone-900`), 17,5:1 sobre branco e 15,3:1 sobre bege. Fica num token próprio para ser reaproveitado no Admin.
