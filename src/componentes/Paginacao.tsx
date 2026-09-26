import Link from "next/link";

import { comParametros, type ParametrosDaRota } from "@/lib/consulta";

/** Itens por página — o padrão do backend, e o que este projeto não altera. */
const POR_PAGINA = 20;

/**
 * Navegação entre páginas da listagem.
 *
 * **Os links são montados aqui, e não a partir do `next`/`previous` do
 * envelope.** Aqueles apontam para a API (`http://backend:8001/api/...`) —
 * jogá-los na tela mandaria a pessoa para fora do site, e dentro do Docker
 * para um endereço que o navegador nem resolve. O envelope serve para saber
 * QUANTAS páginas existem; para onde ir é decisão do frontend.
 */
export function Paginacao({
  total,
  pagina,
  parametros,
  rota,
}: {
  total: number;
  pagina: number;
  parametros: ParametrosDaRota;
  rota: string;
}) {
  const totalDePaginas = Math.ceil(total / POR_PAGINA);
  if (totalDePaginas <= 1) return null;

  const anterior = pagina > 1 ? pagina - 1 : null;
  const proxima = pagina < totalDePaginas ? pagina + 1 : null;

  return (
    <nav aria-label="Paginação" className="flex items-center justify-between gap-4">
      {anterior ? (
        <Link
          href={`${rota}${comParametros(parametros, { page: anterior })}`}
          className="rounded border border-stone-300 bg-white px-3 py-2 hover:border-stone-500"
          rel="prev"
        >
          ← Anterior
        </Link>
      ) : (
        // Um `<span>` no lugar do link: botão desabilitado ainda recebe foco
        // do teclado e promete uma ação que não acontece.
        <span />
      )}

      <span aria-current="page" className="text-sm text-stone-600">
        Página {pagina} de {totalDePaginas}
      </span>

      {proxima ? (
        <Link
          href={`${rota}${comParametros(parametros, { page: proxima })}`}
          className="rounded border border-stone-300 bg-white px-3 py-2 hover:border-stone-500"
          rel="next"
        >
          Próxima →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
