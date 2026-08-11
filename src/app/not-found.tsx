/**
 * Página 404 — servida com status 404 de verdade.
 *
 * O status importa tanto quanto o texto: é ele que impede o buscador de
 * indexar como conteúdo válido o endereço de um coletivo que a equipe tirou
 * do ar. O texto evita dizer "este coletivo está inativo", que denunciaria a
 * existência de um cadastro oculto — para quem chega de fora, o endereço
 * simplesmente não existe.
 */
import Link from "next/link";

export default function NaoEncontrado() {
  return (
    <section className="mx-auto max-w-prose py-12 text-center">
      <h1 className="text-2xl font-semibold">Página não encontrada</h1>
      <p className="mt-4 text-stone-600">
        O endereço que você abriu não existe ou foi alterado.
      </p>
      <p className="mt-6">
        <Link href="/coletivos" className="text-emerald-800 underline">
          Ver os coletivos da rede
        </Link>
      </p>
    </section>
  );
}
