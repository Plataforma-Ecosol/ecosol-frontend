import Link from "next/link";

import type { PontoDeInteresse } from "@/tipos/api";

/**
 * Os pontos do mapa em forma de texto.
 *
 * Não é acessório do mapa, é a outra metade dele. O widget do Leaflet só
 * existe depois que o JavaScript carrega e roda; esta lista chega no HTML, e é
 * ela que o buscador indexa, que o leitor de tela lê e que sobra para quem está
 * numa conexão ruim. Sem ela, `/mapa` seria uma página cujo conteúdo é
 * invisível para três públicos ao mesmo tempo.
 *
 * Componente separado, e não JSX dentro da página, para que a suíte possa
 * conferir o que sai sem precisar montar o mapa.
 */
export function ListaDePontos({ pontos }: { pontos: PontoDeInteresse[] }) {
  if (pontos.length === 0) {
    return (
      <p className="rounded border border-stone-200 bg-white p-6 text-stone-700">
        Nenhum ponto para mostrar.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {pontos.map((ponto) => (
        <li key={ponto.id} className="rounded border border-stone-200 bg-white p-4">
          <h3 className="font-medium">{ponto.nome}</h3>
          {/* O rótulo vem pronto da API. Traduzir `tipo` aqui sairia de
              sincronia com o Admin no dia em que a equipe criar um tipo novo. */}
          <p className="text-sm text-stone-600">{ponto.tipo_display}</p>

          {ponto.endereco && <p className="mt-1 text-stone-700">{ponto.endereco}</p>}
          {ponto.descricao && <p className="mt-2 text-stone-700">{ponto.descricao}</p>}

          {/* `coletivo` é `null` tanto para "sem vínculo" quanto para "vínculo
              com coletivo fora do ar", e os dois são indistinguíveis DE
              PROPÓSITO. Nada de "coletivo indisponível": um texto que só
              aparecesse no segundo caso denunciaria o que se quis esconder. */}
          {ponto.coletivo && (
            <p className="mt-2">
              <Link
                href={`/coletivos/${ponto.coletivo.slug}`}
                className="text-emerald-800 hover:underline"
              >
                {ponto.coletivo.nome}
              </Link>
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
