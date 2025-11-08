'use client'

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"

type PaginationControlsProps = {
  currentPage: number
  totalCount: number
  pageSize: number
  paramName: 'q_page' | 's_page'
}

export default function PaginationControls({
  currentPage,
  totalCount,
  pageSize,
  paramName,
}: PaginationControlsProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const totalPages = Math.ceil(totalCount / pageSize)

  const hasPrev = currentPage > 1
  const hasNext = currentPage < totalPages

  const createPageURL = (pageNumber: number | string) => {
    const params = new URLSearchParams(searchParams)
    params.set(paramName, pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  if (totalPages <= 1) {
    return null
  }

  return (
    <div className="flex items-center justify-between w-full">
      <span className="text-sm text-muted-foreground">
        Página {currentPage} de {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Button
          asChild
          variant="outline"
          size="sm"
          disabled={!hasPrev}
          className="gap-1"
        >
          <Link href={createPageURL(currentPage - 1)}>
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          disabled={!hasNext}
          className="gap-1"
        >
          <Link href={createPageURL(currentPage + 1)}>
            Próxima
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
) }