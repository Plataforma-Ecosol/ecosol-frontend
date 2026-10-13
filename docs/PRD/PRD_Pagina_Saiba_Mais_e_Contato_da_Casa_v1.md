# PRD — Página "Saiba mais" com contato da Casa Paul Singer

13/10/2026 · Jean Macedo

## Contexto e objetivo

Hoje quem chega ao site vê coletivos, agenda e mapa, mas não encontra quem está por trás da plataforma nem como falar com essa equipe. O rodapé cita o Centro Público de Referência em Economia Solidária (Casa Paul Singer), sem endereço, telefone ou e-mail. Esta página resolve isso: uma aba "Saiba mais" no menu principal, aberta ao público geral, com a apresentação da Casa e da Rede, as formas de contato e o caminho até lá.

É a prioridade 3 pedida pela Casa Azul na reunião de alinhamento, depois das cores e da logo (as duas já entregues). **Esta página também substitui a "página Sobre"** que o calendário previa para a Sprint 2: o conteúdo seria o mesmo, e ela já entra na Sprint 1.

**História:** como visitante, quero conhecer a Casa Paul Singer e encontrar telefone, e-mail, endereço e horário de atendimento para entrar em contato ou ir até lá.

- **Card:** [\[Institucional\] Aba "Saiba mais" com contato da Casa Azul · 2 pts](https://trello.com/c/srGBtSKg/36-institucional-aba-saiba-mais-com-contato-da-casa-azul-2-pts) (Sprint Backlog – Sprint 1)
- **Origem:** [Decisões da reunião com a Casa Azul](https://trello.com/c/ao8wf0Xg/67-decis%C3%B5es-da-reuni%C3%A3o-com-a-casa-azul)
- **PRDs anteriores:** paleta, logo, base visual e componentes (`docs/PRD/`). Esta página usa os tokens de cor, a `font-titulo`, os ícones do `lucide-react`, o `Button` do shadcn e o `BotaoCopiar`.
- **Escopo:** só o frontend Next.js. Nenhuma mudança no backend nem na API.
- **Ponto de partida:** a `staging` com o PR #19 (componentes) já mesclado.
- **Validação:** a página será implementada como descrita aqui e apresentada na reunião com a Casa Azul para aprovação. Ajustes pedidos na reunião entram numa versão nova deste PRD.

## Decisões de 13/10

- **Conteúdo fixo no frontend, por enquanto.** Os dados da Casa ficam num módulo TypeScript. A edição pelo Admin é desejada, mas fica para um card próprio (ver "Próximo passo: edição pelo Admin").
- **Entrega na Sprint 1**, como previsto no card.
- **Substitui a "página Sobre" da Sprint 2.** Tirar "página Sobre" do calendário das sprints no Trello.
- **"Ver no mapa" abre o Google Maps.** No celular, abre o aplicativo de rotas que o público já usa.
- **O nome no menu é "Saiba mais"**, o termo da Casa.
- **Cache de 5 minutos** (`REVALIDACAO_DETALHE`) quando os dados passarem a vir da API. Nesta entrega não há cache: a página é estática.
- **Dados da Casa confirmados** (ver "Dados confirmados"), com Facebook incluído.
- **O ITES fica na página**, no último bloco, com o nome por extenso e o endereço no IFRJ Campus Niterói.

**Consequência boa do conteúdo fixo:** a página não chama a API. O Next a gera estática no build, ela abre instantânea e continua no ar mesmo com o backend fora.

## O que a página mostra

Rota `/saiba-mais`, link "Saiba mais" no menu principal. Quatro blocos, nesta ordem:

```
┌──────────────────────────────────────────────────────────┐
│ Casa da Economia Solidária Paul Singer          (h1)     │
├──────────────────────────────────────────────────────────┤
│ Quem somos                                       (h2)    │
│ Texto curto sobre a Casa                                 │
├──────────────────────────────────────────────────────────┤
│ Fale com a Casa                       (h2, id=contato)   │
│ ┌──────────────────────────────────────────────────────┐ │
│ │ [tel] (21) 2717-8350                        [Copiar] │ │
│ │ [✉ coordenaecosol@gmail.com]  [@ casapaulsinger]     │ │
│ │ [Facebook]                                           │ │
│ │ [pino] Av. Ernani do Amaral Peixoto, 901 - Centro,   │ │
│ │        Niterói - RJ, 24020-075   [Ver no mapa ↗]     │ │
│ │ [relógio] Segunda a sexta-feira, das 10h às 16h      │ │
│ │           Para cadastros, até as 17h                 │ │
│ └──────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────┤
│ A Rede de Economia Solidária de Niterói          (h2)    │
│ O que é a rede e o que a plataforma oferece              │
│ [Conheça os coletivos] [Veja a agenda]                   │
├──────────────────────────────────────────────────────────┤
│ Quem faz a plataforma                            (h2)    │
│ ITES (Incubadora Tecnológica de Empreendimentos          │
│ Solidários) do IFRJ Campus Niterói, apoio do CNPq,       │
│ endereço do campus, software livre (GPLv3) + GitHub      │
└──────────────────────────────────────────────────────────┘
```

No desktop (a partir de `md`), "Quem somos" e "Fale com a Casa" podem ficar lado a lado, com o contato à direita. No celular, uma coluna só, com o contato logo depois do "Quem somos": quem abre a página no telefone quase sempre quer o contato.

**Regra geral: dado não confirmado não aparece.** Bloco sem texto some com o seu título; linha de contato sem dado some com o ícone e o rótulo. É a mesma regra do perfil do coletivo. Assim a página pode ir ao ar com o que já estiver confirmado, sem "a definir" na tela.

### Cabeçalho da página

- `h1`: "Casa da Economia Solidária Paul Singer", o nome oficial.
- Sem subtítulo por enquanto. O campo `subtitulo` existe no tipo para quando a Casa quiser um.
- O título do menu é "Saiba mais", e o `h1` é o nome da Casa. O leitor de tela anuncia o que a página é, não o nome da aba.

### Quem somos

Dois parágrafos curtos sobre a Casa: o que é, o que faz e para quem. **O texto é da Casa Azul.** O rascunho abaixo só usa o que já está no site (rodapé e metadados), sem inventar datas, números ou histórico, e só vai ao ar com a aprovação da Casa:

> A Casa da Economia Solidária Paul Singer é o Centro Público de Referência em Economia Solidária de Niterói. É aqui que coletivos, feiras e empreendimentos da economia solidária da cidade encontram apoio, formação e espaço para se organizar.
>
> A Casa mantém esta plataforma para que qualquer pessoa conheça os coletivos da rede, acompanhe a agenda de eventos e saiba onde encontrar a economia solidária em Niterói.

### Fale com a Casa (`id="contato"`)

Mesmo acabamento do "Fale com o coletivo": `rounded-xl border border-dourado-200 bg-white p-5`. Os dados vão dentro de um `<address>`, o elemento HTML feito para o contato de quem publica a página. O bloco só existe se houver pelo menos um contato.

| Item | Como aparece | Link |
| --- | --- | --- |
| Telefone | Ícone `Phone` + `telefone` + `BotaoCopiar` | `tel:{telefone_discagem}` |
| E-mail | Botão com o próprio endereço (ícone `Mail`) | `mailto:` |
| WhatsApp (não há hoje) | Botão "WhatsApp" (ícone `MessageCircle`) | `https://wa.me/{whatsapp}`, nova aba |
| Instagram | Botão com o @ (ícone `AtSign`) | perfil, nova aba |
| Facebook | Botão "Facebook" (ícone `Globe`) | página, nova aba |
| Endereço | Ícone `MapPin` + `endereco` + link "Ver no mapa" | Google Maps, nova aba |
| Horário | Ícone `Clock` + `horario_atendimento` | — |

- **Telefone com `tel:` aqui, sem `tel:` no perfil do coletivo.** No perfil, o telefone é texto livre digitado no Admin, e montar o link exigiria adivinhar DDI e DDD. Aqui o número é escrito uma vez no código, já no formato internacional, e revisado no PR. Pelo mesmo motivo o WhatsApp pode existir aqui, se a Casa passar a ter um.
- **Ordem dos botões:** e-mail, WhatsApp, Instagram, Facebook. O primeiro presente é o `default` (azul cheio) e os outros são `outline`, a mesma regra do perfil. Hoje: e-mail cheio; Instagram e Facebook `outline`.
- **Sem logos de marca nos ícones.** O Instagram já usa `AtSign` no perfil do coletivo; o Facebook segue a mesma linha com `Globe` e o texto "Facebook".
- **"Ver no mapa":** `https://www.google.com/maps/search/?api=1&query=<endereco codificado>`. É só um link, sem script nem chave de API.

### A Rede de Economia Solidária de Niterói

Um parágrafo sobre a rede e dois botões para dentro do site: "Conheça os coletivos" (`/coletivos`, `default`) e "Veja a agenda" (`/eventos`, `outline`), com o `Link` do Next. Os botões aparecem mesmo sem o texto: quem chegou pelo "Saiba mais" precisa de um caminho para continuar.

Rascunho, para aprovação da Casa:

> A Rede de Economia Solidária de Niterói reúne coletivos que trabalham de forma autogestionária, com decisões compartilhadas e renda dividida de forma justa. Nesta plataforma você encontra esses coletivos, a agenda de feiras e eventos e os pontos da economia solidária na cidade.

### Quem faz a plataforma

> A plataforma é desenvolvida pela ITES, a Incubadora Tecnológica de Empreendimentos Solidários do IFRJ Campus Niterói, com apoio do CNPq pelo programa PIBITI. É software livre, sob a licença GPLv3, e o código está aberto no GitHub.

- **Endereço do ITES:** "Estr. Washington Luís, 1596 - Sapê, Niterói - RJ, 24315-375" (IFRJ Campus Niterói), em texto, com ícone `MapPin` e `<span className="sr-only">Endereço do ITES: </span>`. Sem "Ver no mapa" aqui: o link de rota da página é o da Casa, que é onde o público é atendido.
- Link para `https://github.com/Plataforma-Ecosol`, em nova aba.
- Sem logos dos parceiros nesta entrega.

Este bloco é o crédito do projeto e da licença, e não dado da Casa. Fica fixo no código (`src/lib/plataforma.ts` ou direto na página) mesmo depois que o resto for editável pelo Admin. O endereço do ITES fica fora do `<address>` do bloco de contato: ele não é contato da Casa.

## Onde mora o conteúdo: `src/lib/casa.ts`

Um módulo só, tipado, com os dados da Casa. A página lê dele, e o JSON-LD também. Nenhum telefone ou endereço escrito direto no JSX.

**Os nomes dos campos são os mesmos que o endpoint do Admin terá** (ver "Próximo passo"). Quando os dados passarem a vir da API, a página troca a origem e o resto fica igual.

```ts
/**
 * Dados institucionais da Casa Paul Singer. Só canais institucionais.
 * Campo não confirmado fica de fora (sem valor), e a página não o exibe.
 */
export type Casa = {
  nome: string;
  subtitulo?: string;
  quem_somos?: string;
  sobre_a_rede?: string;
  telefone?: string; // para exibir: "(21) 2222-3333"
  telefone_discagem?: string; // para o link: "+552122223333"
  whatsapp?: string; // só dígitos, com DDI: "5521999990000"
  email?: string;
  instagram?: string; // reaproveita urlDoInstagram/arrobaDoInstagram de lib/contatos
  facebook?: string; // URL completa da página
  endereco?: string; // texto único, com bairro, cidade e CEP
  horario_atendimento?: string; // quebras de linha viram linhas na tela
};
```

### Dados confirmados (13/10)

```ts
export const CASA: Casa = {
  nome: "Casa da Economia Solidária Paul Singer",
  telefone: "(21) 2717-8350",
  telefone_discagem: "+552127178350",
  email: "coordenaecosol@gmail.com",
  instagram: "https://www.instagram.com/casapaulsinger/",
  facebook: "https://www.facebook.com/economiasolidaria.niteroirj/",
  endereco: "Av. Ernani do Amaral Peixoto, 901 - Centro, Niterói - RJ, 24020-075",
  horario_atendimento:
    "Segunda a sexta-feira, das 10h às 16h\nPara cadastros, até as 17h",
};
```

- **Facebook sem o `?locale=pt_BR`** do link recebido: o parâmetro só força o idioma da interface do Facebook para quem clica.
- **Instagram como URL completa:** `arrobaDoInstagram` mostra `@casapaulsinger` no botão.
- **Horário em duas linhas:** "das 10h às 16h" é o atendimento geral; "até as 17h" vale só para cadastros, como a Casa informou. Ficam em linhas separadas para a exceção não se perder.
- **Ainda sem valor:** `subtitulo`, `quem_somos`, `sobre_a_rede` (dependem da aprovação dos textos) e `whatsapp` (a Casa não informou).

Funções puras no mesmo arquivo:

- **`urlDoMapa(endereco)`:** monta o link do Google Maps com `encodeURIComponent`.
- **`urlDoWhatsapp(numero)`:** `https://wa.me/<dígitos>`.

### Funções e exibição

`quem_somos`, `sobre_a_rede` e `horario_atendimento` são exibidos com `whitespace-pre-line`. Hoje isso só respeita as quebras escritas no código; quando o texto vier do Admin, respeita as que a equipe digitar.

## Requisitos de implementação

Uma branch criada pelo desenvolvedor a partir da `staging`. Commits com aval do desenvolvedor.

1. **`src/lib/casa.ts`** com o tipo, os dados confirmados e as duas funções. Campos não confirmados ficam ausentes, nunca com texto provisório.
2. **`src/app/saiba-mais/page.tsx`**, componente de servidor, sem chamada à API, com os quatro blocos.
3. **Metadados:** `title: "Saiba mais"` (o layout completa com o sufixo da rede), `description` com o nome da Casa e "contato, endereço e horário", `alternates: { canonical: "/saiba-mais" }`. Sem `openGraph` próprio, para valer a prévia padrão com a logo. Se for declarar, usar `IMAGEM_DE_COMPARTILHAMENTO` (`lib/site.ts`).
4. **JSON-LD** (`<script type="application/ld+json">`) com `@type: "Organization"`, nome, `url`, `telephone`, `email`, `address` e `sameAs` (Instagram e Facebook), montado a partir de `CASA`, com os campos ausentes omitidos. Ajuda o Google a mostrar telefone e endereço na busca pelo nome da Casa.
5. **Menu:** `{ href: "/saiba-mais", rotulo: "Saiba mais" }` no fim de `NAVEGACAO`, em `NavegacaoPrincipal.tsx`. Ele já serve o cabeçalho, o painel do celular e o `<noscript>`.
6. **Rodapé:** link discreto "Fale com a Casa" para `/saiba-mais#contato`, ao lado do texto que já cita a Casa Paul Singer.
7. **Sitemap:** entrada fixa `{ url: urlAbsoluta("/saiba-mais"), changeFrequency: "monthly", priority: 0.5 }`, depois de `/mapa`.
8. **Conferir o cabeçalho em 640 px** (início do `sm`, onde o menu deixa de ser painel): logo, "Casa Paul Singer" e quatro pílulas numa linha. Se não couber, reduzir o espaçamento das pílulas só nesse intervalo, ou passar o menu em painel até `md`.
9. `npm run lint`, `npm run typecheck`, `npm test` e `npm run build` verdes. Conferir no log do build que `/saiba-mais` sai como estática (○). Build do Docker também.
10. **Lighthouse** em `/saiba-mais`, modo celular. Números no PR.
11. O desenvolvedor abre o PR com o `template_pr.md`, cola o link no card e move para Code Review.

## Testes

- **`casa.test.ts`:**
  - `urlDoMapa` codifica acentos e vírgulas ("Niterói" vira `Niter%C3%B3i`).
  - `urlDoWhatsapp` monta `https://wa.me/` só com dígitos.
  - **Guarda dos dados:** se existir, `telefone_discagem` casa com `/^\+55\d{10,11}$/` e `whatsapp` com `/^55\d{10,11}$/`; `telefone` e `telefone_discagem` existem juntos ou não existem; `facebook` e `instagram` começam com `https://`; nenhum campo de texto contém "a definir", "xxxx", "TODO" ou "lorem". É o teste que impede um valor provisório de chegar à produção.
- **`saiba-mais/page.test.tsx`:**
  - Renderiza o `h1` com o nome da Casa.
  - Com os dados reais: link `tel:+552127178350`, `mailto:coordenaecosol@gmail.com`, botão `@casapaulsinger`, botão "Facebook" e link do Google Maps, os três últimos com "(abre em nova aba)"; contato dentro de `<address>` com `id="contato"`; horário em duas linhas.
  - Com um `whatsapp` no mock: link `wa.me` entre o e-mail e o Instagram.
  - **Campos ausentes** (mock do módulo `casa.ts`): sem telefone, WhatsApp, Instagram, Facebook e horário, nenhum link `tel:` nem `wa.me`, nenhum `.lucide-phone` nem `.lucide-clock`. Sem `quem_somos`, nenhum "Quem somos" na tela.
  - O primeiro botão de contato presente é o `default`.
  - Os botões "Conheça os coletivos" e "Veja a agenda" apontam para `/coletivos` e `/eventos`.
  - O bloco "Quem faz a plataforma" mostra "Incubadora Tecnológica de Empreendimentos Solidários" e o endereço do campus, fora do `<address>` da Casa.
  - O JSON-LD é JSON válido e não tem chaves vazias.
- **`NavegacaoPrincipal.test.tsx`:** quatro links em cada cópia do menu; em `/saiba-mais`, "Saiba mais" com `aria-current="page"` e os outros sem.
- **`sitemap.test.ts`:** `/saiba-mais` entre as fixas.
- **Regressão de LGPD:** nenhum teste existente muda. A página não lê nada da API.

## Acessibilidade e celular

- **Semântica:** um `h1`, um `h2` por bloco, contato em `<address>`.
- **Leitor de tela:** "Telefone:", "Endereço:" e "Horário de atendimento:" em `sr-only` antes de cada valor; "(abre em nova aba)" no mapa, no Instagram, no Facebook, no WhatsApp e no GitHub; o `BotaoCopiar` já anuncia a cópia pelo `role="status"`.
- **Contraste:** só pares já medidos no PRD de componentes (`azul` sobre branco 8,4; `bege` sobre `azul` 7,4; `azul-900` sobre `azul-50` 9,7). Ícones em `text-azul` ou `text-dourado-escuro`, nunca no `dourado` original.
- **Alvos de toque:** botões com 44 px de altura; "Ver no mapa" com pelo menos 24 px.
- **Celular (360 px):** uma coluna; e-mail e endereço longos quebram linha, sem rolagem horizontal.
- **Sem JavaScript:** a página inteira funciona (é estática). Só o botão Copiar não aparece, e o número continua selecionável.
- **Lighthouse:** acima de 90 em Acessibilidade, SEO e Boas práticas.

## LGPD

- **Só dados institucionais.** Telefone, e-mail e WhatsApp da Casa, nunca o celular ou o e-mail pessoal de alguém da equipe, mesmo que seja a pessoa que atende. Se a Casa só tiver um número pessoal para passar, a linha fica de fora até existir um canal institucional.
- **Nenhum nome de pessoa da equipe** na página. Nome de Pessoa não é dado público na plataforma.
- **Endereço de coletivo continua proibido** (PRD do Frontend §5.2, "bairro sim, logradouro não"). O único endereço completo do site, além dos Pontos de Interesse, é o da Casa.
- O link do mapa não carrega nada de terceiros na nossa página: o Google só recebe a visita se a pessoa clicar.

## Critérios de aceite

- [ ] Rota `/saiba-mais` gerada estática, sem chamada à API
- [ ] "Saiba mais" no menu principal (cabeçalho, painel do celular e `<noscript>`), com `aria-current` na própria página
- [ ] Cabeçalho cabe numa linha em 640 px com os quatro itens
- [ ] Blocos "Quem somos", "Fale com a Casa", "A Rede" e "Quem faz a plataforma", com textos aprovados pela Casa Azul
- [ ] ITES com o nome por extenso e o endereço no IFRJ Campus Niterói
- [ ] Telefone clicável (`tel:`) com botão Copiar; e-mail com `mailto:`; Instagram e Facebook em nova aba; WhatsApp só se a Casa passar a ter
- [ ] Endereço com "Ver no mapa" abrindo o Google Maps em nova aba
- [ ] Horário de atendimento
- [ ] Dado não confirmado não aparece (sem "a definir" na página), garantido por teste
- [ ] Só canais institucionais, nenhum nome ou contato pessoal da equipe
- [ ] Campos de `casa.ts` com os mesmos nomes do futuro endpoint
- [ ] Link "Fale com a Casa" no rodapé levando a `/saiba-mais#contato`
- [ ] Entrada no `sitemap.ts`; título, descrição e canônico próprios; JSON-LD `Organization`
- [ ] Funciona em celular (360 px) e desktop
- [ ] Lighthouse acima de 90 em Acessibilidade, SEO e Boas práticas (números no PR)
- [ ] Lint, typecheck, testes, `next build` e build do Docker verdes

## Fora do escopo

- **Edição pelo Admin.** Próximo passo, em card próprio (seção abaixo).
- **Formulário de contato.** Pediria envio de e-mail, proteção contra spam e tratamento de dado pessoal de quem escreve. E-mail e WhatsApp resolvem.
- **Mapa embutido (Leaflet) na página.** Mais uma ilha de cliente para mostrar um ponto só. Se a Casa for cadastrada como Ponto de Interesse, ela já aparece em `/mapa`.
- **Logos dos parceiros e fotos da Casa.** Dependem dos arquivos e da autorização de uso.
- **Página de privacidade.** Card próprio da Sprint 2.

## Próximo passo: edição pelo Admin

A equipe quer, mais adiante, editar esses dados pelo Admin. O desenho já foi feito em 13/10 e fica registrado aqui para virar card no backlog (sugestão: "[Backend] Dados da Casa editáveis no Admin · 3 pts", e um card de 1 pt no frontend para trocar a origem dos dados).

**Backend**

- Model `Instituicao` com um registro só: `save()` força `pk = 1`, `CheckConstraint(condition=Q(pk=1))` no banco, e uma migration de dados que cria o registro só com o nome (com `reverse_code`).
- Campos com os nomes de `Casa` acima. Telefone e WhatsApp guardados só com dígitos; o `clean()` aceita com ou sem máscara e exige DDD. Endereço como texto único, como o `endereco` do Ponto de Interesse (os nomes `logradouro`, `numero` e `cep` estão na lista de campos nunca públicos do Coletivo).
- Admin com registro único (sem "Adicionar" nem "Excluir"), nome no menu "dados da Casa (página Saiba mais)" e aviso de usar só canais institucionais.
- Endpoint `GET /api/institucional/`, público, com serializer explícito; campo vazio some da resposta; telefone sai em `telefone` e `telefone_discagem`.
- Testes, README da API e emenda do PRD Técnico §9.2.

**Frontend**

- `buscarInstituicao()` em `lib/api.ts`, no modelo do `buscarOpcoes`: devolve `null` quando a API falha, com cache de `REVALIDACAO_DETALHE` (5 minutos). Uma mudança no Admin aparece no site em até 5 minutos.
- Sem dados, a página continua de pé com um aviso de contatos indisponíveis.
- `casa.ts` deixa de guardar os dados e fica só com o tipo e as funções.

## Pendências com a Casa Azul

Os contatos já estão confirmados. Sem os textos, a página vai ao ar sem "Quem somos" e com "A Rede" só com os botões.

- [x] Nome oficial, endereço, telefone, e-mail, Instagram, Facebook e horário (13/10)
- [ ] Aprovação (ou reescrita) dos textos de "Quem somos" e "A Rede"
- [ ] WhatsApp institucional, se a Casa passar a ter
