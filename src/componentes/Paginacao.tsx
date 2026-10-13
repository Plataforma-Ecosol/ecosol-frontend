import {
  Pagination,
  PaginationAtual,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/componentes/ui/pagination";
import { comParametros, type ParametrosDaRota } from "@/lib/consulta";
import { paginasVisiveis } from "@/lib/paginacao";

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
 *
 * Duas listas, uma para o celular e outra para o computador, e o CSS mostra
 * uma só. No celular de 360 px não cabem os vizinhos da página atual nem as
 * palavras "Anterior" e "Próxima". O `display: none` tira a lista escondida da
 * árvore de acessibilidade e da ordem do Tab, então o leitor de tela encontra
 * uma só. É HTML repetido em troca de não depender de JavaScript para medir a
 * tela.
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

  const props = { pagina, totalDePaginas, parametros, rota };

  return (
    <Pagination>
      <ListaDePaginas {...props} vizinhos={0} className="flex sm:hidden" />
      <ListaDePaginas {...props} vizinhos={1} className="hidden sm:flex" />
    </Pagination>
  );
}

function ListaDePaginas({
  pagina,
  totalDePaginas,
  parametros,
  rota,
  vizinhos,
  className,
}: {
  pagina: number;
  totalDePaginas: number;
  parametros: ParametrosDaRota;
  rota: string;
  vizinhos: number;
  className: string;
}) {
  const href = (numero: number) => `${rota}${comParametros(parametros, { page: numero })}`;

  return (
    <PaginationContent className={className}>
      {/* Sem Anterior na primeira página e sem Próxima na última, em vez de
          um botão desabilitado: ele ainda recebe foco do teclado e promete
          uma ação que não acontece. */}
      {pagina > 1 && (
        <PaginationItem>
          <PaginationPrevious href={href(pagina - 1)} />
        </PaginationItem>
      )}

      {paginasVisiveis(pagina, totalDePaginas, vizinhos).map((item, indice) => (
        <PaginationItem key={item === "…" ? `reticencias-${indice}` : item}>
          {item === "…" ? (
            <PaginationEllipsis />
          ) : item === pagina ? (
            <PaginationAtual>{item}</PaginationAtual>
          ) : (
            // Sem o `aria-label`, o leitor de tela anunciaria só "3, link".
            <PaginationLink href={href(item)} aria-label={`Página ${item}`}>
              {item}
            </PaginationLink>
          )}
        </PaginationItem>
      ))}

      {pagina < totalDePaginas && (
        <PaginationItem>
          <PaginationNext href={href(pagina + 1)} />
        </PaginationItem>
      )}
    </PaginationContent>
  );
}
