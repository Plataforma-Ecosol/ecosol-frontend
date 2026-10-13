/** Item da paginação: um número de página ou as reticências de um trecho cortado. */
export type ItemDaPaginacao = number | "…";

/**
 * Quais páginas aparecem na paginação.
 *
 * Sempre a primeira, a última, a atual e `vizinhos` páginas de cada lado dela;
 * o resto vira "…". Com isso a lista nunca passa de `2 * vizinhos + 5` itens,
 * que é o que deixa a paginação caber no celular (PRD de componentes, seção 4).
 *
 * Um buraco de uma página só mostra o número, e não "…": trocar um número por
 * reticências não economiza espaço e esconde uma página à toa.
 *
 * Função pura, sem HTML, para a regra poder ser testada caso a caso.
 */
export function paginasVisiveis(
  atual: number,
  total: number,
  vizinhos: number,
): ItemDaPaginacao[] {
  if (total < 1) return [];

  // Na prática a API responde 404 antes de uma página fora do intervalo
  // chegar aqui; trazer para dentro só evita a função quebrar.
  const pagina = Math.min(Math.max(atual, 1), total);

  if (total <= 2 * vizinhos + 5) {
    return Array.from({ length: total }, (_, indice) => indice + 1);
  }

  const visiveis = new Set([1, total]);
  for (let p = pagina - vizinhos; p <= pagina + vizinhos; p++) {
    if (p >= 1 && p <= total) visiveis.add(p);
  }

  const itens: ItemDaPaginacao[] = [];
  let anterior = 0;
  for (const p of [...visiveis].sort((a, b) => a - b)) {
    if (p - anterior === 2) itens.push(p - 1);
    else if (p - anterior > 2) itens.push("…");
    itens.push(p);
    anterior = p;
  }
  return itens;
}
