/**
 * Utilidades para o estado de busca que vive na URL.
 *
 * A escolha de guardar busca, filtro e página na URL — em vez de em estado de
 * componente — é o que torna a listagem compartilhável, indexável e compatível
 * com o botão "voltar". Estas funções são o preço disso, e são pequenas.
 */

/** Os parâmetros como o Next os entrega: um valor pode vir repetido na URL. */
export type ParametrosDaRota = Record<string, string | string[] | undefined>;

/**
 * Reduz `?bairro=Centro&bairro=Fonseca` a um único valor.
 *
 * A URL permite repetir a chave, mas nenhum filtro do contrato aceita mais de
 * um valor — o backend responderia usando só um deles, sem avisar. Ficar com o
 * primeiro é arbitrário, e é o comportamento do próprio Django; o que importa
 * é que a página não receba um array onde espera texto.
 */
export function primeiro(valor: string | string[] | undefined): string | undefined {
  return Array.isArray(valor) ? valor[0] : valor;
}

/**
 * Todos os valores de uma chave, sem os vazios.
 *
 * É o par de `primeiro` para o único filtro que aceita repetição: a categoria.
 * `?categoria=1&categoria=3` pede os coletivos que estão nas DUAS — e, como
 * cada valor estreita o resultado, repetir um id não muda nada; por isso a
 * lista sai sem duplicata.
 */
export function todos(valor: string | string[] | undefined): string[] {
  const lista = Array.isArray(valor) ? valor : valor ? [valor] : [];
  return [...new Set(lista.filter(Boolean))];
}

/** Valor aceito por `comParametros`: uma lista vira a chave repetida. */
type Alteracao = string | number | (string | number)[] | undefined;

/**
 * Monta o `?...` de um link preservando os filtros atuais.
 *
 * `alteracoes` sobrescreve o que já existe; passar `undefined` (ou lista
 * vazia) remove a chave — é assim que o botão "limpar filtro" funciona sem
 * precisar montar a URL à mão.
 *
 * Chave repetida na URL atual continua repetida no link. Sem isso, trocar de
 * página com duas categorias marcadas descartaria uma delas no caminho.
 */
export function comParametros(
  atuais: ParametrosDaRota,
  alteracoes: Record<string, Alteracao>,
): string {
  const busca = new URLSearchParams();

  const escrever = (chave: string, valor: Alteracao | string[]) => {
    busca.delete(chave);
    const lista = Array.isArray(valor) ? valor : [valor];
    for (const item of lista) {
      if (item !== undefined && item !== "") busca.append(chave, String(item));
    }
  };

  for (const [chave, valor] of Object.entries(atuais)) escrever(chave, valor);
  for (const [chave, valor] of Object.entries(alteracoes)) escrever(chave, valor);

  const texto = busca.toString();
  return texto ? `?${texto}` : "";
}

/**
 * Converte o `?page=` da URL em número de página válido.
 *
 * `?page=abc` e `?page=-3` viram 1: o backend responderia 404 a ambos, e uma
 * página de erro por causa de URL adulterada seria resposta desproporcional.
 * Já `?page=999` continua chegando ao backend, porque aí o 404 é legítimo —
 * a página realmente não existe.
 */
export function paginaAtual(valor: string | string[] | undefined): number {
  const numero = Number(primeiro(valor));
  return Number.isInteger(numero) && numero > 0 ? numero : 1;
}
