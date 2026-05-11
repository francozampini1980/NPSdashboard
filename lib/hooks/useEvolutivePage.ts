import { useState, useMemo } from 'react'

const MONTHS_PER_PAGE = 6

/**
 * Maneja la paginación del evolutivo y la selección de mes actual.
 * Compartido entre nps-post-compra y nps-post-entrega.
 */
export function useEvolutivePage<T extends { month: string }>(months: T[]) {
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [evolutivePage, setEvolutivePage] = useState(0)

  const totalPages = Math.ceil(months.length / MONTHS_PER_PAGE)
  const maxPage = Math.max(0, totalPages - 1)
  const safePage = Math.min(evolutivePage, maxPage)

  const evolutiveSlice = useMemo(
    () => months.slice(safePage * MONTHS_PER_PAGE, safePage * MONTHS_PER_PAGE + MONTHS_PER_PAGE),
    [months, safePage]
  )

  const currentData = useMemo(
    () => months.find(m => m.month === selectedMonth) ?? null,
    [months, selectedMonth]
  )

  // Llamar cuando los datos cargan para ir a la última página
  function initFromData(data: T[]) {
    if (data.length === 0) return
    const pages = Math.ceil(data.length / MONTHS_PER_PAGE)
    setEvolutivePage(Math.max(0, pages - 1))
    setSelectedMonth(prev => prev || data[data.length - 1].month)
  }

  function goToPrevPage() {
    setEvolutivePage(p => Math.max(0, p - 1))
  }

  function goToNextPage() {
    setEvolutivePage(p => Math.min(maxPage, p + 1))
  }

  return {
    selectedMonth,
    setSelectedMonth,
    evolutiveSlice,
    currentData,
    totalPages,
    maxPage,
    safePage,
    initFromData,
    goToPrevPage,
    goToNextPage,
  }
}
