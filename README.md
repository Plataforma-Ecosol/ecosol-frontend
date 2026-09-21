# ecosol-frontend

Frontend público da **Plataforma de Rede da Economia Solidária de Niterói** —
Centro Público de Referência em Economia Solidária (Casa Paul Singer) ·
ITES / IFRJ Campus Niterói.

Aplicação Next.js **somente leitura**, que consome a API pública do
`ecosol-backend`. Não há login, não há escrita e não há área administrativa: o
cadastro vive no Django Admin, atrás de autenticação, em outro repositório.

## Requisitos

- Node.js 22 ou superior
- O backend rodando e acessível (ver `ecosol-backend`)

## Estrutura

```
src/
├── app/          # rotas (App Router) — cada pasta é uma URL pública
├── componentes/  # peças de interface reutilizadas entre páginas
├── lib/          # api.ts (única porta para o backend) e utilidades
└── tipos/        # api.ts — o contrato da API em TypeScript
```

## Como rodar

```bash
npm ci
cp .env.example .env.local   # ajuste API_URL se o backend não estiver em :8001
npm run dev
```

A aplicação sobe em <http://localhost:3000>.

Para subir o backend do qual esta aplicação depende, a partir de
`apps/ecosol-backend/infra`:

```bash
docker compose up --build
```

### Ou os três serviços de uma vez, em Docker

O repositório `ecosol-infra` sobe Postgres, Django e este frontend com um
comando — útil para conferir a integração como ela roda de verdade, mas sem
recarga ao editar (o código vai para dentro da imagem):

```bash
cd ../../ecosol-infra   # ao lado de apps/, ver o README de lá
docker compose up --build
```

Para o dia a dia de frontend, prefira `npm run dev` acima: é o único caminho
com Fast Refresh.

## Variáveis de ambiente

| Variável | Padrão | Para quê |
|---|---|---|
| `API_URL` | `http://localhost:8001` | Onde o **servidor** do Next encontra a API |
| `API_URL_PUBLICA` | igual a `API_URL` | Onde o **navegador** encontra a API — só para reescrever URL de imagem |

Não existe variável `NEXT_PUBLIC_*`, e isso é decisão de arquitetura (abaixo).

## Como este projeto fala com a API

**Todo acesso acontece no servidor.** Nenhum componente de cliente chama a API;
busca, filtro e paginação são navegação — mudam a URL, e o servidor
re-renderiza. Três consequências, todas desejadas:

1. **As páginas chegam prontas ao buscador.** Descoberta é o propósito da
   plataforma: cada coletivo precisa ser uma página real, indexável e com
   prévia ao ser compartilhada no WhatsApp.
2. **O estado da busca é compartilhável.** Um filtro que vive na URL sobrevive
   ao botão "voltar" e pode ser enviado a outra pessoa.
3. **O backend não precisa de CORS.** Chamada de servidor para servidor não
   passa por CORS, e o `ecosol-backend` não tem `django-cors-headers` instalado.

> Se um dia for preciso buscar do navegador (busca instantânea enquanto
> digita, por exemplo), **não é um ajuste de componente**: exige instalar e
> configurar `django-cors-headers` no backend, em PR próprio, com a lista de
> origens permitidas.

`src/lib/api.ts` é a **única** porta para o backend. Nenhum `fetch` solto em
componente — quando alguém perguntar por onde este sistema fala com o Django, a
resposta tem de ser um arquivo, não uma busca no projeto inteiro.

## O contrato, e as três armadilhas

`src/tipos/api.ts` traduz o contrato da API. Três pontos onde errar produz bug
silencioso:

1. **Contato sem consentimento não é `null` — a chave não existe.** Por isso o
   tipo é `telefone?: string`, e nunca `telefone: string | null`. Renderizar o
   rótulo fora da checagem produz "Telefone:" seguido de nada, que denuncia
   justamente o dado que o backend escondeu.
2. **`coletivo` de um ponto é `null` em dois casos** — sem vínculo, ou vínculo
   com coletivo fora do ar. São indistinguíveis de propósito; não tente
   separá-los nem exiba "coletivo indisponível".
3. **`data_fim` é `null` legítimo.** Evento sem fim declarado.

A referência completa está na seção "API pública" do `README.md` do
`ecosol-backend`, que é a fonte da verdade — ela é verificada por testes.

## Imagens

As imagens vêm do backend como URL absoluta: do Supabase Storage em produção,
de `localhost:8001/media/` no ambiente local. Duas configurações decorrem disso:

- `next.config.ts` declara os hosts em `images.remotePatterns` — sem isso o
  `next/image` recusa a URL.
- `urlPublicaDeMidia()` reescreve o host quando o Next roda dentro do Docker e
  chama a API por um endereço interno (`backend:8001`), que o navegador da
  pessoa não alcança.

## Testes e lint

```bash
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # vitest
npm run build      # next build
```

Os quatro rodam no CI a cada pull request. O `build` não é redundante: é o
único passo que pega o erro de `window is not defined` — biblioteca de
navegador importada fora de uma ilha de cliente —, que não aparece em `dev` nem
em teste unitário.

## Fluxo Git

Branches por tarefa saindo de `staging`, Conventional Commits em português,
`main` e `staging` protegidas. Tudo em português — código, comentários,
commits e textos de tela: é requisito de Tecnologia Social do projeto.

## Documentação

| Documento | O que traz |
|---|---|
| `docs/PRD/PRD_Implementacao_Frontend_Publico_v1.md` | Especificação desta fatia |
| `../ecosol-backend/docs/PRD/` | PRD Técnico e demais fatias |

Licença: GPLv3.
