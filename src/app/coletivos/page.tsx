import type { Metadata } from "next";

import { CartaoColetivo } from "@/componentes/CartaoColetivo";
import { FiltrosAtivos } from "@/componentes/FiltrosAtivos";
import { FormularioDeBusca } from "@/componentes/FormularioDeBusca";
import { Paginacao } from "@/componentes/Paginacao";
import { listarColetivos } from "@/lib/api";
import { paginaAtual, primeiro, type ParametrosDaRota } from "@/lib/consulta";

export const metadata: Metadata = {
  title: "Coletivos",
  description:
    "Conheça os coletivos, empreendimentos e grupos da economia solidária " +
    "de Niterói. Busque por nome, categoria ou bairro.",
};

/**
 * Listagem pública de coletivos.
 *
 * Todo o estado — busca, filtros e página — vem da URL e volta para ela.
 * Nenhum `useState`, nenhuma chamada do navegador: a página é renderizada no
 * servidor a cada navegação, que é o que a mantém indexável.
 */
export default async function Coletivos({
  searchParams,
}: {
  // Promise desde o Next 15, e obrigatoriamente aguardado a partir do 16.
  searchParams: Promise<ParametrosDaRota>;
}) {
  const parametros = await searchParams;
  const pagina = paginaAtual(parametros.page);

  const resultado = await listarColetivos({
    q: primeiro(parametros.q),
    categoria: primeiro(parametros.categoria),
    bairro: primeiro(parametros.bairro),
    page: pagina,
  });

  // O nome da categoria filtrada só existe nos cartões — a API não expõe
  // catálogo de categorias. Quando nenhum coletivo da página a carrega
  // (acontece se a categoria some do cadastro), `FiltrosAtivos` mostra o id.
  const categoriaFiltrada = primeiro(parametros.categoria);
  const nomeDaCategoria = categoriaFiltrada
    ? resultado.results
        .flatMap((coletivo) => coletivo.categorias)
        .find((categoria) => String(categoria.id) === categoriaFiltrada)?.nome
    : undefined;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-emerald-900">Coletivos da rede</h1>
        <p className="text-stone-600">
          {resultado.count === 0
            ? "Nenhum coletivo encontrado."
            : `${resultado.count} ${resultado.count === 1 ? "coletivo" : "coletivos"}.`}
        </p>
      </header>

      <FormularioDeBusca
        parametros={parametros}
        rotulo="Buscar coletivos por nome ou descrição"
        placeholder="Buscar por nome ou descrição"
      />

      <FiltrosAtivos
        parametros={parametros}
        rota="/coletivos"
        nomeDaCategoria={nomeDaCategoria}
      />

      {resultado.results.length === 0 ? (
        <p className="rounded border border-stone-200 bg-white p-6 text-stone-700">
          Nada corresponde a esta busca. Tente outro termo, ou remova os filtros
          acima para ver a rede inteira.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {resultado.results.map((coletivo) => (
            <li key={coletivo.id}>
              <CartaoColetivo coletivo={coletivo} parametros={parametros} />
            </li>
          ))}
        </ul>
      )}

      <Paginacao
        total={resultado.count}
        pagina={pagina}
        parametros={parametros}
        rota="/coletivos"
      />
    </section>
  );
}
