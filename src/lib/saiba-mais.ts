/**
 * Os subgrupos do "Saiba mais": a lista única que a página índice, a rota
 * `/saiba-mais/[subgrupo]` e, depois, a navegação e o sitemap usam.
 *
 * **Os slugs são os do backend** (`SecaoSaibaMais.Subgrupo`, em
 * `rede/models/secao_saiba_mais.py`). Quando o conteúdo passar a vir da API,
 * o slug da URL é o mesmo `slug` que ela devolve, sem tabela de conversão. O
 * `saiba-mais.test.ts` guarda essa igualdade.
 *
 * Ver `docs/PRD/PRD_Saiba_Mais_Rotas_e_Indice_v1.md`.
 */
import { PHASE_PRODUCTION_BUILD } from "next/constants";

import { buscarSaibaMais } from "@/lib/api";
import { temContato, type Casa } from "@/lib/casa";
import type { SecaoDoSaibaMais } from "@/tipos/api";

/** Os mesmos valores de `SecaoSaibaMais.Subgrupo` no backend. */
export type SlugDoSubgrupo = "casa-azul" | "economia-solidaria" | "ites-ifrj";

export type Subgrupo = {
  slug: SlugDoSubgrupo;
  /** O mesmo rótulo que a API devolve em `nome`. */
  nome: string;
  /** Uma frase para o cartão da página índice. */
  resumo: string;
  /**
   * A descrição da página no Google e na prévia de link, com até 160
   * caracteres. Não é o `resumo`: aqui a frase aparece sozinha, sem a índice
   * em volta, e precisa dizer quem é e onde fica.
   */
  descricao: string;
};

/**
 * Nesta ordem na página índice e na navegação.
 *
 * Os resumos e as descrições são rascunhos, para validar com a Casa Azul junto
 * com os textos do conteúdo inicial (frontend#74). Só descrevem o que já está
 * em cada página, sem informação nova.
 *
 * Quem desenvolve a plataforma é a ITES, sozinha; a Casa Azul é consultada e
 * aprova as mudanças. Texto daqui não divide a autoria com a Casa.
 */
export const SUBGRUPOS: readonly Subgrupo[] = [
  {
    slug: "casa-azul",
    nome: "Casa Azul",
    resumo: "Quem somos, contato, endereço e horário de atendimento da Casa Paul Singer.",
    // Sem listar telefone e e-mail: um dado que sai de `lib/casa.ts` some da
    // página (`temContato`), e a descrição continuaria prometendo.
    descricao:
      "A Casa da Economia Solidária Paul Singer é o centro público de referência " +
      "da economia solidária em Niterói. Conheça a Casa e saiba como falar com ela.",
  },
  {
    slug: "economia-solidaria",
    nome: "Economia Solidária",
    resumo: "O que é a economia solidária e como funciona a rede de Niterói.",
    descricao:
      "O que é a economia solidária e como funciona a Rede de Economia Solidária " +
      "de Niterói, com seus coletivos, feiras e eventos.",
  },
  {
    slug: "ites-ifrj",
    nome: "ITES/IFRJ",
    resumo: "A incubadora do IFRJ Campus Niterói que desenvolve esta plataforma.",
    descricao:
      "A ITES, Incubadora Tecnológica de Empreendimentos Solidários do IFRJ " +
      "Campus Niterói, é quem desenvolve esta plataforma.",
  },
];

/** O subgrupo de um slug da URL, ou `undefined` se ele não existir. */
export function buscarSubgrupo(slug: string): Subgrupo | undefined {
  return SUBGRUPOS.find((subgrupo) => subgrupo.slug === slug);
}

export function caminhoDoSubgrupo(slug: SlugDoSubgrupo): string {
  return `/saiba-mais/${slug}`;
}

/**
 * Para onde leva o "Fale com a Casa" do rodapé.
 *
 * O contato completo mora na página da Casa Azul. Sem o bloco de contato, a
 * âncora `#contato` não existiria, e o link vai só para a página.
 */
export function caminhoDoContato(casa: Casa): string {
  const pagina = caminhoDoSubgrupo("casa-azul");
  return temContato(casa) ? `${pagina}#contato` : pagina;
}

/**
 * As seções publicadas de um subgrupo, ou `null` para usar o conteúdo fixo.
 *
 * - **API no ar:** a lista do subgrupo, na ordem do Admin. Pode vir vazia, e
 *   aí a página mostra só a parte fixa: é o que faz uma seção despublicada
 *   sumir do site, inclusive a última.
 * - **API fora do ar no `next build`:** `null`, e a página sai com o conteúdo
 *   fixo. É o caso do CI, que não sobe backend.
 * - **API fora do ar na revalidação, com o site no ar:** relança o erro. O
 *   Next então continua servindo a última página gerada com sucesso e tenta
 *   de novo na visita seguinte. Se devolvesse `null` aqui, o conteúdo fixo
 *   substituiria o do Admin a cada queda, e uma seção despublicada poderia
 *   reaparecer.
 *
 * Ver `docs/PRD/PRD_Saiba_Mais_Conteudo_da_API_v1.md`.
 */
export async function secoesDoSubgrupo(
  slug: SlugDoSubgrupo,
): Promise<SecaoDoSaibaMais[] | null> {
  try {
    const { subgrupos } = await buscarSaibaMais();
    return subgrupos.find((subgrupo) => subgrupo.slug === slug)?.secoes ?? [];
  } catch (erro) {
    if (process.env.NEXT_PHASE === PHASE_PRODUCTION_BUILD) return null;
    throw erro;
  }
}
