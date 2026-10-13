import type { Metadata } from "next";

import { CamposDeColetivo } from "@/componentes/CamposDeFiltro";
import { CartaoColetivo } from "@/componentes/CartaoColetivo";
import { FiltrosAtivos } from "@/componentes/FiltrosAtivos";
import { FormularioDeBusca } from "@/componentes/FormularioDeBusca";
import { PainelDeFiltros } from "@/componentes/PainelDeFiltros";
import { Paginacao } from "@/componentes/Paginacao";
import { listarColetivos, opcoesDeFiltroDeColetivos } from "@/lib/api";
import { paginaAtual, primeiro, todos, type ParametrosDaRota } from "@/lib/consulta";
import { CHAVES_DE_COLETIVO, filtrosAtivosDeColetivos } from "@/lib/filtros";

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
 * Nenhuma chamada do navegador à API: a página é renderizada no servidor a
 * cada navegação, que é o que a mantém indexável. Busca e painel de filtros
 * são ilhas de cliente só para enviar o formulário sem recarregar a página.
 */
export default async function Coletivos({
  searchParams,
}: {
  // Promise desde o Next 15, e obrigatoriamente aguardado a partir do 16.
  searchParams: Promise<ParametrosDaRota>;
}) {
  const parametros = await searchParams;
  const pagina = paginaAtual(parametros.page);

  // As opções do painel em paralelo com a listagem: são independentes, e em
  // sequência a página esperaria as duas respostas uma depois da outra.
  const [resultado, opcoes] = await Promise.all([
    listarColetivos({
      q: primeiro(parametros.q),
      categoria: todos(parametros.categoria),
      bairro: primeiro(parametros.bairro),
      page: pagina,
    }),
    opcoesDeFiltroDeColetivos(),
  ]);

  // Sem as opções, o nome da categoria filtrada ainda pode estar nos cartões
  // da página. Se nem ali estiver, o chip mostra o id.
  const filtros = filtrosAtivosDeColetivos(
    parametros,
    opcoes?.categorias ?? resultado.results.flatMap((coletivo) => coletivo.categorias),
  );

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-azul">Coletivos da rede</h1>
        {/* `aria-live`: com a busca automática o resultado muda sem a pessoa
            sair do campo, e o leitor de tela precisa ouvir quantos achou. */}
        <p aria-live="polite" className="text-texto/75">
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

      <div className="flex flex-wrap items-center gap-2">
        <PainelDeFiltros
          rota="/coletivos"
          parametros={parametros}
          chaves={CHAVES_DE_COLETIVO}
          quantidade={filtros.length}
        >
          <CamposDeColetivo opcoes={opcoes} parametros={parametros} />
        </PainelDeFiltros>
        <FiltrosAtivos filtros={filtros} parametros={parametros} rota="/coletivos" />
      </div>

      {resultado.results.length === 0 ? (
        <p className="rounded border border-dourado/60 bg-white p-6 text-texto/85">
          Nada corresponde a esta busca. Tente outro termo, ou remova os filtros
          acima para ver a rede inteira.
        </p>
      ) : (
        // Mesma grade da home: o `sizes` da foto do cartão conta com ela.
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
