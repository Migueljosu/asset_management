import { useState, useMemo, useEffect } from 'react'

interface UsePaginationProps<T> {
  data: T[]
  itemsPerPage?: number
  searchFields?: (keyof T)[]
  searchValue?: string
  filterFn?: (item: T) => boolean
}

export function usePagination<T>({
  data,
  itemsPerPage = 5,
  searchFields = [],
  searchValue = '',
  filterFn,
}: UsePaginationProps<T>) {
  const [currentPage, setCurrentPage] = useState(1)

  const filteredData = useMemo(() => {
    let result = [...data]

    // Aplicar filtro customizado
    if (filterFn) {
      result = result.filter(filterFn)
    }

    // Aplicar pesquisa
    if (searchValue && searchFields.length > 0) {
      const search = searchValue.toLowerCase()
      result = result.filter((item) =>
        searchFields.some((field) => {
          const value = item[field]
          return value != null && String(value).toLowerCase().includes(search)
        })
      )
    }

    return result
  }, [data, searchValue, searchFields, filterFn])

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(filteredData.length / itemsPerPage))
  }, [filteredData.length, itemsPerPage])

  // Resetar para página 1 quando os dados ou pesquisa mudam
  // NOTA: filterFn é intencionalmente excluído porque é recriado a cada render nos componentes
  useEffect(() => {
    setCurrentPage(1)
  }, [data.length, searchValue])

  // Garantir que currentPage nunca excede totalPages
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredData.slice(start, start + itemsPerPage)
  }, [filteredData, currentPage, itemsPerPage])

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const goToPrevious = () => goToPage(currentPage - 1)
  const goToNext = () => goToPage(currentPage + 1)

  return {
    currentPage,
    totalPages,
    paginatedData,
    filteredData,
    goToPage,
    goToPrevious,
    goToNext,
    setCurrentPage,
    totalItems: filteredData.length,
    startItem: filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1,
    endItem: Math.min(currentPage * itemsPerPage, filteredData.length),
  }
}
