# PRD de Implementação — Frontend público (Next.js)

**Projeto:** Plataforma de Rede da Economia Solidária de Niterói
**Centro Público de Referência em Economia Solidária (Casa Paul Singer) · ITES / IFRJ Campus Niterói**

| | |
|---|---|
| **Documento** | PRD de Implementação — Fatia 5: Frontend público em Next.js |
| **Versão** | 1.1 |
| **Deriva de** | PRD Técnico v4.1 (Seções 2.1, 2.4, 5.1, 7, 8.1; Seção 11, **item 5**) |
| **Escopo** | Aplicação Next.js pública e somente leitura: home, listagem de coletivos, perfil por slug, agenda de eventos e mapa de pontos de interesse — com renderização no servidor, tipagem do contrato da API e regressão de LGPD na camada de exibição |
| **Fora de escopo** | Qualquer escrita, login, área administrativa, autocadastro, geocodificação por Nominatim, deploy em produção, e2e com navegador real |
| **Repositório** | `apps/ecosol-frontend` (dentro da umbrella `ecosol-fullstack`) |
| **Status** | Executado (PRs L–Q). Esta v1.1 corrige o que a execução mostrou estar errado no documento; falta o PR R (Seção 6). |

---

## O que mudou na versão 1.1

A fatia foi executada, e a execução mostrou que partes deste documento estavam erradas. Esta subversão **não muda escopo nem decisões**: corrige o que quebraria o build de quem seguisse o texto, e registra o que se aprendeu.

**Corrigido porque quebrava build ou CI:**

- **Seção 4.4** — `dynamic(..., { ssr: false })` não pode ser chamado de um Server Component no Next 16. Precisa de um invólucro `"use client"`.
- **Seções 4.3 e 5** — faltava `await connection()` na camada de acesso. Sem ele o `next build` tenta pré-renderizar consultando a API e falha com `ECONNREFUSED` — e o CI não sobe backend, então nunca passaria.
- **Seção 4.5** — faltava o bloqueio de IP local do Next 16 (`dangerouslyAllowLocalIP`), que derruba as imagens do backend local.

**Corrigido porque enganava:**

- **Seções 5 e 5.1** — o backend responde `301`, mas o `permanentRedirect` do Next responde `308`. O texto usava `301` para os dois.
- **Seção 4.4** — o pino do mapa é `divIcon` com SVG embutido, e não um `L.Icon` com arquivos em `public/`.
- **Seção 2** — o scaffold entrega um tema escuro pela metade, e "fora de escopo" exige **removê-lo**, não ignorá-lo.

**Registrado:**

- **Seção 6** — `sitemap.ts` e `robots.ts` não estavam atribuídos a nenhum PR, e por isso ficaram de fora. Agora são o PR R.
- **Seção 8** — o padrão de teste que funcionou na prática.
- **Seção 10.6** — o filtro por categoria é clique no cartão, e isso é decisão, não contorno.

---

## 0. Objetivo deste documento

Este PRD detalha **como** executar o **item 5 da Seção 11 do PRD Técnico v4.1**:

> *"Frontend público em Next.js: listagem, perfil por slug, mapa (Leaflet/OSM) e eventos, com renderização no servidor."*

É a **última fatia de código do MVP**. Todo o backend já está entregue: as três entidades públicas — Coletivo, Evento e Ponto de Interesse — têm endpoint, contrato documentado e suíte de regressão bloqueante no CI. Esta fatia não pede nada novo do backend; **consome** o que existe.

O documento é autossuficiente para ser lido por um agente (Claude Code) e transformado em código, sem reabrir os PRDs anteriores. A **fonte da verdade do contrato** é a seção "API pública" do `README.md` de `apps/ecosol-backend` — reproduzida aqui na Seção 3 para leitura offline, mas em caso de divergência **vale o README do backend**, porque ele é verificado por testes.

**A pergunta que governa esta fatia.** O propósito da plataforma é *descoberta*: fazer o coletivo de economia solidária ser encontrado. Toda decisão de frontend aqui responde a "isso torna o coletivo mais encontrável?" — é o que justifica renderização no servidor, URLs por slug, prévia de link e o cuidado com o `301`. Um frontend bonito que não é indexável falha no objetivo do projeto.

**A segunda regra, que não é negociável.** O backend já garante que dado pessoal não sai na API. O frontend não pode reintroduzir o problema por outro caminho: nada de log de resposta em produção, nada de `JSON.stringify` de objeto inteiro em atributo de HTML, nada de campo renderizado "por precaução". A Seção 8.2 transforma isso em teste.

---

## 1. Estado atual dos repositórios (ponto de partida)

**`apps/ecosol-backend` — pronto e não deve ser tocado nesta fatia:**

- Três endpoints públicos, somente leitura, com paginação (`page_size` padrão 20, teto 100), busca `q`, filtros e ordenação estável.
- Contrato documentado na seção "API pública" do `README.md`.
- Suíte com 103 casos, verde e bloqueante no CI.
- Django Admin operando as chaves de visibilidade (`ativo`, `exibir_*_publicamente`).
- `infra/docker-compose.yml` sobe backend + Postgres 16 isolado, com `DJANGO_IGNORE_DOTENV=True`.

**`apps/ecosol-frontend` — praticamente vazio:**

- Um único commit (`Initial commit`), com `LICENSE` (GPLv3) e um `README.md` de uma linha.
- Branches `main` e `staging` já existem no remoto.
- **Não há** scaffold, `package.json`, CI, nem regra de proteção conferida.

