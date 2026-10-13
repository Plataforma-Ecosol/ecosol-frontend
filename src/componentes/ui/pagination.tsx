/**
 * Origem: shadcn/ui (base Radix), copiado em 12/10/2026 pelo PRD de componentes.
 * Alterado: cores da paleta no lugar das do shadcn, sem `dark:`, foco com
 * `outline-azul`, `Link` do Next no lugar do `<a>`, textos em português, e a
 * página atual como `PaginationAtual` (um `<span>`, não um link). Ver
 * `docs/PRD/PRD_Componentes_Busca_Filtros_Paginacao_Contato_v1.md`, seção 4.
 */
import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"
import Link from "next/link"

import { Button } from "@/componentes/ui/button"
import { cn } from "@/lib/utils"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      aria-label="Paginação"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-1", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

type PaginationLinkProps = Pick<React.ComponentProps<typeof Button>, "size"> &
  React.ComponentProps<typeof Link>

function PaginationLink({
  className,
  size = "icon",
  ...props
}: PaginationLinkProps) {
  return (
    <Button
      asChild
      variant="ghost"
      size={size}
      className={cn("tabular-nums", className)}
    >
      <Link data-slot="pagination-link" {...props} />
    </Button>
  )
}

/**
 * A página em que a pessoa está. Um `<span>`, e não um link para a própria
 * página: um link que não leva a lugar nenhum recebe foco e promete uma ação
 * que não acontece.
 */
function PaginationAtual({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-current="page"
      data-slot="pagination-atual"
      className={cn(
        "inline-flex size-10 items-center justify-center rounded-lg bg-azul font-semibold text-bege tabular-nums",
        className
      )}
      {...props}
    />
  )
}

/**
 * No celular só a seta aparece; a palavra continua lá, em `sr-only`, como
 * nome do link para o leitor de tela.
 */
function PaginationPrevious({
  className,
  text = "Anterior",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      rel="prev"
      size="icon"
      className={cn("sm:w-auto sm:pr-3 sm:pl-2", className)}
      {...props}
    >
      <ChevronLeftIcon aria-hidden className="size-5" />
      <span className="sr-only sm:not-sr-only">{text}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  text = "Próxima",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      rel="next"
      size="icon"
      className={cn("sm:w-auto sm:pr-2 sm:pl-3", className)}
      {...props}
    >
      <span className="sr-only sm:not-sr-only">{text}</span>
      <ChevronRightIcon aria-hidden className="size-5" />
    </PaginationLink>
  )
}

/** Decorativa: não é ação nenhuma, e o leitor de tela não precisa ouvi-la. */
function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-10 items-center justify-center text-texto/60",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
    </span>
  )
}

export {
  Pagination,
  PaginationAtual,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
