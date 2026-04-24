import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  currentPage: number
  totalPages: number
  totalItems: number
  startItem: number
  endItem: number
  onPrevious: () => void
  onNext: () => void
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  startItem,
  endItem,
  onPrevious,
  onNext,
}: Props) {
  if (totalItems === 0) return null

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t">
      <span className="text-sm text-muted-foreground">
        Mostrando <strong>{startItem}</strong> a <strong>{endItem}</strong> de{' '}
        <strong>{totalItems}</strong> resultados
      </span>

      <div className="flex items-center gap-2">
        <button
          onClick={onPrevious}
          disabled={currentPage === 1}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={14} />
          Anterior
        </button>

        <span className="text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded-md font-medium min-w-[80px] text-center">
          {currentPage} / {totalPages}
        </span>

        <button
          onClick={onNext}
          disabled={currentPage === totalPages}
          className="flex items-center gap-1 px-3 py-1.5 text-sm border rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          Próxima
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  )
}

