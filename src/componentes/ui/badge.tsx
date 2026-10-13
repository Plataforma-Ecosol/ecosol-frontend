/**
 * Origem: shadcn/ui (base Radix), copiado em 12/10/2026 pelo PRD de componentes.
 * Alterado: cores da paleta no lugar das do shadcn, sem `dark:`, foco com
 * `outline-azul`, só as variantes `default` e `secondary`, e tamanho de chip
 * clicável (32 px) no lugar do selo pequeno do shadcn. Ver
 * `docs/PRD/PRD_Componentes_Busca_Filtros_Paginacao_Contato_v1.md`.
 */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex min-h-8 w-fit shrink-0 items-center justify-center gap-1.5 rounded-full px-3 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul [&>svg]:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-azul text-bege hover:bg-azul-900",
        secondary: "bg-azul-50 text-azul-800 hover:bg-azul hover:text-bege",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