Nasce **tudo** nesta fatia. Não há código legado a preservar — o que existe de referência é o **estilo do backend**: português em todo lugar, docstrings/comentários que explicam o *porquê* e não a mecânica, e testes que provam a promessa em vez de acompanhá-la.

> **Princípio-guia:** o backend gastou quatro fatias construindo a garantia de que só o que é público sai pela API. Esta fatia é a que **mostra** esse dado a uma pessoa. O trabalho é de exibição e de descoberta — não de regra de negócio. Se algo aqui parecer precisar de uma regra nova sobre o que é público, é sinal de parar e perguntar, não de decidir no frontend.

---

## 2. Resultado esperado (Definition of Done da fatia)

A fatia está concluída quando **todos** os itens abaixo forem verdadeiros:

1. `npm run dev` sobe a aplicação e ela consome a API do backend local.
2. As seis rotas da Seção 5 respondem, **renderizadas no servidor**, e o HTML entregue já contém o conteúdo (verificável com `curl` + `view-source`, sem JavaScript).
3. A listagem de coletivos tem busca textual, filtro por categoria e bairro, e paginação — todos refletidos na **URL** (`?q=`, `?categoria=`, `?page=`), para que o estado seja compartilhável e o botão "voltar" funcione.
4. O perfil por slug responde `200`; slug inexistente ou de coletivo inativo entrega **404 de verdade** (`notFound()`), não uma página vazia com status 200.
5. Um **slug antigo** leva o navegador à URL canônica com redirecionamento permanente — a barra de endereço muda, não só o conteúdo.
6. Contatos sem consentimento **não aparecem, e não deixam rastro**: nem rótulo vazio, nem `undefined`, nem ícone órfão.
7. O mapa desenha os pontos ativos com Leaflet/OpenStreetMap, e a mesma página traz a **lista textual** dos pontos, renderizada no servidor.
8. A agenda mostra por padrão os próximos eventos (`?periodo=proximos`) e permite ver os passados.
9. Cada página pública tem `<title>`, `<meta name="description">` e tags Open Graph próprias — é o que gera a prévia ao compartilhar no WhatsApp (Seção 7 do v4.1).
10. Layout **mobile first**, utilizável em smartphone básico; nenhuma rolagem horizontal.
11. `npm run lint`, `tsc --noEmit`, `vitest run` e `next build` passam, e o CI do repositório fica **verde**.
12. O `README.md` do frontend documenta como rodar, as variáveis de ambiente e a relação com a API.

> **O que NÃO faz parte do "pronto":** deploy na Vercel, domínio, analytics, tema escuro, animações, biblioteca de componentes e testes end-to-end com navegador real. O v4.1 pede explicitamente que se evite sobre-engenharia.

> **Atenção: "tema escuro fora de escopo" exige trabalho.** Lê-se como "não há nada a fazer", e é o contrário. O `create-next-app` **entrega** um bloco `prefers-color-scheme: dark` no `globals.css`, junto de uma regra em `body` escrita **fora de `@layer`** — e regra sem camada vence qualquer utilitário do Tailwind, independente de especificidade. O resultado: o `bg-stone-50` do layout nunca vale, e em quem usa o sistema em modo escuro o fundo vira `#0a0a0a` enquanto o texto continua na cor escolhida para fundo claro. Medido no navegador: fundo `rgb(10,10,10)` com texto cinza escuro, ilegível. **Apagar o bloco e a regra faz parte do PR L.** Meio tema escuro é pior do que nenhum — e o defeito não aparece em teste nem em verificação de rota, só ao abrir a página.

---

## 3. O contrato que o frontend consome

Fonte da verdade: seção "API pública" do `README.md` do backend. Reproduzido aqui em resumo.

### 3.1. Convenções

- Somente `GET`, sem autenticação. Chaves em `snake_case`.
- Listas vêm no envelope do DRF: `{ count, next, previous, results }`.
- `page` (padrão 1; fora da faixa → `404`) e `page_size` (padrão 20, **teto 100**).
- Datas em ISO 8601 (`AAAA-MM-DD`); data-hora em ISO 8601 **com fuso** (`2026-08-15T18:00:00-03:00`).
- A paginação é **estável** — as listagens desempatam pela chave primária, então percorrer as páginas devolve cada registro exatamente uma vez.
- `ativo` não é parâmetro em nenhuma rota, e não aparece em nenhuma resposta.

### 3.2. Rotas

| Rota | Devolve |
|---|---|
| `GET /api/coletivos/` | Lista paginada de coletivos ativos |
| `GET /api/coletivos/{slug}/` | Detalhe; **`301`** se o slug for antigo |
| `GET /api/eventos/` | Lista paginada de eventos ativos |
| `GET /api/eventos/{slug}/` | Detalhe |
| `GET /api/pontos-de-interesse/` | Lista paginada de pontos ativos |
| `GET /api/pontos-de-interesse/{id}/` | Detalhe (por **id**, não por slug) |

### 3.3. Parâmetros por listagem

| Endpoint | Parâmetros |
|---|---|
| Coletivos | `q`, `categoria` (int), `bairro`, `ordering` (`nome`, `-nome`, `criado_em`, `-criado_em`) |
| Eventos | `q`, `periodo` (`proximos`/`passados`/`todos`), `de`, `ate` (**só** `AAAA-MM-DD`), `bairro`, `ordering` (`data_inicio`, `-data_inicio`, `titulo`, `-titulo`) |
| Pontos | `q`, `tipo` (`orgao_es`/`loja_fisica`/`feira_arariboia`), `ordering` (`nome`, `-nome`) |

Valor inválido responde `400` — o frontend precisa tratar, não deixar estourar.

