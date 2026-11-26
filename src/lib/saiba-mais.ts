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
import { temContato, type Casa } from "@/lib/casa";

/** Os mesmos valores de `SecaoSaibaMais.Subgrupo` no backend. */
export type SlugDoSubgrupo = "casa-azul" | "economia-solidaria" | "ites-ifrj";

export type Subgrupo = {
  slug: SlugDoSubgrupo;
  /** O mesmo rótulo que a API devolve em `nome`. */
  nome: string;
  /** Uma frase para o cartão da página índice. */
  resumo: string;
};

/**
 * Nesta ordem na página índice e na navegação.
 *
 * Os resumos são rascunhos, para validar com a Casa Azul junto com os textos
 * do conteúdo inicial (frontend#74). Só descrevem o que já está em cada
 * página, sem informação nova.
 */
export const SUBGRUPOS: readonly Subgrupo[] = [
  {
    slug: "casa-azul",
    nome: "Casa Azul",
    resumo: "Quem somos, contato, endereço e horário de atendimento da Casa Paul Singer.",
  },
  {
    slug: "economia-solidaria",
    nome: "Economia Solidária",
    resumo: "O que é a economia solidária e como funciona a rede de Niterói.",
  },
  {
    slug: "ites-ifrj",
    nome: "ITES/IFRJ",
    resumo: "A incubadora do IFRJ Campus Niterói que desenvolve esta plataforma.",
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
