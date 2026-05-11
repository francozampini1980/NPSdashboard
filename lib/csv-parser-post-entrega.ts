import Papa from 'papaparse'
import { PostEntregaMonthlyData } from '@/types'
import { findDataStart } from './csv-utils'

// Post-entrega CSV columns (0-indexed):
// A=0 NPS (0-10), B=1 CES (1-5), C=2 comentario neg CES (skip),
// D=3 comentario final (skip), E=4 CSAT puntualidad (1-5),
// F=5 CSAT predisposicion (1-5), G=6 CSAT condicion (1-5),
// H=7 fecha (D/M/YYYY H:MM:SS)
const COL = {
  nps: 0,
  ces: 1,
  csat_puntualidad: 4,
  csat_predisposicion: 5,
  csat_condicion: 6,
  fecha: 7,
}

function parsePostEntregaDate(dateStr: string): string {
  // Format: D/M/YYYY H:MM:SS
  const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (!match) return ''
  const month = match[2].padStart(2, '0')
  const year = match[3]
  return `${year}-${month}`
}

// Score = % de respuestas satisfactorias (4 o 5) sobre el total de válidas
// Estándar CSAT/CES: (respuestas 4+5 / total) × 100
function calcMetric(values: number[]): {
  score: number
  good_pct: number
  regular_pct: number
  bad_pct: number
} {
  const valid = values.filter(v => v >= 1 && v <= 5)
  if (valid.length === 0) return { score: 0, good_pct: 0, regular_pct: 0, bad_pct: 0 }
  const good_pct = (valid.filter(v => v >= 4).length / valid.length) * 100
  const regular_pct = (valid.filter(v => v === 3).length / valid.length) * 100
  const bad_pct = (valid.filter(v => v <= 2).length / valid.length) * 100
  return {
    score: Math.round(good_pct * 10) / 10,
    good_pct: Math.round(good_pct * 10) / 10,
    regular_pct: Math.round(regular_pct * 10) / 10,
    bad_pct: Math.round(bad_pct * 10) / 10,
  }
}

export function parsePostEntregaCSV(
  fileContent: string,
  sentCount: number
): { data: PostEntregaMonthlyData; detectedMonth: string; rowCount: number } {
  const result = Papa.parse<string[]>(fileContent, { skipEmptyLines: true })
  const rows = result.data as string[][]

  // Find first data row where column A is 0-10
  const startIdx = findDataStart(rows, COL.nps)

  const dataRows = rows.slice(startIdx).filter(row => {
    const val = Number(row[COL.nps])
    return !isNaN(val) && val >= 0 && val <= 10
  })

  if (dataRows.length === 0) {
    throw new Error('No se encontraron filas válidas. Verificá que el archivo tenga el formato correcto (columna A: NPS 0-10).')
  }

  const detectedMonth = parsePostEntregaDate(dataRows[0][COL.fecha] ?? '')

  // NPS
  const npsValues = dataRows.map(r => Number(r[COL.nps]))
  const total = npsValues.length
  const promoters = npsValues.filter(v => v >= 9).length
  const detractors = npsValues.filter(v => v <= 6).length
  const neutrals = total - promoters - detractors
  const npsScore = Math.round(((promoters - detractors) / total) * 100)

  const scoreDistribution: Record<string, number> = {}
  for (let i = 0; i <= 10; i++) scoreDistribution[String(i)] = 0
  npsValues.forEach(v => {
    scoreDistribution[String(v)] = (scoreDistribution[String(v)] ?? 0) + 1
  })

  // CES y CSAT
  const ces = calcMetric(dataRows.map(r => Number(r[COL.ces])))
  const csatPuntualidad = calcMetric(dataRows.map(r => Number(r[COL.csat_puntualidad])))
  const csatPredisposicion = calcMetric(dataRows.map(r => Number(r[COL.csat_predisposicion])))
  const csatCondicion = calcMetric(dataRows.map(r => Number(r[COL.csat_condicion])))

  const cesComments: string[] = []
  const openComments: string[] = []
  dataRows.forEach(row => {
    const colC = row[2]?.trim()
    const colD = row[3]?.trim()
    if (colC && colC.length > 2) cesComments.push(colC)
    if (colD && colD.length > 2) openComments.push(colD)
  })

  const data: PostEntregaMonthlyData = {
    month: detectedMonth,
    sent_count: sentCount,
    total_responses: total,
    nps_score: npsScore,
    promoters_count: promoters,
    neutrals_count: neutrals,
    detractors_count: detractors,
    score_distribution: scoreDistribution,
    ces_score: ces.score,
    ces_good_pct: ces.good_pct,
    ces_regular_pct: ces.regular_pct,
    ces_bad_pct: ces.bad_pct,
    csat_puntualidad_score: csatPuntualidad.score,
    csat_puntualidad_good_pct: csatPuntualidad.good_pct,
    csat_puntualidad_regular_pct: csatPuntualidad.regular_pct,
    csat_puntualidad_bad_pct: csatPuntualidad.bad_pct,
    csat_predisposicion_score: csatPredisposicion.score,
    csat_predisposicion_good_pct: csatPredisposicion.good_pct,
    csat_predisposicion_regular_pct: csatPredisposicion.regular_pct,
    csat_predisposicion_bad_pct: csatPredisposicion.bad_pct,
    csat_condicion_score: csatCondicion.score,
    csat_condicion_good_pct: csatCondicion.good_pct,
    csat_condicion_regular_pct: csatCondicion.regular_pct,
    csat_condicion_bad_pct: csatCondicion.bad_pct,
    open_comments: openComments,
    ces_comments: cesComments,
  }

  return { data, detectedMonth, rowCount: total }
}