**Não há endpoint de catálogo.** A API não expõe a lista de categorias nem a de bairros: `categoria` recebe um id e `bairro` um texto, mas não existe `/api/categorias/` de onde tirar as opções. Isso decide a forma do filtro na tela — ver a decisão 10.6.

### 3.4. As três armadilhas do contrato

Estas três são a razão de a Seção 4.2 existir. Errar qualquer uma produz bug silencioso.

**1. Contato ausente é chave que NÃO EXISTE — não é `null`.** Sem consentimento, `telefone`, `email` e `instagram` são *removidos* do JSON. Em TypeScript o tipo é `telefone?: string`, e **nunca** `telefone: string | null`. Escrever `| null` faria o compilador aceitar `dados.telefone` como sempre presente e o React renderizaria o rótulo com valor vazio ao lado — exatamente o rastro que a omissão existe para não deixar.

**2. `coletivo` de um ponto é `null` — e isso é deliberado.** O ponto sem vínculo e o ponto cujo coletivo foi tirado do ar devolvem **o mesmo** `coletivo: null`. Aqui o tipo é `ColetivoResumo | null`. A indistinguibilidade é a proteção; o frontend não deve tentar diferenciar os dois casos, nem exibir "coletivo indisponível" — só não mostra vínculo nenhum.

**3. `data_fim` é `null` legítimo.** Evento sem data de fim traz a chave presente valendo `null`. Tipo: `data_fim: string | null`.

### 3.5. Imagens

`imagens[].imagem` (evento) e `imagem_capa` (ponto) vêm como **URL absoluta**. Em produção apontam para o Supabase Storage; no ambiente local, para `http://localhost:8001/media/...`. Ver a armadilha de host na Seção 4.5 — ela morde no Docker.

---

## 4. Arquitetura do frontend

### 4.1. Stack

| Peça | Escolha | Observação |
|---|---|---|
| Framework | **Next.js (App Router)**, última estável | Fixar no PR a versão realmente instalada |
| Linguagem | **TypeScript**, `strict: true` | O `strict` é o que faz a Seção 3.4 valer |
| Estilo | **Tailwind CSS** | Na v4 a configuração é via CSS (`@import "tailwindcss"`), não `tailwind.config.js` — seguir o que o `create-next-app` gerar |
| Mapa | **Leaflet + react-leaflet** | Só no cliente (Seção 4.4) |
| Testes | **Vitest + React Testing Library** | e2e fora de escopo |

Nenhuma biblioteca de componentes, nenhum gerenciador de estado, nenhum cliente HTTP (o `fetch` nativo basta). O v4.1 (2.1) prevê explicitamente que não é preciso biblioteca de formulário no MVP, já que a Interface 2 é o Django Admin.

### 4.2. Os tipos do contrato — `src/tipos/api.ts`

Um único módulo declara o contrato. Ele é a tradução literal da Seção 3, e o comentário de cada campo opcional explica **por que** é opcional — sem isso, o próximo desenvolvedor "conserta" o `?` para `| null` e reabre o vazamento.

```ts
/** Envelope de paginação do DRF, comum às três listagens. */
export interface Pagina<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CategoriaResumo { id: number; nome: string; slug: string; }
export interface ColetivoResumo  { id: number; nome: string; slug: string; }

export interface Coletivo {
  id: number;
  nome: string;
  slug: string;
  descricao: string;
  bairro: string;
  site: string;
  categorias: CategoriaResumo[];
  criado_em: string;
  atualizado_em: string;

  // Opcionais por OMISSÃO, não por nulidade: sem consentimento a chave é
  // removida do JSON. `?: string` obriga o código a checar a existência antes
  // de renderizar. Trocar por `string | null` faria o compilador aceitar o
  // acesso direto e o rótulo apareceria vazio — o rastro que a omissão evita.
  telefone?: string;
  email?: string;
  instagram?: string;
}

export interface ImagemEvento { id: number; imagem: string; legenda: string; ordem: number; }

export interface Evento {
  id: number;
  titulo: string;
  slug: string;
  descricao: string;
  data_inicio: string;      // ISO 8601 com fuso
  data_fim: string | null;  // ausência legítima
  local: string;
  bairro: string;
  link: string;
  imagens: ImagemEvento[];
  criado_em: string;
  atualizado_em: string;
}

export type TipoPonto = "orgao_es" | "loja_fisica" | "feira_arariboia";

export interface PontoDeInteresse {
  id: number;
  nome: string;
  tipo: TipoPonto;
  tipo_display: string;     // rótulo pronto — não reimplementar a tradução
  descricao: string;
  latitude: number;         // número, não string
  longitude: number;
  endereco: string;
  imagem_capa: string | null;
  // `null` tanto para "sem vínculo" quanto para "coletivo fora do ar".
  // Os dois casos são indistinguíveis DE PROPÓSITO — não tentar separá-los.
  coletivo: ColetivoResumo | null;
  criado_em: string;
  atualizado_em: string;
}
```

### 4.3. A camada de acesso — `src/lib/api.ts`

**Uma única porta para a API.** Nenhum componente chama `fetch` direto. O motivo é de auditoria: quando alguém perguntar "por onde este sistema fala com o backend?", a resposta tem de ser um arquivo, não uma busca no projeto inteiro.

Responsabilidades:

- Montar a URL a partir de `API_URL` e dos parâmetros de consulta.
- Traduzir status em comportamento: `404` → `notFound()` do Next; `400` → erro tratado com mensagem em português; `5xx` → erro que o `error.tsx` captura.
- Aplicar `revalidate` (Seção 9).
- **Chamar `await connection()` antes de qualquer requisição** (abaixo).
- Nada mais. **Sem cache próprio, sem retry, sem interceptador.**

