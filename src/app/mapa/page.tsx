import type { Metadata } from "next";
import Link from "next/link";

import { ListaDePontos } from "@/componentes/ListaDePontos";
import { MapaCliente } from "@/componentes/MapaCliente";
import { listarPontos } from "@/lib/api";
import { comParametros, primeiro, type ParametrosDaRota } from "@/lib/consulta";
import type { PontoDeInteresse } from "@/tipos/api";

export const metadata: Metadata = {
  title: "Mapa",
  description:
    "Onde encontrar a economia solidária em Niterói: órgãos, lojas físicas " +
    "e as feiras do Circuito Arariboia.",
};

/** Teto de itens por página da API. O mapa pede tudo de uma vez. */
const TETO_DA_API = 100;

/**
 * O mapa público dos pontos de interesse.
 *
 * Página renderizada no SERVIDOR; só o widget do mapa é ilha de cliente. A
 * lista textual abaixo dele não é acessório: é ela que o buscador indexa, que
 * o leitor de tela lê e que sobra para quem está numa conexão ruim ou com
 * JavaScript desligado. Um `<div>` mudo com um mapa dentro não informa nada a
 * nenhum dos três.
 */
export default async function Mapa({
  searchParams,
}: {
  searchParams: Promise<ParametrosDaRota>;
}) {
  const parametros = await searchParams;
  const tipoPedido = primeiro(parametros.tipo);

  // A listagem inteira, sem filtro de tipo. É de propósito: o mapa carrega
  // todos os pontos por natureza, e as opções de filtro precisam do conjunto
  // completo — filtrando no servidor, a resposta traria só um tipo e as outras
  // opções sumiriam da tela justamente depois de a pessoa filtrar.
  const resultado = await listarPontos({ page_size: TETO_DA_API, ordering: "nome" });

  // Os rótulos vêm de `tipo_display`, da API — nunca reescritos aqui. No dia
  // em que a equipe criar um tipo novo no Admin, ele aparece sozinho.
  const tipos = new Map<string, string>();
  for (const ponto of resultado.results) tipos.set(ponto.tipo, ponto.tipo_display);

  const tipoAtivo = tipoPedido && tipos.has(tipoPedido) ? tipoPedido : undefined;
  const pontos: PontoDeInteresse[] = tipoAtivo
    ? resultado.results.filter((ponto) => ponto.tipo === tipoAtivo)
    : resultado.results;

  // O teto da API é 100 e não há paginação de mapa. Quando a rede passar
  // disso, o mapa passa a mentir por omissão — melhor dizer em voz alta do que
  // desenhar 100 marcadores como se fossem todos.
  const truncado = resultado.count > resultado.results.length;

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-emerald-900">
          Mapa da economia solidária
        </h1>
        <p className="text-stone-600">
          {pontos.length === 0
            ? "Nenhum ponto cadastrado até o momento."
            : `${pontos.length} ${pontos.length === 1 ? "ponto" : "pontos"} em Niterói.`}
        </p>
      </header>

      {tipos.size > 1 && (
        <nav aria-label="Filtrar por tipo de ponto" className="flex flex-wrap gap-2">
          <Link
            href={`/mapa${comParametros(parametros, { tipo: undefined })}`}
            aria-current={tipoAtivo ? undefined : "page"}
            className={
              tipoAtivo
                ? "rounded border border-stone-300 bg-white px-3 py-2 text-sm hover:border-stone-500"
                : "rounded bg-emerald-800 px-3 py-2 text-sm text-white"
            }
          >
            Todos
          </Link>

          {[...tipos].map(([valor, rotulo]) => {
            const ativo = valor === tipoAtivo;
            return (
              <Link
                key={valor}
                href={`/mapa${comParametros(parametros, { tipo: valor })}`}
                aria-current={ativo ? "page" : undefined}
                className={
                  ativo
                    ? "rounded bg-emerald-800 px-3 py-2 text-sm text-white"
                    : "rounded border border-stone-300 bg-white px-3 py-2 text-sm hover:border-stone-500"
                }
              >
                {rotulo}
              </Link>
            );
          })}
        </nav>
      )}

      {pontos.length > 0 && <MapaCliente pontos={pontos} />}

      {truncado && (
        <p className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          O mapa mostra os primeiros {resultado.results.length} pontos, de{" "}
          {resultado.count} cadastrados.
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Todos os pontos</h2>
        <ListaDePontos pontos={pontos} />
      </section>
    </section>
  );
}
