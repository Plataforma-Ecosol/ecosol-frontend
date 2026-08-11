import Link from "next/link";

import { CartaoColetivo } from "@/componentes/CartaoColetivo";
import { listarColetivos } from "@/lib/api";

/**
 * Página inicial — apresentação da rede e porta de entrada.
 *
 * Mostra alguns coletivos de verdade, e não só texto: quem chega pela primeira
 * vez precisa ver que existe gente ali. Os próximos eventos entram no PR O,
 * junto com a formatação de datas.
 */
export default async function Home() {
  // Os seis primeiros em ordem alfabética. Não há campo "destaque" no
  // cadastro, e inventar um critério de destaque no frontend seria decidir
  // sozinho quem a rede promove — isso é decisão da equipe, no Admin.
  const coletivos = await listarColetivos({ ordering: "nome" });
  const destaques = coletivos.results.slice(0, 6);

  return (
    <div className="space-y-12">
      <section className="max-w-prose">
        <h1 className="text-3xl font-semibold text-emerald-900">
          Rede de Economia Solidária de Niterói
        </h1>

        <p className="mt-4 text-lg text-stone-700">
          Coletivos, feiras, lojas e a agenda da economia solidária da cidade,
          reunidos em um só lugar.
        </p>

        <p className="mt-4 text-stone-600">
          Esta plataforma é mantida pelo Centro Público de Referência em
          Economia Solidária (Casa Paul Singer), em parceria com o ITES e o IFRJ
          Campus Niterói.
        </p>
      </section>

      {destaques.length > 0 && (
        <section className="space-y-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-semibold">Coletivos da rede</h2>
            <Link href="/coletivos" className="text-emerald-800 hover:underline">
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
            className="rounded border border-stone-200 bg-white p-4 hover:border-emerald-700"
          >
            <span className="block font-medium text-emerald-800">{titulo}</span>
            <span className="mt-1 block text-sm text-stone-600">{texto}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