**Todo acesso é server-side.** As funções deste módulo rodam em Server Components. O navegador nunca fala com o Django. Isso não é detalhe de implementação — é o que mantém o requisito de SEO de pé (a página chega pronta) e o que torna **desnecessário configurar CORS no backend** (ver decisão 10.1).

**`await connection()` é obrigatório, e mora aqui.** Sem ele, o `next build` trata as páginas como estáticas e tenta pré-renderizá-las **consultando a API durante o build**. Quando a API não está no ar, o build inteiro falha com `ECONNREFUSED` — e ela nunca está no ar no CI, que não sobe backend. O mesmo aconteceria num deploy feito durante uma instabilidade do backend.

`connection()` interrompe a pré-renderização: daí para baixo, o código só roda quando existe requisição de verdade.

**Não confundir com `export const dynamic = "force-dynamic"`.** Ele também tornaria a página dinâmica, mas desligaria junto o cache de `fetch` — e é desse cache que vem a velocidade da Seção 9. `connection()` não o afeta.

Fica na camada de acesso, e não em cada página, pelo mesmo motivo que a guarda de storage do backend é `autouse`: proteção que cada arquivo precisa lembrar de pedir falha na primeira página que esquecer.

### 4.4. O mapa, e por que ele é a única ilha de cliente

Leaflet toca `window` **no momento do import**. Importá-lo de um Server Component quebra o build com `ReferenceError: window is not defined`. A saída é `dynamic(..., { ssr: false })` — mas ele **não pode ser chamado da página**.

**No Next 16, `ssr: false` é proibido em Server Component.** A documentação é explícita: *"`ssr: false` is not allowed with `next/dynamic` in Server Components. Please move it into a Client Component."* O `next build` falha.

São necessários, portanto, **dois** arquivos: um invólucro que já seja de cliente e faça o `dynamic`, e o mapa em si.

```tsx
// src/componentes/MapaCliente.tsx
"use client";

import dynamic from "next/dynamic";

// `ssr: false` só é aceito dentro de um componente que JÁ é de cliente.
const Mapa = dynamic(() => import("@/componentes/Mapa"), {
  ssr: false,
  // Reserva a altura do mapa: sem isso o conteúdo abaixo salta quando ele
  // termina de carregar, e quem estiver lendo a lista perde o lugar.
  loading: () => <div className="h-[28rem] animate-pulse bg-stone-100" />,
});

export function MapaCliente({ pontos }: { pontos: PontoDeInteresse[] }) {
  return <Mapa pontos={pontos} />;
}
```

A página `/mapa` importa `MapaCliente` e **continua sendo Server Component**. O invólucro existe por exigência do framework, não por gosto de indireção — vale dizer isso no próprio arquivo, senão alguém o remove por parecer supérfluo.

Dois cuidados que economizam uma tarde:

- **Importar o CSS do Leaflet** (`leaflet/dist/leaflet.css`), senão o mapa aparece como tiles empilhados fora de lugar.
- **Trocar o ícone padrão do marcador por um `divIcon`.** O Leaflet resolve o caminho do PNG do pino de um jeito que os empacotadores quebram, e o sintoma é um mapa correto com **marcadores invisíveis**, sem erro no console. Um `divIcon` com SVG embutido não depende de arquivo nenhum, então não há o que quebrar — e de quebra permite colorir o pino por `tipo`. (Servir os PNGs de `public/` também resolveria, mas o projeto não tem essa pasta e ela voltaria só para isso.)

**A página `/mapa` continua sendo renderizada no servidor.** Só o widget é cliente. A página entrega, no HTML, a lista textual de todos os pontos — nome, tipo, endereço e vínculo. Isso atende três coisas de uma vez: o buscador indexa, quem está em conexão ruim ou com JavaScript desligado ainda consegue a informação, e o leitor de tela tem conteúdo real em vez de um `<div>` mudo.

### 4.5. A armadilha do host das imagens (morde no Docker)

O Django monta a URL da imagem **a partir do host da requisição**. Se o Next.js, dentro do compose, chamar `http://backend:8001/api/eventos/`, as imagens voltarão como `http://backend:8001/media/...` — endereço que só existe dentro da rede do Docker. O navegador da pessoa não resolve, e a imagem quebra **sem erro no console do servidor**.

Onde cada caso cai:

| Ambiente | `DJANGO_USE_S3` | URL da imagem | Problema? |
|---|---|---|---|
| Produção | `True` | Supabase Storage, absoluta e independente do host | Não |
| Local, Next fora do Docker | `False` | `http://localhost:8001/media/...` | Não |
| Local, Next dentro do compose | `False` | `http://backend:8001/media/...` | **Sim** |

**Solução prescrita:** uma função `urlPublicaDeMidia(url)` em `src/lib/api.ts`, aplicada por todo componente que exibe imagem. Ela troca o host interno pelo host público quando as duas variáveis diferem, e é no-op quando são iguais — o que faz dela um no-op em produção. É pequena, tem uma responsabilidade só, e evita um bug que se manifesta apenas no ambiente que a equipe usa para conferir visual.

Além disso, `next.config.ts` precisa declarar os hosts permitidos em `images.remotePatterns` (o domínio do Supabase e `localhost:8001`), senão o `next/image` recusa a URL externa.

**E declarar o host não basta.** O Next 16 passou a **bloquear a otimização de imagem vinda de endereço local**, como defesa contra SSRF. O sintoma é `400 "url" parameter is not allowed` e a imagem quebrada — mesmo com o host em `remotePatterns`. Liberar exige `images.dangerouslyAllowLocalIP`.

