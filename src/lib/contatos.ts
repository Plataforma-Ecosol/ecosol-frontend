/**
 * Como cada contato autorizado vira um link clicável.
 *
 * O cadastro é preenchido por pessoas, à mão, e aceita o mesmo contato escrito
 * de várias formas. Normalizar na exibição é o que evita o link quebrado — e
 * link quebrado num perfil público é pior do que texto simples, porque parece
 * que o coletivo não existe mais.
 */

/**
 * Monta o endereço do perfil no Instagram a partir do que a equipe digitou.
 *
 * O campo é texto livre: aparece como `@coletivo`, `coletivo`, ou já como URL
 * inteira. Os três precisam levar ao mesmo lugar.
 */
export function urlDoInstagram(valor: string): string | undefined {
  const limpo = valor.trim();
  if (!limpo) return undefined;

  // Já é endereço completo — respeitar o que foi cadastrado em vez de
  // reconstruir, que quebraria um link de perfil com parâmetro ou subcaminho.
  if (/^https?:\/\//i.test(limpo)) return limpo;

  const usuario = limpo.replace(/^@/, "").replace(/^instagram\.com\//i, "");
  return usuario ? `https://instagram.com/${usuario}` : undefined;
}

/** O texto do link do Instagram: sempre com `@`, venha como vier. */
export function arrobaDoInstagram(valor: string): string {
  const limpo = valor.trim().replace(/^https?:\/\/(www\.)?instagram\.com\//i, "");
  const usuario = limpo.replace(/^@/, "").replace(/\/$/, "");
  return `@${usuario}`;
}

/**
 * Garante que o site cadastrado tenha esquema.
 *
 * Sem isto, `ecosolniteroi.org` no `href` vira caminho RELATIVO: o navegador
 * abriria `/coletivos/ecosolniteroi.org`, um 404 dentro do próprio site. O
 * campo é `URLField` no Django, que normalmente já exige esquema — mas o dado
 * pode ter vindo da planilha antiga, e o custo de garantir aqui é uma linha.
 */
export function urlDoSite(valor: string): string | undefined {
  const limpo = valor.trim();
  if (!limpo) return undefined;
  return /^https?:\/\//i.test(limpo) ? limpo : `https://${limpo}`;
}
