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