A condição de liberação deve olhar **para onde as imagens apontam**, e não para `NODE_ENV`:

```ts
const API_PUBLICA =
  process.env.API_URL_PUBLICA ?? process.env.API_URL ?? "http://localhost:8001";

const IMAGENS_VEM_DE_HOST_LOCAL =
  /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\]|backend)(:|\/|$)/i.test(API_PUBLICA);
```

Amarrar a `NODE_ENV` parece equivalente e **não é**: `npm run start` e o container do compose rodam em modo produção contra o backend local — exatamente os cenários em que a equipe confere o visual antes de subir — e a permissão ficaria desligada onde é mais necessária. Do jeito acima ela se desliga sozinha quando `API_URL_PUBLICA` passa a ser o domínio real, que é quando o risco de SSRF passa a existir de verdade.

---

## 5. As páginas

| Rota | Consome | Renderização | Conteúdo |
|---|---|---|---|
| `/` | listagens, poucos itens | Sob demanda | Apresentação da rede, coletivos em destaque, próximos eventos, chamada para o mapa |
| `/coletivos` | `GET /api/coletivos/` | Sob demanda | Busca, filtro por categoria e bairro, paginação — tudo na URL |
| `/coletivos/[slug]` | `GET /api/coletivos/{slug}/` | Sob demanda | Perfil público; `404`; **canônico via `308`** |
| `/eventos` | `GET /api/eventos/?periodo=proximos` | Sob demanda | Agenda; alternar próximos/passados |
| `/eventos/[slug]` | `GET /api/eventos/{slug}/` | Sob demanda | Detalhe com galeria |
| `/mapa` | `GET /api/pontos-de-interesse/?page_size=100` | Sob demanda + ilha cliente | Mapa Leaflet + lista textual |

**Nenhuma página é pré-renderizada no build**, e isso é consequência direta do `await connection()` da Seção 4.3 — é o que permite o `next build` passar sem backend no ar. Todas continuam renderizadas **no servidor**; a velocidade vem do cache de `fetch` (Seção 9), e não de HTML gerado no build. Para o requisito de indexação o efeito é o mesmo: a página chega pronta ao buscador.

### 5.1. O perfil do coletivo: o backend responde `301`, o frontend responde `308`

O backend responde `301` quando o slug pedido é antigo. O `fetch` **segue redirecionamentos por padrão**, então a página renderizaria certo — mas na **URL errada**. Do ponto de vista de um buscador, isso é conteúdo duplicado em dois endereços, que é exatamente o que o mecanismo de `301` existia para evitar. O trabalho do backend seria desperdiçado no último metro.

**Como resolver, de forma robusta:** deixar o `fetch` seguir o redirecionamento normalmente e, depois, comparar o slug pedido com o `slug` que veio no corpo. Se forem diferentes, chamar `permanentRedirect()` do `next/navigation`.

```tsx
const coletivo = await buscarColetivo(slug);
// O backend redirecionou: o slug pedido é antigo. Levar o NAVEGADOR ao
// endereço canônico, e não só o conteúdo — senão o buscador indexa dois
// endereços para o mesmo coletivo, que é o que o 301 do backend evita.
if (coletivo.slug !== slug) {
  permanentRedirect(`/coletivos/${coletivo.slug}`);
}
```

Comparar o corpo, em vez de inspecionar o status com `redirect: "manual"`, é deliberado: não depende da semântica de modo de redirecionamento do `fetch`, que difere entre servidor e navegador, e falha de forma visível se algum dia o backend mudar a mecânica.

**O status que o visitante recebe é `308`, não `301`.** O `permanentRedirect` do Next responde `308`, e não há como pedir `301` sem escrever a resposta à mão — o que não compensa. Os dois são redirecionamento permanente e os buscadores os tratam igual para consolidar autoridade; o `308` ainda preserva o método HTTP.

Os dois números convivem, em camadas diferentes: **`301` é o da API** (o backend, ao responder o slug antigo) e **`308` é o do site** (o Next, ao mandar o navegador para a URL canônica). Onde este documento disser `301` sem qualificar, trata-se do backend.

### 5.2. O que o perfil mostra — e o que não pode mostrar

Mostra: nome, categorias, descrição, bairro, site e **apenas os contatos presentes na resposta**.

Cada contato é renderizado sob checagem de existência, e o rótulo vive **dentro** da condição:

```tsx
{coletivo.telefone && (
  <p><span className="font-medium">Telefone:</span> {coletivo.telefone}</p>
)}
```

Escrever o rótulo fora da condição produz "Telefone:" seguido de nada — que denuncia que existe um telefone escondido, e é precisamente o que a omissão de chave no backend impede. A Seção 8.2 tem teste para isto.

---

## 6. Ordem de execução (sequência de PRs)

Continua a numeração das fatias anteriores, que terminaram no PR K. Executar **nesta ordem**:

| # | Branch | Conteúdo | Bloqueia? |
|---|---|---|---|
| **L** | `chore/scaffold-frontend` | `create-next-app` (TS + Tailwind + App Router), `src/tipos/api.ts`, `src/lib/api.ts`, layout base, `README.md`, CI do repositório, Dockerfile | Sim — tudo depende |
| **M** | `feat/listagem-de-coletivos` | `/` e `/coletivos` com busca, filtros e paginação na URL | Depende de L |
| **N** | `feat/perfil-do-coletivo` | `/coletivos/[slug]`, `404`, canônico via `308`, metadados de compartilhamento | Depende de M |
| **O** | `feat/agenda-de-eventos` | `/eventos` e `/eventos/[slug]` com galeria | Depende de L |
| **P** | `feat/mapa-de-pontos` | `/mapa` com Leaflet + lista textual | Depende de L |
| **Q** | `test/frontend-regressao-lgpd` | Suíte da Seção 8, bloqueante no CI | Depende de N, O e P |
| **R** | `feat/sitemap-e-robots` | `sitemap.ts` e `robots.ts` do App Router (Seção 9) | Depende de Q |

