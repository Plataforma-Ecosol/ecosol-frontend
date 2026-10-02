import type { Metadata } from "next";
import Link from "next/link";

import { CartaoEvento } from "@/componentes/CartaoEvento";
import { FormularioDeBusca } from "@/componentes/FormularioDeBusca";
import { Paginacao } from "@/componentes/Paginacao";
import { listarEventos, type FiltrosDeEvento } from "@/lib/api";
import { comParametros, paginaAtual, primeiro, type ParametrosDaRota } from "@/lib/consulta";

export const metadata: Metadata = {
  title: "Agenda",
  description:
    "Feiras, encontros e formações da economia solidária de Niterói. " +
    "Veja os próximos eventos da rede.",
};

/** As duas visões da agenda. `todos` existe na API, mas não como aba. */
const ABAS = [
  { valor: "proximos", rotulo: "Próximos" },
  { valor: "passados", rotulo: "Já aconteceram" },
] as const;

type Periodo = (typeof ABAS)[number]["valor"];

/**
 * Agenda pública de eventos.
 *
 * O padrão é `proximos`, e não a rota nua. A API não recorta o tempo sem que
 * se peça — decisão correta dela, para que quem consome possa montar um
 * histórico —, mas uma agenda que abre mostrando o que já passou não é agenda.
 * Quem quiser o histórico tem a aba ao lado.
 */
export default async function Eventos({
  searchParams,
}: {
  searchParams: Promise<ParametrosDaRota>;
}) {
  const parametros = await searchParams;
  const pagina = paginaAtual(parametros.page);

  const pedido = primeiro(parametros.periodo);
  const periodo: Periodo = pedido === "passados" ? "passados" : "proximos";

  const filtros: FiltrosDeEvento = {
    q: primeiro(parametros.q),
    bairro: primeiro(parametros.bairro),
    periodo,
    page: pagina,
    // O histórico se lê do mais recente para o mais antigo; a agenda, do
    // próximo para o distante. Sem a inversão, "já aconteceram" começaria pelo
    // evento mais antigo da base, que é o menos interessante de todos.
    ordering: periodo === "passados" ? "-data_inicio" : "data_inicio",
  };

  const resultado = await listarEventos(filtros);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-emerald-900">Agenda da rede</h1>
        <p className="text-stone-600">
          {resultado.count === 0
            ? periodo === "proximos"
              ? "Nenhum evento marcado no momento."
              : "Nenhum evento anterior registrado."
            : `${resultado.count} ${resultado.count === 1 ? "evento" : "eventos"}.`}
        </p>
      </header>

      <nav aria-label="Período da agenda" className="flex gap-2">
        {ABAS.map(({ valor, rotulo }) => {
          const ativa = valor === periodo;
          return (
            <Link
              key={valor}
              href={`/eventos${comParametros(parametros, {
                periodo: valor,
                page: undefined,
              })}`}
              aria-current={ativa ? "page" : undefined}
              className={
                ativa
                  ? "rounded bg-emerald-800 px-4 py-2 text-white"
                  : "rounded border border-stone-300 bg-white px-4 py-2 hover:border-stone-500"
              }
            >
              {rotulo}
            </Link>
          );
        })}
      </nav>

      <FormularioDeBusca
        parametros={parametros}
        rotulo="Buscar eventos por título, descrição ou local"
        placeholder="Buscar por título, descrição ou local"
      />

      {resultado.results.length === 0 ? (
        <p className="rounded border border-stone-200 bg-white p-6 text-stone-700">
          {periodo === "proximos"
            ? "Não há eventos marcados por enquanto. Volte em breve, ou veja os que já aconteceram."
            : "Nada corresponde a esta busca."}
        </p>
      ) : (
        <ul className="space-y-4">
          {resultado.results.map((evento) => (
            <li key={evento.id}>
              <CartaoEvento evento={evento} />
            </li>
          ))}
        </ul>
      )}

      <Paginacao
        total={resultado.count}
        pagina={pagina}
        parametros={parametros}
        rota="/eventos"
      />
    </section>
  );
}
