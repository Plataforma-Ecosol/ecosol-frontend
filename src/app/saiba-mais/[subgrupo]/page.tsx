import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ConteudoCasaAzul } from "@/componentes/saiba-mais/ConteudoCasaAzul";
import { ConteudoEconomiaSolidaria } from "@/componentes/saiba-mais/ConteudoEconomiaSolidaria";
import { ConteudoItesIfrj } from "@/componentes/saiba-mais/ConteudoItesIfrj";
import { NavegacaoDosSubgrupos } from "@/componentes/saiba-mais/NavegacaoDosSubgrupos";
import { TrilhaDoSaibaMais } from "@/componentes/saiba-mais/TrilhaDoSaibaMais";
import { CASA } from "@/lib/casa";
import {
  buscarSubgrupo,
  caminhoDoSubgrupo,
  SUBGRUPOS,
  type SlugDoSubgrupo,
} from "@/lib/saiba-mais";

type Props = {
  // Promise desde o Next 15, e obrigatoriamente aguardado a partir do 16.
  params: Promise<{ subgrupo: string }>;
};

/**
 * Só os três subgrupos existem: qualquer outro slug responde 404, sem código
 * extra (HU22, cenário 5). Vale porque o projeto não liga o `cacheComponents`,
 * que no Next 16 remove esta opção.
 */
export const dynamicParams = false;

/** As três páginas saem estáticas no build. */
export function generateStaticParams() {
  return SUBGRUPOS.map(({ slug }) => ({ subgrupo: slug }));
}

/**
 * Título e canônico próprios. A descrição própria e a entrada no sitemap
 * chegam no frontend#76; até lá vale a descrição padrão do layout.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subgrupo } = await params;
  const dados = buscarSubgrupo(subgrupo);
  if (!dados) return {};

  return {
    title: dados.nome,
    alternates: { canonical: caminhoDoSubgrupo(dados.slug) },
  };
}

const CONTEUDO: Record<SlugDoSubgrupo, () => ReactNode> = {
  "casa-azul": ConteudoCasaAzul,
  "economia-solidaria": ConteudoEconomiaSolidaria,
  "ites-ifrj": ConteudoItesIfrj,
};

/**
 * A página de um subgrupo do "Saiba mais".
 *
 * **Estática, sem chamada à API.** O conteúdo de cada subgrupo é o que a
 * antiga página única mostrava, só mudado de lugar (ver
 * `docs/PRD/PRD_Saiba_Mais_Rotas_e_Indice_v1.md`).
 */
export default async function PaginaDoSubgrupo({ params }: Props) {
  const { subgrupo } = await params;
  const dados = buscarSubgrupo(subgrupo);
  // Não acontece com `dynamicParams = false`; fica por segurança.
  if (!dados) notFound();

  const Conteudo = CONTEUDO[dados.slug];
  const daCasa = dados.slug === "casa-azul";

  return (
    <article className="space-y-10">
      {/* Ordem do foco igual à visual: trilha, pílulas, conteúdo. */}
      <header className="space-y-3">
        <TrilhaDoSaibaMais atual={dados.slug} />
        <div className="space-y-2">
          {/* Na Casa, o nome oficial, e não o apelido: o leitor de tela anuncia
              o que a página é. */}
          <h1 className="text-3xl font-bold text-azul">{daCasa ? CASA.nome : dados.nome}</h1>
          {daCasa && CASA.subtitulo && <p className="text-lg text-texto">{CASA.subtitulo}</p>}
        </div>
        <NavegacaoDosSubgrupos atual={dados.slug} />
      </header>

      <Conteudo />
    </article>
  );
}
