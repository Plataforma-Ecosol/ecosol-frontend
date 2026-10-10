import { MapPin } from "lucide-react";
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
    <article className="rounded border border-dourado/60 bg-white p-4">
      <h2 className="text-lg font-bold">
        <Link
          href={`/coletivos/${coletivo.slug}`}
          className="text-azul hover:underline"
        >
          {coletivo.nome}
        </Link>
      </h2>

      {coletivo.bairro && (
        <p className="mt-1 text-sm text-texto/75">
          <Link
            href={`/coletivos${comParametros(parametros, {
              bairro: coletivo.bairro,
              page: undefined,
            })}`}
            className="inline-flex items-center gap-1.5 hover:underline"
          >
            <MapPin aria-hidden className="size-4 shrink-0 text-dourado-escuro" />
            {coletivo.bairro}
          </Link>
        </p>
      )}

      {coletivo.descricao && (
        // `line-clamp` corta na exibição, e não no texto: a descrição inteira
        // continua no HTML, onde o buscador e o leitor de tela a alcançam.
        <p className="mt-2 line-clamp-3 text-texto/85">{coletivo.descricao}</p>
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
                className="inline-block rounded-full border border-dourado bg-bege px-3 py-1 text-sm text-azul hover:bg-azul hover:text-bege"
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
