import { MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/componentes/ui/badge";
import { comParametros, todos, type ParametrosDaRota } from "@/lib/consulta";
import { iniciaisDoNome } from "@/lib/iniciais";
import type { Coletivo } from "@/tipos/api";

/**
 * Largura da foto em cada tela. O `main` tem `max-w-5xl` (1024 px) e `px-4`:
 * sobram 992 px, que em três colunas com `gap-4` dão 320 px por cartão. Vale
 * para a home e para `/coletivos`, que usam a mesma grade — mudou uma, muda
 * este valor.
 */
const TAMANHOS_DA_FOTO = "(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw";

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
 *
 * A categoria clicada SOMA às já marcadas, em vez de trocá-las: os filtros
 * combinam com "e", e o cartão clicado está no resultado justamente por ter
 * as categorias marcadas — somar a dele estreita a lista sem esvaziá-la.
 *
 * O cartão inteiro abre o perfil, pelo "link esticado": o `::after` do link
 * do nome cobre o `article`, que é `relative`. Envolver o cartão num `<a>` não
 * dá, porque bairro e categorias já são links, e link dentro de link é HTML
 * inválido. Esses links ganham `relative z-10` para ficar por cima. Para o
 * leitor de tela continua um link só, com o nome do coletivo.
 */
export function CartaoColetivo({
  coletivo,
  parametros,
}: {
  coletivo: Coletivo;
  parametros: ParametrosDaRota;
}) {
  return (
    <article className="relative overflow-hidden rounded-xl border border-dourado-200 bg-white shadow-sm transition-[box-shadow,border-color] duration-200 focus-within:border-azul-300 focus-within:shadow-md hover:border-azul-300 hover:shadow-md motion-reduce:transition-none">
      {/* `aspect-video` reserva o espaço antes da foto carregar: a página não
          pula. Sem `preload`: o cartão fica abaixo da primeira dobra. */}
      <div className="relative aspect-video">
        {coletivo.foto ? (
          // URL como a API devolve: quem busca o `src` do `next/image` é o
          // servidor do Next, e não o navegador (ver `urlPublicaDeMidia`).
          <Image
            src={coletivo.foto}
            alt={coletivo.foto_descricao || `Foto do coletivo ${coletivo.nome}`}
            fill
            sizes={TAMANHOS_DA_FOTO}
            className="object-cover"
          />
        ) : (
          // Decorativo: o nome já está no título logo abaixo.
          <div
            aria-hidden
            className="flex h-full items-center justify-center bg-azul-100 font-titulo text-4xl text-azul"
          >
            {iniciaisDoNome(coletivo.nome)}
          </div>
        )}
      </div>

      <div className="p-4">
        <h2 className="text-lg font-bold">
          <Link
            href={`/coletivos/${coletivo.slug}`}
            className="text-azul after:absolute after:inset-0 hover:underline"
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
              className="relative z-10 inline-flex items-center gap-1.5 hover:underline"
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
                <Badge asChild variant="secondary" className="relative z-10">
                  <Link
                    href={`/coletivos${comParametros(parametros, {
                      categoria: [...todos(parametros.categoria), String(categoria.id)],
                      page: undefined,
                    })}`}
                  >
                    {categoria.nome}
                  </Link>
                </Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