> **Por que o PR R existe:** na v1.0 deste documento, `sitemap.ts` e `robots.ts` apareciam na Seção 9 e no checklist da Seção 11, mas **nenhum PR os assumia**. O resultado previsível: a fatia foi dada por concluída sem eles. Item pedido em duas seções e atribuído a nenhuma é item que não acontece.

> **Por que a regressão de LGPD é PR próprio:** mesma razão da fatia 2 (PR F). O revisor recebe um PR pequeno em que a única pergunta é *"este teste realmente prova a promessa?"*, sem competir com a atenção gasta em revisar telas.

Cada PR sai de `staging`, segue Conventional Commits em português e vai a revisão. Configurar em `ecosol-frontend` as mesmas proteções de `main` e `staging` já ativas no backend — **isso faz parte do PR L**, não é tarefa avulsa.

---

## 7. Implementação

```
apps/ecosol-frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx            # cabeçalho, rodapé, metadados base
│   │   ├── page.tsx              # home
│   │   ├── coletivos/
│   │   │   ├── page.tsx          # listagem
│   │   │   └── [slug]/page.tsx   # perfil (301 da API → 308 canônico)
│   │   ├── eventos/
│   │   │   ├── page.tsx
│   │   │   └── [slug]/page.tsx
│   │   ├── mapa/page.tsx
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   ├── componentes/
│   │   ├── CartaoColetivo.tsx
│   │   ├── CartaoEvento.tsx
│   │   ├── Mapa.tsx              # "use client" — única ilha de cliente
│   │   ├── Paginacao.tsx
│   │   └── FormularioDeBusca.tsx
│   ├── lib/
│   │   ├── api.ts                # única porta para o backend
│   │   └── datas.ts              # formatação em pt-BR
│   └── tipos/
│       └── api.ts                # o contrato (Seção 4.2)
├── docs/PRD/                     # este documento
├── Dockerfile
└── next.config.ts
```

### 7.1. Variáveis de ambiente

| Variável | Exemplo | Para quê |
|---|---|---|
| `API_URL` | `http://localhost:8001` | Base da API. **Sem `NEXT_PUBLIC_`** — o navegador nunca chama a API |
| `API_URL_PUBLICA` | `http://localhost:8001` | Host público para reescrever URL de mídia (Seção 4.5) |

Documentar as duas em `.env.example`, como o backend faz.

### 7.2. Formatação de datas — `src/lib/datas.ts`

`data_inicio` chega como `2026-08-15T18:00:00-03:00`. Exibir com `Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" })`, e **não** com `toLocaleString()` sem fuso: o servidor de renderização pode estar em UTC, e a data mostrada divergiria da que o navegador calcula — o React acusa erro de hidratação e, pior, o horário do evento aparece errado por três horas.

Quando `data_fim` é `null`, mostrar só o início. Quando existe e cai no mesmo dia, mostrar "15 de agosto, 18h–21h" em vez de repetir a data.

### 7.3. O que não fazer

- **Não** criar rota de API no Next que espelhe a do Django. Server Component já roda no servidor; um `route.ts` no meio seria um salto de rede a mais sem ganho.
- **Não** guardar resposta em estado global. Cada página busca o que precisa.
- **Não** instalar `axios`, `swr`, `react-query`, `zustand` ou biblioteca de componentes.
- **Não** mexer em `apps/ecosol-backend`. Se algo parecer faltar na API, **parar e perguntar**.

---

## 8. Testes desta fatia (PR Q)

Vitest + React Testing Library. Poucos testes, cada um provando algo que quebraria de verdade.

> **O padrão que funcionou, e que vale repetir nas próximas fatias:** o teste de exposição **nasce junto com a tela que ele protege**, no mesmo PR — não no PR final. Na execução desta fatia, quatro dos seis comportamentos da Seção 8.3 já tinham teste quando o PR Q chegou, e ele ficou reduzido ao que sobrava (as duas verificações de nível de página, que são as mais fáceis de esquecer). Planejar uma suíte final grande superdimensiona o último PR e, pior, adia a proteção para depois de o código já estar escrito — quando ela deixa de influenciar o desenho.

### 8.1. Contrato — os tipos são teste

`tsc --noEmit` no CI é a primeira linha de defesa: com `strict: true`, acessar `coletivo.telefone` sem checar não compila. Isso cobre sozinho a classe inteira de erro da Seção 3.4.

### 8.2. Regressão de LGPD na exibição

O irmão, no frontend, do teste que o backend já tem. Renderiza o perfil com um coletivo **sem nenhuma chave de contato** e assere que o HTML resultante:

- não contém as palavras "Telefone", "E-mail" nem "Instagram";
- não contém `undefined` nem `null` como texto visível.

E o par: com os contatos presentes, os três aparecem. Sem esse segundo caso, o teste passaria com um componente que nunca mostra contato nenhum.

### 8.3. Comportamento que quebraria em silêncio

