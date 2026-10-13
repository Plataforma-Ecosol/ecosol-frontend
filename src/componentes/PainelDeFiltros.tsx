"use client";

import { SlidersHorizontal, X } from "lucide-react";
import Form from "next/form";
import Link from "next/link";
import { useId, useRef, type ReactNode } from "react";

import { Button } from "@/componentes/ui/button";
import { comParametros, todos, type ParametrosDaRota } from "@/lib/consulta";

/**
 * O botão "Filtros" e o painel que ele abre.
 *
 * **O painel é um `<dialog>` nativo aberto com `showModal()`**, como o menu do
 * celular: foco preso no painel, `Esc` fecha, o resto da página fica inerte e
 * o foco volta ao botão ao fechar — sem biblioteca. No celular ele sobe de
 * baixo, ocupando até 85% da tela; do `sm` para cima, abre na lateral.
 *
 * **Os filtros são um formulário GET**, como a busca. Checkbox com o mesmo
 * `name` já gera `?categoria=1&categoria=3` sozinha; o `<Form>` do Next só
 * troca o recarregamento da página por navegação. Os filtros se aplicam ao
 * clicar em "Ver resultados", e não a cada clique: com várias categorias, cada
 * marcação no meio do caminho seria uma consulta à toa.
 *
 * Quem decide os campos é a página (`children`), porque coletivos e agenda
 * filtram coisas diferentes. Este componente só conhece as chaves que o
 * painel controla (`chaves`): o resto da URL (a busca, a aba da agenda) vai
 * em campos ocultos, e `page` fica de fora, porque filtro novo muda o tamanho
 * do resultado.
 */
export function PainelDeFiltros({
  rota,
  parametros,
  chaves,
  quantidade,
  children,
}: {
  rota: string;
  parametros: ParametrosDaRota;
  chaves: string[];
  /** Quantos filtros estão em vigor; aparece no botão. */
  quantidade: number;
  children: ReactNode;
}) {
  const painel = useRef<HTMLDialogElement>(null);
  const idDoTitulo = useId();
  const fechar = () => painel.current?.close();

  const mantidos = Object.entries(parametros)
    .filter(([chave]) => !chaves.includes(chave) && chave !== "page")
    .flatMap(([chave, valor]) => todos(valor).map((item) => [chave, item] as const));

  const semFiltros = `${rota}${comParametros(parametros, {
    ...Object.fromEntries(chaves.map((chave) => [chave, undefined])),
    page: undefined,
  })}`;

  const campos = (
    <>
      {mantidos.map(([chave, valor]) => (
        <input key={`${chave}-${valor}`} type="hidden" name={chave} value={valor} />
      ))}
      {children}
    </>
  );

  return (
    <>
      <Button
        type="button"
        variant="outline"
        aria-haspopup="dialog"
        onClick={() => painel.current?.showModal()}
      >
        <SlidersHorizontal aria-hidden className="size-5" />
        Filtros{" "}
        {quantidade > 0 && (
          <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-azul px-1.5 text-sm font-semibold text-bege tabular-nums">
            {quantidade}{" "}
            <span className="sr-only">{quantidade === 1 ? "ativo" : "ativos"}</span>
          </span>
        )}
      </Button>

      <dialog
        ref={painel}
        aria-labelledby={idDoTitulo}
        // Clique no próprio `<dialog>`, e não num filho, só acontece no
        // `::backdrop` — o painel em si é todo coberto pelo formulário.
        onClick={(evento) => {
          if (evento.target === evento.currentTarget) fechar();
        }}
        className="fixed inset-x-0 top-auto bottom-0 m-0 max-h-[85dvh] w-full max-w-none rounded-t-2xl bg-white p-0 text-texto shadow-xl transition-transform duration-200 ease-out backdrop:bg-azul-900/40 open:flex open:flex-col starting:translate-y-full motion-reduce:transition-none sm:inset-y-0 sm:right-0 sm:left-auto sm:h-dvh sm:max-h-none sm:w-96 sm:rounded-none sm:starting:translate-x-full sm:starting:translate-y-0"
      >
        <Form action={rota} onSubmit={fechar} className="flex min-h-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-azul-100 px-4 py-3">
            <h2 id={idDoTitulo} className="text-lg font-bold text-azul">
              Filtros
            </h2>
            <button
              type="button"
              aria-label="Fechar filtros"
              onClick={fechar}
              className="inline-flex size-11 items-center justify-center rounded-full text-azul hover:bg-azul-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-4 py-4">{campos}</div>

          <div className="flex gap-2 border-t border-azul-100 px-4 py-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href={semFiltros} onClick={fechar}>
                Limpar
              </Link>
            </Button>
            <Button type="submit" className="flex-1 font-semibold">
              Ver resultados
            </Button>
          </div>
        </Form>
      </dialog>

      {/* Sem JavaScript o botão não abre nada. Para os filtros não sumirem,
          o mesmo formulário aparece num `<details>`, que abre sozinho — o
          mesmo cuidado do menu do celular. */}
      <noscript>
        <details className="w-full rounded-lg border border-azul-200 bg-white p-4">
          <summary className="cursor-pointer font-semibold text-azul">Filtros</summary>
          <form action={rota} className="mt-4 space-y-6">
            {campos}
            <Button type="submit" className="font-semibold">
              Ver resultados
            </Button>
          </form>
        </details>
      </noscript>
    </>
  );
}
