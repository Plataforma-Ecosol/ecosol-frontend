/**
 * Origem: shadcn/ui (base Radix), copiado em 12/10/2026 pelo PRD de componentes.
 * Alterado: cores da paleta no lugar das do shadcn, sem `dark:` nem
 * `aria-invalid:`, foco com `outline-azul`, sem as classes de `file:` (nenhum
 * campo do site envia arquivo). Ver
 * `docs/PRD/PRD_Componentes_Busca_Filtros_Paginacao_Contato_v1.md`.
 *
 * `text-base` sem prefixo é de propósito: abaixo de 16 px o Safari do iPhone
 * dá zoom na página quando a pessoa toca no campo. O `md:text-sm` do shadcn
 * fica, porque no computador esse zoom não existe.
 */
import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-lg border border-azul-500 bg-white px-3 py-1 text-base text-texto transition-colors placeholder:text-texto/60 focus-visible:border-azul focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      {...props}
    />
  )
}

export { Input }
