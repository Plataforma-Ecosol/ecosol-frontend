import Link from "next/link";

import { buscarSubgrupo, caminhoDoSubgrupo, type SlugDoSubgrupo } from "@/lib/saiba-mais";
import { urlAbsoluta } from "@/lib/site";

const INDICE = { nome: "Saiba mais", caminho: "/saiba-mais" } as const;

/**
 * A trilha em JSON-LD, para o Google mostrar "Saiba mais › Casa Azul" no lugar
 * do endereço no resultado da busca. Endereços absolutos, como pede o schema.org.
 */
function dadosEstruturados(nome: string, atual: SlugDoSubgrupo) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: INDICE.nome, item: urlAbsoluta(INDICE.caminho) },
      {
        "@type": "ListItem",
        position: 2,
        name: nome,
        item: urlAbsoluta(caminhoDoSubgrupo(atual)),
      },
    ],
  };
}

/**
 * A trilha "Saiba mais › subgrupo" no topo da página de um subgrupo.
 *
 * **Componente de servidor.** O subgrupo atual vem da rota, por propriedade,
 * então não precisa de `usePathname` e a página continua estática.
 *
 * Lista ordenada, porque a ordem dos itens é o caminho. O item atual não é
 * link: um link para a própria página só confunde. Ver
 * `docs/PRD/PRD_Saiba_Mais_Navegacao_entre_Subgrupos_v1.md`.
 */
export function TrilhaDoSaibaMais({ atual }: { atual: SlugDoSubgrupo }) {
  // O nome curto ("Casa Azul"); o h1 da página fica com o nome oficial.
  const nome = buscarSubgrupo(atual)?.nome ?? atual;

  return (
    <>
      <script
        type="application/ld+json"
        // `<` escapado, como no JSON-LD da Casa: um `</script>` num campo
        // fecharia a tag antes da hora.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(dadosEstruturados(nome, atual)).replace(/</g, "\\u003c"),
        }}
      />
      <nav aria-label="Trilha de navegação" className="text-sm">
        <ol className="flex flex-wrap items-center gap-x-2">
          <li>
            <Link
              href={INDICE.caminho}
              className="inline-flex min-h-11 items-center font-semibold text-azul underline underline-offset-4 hover:text-azul-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul"
            >
              {INDICE.nome}
            </Link>
          </li>
          <li className="flex items-center gap-2">
            {/* Escondido do leitor de tela, que leria "sinal de maior". */}
            <span aria-hidden>›</span>
            <span aria-current="page" className="text-texto">
              {nome}
            </span>
          </li>
        </ol>
      </nav>
    </>
  );
}