| Teste | O que prova |
|---|---|
| Perfil com slug antigo | Chama `permanentRedirect` para o slug canônico |
| Perfil com slug inexistente | Chama `notFound()`, não renderiza página vazia |
| Ponto com `coletivo: null` | Não renderiza bloco de vínculo nem texto de indisponibilidade |
| Evento com `data_fim: null` | Mostra só a data de início, sem "até null" |
| Formatação de data | `2026-08-15T18:00:00-03:00` vira "15 de agosto de 2026, 18h" no fuso de São Paulo |
| Lista textual do mapa | A página `/mapa` renderiza os nomes dos pontos **sem** o componente de mapa |

### 8.4. O que NÃO testar aqui

Nada que o backend já garanta (que coletivo inativo não vem na listagem, que `ativo` não sai na resposta). Duplicar essa suíte no frontend dá falsa sensação de cobertura e quebra junto quando o backend mudar de propósito. O frontend testa **o que o frontend faz com a resposta**.

### 8.5. CI

Workflow em `.github/workflows/ci.yml` do repositório do frontend, espelhando o do backend, rodando em todo PR:

`npm ci` → `npm run lint` → `tsc --noEmit` → `vitest run` → `next build`

O `next build` no CI não é redundante: ele é o único passo que pega o erro de `window is not defined` do Leaflet (Seção 4.4), que não aparece em `dev` nem nos testes unitários.

---

## 9. Desempenho, SEO e acessibilidade

**Desempenho** (requisito de 500 ms, Seção 7 do v4.1) — a parte cara é a chamada à API, já otimizada no backend. No frontend:

- `revalidate` de 60 s nas listagens e 300 s nos detalhes, **no cache de `fetch`**. Como nenhuma página é pré-renderizada (Seção 4.3), é daí que vem a velocidade. O cadastro muda algumas vezes por semana; consultar a API a cada visita seria desperdício.
- `next/image` com `sizes` correto — a galeria de evento é o único lugar com imagem pesada.
- Nenhuma fonte externa: usar a pilha de fontes do sistema. Uma fonte do Google custa mais no 3G de um smartphone básico do que entrega em estética.

**SEO** (o propósito do projeto):

- `generateMetadata` por página, com `title`, `description` e Open Graph.
- `sitemap.ts` e `robots.ts` do App Router, listando coletivos e eventos ativos — **PR R da Seção 6**.
- URLs por slug, e o `301` da API honrado com um `308` do site, conforme a Seção 5.1.
- `<link rel="canonical">` no perfil.

**Acessibilidade** — não é item de luxo aqui: o público inclui pessoas em conexão ruim e aparelho modesto. HTML semântico, contraste suficiente, foco visível, `alt` real nas imagens (a `legenda` da imagem do evento serve), e a lista textual do mapa da Seção 4.4.

---

## 10. Decisões desta fatia

### 10.1. Todo acesso à API é server-side — e por isso o backend segue sem CORS

**Decisão:** nenhum componente de cliente chama a API. Busca, filtro e paginação são navegação (mudam a URL, o servidor re-renderiza), não `fetch` no navegador.

**Motivo:** o backend hoje **não tem `django-cors-headers`** instalado — verificado em `requirements.txt` e `config/settings.py`. Chamada de servidor para servidor não passa por CORS, então a arquitetura acima funciona sem tocar no backend. E ela é a que o v4.1 já pedia por outro caminho: filtro que muda a URL é compartilhável, indexável e sobrevive ao botão "voltar".

**Consequência a registrar:** no dia em que alguém quiser busca instantânea enquanto digita, isso **não é um ajuste de componente** — exige instalar e configurar `django-cors-headers` no backend, em PR próprio, com a lista de origens permitidas. Não fazer isso por conta própria dentro desta fatia.

### 10.2. O mapa é ilha de cliente; a página do mapa é servidor

Registrada na Seção 4.4. O widget não pode ser SSR (Leaflet lê `window`), mas a página pode e deve — daí a lista textual, que atende SEO e acessibilidade de uma vez.

### 10.3. Geocodificação por Nominatim fica fora desta fatia

O v4.1 (2.4) prevê Nominatim para converter endereço em coordenadas **no momento do cadastro**. Isso é trabalho do back-office, não do frontend público: hoje a equipe digita latitude e longitude no Admin, e o mapa apenas lê. Automatizar a geocodificação é melhoria do Admin, em fatia própria.

### 10.4. Onde vive o `docker-compose` — a decidir com o Jean

O v4.1 (2.5) prevê os três serviços orquestrados juntos. Hoje o `docker-compose.yml` vive **dentro de `apps/ecosol-backend`**, e o frontend é outro repositório: um compose não consegue construir a partir de um contexto fora da sua árvore.

Três saídas possíveis, e **nenhuma deve ser escolhida sem decisão explícita**:

| Saída | Custo |
|---|---|
| Cada repo com seu compose; o do frontend só sobe o Next e aponta para o backend em `localhost` | Simples, mas deixa de ser "um comando sobe tudo" |
| Um terceiro repositório de infraestrutura, com o compose dos três | Fiel ao v4.1; um repo a mais para manter |
| Compose do backend ganha o serviço do frontend, com contexto por `../ecosol-frontend` | Um comando sobe tudo, mas amarra os dois repos a um layout de pastas |

Esta é a **única questão em aberto** do PRD. O PR L entrega o `Dockerfile` do frontend em qualquer cenário; a orquestração conjunta espera a decisão.

### 10.5. Sem emendas ao PRD Técnico v4.1

Nenhuma decisão aqui contraria o v4.1. Fica registrada, porém, uma **defasagem do documento** a corrigir na próxima revisão: a Seção 9 do v4.1 documenta apenas o contrato de Coletivos, enquanto Eventos e Pontos de Interesse já têm contrato real (README do backend), e a Seção 12 ainda descreve o item 6 como "próximo" quando ele foi entregue.

