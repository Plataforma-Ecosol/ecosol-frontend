import Link from "next/link";

import { comParametros, primeiro, type ParametrosDaRota } from "@/lib/consulta";

/**
 * Mostra os filtros em vigor, cada um removível.
 *
 * Existe por um motivo concreto: os filtros de categoria e bairro são
 * aplicados clicando em um cartão, e depois disso a única pista de que a
 * listagem está recortada seria a barra de endereço. Quem chega por um link
 * compartilhado não viu o clique acontecer — sem estes rótulos, veria uma
 * lista incompleta achando que é a rede inteira.
 *
 * O rótulo da categoria é o `id`, e não o nome: a URL carrega `?categoria=3`
 * e o catálogo de categorias não é exposto pela API, então traduzir o número
 * exigiria uma chamada que não existe. Quando a categoria filtrada aparece em
 * algum cartão da página, o nome é recuperado dali.
 */
export function FiltrosAtivos({
  parametros,
  rota,
  nomeDaCategoria,
}: {
  parametros: ParametrosDaRota;
  rota: string;
  nomeDaCategoria?: string;
}) {
  const categoria = primeiro(parametros.categoria);
  const bairro = primeiro(parametros.bairro);

  const ativos = [
    categoria && {
      chave: "categoria",
      rotulo: `Categoria: ${nomeDaCategoria ?? categoria}`,
    },
    bairro && { chave: "bairro", rotulo: `Bairro: ${bairro}` },
  ].filter((filtro): filtro is { chave: string; rotulo: string } => Boolean(filtro));

  if (ativos.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-texto/75">Filtrando por:</span>

      {ativos.map(({ chave, rotulo }) => (
        <Link
          key={chave}
          href={`${rota}${comParametros(parametros, { [chave]: undefined, page: undefined })}`}
          className="inline-flex items-center gap-1 rounded-full border border-azul bg-white px-3 py-1 text-sm text-azul hover:bg-azul/10"
        >
          {rotulo}
          {/* O × é decorativo; quem usa leitor de tela ouve o texto abaixo. */}
          <span aria-hidden="true">×</span>
          <span className="sr-only">(remover este filtro)</span>
        </Link>
      ))}
    </div>
  );
}
