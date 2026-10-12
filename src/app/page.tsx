import Link from "next/link";

import { AberturaDaHome } from "@/componentes/AberturaDaHome";
import { CartaoColetivo } from "@/componentes/CartaoColetivo";
import { CartaoEvento } from "@/componentes/CartaoEvento";
import { listarColetivos, listarEventos, listarPontos } from "@/lib/api";

/**
 * Página inicial — apresentação da rede e porta de entrada.
 *
 * Mostra alguns coletivos de verdade, e não só texto: quem chega pela primeira
 * vez precisa ver que existe gente ali. Os próximos eventos entram no PR O,
 * junto com a formatação de datas.
 *
 * A abertura (título, chamadas e números da rede) mora em `AberturaDaHome`;
 * aqui só se buscam os dados.
 */
export default async function Home() {
  // Os seis primeiros em ordem alfabética. Não há campo "destaque" no
  // cadastro, e inventar um critério de destaque no frontend seria decidir
  // sozinho quem a rede promove — isso é decisão da equipe, no Admin.
  // As chamadas em paralelo: encadeadas com `await` seguido de `await`, a
  // home esperaria a soma de todas em vez da mais lenta. Dos pontos só
  // interessa o `count`, para os números da abertura — daí `page_size: 1`.
  const [coletivos, eventos, pontos] = await Promise.all([
    listarColetivos({ ordering: "nome" }),
    listarEventos({ periodo: "proximos", ordering: "data_inicio" }),
    listarPontos({ page_size: 1 }),
  ]);

  const destaques = coletivos.results.slice(0, 6);
  const proximos = eventos.results.slice(0, 3);

  return (
    <div className="space-y-12">
      {/* A foto da feira entra num commit próprio, quando a Casa Paul Singer
          enviá-la com a autorização de uso de imagem. Até lá, a abertura fica
          em uma coluna só. */}
      <AberturaDaHome
        totais={{
          coletivos: coletivos.count,
          pontos: pontos.count,
          eventos: eventos.count,
        }}
      />

      {destaques.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-bold">Coletivos da rede</h2>
            <Link href="/coletivos" className="text-azul hover:underline">
              Ver todos ({coletivos.count}) →
            </Link>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {destaques.map((coletivo) => (
              <li key={coletivo.id}>
                <CartaoColetivo coletivo={coletivo} parametros={{}} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {proximos.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-bold">Próximos eventos</h2>
            <Link href="/eventos" className="text-azul hover:underline">
              Ver a agenda →
            </Link>
          </div>

          <ul className="space-y-4">
            {proximos.map((evento) => (
              <li key={evento.id}>
                <CartaoEvento evento={evento} />
              </li>
            ))}
          </ul>
        </section>
      )}

      <nav aria-label="Seções da plataforma" className="grid gap-4 sm:grid-cols-2">
        {[
          {
            href: "/eventos",
            titulo: "Agenda",
            texto: "Feiras, encontros e formações da rede",
          },
          {
            href: "/mapa",
            titulo: "Mapa",
            texto: "Onde encontrar a economia solidária na cidade",
          },
        ].map(({ href, titulo, texto }) => (
          <Link
            key={href}
            href={href}
            className="rounded border border-dourado/60 bg-white p-4 hover:border-azul"
          >
            <span className="block font-medium text-azul">{titulo}</span>
            <span className="mt-1 block text-sm text-texto/75">{texto}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
