"use client";

/**
 * Fronteira de erro das páginas públicas.
 *
 * Precisa ser Client Component — é exigência do Next para poder oferecer o
 * botão que tenta de novo sem recarregar a página inteira.
 *
 * **A mensagem do erro não vai para a tela.** Ela pode carregar a URL interna
 * da API, o host do banco ou um trecho de resposta; nada disso interessa a
 * quem só queria ver a agenda, e tudo isso interessa a quem estiver sondando o
 * sistema. A pessoa recebe um texto útil em português; o detalhe fica no log
 * do servidor, onde a equipe alcança.
 */
export default function Erro({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="mx-auto max-w-prose py-12 text-center">
      <h1 className="text-2xl font-semibold">Não foi possível carregar esta página</h1>
      <p className="mt-4 text-stone-600">
        Pode ter sido uma instabilidade momentânea. Tente de novo em alguns
        instantes.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded bg-emerald-800 px-4 py-2 text-white hover:bg-emerald-900"
      >
        Tentar de novo
      </button>
    </section>
  );
}
