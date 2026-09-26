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
