/**
 * Origem: shadcn/ui (base Radix), copiado em 12/10/2026 pelo PRD de componentes.
 * Alterado: cores da paleta no lugar das do shadcn, sem `dark:`, foco com
 * `outline-azul`, só as variantes e os tamanhos que o site usa, alvo de toque
 * de 44 px no tamanho padrão. Ver
 * `docs/PRD/PRD_Componentes_Busca_Filtros_Paginacao_Contato_v1.md`.
 */
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-lg font-medium whitespace-nowrap transition-colors select-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-azul disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-azul text-bege hover:bg-azul-700",
        outline:
          "border border-azul-200 bg-white text-azul hover:border-azul hover:bg-azul-50",
        ghost: "text-azul hover:bg-azul-50",
        link: "text-azul underline underline-offset-4 hover:text-azul-900",
      },
      size: {
        default: "min-h-11 px-4",
        sm: "min-h-9 px-3 text-sm",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
