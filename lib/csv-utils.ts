/**
 * Encuentra el índice de la primera fila de datos válidos en un CSV.
 * Busca hasta las primeras 5 filas una celda en `col` que sea un número
 * dentro de [min, max]. Retorna el índice de esa fila.
 */
export function findDataStart(rows: string[][], col: number, min = 0, max = 10): number {
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const val = Number(rows[i][col])
    if (!isNaN(val) && val >= min && val <= max) return i
  }
  return Math.min(rows.length, 5)
}

/**
 * Formatea un valor NPS con su signo para mostrar en UI.
 */
export function formatNPS(nps: number): string {
  return nps > 0 ? `+${nps}` : String(nps)
}
