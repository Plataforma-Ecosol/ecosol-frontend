import Link from "next/link";

import { comParametros, type ParametrosDaRota } from "@/lib/consulta";
import type { Coletivo } from "@/tipos/api";

/**
 * Um coletivo na listagem.
 *
 * O cartão NÃO mostra contatos. Não é esquecimento: telefone, e-mail e
 * instagram só existem na resposta quando há consentimento, e mesmo assim o
 * lugar deles é o perfil — quem consentiu em ter o contato publicado no perfil
 * não consentiu em tê-lo varrido de uma listagem inteira de uma vez.
 *
 * Bairro e categorias são links de filtro. É o que substitui a lista suspensa
 * que não temos: a API não expõe catálogo de categorias nem de bairros, e o
 * filtro `bairro` compara o valor inteiro (`iexact`), então um campo de texto
 * livre erraria a cada acento ou abreviação. Clicando, o valor está sempre
 * correto por construção.
 */
export function CartaoColetivo({
  coletivo,
  parametros,
}: {
  coletivo: Coletivo;
  parametros: ParametrosDaRota;
}) {
  return (
    <article className="rounded border border-stone-200 bg-white p-4">
      <h2 className="text-lg font-medium">
        <Link
          href={`/coletivos/${coletivo.slug}`}
          className="text-emerald-800 hover:underline"
        >
          {coletivo.nome}
        </Link>
      </h2>

      {coletivo.bairro && (
        <p className="mt-1 text-sm text-stone-600">
          <Link
            href={`/coletivos${comParametros(parametros, {
              bairro: coletivo.bairro,
              page: undefined,
            })}`}
            className="hover:underline"
          >
            {coletivo.bairro}
          </Link>
        </p>
      )}

      {coletivo.descricao && (
        // `line-clamp` corta na exibição, e não no texto: a descrição inteira
        // continua no HTML, onde o buscador e o leitor de tela a alcançam.
        <p className="mt-2 line-clamp-3 text-stone-700">{coletivo.descricao}</p>
      )}

      {coletivo.categorias.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {coletivo.categorias.map((categoria) => (
            <li key={categoria.id}>
              <Link
                href={`/coletivos${comParametros(parametros, {
                  categoria: categoria.id,
                  page: undefined,
                })}`}
                className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-900 hover:bg-emerald-100"
              >
                {categoria.nome}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
