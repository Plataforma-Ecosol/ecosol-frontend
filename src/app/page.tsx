import Link from "next/link";

/**
 * Página inicial — apresentação da rede.
 *
 * Nesta fatia (PR L) ela é a porta de entrada e nada mais. O PR M substitui o
 * conteúdo pelos coletivos em destaque e pelos próximos eventos, quando a
 * camada de listagem existir.
 */
export default function Home() {
  return (
    <section className="mx-auto max-w-prose">
      <h1 className="text-3xl font-semibold text-emerald-900">
        Rede de Economia Solidária de Niterói
      </h1>

      <p className="mt-4 text-lg text-stone-700">
        Coletivos, feiras, lojas e a agenda da economia solidária da cidade,
        reunidos em um só lugar.
      </p>

      <p className="mt-4 text-stone-600">
        Esta plataforma é mantida pelo Centro Público de Referência em Economia
        Solidária (Casa Paul Singer), em parceria com o ITES e o IFRJ Campus
        Niterói.
      </p>

      <nav aria-label="Seções da plataforma" className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { href: "/coletivos", titulo: "Coletivos", texto: "Quem faz parte da rede" },
          { href: "/eventos", titulo: "Agenda", texto: "Feiras, encontros e formações" },
          { href: "/mapa", titulo: "Mapa", texto: "Onde encontrar a rede na cidade" },
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
    </section>
  );
}
