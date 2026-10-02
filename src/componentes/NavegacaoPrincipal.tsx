"use client";

/**
 * O menu principal: mostra onde a pessoa está, e no celular vira um painel.
 *
 * Componente de cliente só porque precisa ler a rota (`usePathname`) e abrir o
 * painel; o `layout.tsx` continua sendo de servidor e apenas o renderiza.
 *
 * **O painel é um `<dialog>` nativo aberto com `showModal()`**, e não o Sheet
 * do shadcn (que só entra na parte 2 da identidade visual e traria o Radix
 * junto). O modal nativo já entrega o que o Sheet daria: foco preso no painel,
 * `Esc` fecha, o resto da página fica inerte e o foco volta ao botão ao fechar.
 */
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

const NAVEGACAO = [
  { href: "/coletivos", rotulo: "Coletivos" },
  { href: "/eventos", rotulo: "Agenda" },
  { href: "/mapa", rotulo: "Mapa" },
];

/**
 * `page` na própria página da seção; `true` numa subpágina dela (o perfil de
 * um coletivo está "dentro" de Coletivos). Os dois têm o mesmo destaque. Na
 * home nada fica ativo: ela não é nenhuma das três seções.
 */
function estadoDoLink(rota: string, href: string): "page" | "true" | undefined {
  if (rota === href) return "page";
  if (rota.startsWith(`${href}/`)) return "true";
  return undefined;
}

export function NavegacaoPrincipal() {
  const rota = usePathname();
  const painel = useRef<HTMLDialogElement>(null);

  // Trocou de rota (inclusive pelo botão "voltar"), o painel fecha. Clicar num
  // link já fecha pelo `onClick`; este efeito cobre o resto.
  useEffect(() => {
    painel.current?.close();
  }, [rota]);

  const fechar = () => painel.current?.close();

  return (
    <>
      {/* Do `sm` para cima: os links no próprio cabeçalho, em pílulas. O
          estilo do ativo vem do atributo `aria-current`, sem estado duplicado
          numa classe à parte. */}
      <nav aria-label="Principal" className="hidden sm:block">
        <ul className="flex gap-1 text-sm">
          {NAVEGACAO.map(({ href, rotulo }) => (
            <li key={href}>
              <Link
                href={href}
                aria-current={estadoDoLink(rota, href)}
                className="block rounded-full px-3 py-1.5 decoration-laranja decoration-[3px] underline-offset-[6px] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bege aria-[current]:bg-bege/15 aria-[current]:font-semibold aria-[current]:underline"
              >
                {rotulo}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Abaixo do `sm`: um botão e o painel lateral, em vez de os links
          quebrarem o cabeçalho em duas linhas. */}
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => painel.current?.showModal()}
        className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bege sm:hidden"
      >
        <Menu aria-hidden className="size-5 shrink-0" />
        Menu
      </button>

      <dialog
        ref={painel}
        aria-label="Menu"
        // Clique no próprio `<dialog>`, e não num filho, só acontece no
        // `::backdrop` — o painel em si é todo coberto pelo conteúdo.
        onClick={(evento) => {
          if (evento.target === evento.currentTarget) fechar();
        }}
        className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-white text-texto shadow-xl transition-transform duration-200 ease-out backdrop:bg-azul-900/40 starting:translate-x-full motion-reduce:transition-none sm:hidden"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-azul-100 px-4 py-3">
            <span className="font-titulo text-lg font-bold text-azul">Menu</span>
            <button
              type="button"
              aria-label="Fechar menu"
              onClick={fechar}
              className="inline-flex size-11 items-center justify-center rounded-full text-azul hover:bg-azul-50"
            >
              <X aria-hidden className="size-5" />
            </button>
          </div>

          <nav aria-label="Principal">
            <ul className="py-2">
              {NAVEGACAO.map(({ href, rotulo }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={fechar}
                    aria-current={estadoDoLink(rota, href)}
                    className="flex min-h-11 items-center border-l-4 border-transparent px-4 text-azul hover:bg-azul-50 aria-[current]:border-laranja aria-[current]:bg-azul-50 aria-[current]:font-semibold"
                  >
                    {rotulo}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </dialog>

      {/* Sem JavaScript o botão não abre nada. Para o celular não ficar sem
          menu, os links voltam em linha — o mesmo cuidado da busca, que
          funciona com `method="get"`. */}
      <noscript>
        <nav aria-label="Principal" className="flex w-full gap-4 text-sm sm:hidden">
          {NAVEGACAO.map(({ href, rotulo }) => (
            <Link key={href} href={href} className="hover:underline">
              {rotulo}
            </Link>
          ))}
        </nav>
      </noscript>
    </>
  );
}
