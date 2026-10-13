import type { Metadata } from "next";
import Link from "next/link";

import { CamposDeEvento } from "@/componentes/CamposDeFiltro";
import { CartaoEvento } from "@/componentes/CartaoEvento";
import { FiltrosAtivos } from "@/componentes/FiltrosAtivos";
import { FormularioDeBusca } from "@/componentes/FormularioDeBusca";
import { PainelDeFiltros } from "@/componentes/PainelDeFiltros";
import { Paginacao } from "@/componentes/Paginacao";
import { listarEventos, opcoesDeFiltroDeEventos, type FiltrosDeEvento } from "@/lib/api";
import { comParametros, paginaAtual, primeiro, type ParametrosDaRota } from "@/lib/consulta";
import { CHAVES_DE_EVENTO, dataDoFiltro, filtrosAtivosDeEventos } from "@/lib/filtros";

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
 *
 * O painel de filtros soma intervalo de datas e bairro à aba: tudo combina
 * com "e". Um intervalo no passado dentro de "Próximos" volta vazio, e é o
 * certo — a aba também é filtro.
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
    // Data fora do formato é ignorada, e não repassada: a API responderia 400
    // e a agenda inteira viraria página de erro por causa da URL.
    de: dataDoFiltro(parametros.de),
    ate: dataDoFiltro(parametros.ate),
    periodo,
    page: pagina,
    // O histórico se lê do mais recente para o mais antigo; a agenda, do
    // próximo para o distante. Sem a inversão, "já aconteceram" começaria pelo
    // evento mais antigo da base, que é o menos interessante de todos.
    ordering: periodo === "passados" ? "-data_inicio" : "data_inicio",
  };

  const [resultado, opcoes] = await Promise.all([
    listarEventos(filtros),
    opcoesDeFiltroDeEventos(),
  ]);
  const ativos = filtrosAtivosDeEventos(parametros);
  const filtrando = ativos.length > 0 || Boolean(primeiro(parametros.q));

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-azul">Agenda da rede</h1>
        {/* `aria-live`: com a busca automática o resultado muda sem a pessoa
            sair do campo, e o leitor de tela precisa ouvir quantos achou. */}
        <p aria-live="polite" className="text-texto/75">
          {resultado.count === 0
            ? filtrando
              ? "Nenhum evento encontrado."
              : periodo === "proximos"
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
                  ? "rounded bg-azul px-4 py-2 text-bege"
                  : "rounded border border-azul bg-white px-4 py-2 text-azul hover:bg-azul/10"
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

      <div className="flex flex-wrap items-center gap-2">
        <PainelDeFiltros
          rota="/eventos"
          parametros={parametros}
          chaves={CHAVES_DE_EVENTO}
          quantidade={ativos.length}
        >
          <CamposDeEvento opcoes={opcoes} parametros={parametros} />
        </PainelDeFiltros>
        <FiltrosAtivos filtros={ativos} parametros={parametros} rota="/eventos" />
      </div>

      {resultado.results.length === 0 ? (
        <p className="rounded border border-dourado/60 bg-white p-6 text-texto/85">
          {filtrando
            ? "Nada corresponde a esta busca. Tente outro termo, ou remova os filtros acima."
            : periodo === "proximos"
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
