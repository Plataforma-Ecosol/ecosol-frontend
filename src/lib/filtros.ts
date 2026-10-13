/**
 * Os filtros em vigor de cada listagem, já com o texto que vai na tela.
 *
 * Servem a duas coisas: os chips removíveis (`FiltrosAtivos`) e o número no
 * botão do painel de filtros. Ficam aqui, longe do HTML, para a regra de cada
 * rótulo poder ser testada sem renderizar nada.
 */
import { primeiro, todos, type ParametrosDaRota } from "@/lib/consulta";
import type { CategoriaResumo } from "@/tipos/api";

/** Um filtro em vigor: a chave da URL, o valor e o texto do chip. */
export type FiltroAtivo = { chave: string; valor: string; rotulo: string };

/** Chaves que o painel de coletivos controla. */
export const CHAVES_DE_COLETIVO = ["categoria", "bairro"];

/** Chaves que o painel da agenda controla. */
export const CHAVES_DE_EVENTO = ["de", "ate", "bairro"];

/**
 * Filtros em vigor em `/coletivos`.
 *
 * O nome da categoria vem das opções do painel. Quando ele não está lá (a
 * categoria saiu do cadastro, ou as opções não carregaram), o chip mostra o
 * id: melhor um número do que esconder que a lista está recortada.
 */
export function filtrosAtivosDeColetivos(
  parametros: ParametrosDaRota,
  categorias: CategoriaResumo[],
): FiltroAtivo[] {
  const nomes = new Map(categorias.map(({ id, nome }) => [String(id), nome]));

  const ativos = todos(parametros.categoria).map((id) => ({
    chave: "categoria",
    valor: id,
    rotulo: `Categoria: ${nomes.get(id) ?? id}`,
  }));

  const bairro = primeiro(parametros.bairro);
  if (bairro) ativos.push({ chave: "bairro", valor: bairro, rotulo: `Bairro: ${bairro}` });

  return ativos;
}

/** Filtros em vigor em `/eventos`. As datas só valem no formato da API. */
export function filtrosAtivosDeEventos(parametros: ParametrosDaRota): FiltroAtivo[] {
  const ativos: FiltroAtivo[] = [];

  const de = dataDoFiltro(parametros.de);
  if (de) ativos.push({ chave: "de", valor: de, rotulo: `A partir de ${dataNaTela(de)}` });

  const ate = dataDoFiltro(parametros.ate);
  if (ate) ativos.push({ chave: "ate", valor: ate, rotulo: `Até ${dataNaTela(ate)}` });

  const bairro = primeiro(parametros.bairro);
  if (bairro) ativos.push({ chave: "bairro", valor: bairro, rotulo: `Bairro: ${bairro}` });

  return ativos;
}

/**
 * A data do filtro, se ela estiver em `AAAA-MM-DD` e existir no calendário.
 *
 * A API responde `400` a qualquer outro formato, e a agenda inteira viraria
 * página de erro por causa de uma URL adulterada. Data inválida é ignorada,
 * do mesmo jeito que `?page=abc` vira a página 1.
 */
export function dataDoFiltro(valor: string | string[] | undefined): string | undefined {
  const texto = primeiro(valor);
  if (!texto || !/^\d{4}-\d{2}-\d{2}$/.test(texto)) return undefined;

  const [ano, mes, dia] = texto.split("-").map(Number);
  const data = new Date(Date.UTC(ano, mes - 1, dia));
  const existe =
    data.getUTCFullYear() === ano && data.getUTCMonth() === mes - 1 && data.getUTCDate() === dia;
  return existe ? texto : undefined;
}

/** `2026-10-12` → `12/10/2026`, sem passar por fuso horário. */
function dataNaTela(iso: string): string {
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}
