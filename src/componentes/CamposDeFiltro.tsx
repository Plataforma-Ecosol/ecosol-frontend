import { Input } from "@/componentes/ui/input";
import { primeiro, todos, type ParametrosDaRota } from "@/lib/consulta";
import { dataDoFiltro } from "@/lib/filtros";
import type { OpcoesDeFiltroDeColetivo, OpcoesDeFiltroDeEvento } from "@/tipos/api";

/**
 * Os campos do painel de filtros de cada listagem.
 *
 * Componentes de servidor: só HTML de formulário, com os valores atuais
 * marcados. Quem abre o painel e envia é o `PainelDeFiltros`.
 *
 * Os rótulos envolvem o campo, em vez de ligá-los por `id`: o painel renderiza
 * estes campos duas vezes (o `<dialog>` e a versão sem JavaScript), e `id`
 * repetido quebraria a ligação.
 *
 * As opções de categoria e bairro vêm da API (`/api/filtros/...`), só com o
 * que está em uso. Escolher numa lista, e não digitar, é o que mantém o
 * filtro de bairro certo: a API compara o valor inteiro, e "icarai" sem
 * acento voltaria vazio sem explicar por quê.
 */

const CLASSES_DO_SELECT =
  "h-11 w-full rounded-lg border border-azul-500 bg-white px-3 text-base text-texto focus-visible:border-azul focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul md:text-sm";

/** Sem as opções (API fora do ar ou ainda sem o endpoint), um aviso no lugar. */
function SemOpcoes() {
  return (
    <p className="rounded-lg bg-azul-50 p-3 text-sm text-azul-900">
      Não foi possível carregar as opções de categoria e bairro agora. Tente de novo em
      instantes.
    </p>
  );
}

export function CamposDeColetivo({
  opcoes,
  parametros,
}: {
  opcoes: OpcoesDeFiltroDeColetivo | null;
  parametros: ParametrosDaRota;
}) {
  if (!opcoes) return <SemOpcoes />;

  const marcadas = todos(parametros.categoria);

  return (
    <>
      {opcoes.categorias.length > 0 && (
        <fieldset>
          <legend className="font-semibold text-azul">Categorias</legend>
          <p className="mt-1 text-sm text-texto/75">
            Com mais de uma marcada, aparecem só os coletivos que estão em todas.
          </p>
          <ul className="mt-2 grid gap-1">
            {opcoes.categorias.map(({ id, nome }) => (
              <li key={id}>
                <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-2 hover:bg-azul-50">
                  <input
                    type="checkbox"
                    name="categoria"
                    value={id}
                    defaultChecked={marcadas.includes(String(id))}
                    className="size-5 shrink-0 accent-azul"
                  />
                  {nome}
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      <CampoDeBairro bairros={opcoes.bairros} atual={primeiro(parametros.bairro)} />
    </>
  );
}

export function CamposDeEvento({
  opcoes,
  parametros,
}: {
  opcoes: OpcoesDeFiltroDeEvento | null;
  parametros: ParametrosDaRota;
}) {
  const de = dataDoFiltro(parametros.de);
  const ate = dataDoFiltro(parametros.ate);

  return (
    <>
      {/* `type="date"` já entrega `AAAA-MM-DD`, o único formato que a API
          aceita. `min` e `max` cruzados evitam o intervalo invertido, que
          voltaria vazio sem dizer por quê. */}
      <fieldset>
        <legend className="font-semibold text-azul">Datas</legend>
        <div className="mt-2 grid gap-3">
          <label className="grid gap-1 text-sm font-medium">
            A partir de
            <Input type="date" name="de" defaultValue={de} max={ate} />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Até
            <Input type="date" name="ate" defaultValue={ate} min={de} />
          </label>
        </div>
      </fieldset>

      {opcoes ? (
        <CampoDeBairro bairros={opcoes.bairros} atual={primeiro(parametros.bairro)} />
      ) : (
        <SemOpcoes />
      )}
    </>
  );
}

/**
 * A lista de bairros, com o atual selecionado.
 *
 * O bairro da URL pode não estar escrito igual ao da lista: o link do cartão
 * usa a grafia daquele coletivo ("centro"), e a lista traz uma só ("Centro").
 * A comparação ignora maiúsculas, como o filtro da API. Se mesmo assim não
 * houver opção igual, a da URL entra na lista: sem isso o campo mostraria
 * "Todos os bairros", e aplicar outro filtro apagaria o bairro sem aviso.
 */
function CampoDeBairro({ bairros, atual }: { bairros: string[]; atual?: string }) {
  const igual = atual && bairros.find((bairro) => bairro.toLowerCase() === atual.toLowerCase());
  const opcoes = atual && !igual ? [atual, ...bairros] : bairros;

  return (
    <label className="grid gap-1">
      <span className="font-semibold text-azul">Bairro</span>
      <select name="bairro" defaultValue={igual || atual || ""} className={CLASSES_DO_SELECT}>
        <option value="">Todos os bairros</option>
        {opcoes.map((bairro) => (
          <option key={bairro} value={bairro}>
            {bairro}
          </option>
        ))}
      </select>
    </label>
  );
}
