import Link from "next/link";

import { caminhoDoSubgrupo, SUBGRUPOS, type SlugDoSubgrupo } from "@/lib/saiba-mais";

const BASE =
  "inline-flex min-h-11 items-center rounded-full px-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul";
const ATUAL = "bg-azul text-bege";
const OUTRA = "border border-azul bg-white text-azul hover:bg-azul/10";

/**
 * As pílulas para trocar de subgrupo dentro do "Saiba mais".
 *
 * **Links, e não abas de ARIA.** O `role="tablist"` serve para trocar painéis
 * na mesma página; aqui cada subgrupo é outra página, com endereço próprio. É
 * o mesmo padrão dos períodos da agenda: um `<nav>` com links e
 * `aria-current="page"` no atual. Tab passa pelos links, Enter abre.
 *
 * **Componente de servidor**, como a trilha: o atual vem da rota.
 *
 * **`flex-wrap`, sem rolagem horizontal.** Em 360 px as três não cabem numa
 * linha, e a rolagem esconderia a última fora da tela. Ver
 * `docs/PRD/PRD_Saiba_Mais_Navegacao_entre_Subgrupos_v1.md`.
 */
export function NavegacaoDosSubgrupos({ atual }: { atual: SlugDoSubgrupo }) {
  return (
    <nav aria-label="Subgrupos do Saiba mais">
      <ul className="flex flex-wrap gap-2">
        {SUBGRUPOS.map(({ slug, nome }) => {
          const ehAtual = slug === atual;
          return (
            <li key={slug}>
              <Link
                href={caminhoDoSubgrupo(slug)}
                aria-current={ehAtual ? "page" : undefined}
                className={`${BASE} ${ehAtual ? ATUAL : OUTRA}`}
              >
                {nome}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
