/**
 * O endereço público deste site.
 *
 * Existe como módulo, e não como `process.env.SITE_URL` espalhado, porque três
 * lugares precisam do mesmo valor — o `metadataBase` do layout, o `sitemap.ts`
 * e o `robots.ts` — e um deles divergindo produz endereço errado no índice do
 * buscador, que é o tipo de defeito que ninguém percebe olhando o site.
 */

/** Sem barra no fim: quem monta caminho concatena `/algo` e não quer `//algo`. */
export const ENDERECO_DO_SITE = (
  process.env.SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

/** Garante que o endereço termine em `/admin/`, sem duplicar a barra nem o `admin`. */
function comSufixoAdmin(url: string): string {
  const semBarraNoFim = url.replace(/\/+$/, "");
  const comAdmin = /\/admin$/.test(semBarraNoFim)
    ? semBarraNoFim
    : `${semBarraNoFim}/admin`;
  return `${comAdmin}/`;
}

/**
 * Endereço do Django Admin, para o link discreto "Área da equipe" no rodapé.
 *
 * O backend fica em outro domínio, então não há como montar esse endereço a
 * partir de `ENDERECO_DO_SITE`. `ADMIN_URL` existe para permitir um endereço
 * de admin diferente do da API pública (um subdomínio próprio, por exemplo);
 * na ausência dela, o padrão é `/admin/` a partir de `API_URL_PUBLICA` — a
 * mesma variável que já resolve o endereço de mídia alcançável pelo
 * navegador, com a mesma cadeia de fallback dela (`API_URL`, depois
 * `localhost:8001`) — porque cobre o compose e o local sem exigir
 * configuração nova. String vazia (o valor de um `ARG` do Docker sem
 * `--build-arg`) conta como "não definida".
 */
export const ENDERECO_DA_AREA_DA_EQUIPE = comSufixoAdmin(
  process.env.ADMIN_URL ||
    process.env.API_URL_PUBLICA ||
    process.env.API_URL ||
    "http://localhost:8001",
);

/** Monta um endereço absoluto a partir de um caminho interno. */
export function urlAbsoluta(caminho: string): string {
  return `${ENDERECO_DO_SITE}${caminho.startsWith("/") ? caminho : `/${caminho}`}`;
}

/**
 * O site pode ser indexado por buscadores?
 *
 * `false` só em homologação. Lá o site existe para a equipe conferir o
 * trabalho da sprint — e um coletivo de teste no Google, ou a mesma página em
 * dois domínios, atrapalha o site oficial, cujo propósito é ser encontrado.
 * Qualquer valor que não seja exatamente "false" conta como indexável: o erro
 * de digitação cai no comportamento de produção, que é o padrão do projeto.
 */
export const SITE_INDEXAVEL =
  process.env.SITE_INDEXAVEL?.trim().toLowerCase() !== "false";

/**
 * A prévia padrão de link: a logo da Casa sobre bege (`app/opengraph-image.png`).
 *
 * O Next já a aplica sozinho às páginas que não declaram `openGraph`. Mas uma
 * página que declara `openGraph` SUBSTITUI o do layout por inteiro, imagem
 * inclusive — e o perfil do coletivo e o evento sem cartaz, justamente os
 * links que mais circulam no WhatsApp, saíam sem prévia nenhuma. Essas
 * páginas usam esta constante como reserva.
 *
 * Caminho relativo de propósito: o `metadataBase` do layout o torna absoluto,
 * que é o único formato que o WhatsApp aceita.
 */
export const IMAGEM_DE_COMPARTILHAMENTO = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "Casa da Economia Solidária Paul Singer",
};
