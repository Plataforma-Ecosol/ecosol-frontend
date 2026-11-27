# PRD — Saiba mais: conteúdo inicial dos subgrupos

27/11/2026 · Jean Macedo

## Contexto e objetivo

O card pede três coisas. Duas já foram entregues pelos cards anteriores da história:

| Critério do card | Situação |
| --- | --- |
| Contato e apresentação da Casa Paul Singer em Casa Azul | Feito no #72: o "Quem somos" e o "Fale com a Casa" moram em `/saiba-mais/casa-azul` |
| Imagens otimizadas com `next/image` | Feito no #75: a imagem de cada seção do Admin sai pelo `next/image`, com `alt` |
| Textos de Economia Solidária e ITES/IFRJ validados com a Casa Azul antes do merge | **Este PRD**, com a validação depois da entrega (ver abaixo) |

Falta o conteúdo em si: revisar os textos dos três subgrupos, corrigir o que está errado e entregar à Casa Azul para o feedback.

**Como a validação acontece:** o processo atual da equipe é implementar, entregar e depois receber o feedback da Casa Azul, fazendo as mudanças quando ela pedir. Por isso este card **não espera** a resposta da Casa para o merge, embora o texto do card diga "antes do merge". A validação vira feedback sobre o que já está no ar, e o que a Casa pedir entra num ajuste posterior: pelo Admin, quando for texto das seções, ou por um PR pequeno, quando for texto do código. O erro conhecido é de autoria. A plataforma é desenvolvida **só pela ITES**, e a equipe de desenvolvimento é da ITES. A Casa Azul é consultada e aprova as mudanças. Dois textos publicados dizem outra coisa:

- "A Casa mantém esta plataforma…", no "Quem somos" da Casa (`lib/casa.ts` e a seção `quem-somos` da carga inicial do backend);
- "desenvolve esta plataforma junto com a Casa…", na seção `a-ites` da carga inicial do backend.

**História:** como visitante do portal, quero ler em cada subgrupo um texto correto e aprovado pela Casa Azul sobre a Casa, a economia solidária em Niterói e a ITES.

