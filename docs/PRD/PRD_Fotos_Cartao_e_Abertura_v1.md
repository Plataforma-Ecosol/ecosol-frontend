# PRD — Fotos: cartão do coletivo e abertura da home

10/10/2026 · Jean Macedo

## Contexto e objetivo

Na reunião de 02/10, a equipe decidiu deixar a plataforma com "menos cara de genérico". O trabalho foi dividido em três cards. Este é a parte 3: fotos reais no cartão do coletivo e uma abertura nova na home. A parte 1 (base visual) já está na `staging`, e este card usa o que ela trouxe: `font-titulo`, as escalas `azul-50` … `azul-950` e os ícones do `lucide-react`.

**História:** como visitante, quero ver fotos reais dos coletivos e das feiras, para perceber que existe gente de verdade por trás da rede.

- **Card:** [\[Identidade visual\] Fotos: cartão do coletivo e abertura da home · 5 pts](https://trello.com/c/ZEjnd7dr/77-identidade-visual-fotos-cart%C3%A3o-do-coletivo-e-abertura-da-home-5-pts) (Em Andamento)
- **Vitrine com antes e depois:** [Vitrine de melhorias da Plataforma ES](https://claude.ai/artifact/KKQw4WQSrecSUGkbtSrL7W), fichas "Cartão do coletivo com foto" e "Abertura da página inicial"
- **PRD anterior:** base visual (`docs/PRD/PRD_Base_Visual_v1.md`). Nada do que foi feito lá muda aqui.
- **Card em paralelo:** [parte 2, componentes](https://trello.com/c/VAmieHmr/76-identidade-visual-componentes-busca-filtros-pagina%C3%A7%C3%A3o-e-contato-do-coletivo-5-pts), também em andamento. Pode mexer nos chips do `CartaoColetivo` e trazer o `Button` do shadcn. Ver "Pontos para confirmar".
- **Escopo:** este card mexe **nos dois repositórios**. O backend ganha o campo de foto no Coletivo. O frontend usa a foto no cartão e reformula a abertura da home.

São quatro entregas, cada uma numa seção abaixo:

| # | Entrega | Repositório | Onde mexe | Depende de |
| --- | --- | --- | --- | --- |
| 1 | Foto no Coletivo | backend | Model, migration, serializer, Admin, README | Nada |
| 2 | Cartão do coletivo | frontend | `CartaoColetivo`, novo `lib/iniciais.ts`, tipos, listagem | Entrega 1 (sem fotos cadastradas, o cartão já funciona com as iniciais) |
| 3 | Abertura da home | frontend | `page.tsx`, novos `AberturaDaHome` e `NumerosDaRede` | Foto de feira enviada pela Casa Paul Singer |
| 4 | Parceria no rodapé | frontend | `layout.tsx` | Nada |

## 1. Backend: foto no Coletivo

O que já existe e serve de modelo:

- `PontoDeInteresse.imagem_capa`: imagem opcional que sai como URL absoluta ou `null`.
- `ImagemEvento.legenda`: texto que o frontend usa como `alt`.
- Storage pronto: Supabase em homologação e produção (`DJANGO_USE_S3=True`), pasta `media/` no local. A fixture `media_temporaria` (autouse) já impede que os testes subam arquivo para o bucket.

### Campos novos

| Campo | Tipo | Na API | Para quê |
| --- | --- | --- | --- |
| `foto` | `ImageField(upload_to=caminho_da_foto, null=True, blank=True)` | URL absoluta ou `null` | Foto no topo do cartão |
| `foto_descricao` | `CharField(max_length=200, blank=True)` | Texto, pode vir vazio | O `alt` da foto |

No model, os dois ficam num bloco próprio (`# --- Foto (pública) ---`), logo depois da identificação pública.

**Nome do arquivo no bucket.** O `upload_to` é uma função que gera `coletivos/<uuid>.<ext>` e ignora o nome original. O motivo é o `AWS_S3_FILE_OVERWRITE`, que está no padrão `True` (o docstring do `tests/conftest.py` explica). Com `upload_to="coletivos/"`, dois coletivos que enviarem `foto.jpg` gravam a mesma chave, e o primeiro passa a mostrar a foto do segundo, sem erro nenhum. O nome novo a cada envio também resolve o cache: trocou a foto, mudou a URL.

```python
# rede/models/coletivo.py
import uuid
from pathlib import Path


def caminho_da_foto(instancia, nome_original):
    """Nome único no bucket: `coletivos/<uuid>.<ext>`."""
    extensao = Path(nome_original).suffix.lower()
    return f"coletivos/{uuid.uuid4().hex}{extensao}"
```

A função fica no nível do módulo, senão a migration não consegue referenciá-la.

**Tamanho máximo:** 5 MB, com um validador no campo (`validar_tamanho_da_foto`). Mensagem em português, com o tamanho do arquivo: "A foto tem 7,2 MB. O limite é 5 MB." O `next/image` reduz a foto na hora de mostrar, então o limite protege o espaço do bucket, não a tela.

### Serializer

`ColetivoSerializer.Meta.fields` ganha `"foto"` e `"foto_descricao"`, num grupo `# Foto` logo depois de `site`.

- Sem arquivo, o DRF devolve `foto: null`. Aqui `null` é o certo, ao contrário dos contatos. A foto não tem consentimento por campo, como o telefone. Quem decide se ela é pública é a equipe, ao enviá-la com autorização. E `null` é o mesmo formato do `imagem_capa` do ponto.
- O `ColetivoResumoSerializer` (o coletivo aninhado no ponto) **não muda**.

O teste de lista branca (`CHAVES_SEM_CONTATOS` em `tests/test_api_coletivos.py`) vai quebrar, e é para quebrar. Acrescentar as duas chaves de propósito e responder no PR a pergunta que o próprio teste faz: "esse campo pode mesmo ser público?". Resposta: sim, porque a foto só é enviada com autorização de uso de imagem.

### Admin

Novo bloco "Foto", logo abaixo de "Identificação pública":

- Campos: `foto`, `previa_da_foto` (somente leitura) e `foto_descricao`.
- `previa_da_foto` segue o `previa` do `ImagemEventoInline`: miniatura da foto salva, ou "—" sem foto.
- Texto do bloco (`description`):

  > Aparece no cartão do coletivo, no site. Só envie com autorização de uso de imagem das pessoas que aparecem na foto. Prefira foto na horizontal: o cartão corta as bordas para caber. Na descrição, diga o que a foto mostra (por exemplo, "Integrantes do coletivo na barraca da feira"). Ela é lida por quem usa leitor de tela.

Funciona do mesmo jeito no Admin atual e depois do Unfold.

### README

- "API pública > Coletivos > Campos da resposta": acrescentar `foto` (URL absoluta ou `null`) e `foto_descricao`.
- "Imagens": registrar a pasta `coletivos/` e o nome único por envio.

### Testes do backend

- `foto` sai como URL absoluta quando há arquivo, e `null` quando não há.
- `foto_descricao` sai como texto, inclusive vazio.
- Lista branca atualizada com as duas chaves.
- `caminho_da_foto`: dois envios de `foto.JPG` geram caminhos diferentes, os dois em `coletivos/` e com a extensão em minúsculas.
- Validador: arquivo acima de 5 MB é recusado com a mensagem; 5 MB exatos passam. Testar a função direto, sem montar imagem válida.
- Admin: a tela de edição do coletivo abre (200) e mostra o bloco "Foto".
- `makemigrations --check` verde, com a `0005` versionada.

## 2. Cartão do coletivo

### Tipos

```ts
// src/tipos/api.ts, dentro de `Coletivo`

/**
 * URL absoluta da foto. `null` quando o coletivo não tem foto: ausência
 * legítima, no mesmo formato do `imagem_capa` do ponto. Não é contato, então
 * aqui não vale a regra da chave omitida.
 */
foto: string | null;
/** Texto alternativo da foto, escrito pela equipe no Admin. Pode vir vazio. */
foto_descricao: string;
```

Os campos são obrigatórios no tipo. As fixtures de teste que montam um `Coletivo` vão pedir `foto: null, foto_descricao: ""`: é o compilador mostrando onde o contrato mudou.

### Layout

```
┌─────────────────────────────┐
│                             │
│   foto 16:9  (ou  SV )      │
│                             │
├─────────────────────────────┤
│ Sementes do Vale            │
│ [pino] Engenhoca            │
│ Grupo de agricultoras…      │
│ (Alimentação) (Agroecologia)│
└─────────────────────────────┘
```

- `article`: `relative overflow-hidden rounded-xl border border-dourado-200 bg-white shadow-sm`. O `p-4` sai do `article` e vai para o corpo.
- Topo: `relative aspect-video`. O `aspect-video` reserva o espaço antes da foto carregar, então a página não pula.
- Corpo: `p-4`, com o conteúdo de hoje (nome, bairro, descrição, categorias). A lógica dos links de filtro não muda.

### A foto

```tsx
<Image
  src={urlPublicaDeMidia(coletivo.foto)}
  alt={coletivo.foto_descricao || `Foto do coletivo ${coletivo.nome}`}
  fill
  sizes={TAMANHOS_DA_FOTO}
  className="object-cover"
/>
```

- `urlPublicaDeMidia` sempre. É a armadilha do host no Docker (PRD do Frontend, seção 4.5).
- Sem `preload`: o cartão fica abaixo da primeira dobra na home e na listagem. O carregamento preguiçoso padrão é o certo.
- O `next.config.ts` já libera o Supabase e o `/media/` local. Nada muda lá.

**`sizes`.** O `main` tem `max-w-5xl` (1024 px) e `px-4`, então sobram 992 px. Com três colunas e `gap-4`, cada cartão tem 320 px:

```ts
const TAMANHOS_DA_FOTO = "(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw";
```

Esse valor só serve se as duas grades forem iguais. Hoje a home tem três colunas a partir de `lg`, e a listagem `/coletivos` só duas. Proposta: a listagem passa a `sm:grid-cols-2 lg:grid-cols-3`, igual à home e à vitrine. Com duas colunas no desktop, cada cartão teria 488 px e a foto 275 px de altura, empurrando o texto para baixo.

### Sem foto: iniciais

Com `foto === null`, o topo vira um bloco do mesmo tamanho (`aspect-video`) com as iniciais.

- Estilo da vitrine: `bg-azul-100 text-azul font-titulo text-4xl`, centralizado. Uma cor só para todos, sem cor sorteada por coletivo.
- `aria-hidden`: o nome já está no título logo abaixo. O leitor de tela não precisa ler "S V".

Regra em `src/lib/iniciais.ts`, função `iniciaisDoNome(nome)`:

1. Separar por espaço e descartar as palavras de ligação `de`, `da`, `do`, `das`, `dos` e `e`, sem diferenciar maiúsculas.
2. De cada palavra, pegar o primeiro caractere que seja letra ou número (`/[\p{L}\p{N}]/u`). Acento fica; parêntese e aspas são pulados.
3. Usar as duas primeiras palavras. Nome de uma palavra só dá uma letra.
4. Passar para maiúsculas com `toLocaleUpperCase("pt-BR")`.
5. Se não sobrar nada (nome só com símbolos), devolver string vazia. O bloco aparece só com a cor.

| Nome | Iniciais |
| --- | --- |
| Mãos de Barro | MB |
| Sementes do Vale | SV |
| Costura | C |
| Ágape e Arte | ÁA |
| (Re)Costura Solidária | RS |
| Grupo das Mulheres da Engenhoca | GM |

### Cartão inteiro clicável e hover

Na vitrine, o cartão todo é um link. Aqui não dá para envolver o cartão num `<a>`: o bairro e as categorias já são links de filtro, e link dentro de link é HTML inválido.

A saída é o "link esticado". O link do nome ganha `after:absolute after:inset-0`, e o `article` já é `relative`. Um clique em qualquer parte do cartão, foto inclusive, abre o perfil. Os links de bairro e de categoria ganham `relative z-10` para continuar clicáveis por cima. Para o leitor de tela nada muda: continua um link só, com o nome do coletivo.

Custo: arrastar o mouse para selecionar o texto da descrição deixa de funcionar. Num cartão de listagem, é aceitável.

Hover com sombra e borda, como pede o card:

```
transition-[box-shadow,border-color] duration-200
hover:border-azul-300 hover:shadow-md
focus-within:border-azul-300 focus-within:shadow-md
motion-reduce:transition-none
```

- Sem o deslocamento para cima que a vitrine tem. O card pede só sombra e borda.
- `focus-within` dá o mesmo destaque para quem navega pelo teclado.
- Com `prefers-reduced-motion`, a troca é instantânea.

**A regra de LGPD do cartão continua:** nenhum contato no cartão, nem com consentimento. A foto não muda isso, e o teste atual continua valendo.

## 3. Abertura da home

Hoje a abertura tem o `h1`, uma frase e o parágrafo da parceria. Depois: duas colunas a partir de `md` (texto à esquerda, foto à direita) e uma coluna no celular (texto primeiro, foto embaixo).

```
┌───────────────────────────────┬──────────────────────┐
│ [pino] NITERÓI · CASA PAUL SINGER                    │
│ A economia solidária de       │                      │
│ Niterói em um só lugar        │    foto da feira     │
│ Conheça os coletivos, …       │        (4:3)         │
│ [Conhecer os coletivos →]     │                      │
│ [calendário Ver a agenda]     │                      │
│ 7 coletivos · 3 pontos · 3 ev │                      │
└───────────────────────────────┴──────────────────────┘
```

Novo `src/componentes/AberturaDaHome.tsx`, componente de servidor. Ele recebe os três totais e a foto como props. A `page.tsx` só busca os dados e faz o import da foto.

### Texto

- **Linha de cima:** "Niterói · Casa Paul Singer", com `MapPin`. `text-xs font-semibold uppercase tracking-widest text-dourado-escuro`.
- **`h1`:** "A economia solidária de Niterói em um só lugar". O trecho "em um só lugar" em `text-azul`, o resto em `text-azul-900`. `text-4xl md:text-5xl leading-tight`. É o "título maior" do card (hoje é `text-3xl`). A fonte vem sozinha, pela regra de `h1` no `@layer base`.
- **Frase:** "Conheça os coletivos, encontre as feiras e acompanhe a agenda da rede." `text-lg text-texto/85 max-w-prose`.

O `h1` deixa de repetir o nome da rede. O `<title>` e a descrição da página (no `layout.tsx`) continuam com "Rede de Economia Solidária de Niterói", que é o que aparece no buscador e no WhatsApp.

### Botões

| Botão | Destino | Estilo | Ícone |
| --- | --- | --- | --- |
| Conhecer os coletivos | `/coletivos` | Principal: `bg-azul text-bege hover:bg-azul-700` | `ArrowRight`, depois do texto |
| Ver a agenda | `/eventos` | Secundário: `bg-white text-azul border border-azul-200 hover:border-azul` | `CalendarDays`, antes do texto |

- São `Link`, não `button`: levam para outra página.
- `inline-flex min-h-11 items-center gap-2 rounded-lg px-4 font-semibold`. Os 44 px de altura são o alvo de toque mínimo. Ícones com `aria-hidden`.
- No celular, o grupo tem `flex-wrap`. Em telas estreitas cada botão ocupa a linha inteira.
- Se a parte 2 já tiver trazido o `Button` do shadcn quando este card for implementado, usar `<Button asChild>` com o `Link`. Senão, as classes acima. O resultado na tela é o mesmo.

### Números da rede

Vêm do `count` das listagens. Nenhum número escrito à mão.

| Número | De onde vem | Chamada |
| --- | --- | --- |
| coletivos | `coletivos.count` | Já existe: `listarColetivos({ ordering: "nome" })` |
| próximos eventos | `eventos.count` | Já existe: `listarEventos({ periodo: "proximos", ordering: "data_inicio" })` |
| pontos no mapa | `pontos.count` | Nova: `listarPontos({ page_size: 1 })` |

- A terceira chamada entra no mesmo `Promise.all`, para a home esperar a mais lenta e não a soma. `page_size: 1` porque só o `count` interessa. Cache de 60 s, como as outras listagens.
- A API só conta registros ativos. Coletivo tirado do ar pela equipe não entra no número.
- Componente puro `src/componentes/NumerosDaRede.tsx`, que recebe os três números. Assim ele é testável sem simular a API.
- Marcação: `<ul>` com `<li><strong>7</strong> coletivos</li>`. O leitor de tela lê "7 coletivos". Número em `font-titulo text-3xl text-azul tabular-nums`; rótulo em `text-sm text-texto/70`.
- Singular e plural: "1 coletivo", "1 ponto no mapa", "1 próximo evento".
- Número formatado com `toLocaleString("pt-BR")` (1.234).
- **Zero não aparece.** "0 próximos eventos" passa a ideia de rede parada. Item com zero some; se os três forem zero, o bloco inteiro some.

### Foto da feira

- **Origem:** enviada pela Casa Paul Singer, com autorização de uso de imagem das pessoas que aparecem. Registrar no PR quem autorizou e quando.
- **Onde fica:** versionada no frontend, em `src/imagens/abertura-feira.jpg`, com import estático (`import fotoDaFeira from "@/imagens/abertura-feira.jpg"`). O import estático já entrega largura, altura e `placeholder="blur"`. Trocar a foto exige um deploy, o que basta para uma foto de abertura. Gerenciar pelo Admin pediria um model de "configuração do site", que não existe.
- **Preparo antes do commit:** maior lado com 1600 px, JPEG com qualidade perto de 80, abaixo de 400 KB. O `next/image` gera AVIF e WebP no tamanho certo para cada tela, mas o original pesado continua pesando no repositório.
- **`preload`:** é o `priority` que o card cita. No Next 16 o nome mudou, como já está registrado no `Logo.tsx`. No desktop, a foto é o maior elemento da primeira dobra e vira o LCP.
- **`sizes`:** `"(min-width: 768px) 460px, 100vw"`. Com duas colunas a partir de `md`, a foto fica com uns 460 px.
- **Forma:** proporção 4:3, `object-cover`, `rounded-2xl` com o canto de baixo à esquerda menor (`rounded-bl-sm`), como na vitrine.
- **`alt`:** descreve a cena de verdade e é escrito quando a foto chegar. O tipo de texto: "Barracas e visitantes numa feira de economia solidária na Praça Araribóia". Sem começar por "foto de" ou "imagem de".

**Enquanto a foto não chega:** o resto da abertura (título, botões e números) pode ir para a `staging` sem a coluna da foto, em uma coluna só, como no celular. A foto entra num commit próprio quando a Casa enviar. Nada de foto de banco de imagens nem de espaço reservado no ar.

### O resto da home

- Sai o parágrafo da parceria. Ele vai para o rodapé (seção 4).
- "Coletivos da rede", "Próximos eventos" e os atalhos de Agenda e Mapa no fim da página ficam como estão. Os cartões de coletivo já aparecem com foto, pela seção 2.

## 4. Parceria no rodapé

Hoje, a primeira linha do rodapé é "Centro Público de Referência em Economia Solidária (Casa Paul Singer) · ITES / IFRJ Campus Niterói". Ela passa a ser a frase que sai da home:

> Esta plataforma é mantida pelo Centro Público de Referência em Economia Solidária (Casa Paul Singer), em parceria com o ITES e o IFRJ Campus Niterói.

O resto do rodapé (logo, GPLv3 e Área da equipe) não muda.

## Requisitos de implementação

Uma branch em cada repositório, criada pelo desenvolvedor a partir da `staging` (regra do `CLAUDE.md` da raiz). Um commit por entrega, cada um com aval do desenvolvedor, para a revisão poder ir por partes. **Backend primeiro:** o frontend depende do campo novo na API.

**Backend (`apps/ecosol-backend`)**

1. `caminho_da_foto`, `validar_tamanho_da_foto` e os dois campos no `Coletivo`. Gerar a migration `0005`.
2. Serializer com `foto` e `foto_descricao`, lista branca do teste atualizada e os testes da seção 1.
3. Admin: bloco "Foto" com a prévia e o texto sobre autorização.
4. README: campos da resposta e a pasta `coletivos/` em "Imagens".
5. `ruff`, `makemigrations --check --dry-run` e `pytest` verdes.
6. Depois do merge na `staging`: rodar a migration na homologação (README, "Migrations e superusuário da homologação") e pedir à Casa Paul Singer que envie as fotos pelo Admin.

**Frontend (`apps/ecosol-frontend`)**

7. Tipos `foto` e `foto_descricao`; atualizar as fixtures de `Coletivo` nos testes.
8. `lib/iniciais.ts`, com teste.
9. `CartaoColetivo`: foto ou iniciais, link esticado e hover. Listagem `/coletivos` com `lg:grid-cols-3`.
10. Rodapé com a frase da parceria.
11. `AberturaDaHome` e `NumerosDaRede`, com `listarPontos` no `Promise.all` da home. Sem a foto, se ela ainda não tiver chegado.
12. Foto da feira, num commit próprio, quando chegar.
13. **PRD do Frontend** (`PRD_Implementacao_Frontend_Publico_v1.md`), citando este PRD como origem:
    - Seção 3.5: incluir `foto` do coletivo (URL absoluta ou `null`) e `foto_descricao`.
    - Seção 4.2: os dois campos novos no tipo `Coletivo`.
    - Seção 5: o conteúdo da rota `/` passa a ser "Abertura com foto, chamadas e números da rede, coletivos em destaque, próximos eventos, chamada para o mapa".
    - Seção 9: trocar "a galeria de evento é o único lugar com imagem pesada" por "galeria de evento, foto do cartão do coletivo e foto da abertura da home".
14. `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` verdes.
15. Lighthouse antes e depois (seção "Acessibilidade e celular"). Números no PR.
16. O desenvolvedor abre os PRs (backend primeiro) com o `template_pr.md`, cola os links no card e move para Code Review.

## Testes

Os testes atuais do `CartaoColetivo` buscam o link pelo nome do coletivo. Com o link esticado, o nome acessível do link continua o mesmo, então eles devem passar sem mudança na asserção. Se algum quebrar, atualizar a busca, não apagar o teste.

Novos testes no frontend:

- **`iniciais.test.ts`:** os seis exemplos da tabela da seção 2, mais nome só com símbolos devolvendo string vazia.
- **`CartaoColetivo`:**
  - Com foto: há um `img` com o `alt` vindo de `foto_descricao` e com o atributo `sizes`.
  - Com foto e `foto_descricao` vazia: o `alt` é "Foto do coletivo Sementes do Vale".
  - Sem foto: nenhum `img`; as iniciais "SV" aparecem dentro de um elemento com `aria-hidden`.
  - Os testes de LGPD, de campo ausente e de filtros preservados continuam passando.
- **`NumerosDaRede`:** plural e singular; item com zero não aparece; com os três zerados nada é renderizado; `1234` aparece como "1.234".
- **`AberturaDaHome`:** os dois botões com `href` `/coletivos` e `/eventos`; um `h1` só.
- **Rodapé:** se algum teste procurar o texto antigo, atualizar a busca.

**Atenção com o import da foto no Vitest:** o import de um `.jpg` no Vitest devolve uma string, e não o objeto (`src`, `width`, `height`) que o `next/image` espera do import estático. Por isso a foto chega ao `AberturaDaHome` como prop, e o teste passa um objeto falso com esses três campos.

## Acessibilidade e celular

- **`alt` real em todas as fotos:** no cartão, a `foto_descricao` ou o texto padrão com o nome; na abertura, a descrição da cena. Iniciais com `aria-hidden`.
- **Um `h1` só** na home.
- **Botões da abertura** com 44 px de altura e foco visível.
- **Contraste:** conferir e anotar no PR os pares novos. `bege` sobre `azul` (botão principal), `azul` sobre branco (botão secundário), `azul-900` sobre `bege` (título), `texto/70` sobre `bege` (rótulo dos números), todos com mínimo de 4,5. As iniciais (`azul` sobre `azul-100`) são texto grande e decorativo: mínimo de 3.
- **Movimento:** a transição do cartão some com `prefers-reduced-motion`.
- **Celular (360 px):** abertura em uma coluna, com a foto depois dos números. Botões quebram de linha sem rolagem horizontal. Cartões em uma coluna, com a foto na largura toda.
- **Sem salto de layout:** o `aspect-video` do cartão e o import estático da abertura reservam o espaço antes da foto carregar.
- **Lighthouse:** medir antes de começar (`next build && next start`, aba anônima, modo celular) em `/` e `/coletivos`, com algumas fotos cadastradas no backend local. Depois, as mesmas páginas. Desempenho e Acessibilidade não podem cair. Olhar em especial o LCP e o CLS.

## Critérios de aceite

- [ ] Campo `foto` opcional no Coletivo, com nome único no bucket e limite de 5 MB
- [ ] `foto_descricao` no Coletivo, usada como `alt`
- [ ] Envio da foto pelo Admin, com prévia e o aviso de autorização de uso de imagem
- [ ] `foto` e `foto_descricao` na API pública, com `foto: null` sem foto e lista branca atualizada
- [ ] Cartão com foto no topo via `next/image`, com `sizes` correto e `urlPublicaDeMidia`
- [ ] Sem foto, as iniciais do coletivo no lugar, com `aria-hidden`
- [ ] Hover com sombra e borda, também no foco por teclado, sem transição com movimento reduzido
- [ ] Cartão continua sem nenhum contato (teste de LGPD passando)
- [ ] Abertura com título maior e os botões "Conhecer os coletivos" e "Ver a agenda"
- [ ] Números da rede tirados do `count` da API, sem zero na tela
- [ ] Foto real de feira com `preload`, autorizada pela Casa Paul Singer
- [ ] Texto da parceria com o ITES e o IFRJ no rodapé, fora da home
- [ ] `alt` real em todas as imagens
- [ ] README do backend e PRD do Frontend (seções 3.5, 4.2, 5 e 9) atualizados
- [ ] Funciona em celular e desktop
- [ ] Lighthouse sem queda em Desempenho e Acessibilidade (números no PR)
- [ ] Backend: `ruff`, `makemigrations --check` e `pytest` verdes
- [ ] Frontend: lint, typecheck, testes e `next build` verdes

## Fora do escopo

- Foto no perfil do coletivo e como imagem da prévia do link (Open Graph). Depois deste card fica simples: o campo já existe.
- Galeria com várias fotos por coletivo e envio pelo próprio coletivo (card "[Área do Coletivo] Upload de logo e fotos").
- Apagar do bucket a foto antiga quando ela é trocada. Hoje ela fica lá, como já acontece com evento e ponto.
- Nome único no bucket para `eventos/` e `pontos-de-interesse/`. O mesmo risco de sobrescrita da seção 1 existe lá. Vale um card de backend próprio.
- Cartão flutuante "Próxima feira" sobre a foto e faixa colorida embaixo da abertura, que aparecem na vitrine.
- Cor por categoria nos chips.
- Foto da abertura gerenciada pelo Admin.

## Pontos para confirmar

- [ ] **Nome dos campos:** `foto` e `foto_descricao`. O ponto de interesse usa `imagem_capa`; seguir esse nome deixaria a API mais uniforme, mas `foto` descreve melhor o que é e é a palavra usada pela equipe.
- [ ] **Limite de 5 MB** por foto.
- [ ] **Listagem `/coletivos` com três colunas** no desktop, igual à home (seção 2).
- [ ] **Cartão inteiro clicável**, com link esticado (seção 2).
- [ ] **Novo texto do `h1`** da home (seção 3). O nome da rede continua no `<title>`.
- [ ] **Foto da abertura versionada no frontend**, e não no Admin.
- [ ] **Ordem com a parte 2 (card 76):** as duas podem mexer no `CartaoColetivo` e nos botões. Combinar qual entra primeiro na `staging`; a outra atualiza a branch antes de abrir o PR.
