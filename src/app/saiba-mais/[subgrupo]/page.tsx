import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { ConteudoCasaAzul } from "@/componentes/saiba-mais/ConteudoCasaAzul";
import { ConteudoEconomiaSolidaria } from "@/componentes/saiba-mais/ConteudoEconomiaSolidaria";
import { ConteudoItesIfrj } from "@/componentes/saiba-mais/ConteudoItesIfrj";
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
      <header className="space-y-2">
        {/* Volta simples para a índice. O frontend#73 troca por breadcrumb e abas. */}
        <Link
          href="/saiba-mais"
          className="inline-flex min-h-11 items-center gap-1 font-semibold text-azul underline-offset-4 hover:underline"
        >
          <ArrowLeft aria-hidden className="size-4" />
          Saiba mais
        </Link>
        {/* Na Casa, o nome oficial, e não o apelido: o leitor de tela anuncia
            o que a página é. */}
        <h1 className="text-3xl font-bold text-azul">{daCasa ? CASA.nome : dados.nome}</h1>
        {daCasa && CASA.subtitulo && <p className="text-lg text-texto">{CASA.subtitulo}</p>}
      </header>

      <Conteudo />
    </article>
  );
}