- **Card:** [Plataforma-Ecosol/ecosol-frontend#74](https://github.com/Plataforma-Ecosol/ecosol-frontend/issues/74), "[Institucional] Saiba mais: conteúdo inicial dos subgrupos · 3 pts" (Sprint 3)
- **História-mãe:** [#71](https://github.com/Plataforma-Ecosol/ecosol-frontend/issues/71), "Subgrupos na aba Saiba mais · 12 pts"
- **Requisito / HU:** RF21 / HU22
- **Release:** R3 · Área da equipe e Saiba mais
- **Escopo:** o frontend Next.js e os textos no Admin. Nenhuma mudança de código no backend.
- **Ponto de partida:** a branch do frontend#75 (`feat/saiba-mais-conteudo-da-api`). O PR deste card vai para a `staging` depois do #79, do #76 e do #75.

## Decisões

- **Depois do #75, o texto que aparece no site é o do Admin.** Por isso a correção tem duas partes:
  - **no Admin**, as seções `quem-somos` e `a-ites`, em cada ambiente (homologação e produção). É a correção que o visitante vê;
  - **no código**, o conteúdo fixo de reserva (`lib/casa.ts`), que só aparece quando o build roda sem API. Ele precisa dizer o mesmo que o Admin.
- **Sem migration nova no backend.** A carga inicial (`0007`) usa `get_or_create` e não sobrescreve texto existente, de propósito. Corrigir pelo Admin é o caminho que o #75 abriu, e não precisa de PR no backend. Bancos locais novos continuam nascendo com o texto antigo da `0007`. Isso fica registrado como risco, e não como bloqueio.
- **A seção da ITES no Admin deixa de falar da plataforma.** O bloco fixo "Quem faz a plataforma" já diz quem desenvolve, com o CNPq, a licença e o GitHub. Repetir isso na seção do Admin duplicaria o crédito na mesma página. A seção passa a apresentar a ITES como incubadora, e o crédito fica só no bloco fixo.
- **O feedback da Casa Azul é pedido sobre um texto só.** O anexo deste PRD junta tudo que aparece nas páginas: seções, resumos dos cartões da índice e descrições do Google (#76). A Casa responde uma vez, e o que ela pedir entra depois, no Admin, em `lib/casa.ts` e em `SUBGRUPOS`.
- **Um teste trava a autoria.** O teste do #76 que reprova "junto com a Casa" e "Casa mantém" em `SUBGRUPOS` passa a cobrir também os textos de `lib/casa.ts`.
- **O PR não espera o feedback.** Ele segue o caminho normal: revisão do Vinícius e merge na `staging`. O anexo vai para a Casa Azul junto com a entrega.

## O que muda

### `src/lib/casa.ts`

O segundo parágrafo do `quem_somos` sai, pela versão do anexo. O primeiro parágrafo e o `sobre_a_rede` ficam como estão, à espera da validação.

### Admin (homologação e produção)

| Seção | Mudança |
| --- | --- |
| `quem-somos` (Casa Azul) | Segundo parágrafo, pela versão do anexo |
| `a-ites` (ITES/IFRJ) | Texto novo, pela versão do anexo |
| `rede-de-economia-solidaria` | Nenhuma, à espera da validação |

A troca é feita pela equipe no Admin de cada ambiente, junto com a entrega deste card, e fica registrada no PR, com o ambiente e a data.

### Testes

- `lib/casa.test.ts`: nenhum texto da Casa divide a autoria da plataforma ("junto com a Casa", "Casa mantém", "Casa desenvolve").
- O teste do `ConteudoCasaAzul` que procura o "Quem somos" fixo continua valendo com o parágrafo novo.

## Requisitos de implementação

Branch `feat/saiba-mais-conteudo-inicial`, criada a partir de `feat/saiba-mais-conteudo-da-api` (#75). Commits aprovados pelo desenvolvedor.

1. O parágrafo novo em `lib/casa.ts` e o teste de autoria.
2. `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` verdes.
3. Abrir o PR para a `staging` depois do #75, com "Closes #74" e o link no card.
4. Atualizar as seções `quem-somos` e `a-ites` no Admin de cada ambiente e registrar no PR.
5. Mandar o anexo à Casa Azul para o feedback. O que ela pedir vira ajuste posterior, fora deste card.

## Acessibilidade e celular

Nada muda na estrutura das páginas: só texto.

## LGPD

Nada muda. Os textos só falam da Casa, da Rede e da ITES.

## Critérios de aceite

Os três do card:

- [x] Contato e apresentação da Casa Paul Singer em Casa Azul (#72)
- [ ] Textos de Economia Solidária e ITES/IFRJ validados com a Casa Azul: entregues para o feedback, que vem depois do merge, pelo processo atual da equipe
- [x] Imagens otimizadas com `next/image` (#75)

E os deste PRD:

- [ ] Nenhum texto do site divide com a Casa a autoria da plataforma, no código e no Admin
- [ ] O conteúdo fixo de reserva diz o mesmo que o Admin
- [ ] O anexo de textos enviado à Casa Azul para o feedback
- [ ] Lint, typecheck, testes e `next build` verdes

## Fora do escopo

- **Fotos dos subgrupos:** a equipe sobe pelo Admin quando tiver, com a autorização de uso de imagem. O #75 já as mostra.
- **Migration de correção no backend:** a correção vai pelo Admin.

## Riscos

- **Feedback da Casa Azul depois do merge:** o texto entra no ar antes de a Casa ler. Se ela pedir mudança, o ajuste é rápido: no Admin, sem deploy, para o texto das seções; num PR pequeno, para `lib/casa.ts` e `SUBGRUPOS`.
- **Bancos locais novos** nascem com os textos antigos da `0007`. Não aparece para o visitante, só para quem desenvolve. Se incomodar, uma migration de correção, que só troque o texto que ainda for igual ao da carga inicial, resolve sem sobrescrever edição da equipe.

## Anexo — textos para o feedback da Casa Azul

Para cada subgrupo: o texto da página, o resumo do cartão da índice e a descrição que aparece no Google. **Em negrito, o que muda.**

### Casa Azul

**Página — "Quem somos"**

> A Casa da Economia Solidária Paul Singer é o Centro Público de Referência em Economia Solidária de Niterói. É aqui que coletivos, feiras e empreendimentos da economia solidária da cidade encontram apoio, formação e espaço para se organizar.
>
> **Nesta plataforma, qualquer pessoa pode conhecer os coletivos da rede, acompanhar a agenda de eventos e saber onde encontrar a economia solidária em Niterói.**

**Cartão da índice:** Quem somos, contato, endereço e horário de atendimento da Casa Paul Singer.

**Google:** A Casa da Economia Solidária Paul Singer é o centro público de referência da economia solidária em Niterói. Conheça a Casa e saiba como falar com ela.

### Economia Solidária

**Página — "A Rede de Economia Solidária de Niterói"**

> A Rede de Economia Solidária de Niterói reúne coletivos que trabalham de forma autogestionária, com decisões compartilhadas e renda dividida de forma justa. Nesta plataforma você encontra esses coletivos, a agenda de feiras e eventos e os pontos da economia solidária na cidade.

**Cartão da índice:** O que é a economia solidária e como funciona a rede de Niterói.

**Google:** O que é a economia solidária e como funciona a Rede de Economia Solidária de Niterói, com seus coletivos, feiras e eventos.

### ITES/IFRJ

**Página — "A ITES"**

> **A ITES é a Incubadora Tecnológica de Empreendimentos Solidários do IFRJ Campus Niterói. Ela apoia a criação e o fortalecimento de empreendimentos da economia solidária.**

(É o texto da carga inicial sem o trecho sobre a plataforma, que fica no bloco fixo abaixo. Se a ITES quiser apresentar melhor o que faz, é aqui.)

**Página — "Quem faz a plataforma"** (bloco fixo)

> A plataforma é desenvolvida pela ITES, a Incubadora Tecnológica de Empreendimentos Solidários do IFRJ Campus Niterói, com apoio do CNPq pelo programa PIBITI. É software livre, sob a licença GPLv3, e o código está aberto.

**Cartão da índice:** A incubadora do IFRJ Campus Niterói que desenvolve esta plataforma.

**Google:** A ITES, Incubadora Tecnológica de Empreendimentos Solidários do IFRJ Campus Niterói, é quem desenvolve esta plataforma.