### 10.6. O filtro por categoria é clique no cartão, não lista suspensa

**Decisão:** categoria e bairro se aplicam clicando no próprio cartão de um coletivo, e os filtros em vigor aparecem como rótulos removíveis no topo da listagem.

**Motivo:** a API não expõe catálogo (Seção 3.3), e a decisão de **não criar** `/api/categorias/` foi tomada. Sem esse endpoint não há de onde tirar as opções de uma lista suspensa. E um campo de texto livre para bairro seria pior do que parece: o filtro compara o valor inteiro (`iexact`), então "icarai" sem acento, ou "Centro Niterói", devolvem vazio sem explicar por quê. Clicando, o valor está correto por construção.

**Os rótulos removíveis não são enfeite.** Sem eles, a única pista de que a listagem está recortada seria a barra de endereço — e quem chega por um link compartilhado não viu o clique acontecer: veria uma lista incompleta achando que é a rede inteira.

Isto **não é contorno provisório**, é o desenho oficial. Registrado para que a próxima pessoa a ler o documento não proponha a lista suspensa de novo.
---

## 11. Checklist de aceite (para marcar no PR)

- [ ] Scaffold Next.js com App Router, TypeScript `strict` e Tailwind.
- [ ] `src/tipos/api.ts` com os três tipos; contatos como `?: string`, **nunca** `| null`.
- [ ] `src/lib/api.ts` é a única porta para o backend; nenhum `fetch` solto em componente.
- [ ] `await connection()` na camada de acesso — e `next build` passa com o backend **desligado**.
- [ ] Nenhuma chamada à API a partir do navegador.
- [ ] As seis rotas da Seção 5 respondem com HTML já preenchido (conferido sem JavaScript).
- [ ] Busca, filtros e paginação refletidos na URL.
- [ ] Slug inexistente ou inativo → `notFound()`.
- [ ] Slug antigo → `permanentRedirect` para o canônico, respondendo `308` (a barra de endereço muda).
- [ ] Contato sem consentimento não deixa rótulo, `undefined` nem ícone órfão.
- [ ] Ponto com `coletivo: null` não exibe bloco de vínculo nem aviso.
- [ ] Mapa com `dynamic(..., { ssr: false })` **dentro de um invólucro `"use client"`**, CSS do Leaflet importado e pino em `divIcon`.
- [ ] `/mapa` traz a lista textual dos pontos renderizada no servidor.
- [ ] Datas formatadas em `America/Sao_Paulo`, sem erro de hidratação.
- [ ] `images.remotePatterns` cobrindo Supabase e `localhost:8001`, e `dangerouslyAllowLocalIP` condicionado ao host da API (não a `NODE_ENV`).
- [ ] `generateMetadata` e `canonical` no perfil.
- [ ] `sitemap.ts` e `robots.ts` (PR R — não faz parte de L–Q).
- [ ] Bloco `prefers-color-scheme: dark` e a regra `body` do scaffold **removidos** do `globals.css`.
- [ ] Mobile first, sem rolagem horizontal, conferido também em modo escuro do sistema.
- [ ] Suíte da Seção 8 passando e bloqueante no CI.
- [ ] `lint`, `tsc --noEmit`, `vitest run` e `next build` verdes.
- [ ] `README.md` do frontend com execução, variáveis e relação com a API.
- [ ] `main` e `staging` protegidas em `ecosol-frontend`.
- [ ] Decisão da Seção 10.4 registrada no PR L.

---

## 12. Instruções para o Claude Code (como executar)

1. Trabalhar **dentro de `apps/ecosol-frontend`** — é o repositório Git independente. **Não** tocar em `apps/ecosol-backend` nesta fatia.
2. **Antes de tudo**, rodar `git status` nos dois repositórios: se houver alteração não commitada, **parar e avisar**. Não commitar trabalho alheio junto, não usar `stash` sem perguntar.
3. Ler, **antes de escrever código**: a seção "API pública" do `README.md` do backend (o contrato), `rede/serializers.py` (o que sai e o que não sai) e este documento inteiro. O código do backend é a referência de estilo — comentário explica *por quê*, não *o quê*.
4. **Subir o backend local e olhar as respostas de verdade** antes de escrever os tipos. Conferir na resposta real que o coletivo sem consentimento não traz a chave do contato; é a diferença entre transcrever o contrato e verificá-lo.
5. Seguir a ordem de PRs da Seção 6. Um PR por branch, saindo de `staging`, com Conventional Commits em português.
6. Rodar `npm run lint`, `tsc --noEmit`, `vitest run` e `next build` a cada commit; só seguir com tudo verde.
7. Nenhuma dependência além das da Seção 4.1. Querer uma a mais é sinal de parar e perguntar.
8. Manter tudo em português — código, comentários, commits, textos de tela e mensagens de erro. É requisito de Tecnologia Social do projeto.
9. **Não dar push sem autorização explícita.** Commit local é livre; `push`, PR e merge só quando o Jean pedir.
10. Diante de qualquer ambiguidade sobre o que pode ser exibido: **parar e perguntar**. Em hipótese alguma inventar um campo, inferir um dado que a API não devolveu, ou exibir um valor "por precaução".

---

*Fatia derivada da Seção 11, item 5 do PRD Técnico v4.1. Encerra o MVP em código. Não altera decisões de arquitetura e não registra emendas; deixa em aberto uma única decisão (Seção 10.4, orquestração Docker dos dois repositórios) e aponta duas defasagens do v4.1 a corrigir na próxima revisão (Seção 10.5).*
