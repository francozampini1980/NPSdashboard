import Papa from 'papaparse'
import { ParsedCSVRow, MonthlyNPSData, POSITIVE_TOPICS, NEGATIVE_TOPICS } from '@/types'

// Column indices (0-based): A=0, B=1, C=2, D=3, E=4, F=5, G=6, H=7, ...
const COL = {
  fecha: 2,       // C
  pais: 3,        // D
  device: 5,      // F
  browser: 6,     // G
  os: 7,          // H
  nps: 10,        // K
  mencion_neg: 11, // L
  mencion_pos: 12, // M
  comentario: 13,  // N
  tipo_comentario: 18, // S
}

function normalizeTopicName(raw: string, list: readonly string[]): string {
  if (!raw) return ''
  const clean = raw.trim().toLowerCase()
  const match = list.find(t => t.toLowerCase() === clean)
  return match ?? raw.trim()
}

export function parseCSV(
  fileContent: string,
  impressions: number,
  surveyType: 'post_purchase' | 'post_delivery' = 'post_purchase'
): { data: MonthlyNPSData; detectedMonth: string; rowCount: number } {
  const result = Papa.parse<string[]>(fileContent, {
    skipEmptyLines: true,
  })

  const rows = result.data as string[][]

  // Skip header row(s) — find first row where column K is a number 0-10
  let startIdx = 0
  for (let i = 0; i < Math.min(rows.length, 5); i++) {
    const val = rows[i][COL.nps]
    const n = Number(val)
    if (!isNaN(n) && n >= 0 && n <= 10) {
      startIdx = i
      break
    }
    startIdx = i + 1
  }

  const dataRows = rows.slice(startIdx)

  const parsed: ParsedCSVRow[] = dataRows
    .filter(row => {
      const val = row[COL.nps]
      const n = Number(val)
      return !isNaN(n) && n >= 0 && n <= 10
    })
    .map(row => ({
      fecha: row[COL.fecha] ?? '',
      pais: row[COL.pais] ?? '',
      device: row[COL.device] ?? '',
      browser: row[COL.browser] ?? '',
      os: row[COL.os] ?? '',
      nps: Number(row[COL.nps]),
      mencion_negativa: normalizeTopicName(row[COL.mencion_neg] ?? '', NEGATIVE_TOPICS),
      mencion_positiva: normalizeTopicName(row[COL.mencion_pos] ?? '', POSITIVE_TOPICS),
      comentario: row[COL.comentario] ?? '',
      tipo_comentario: row[COL.tipo_comentario] ?? '',
    }))

  if (parsed.length === 0) {
    throw new Error('No se encontraron filas válidas en el CSV. Verificá que el archivo tenga el formato correcto.')
  }

  // Detect month from first row date
  const firstDate = parsed[0].fecha
  let detectedMonth = ''
  if (firstDate) {
    const match = firstDate.match(/^(\d{4}-\d{2})/)
    if (match) detectedMonth = match[1]
  }

  // Calculate NPS metrics
  const total = parsed.length
  const promoters = parsed.filter(r => r.nps >= 9).length
  const detractors = parsed.filter(r => r.nps <= 6).length
  const neutrals = total - promoters - detractors
  const npsScore = Math.round(((promoters - detractors) / total) * 100)

  // Score distribution
  const scoreDistribution: Record<string, number> = {}
  for (let i = 0; i <= 10; i++) scoreDistribution[String(i)] = 0
  parsed.forEach(r => {
    scoreDistribution[String(r.nps)] = (scoreDistribution[String(r.nps)] ?? 0) + 1
  })

  // Promotion reasons (only from promoters — nps 9-10, only predefined topics)
  const promotionReasons: Record<string, number> = {}
  POSITIVE_TOPICS.forEach(t => (promotionReasons[t] = 0))
  parsed
    .filter(r => r.nps >= 9 && r.mencion_positiva)
    .forEach(r => {
      if (r.mencion_positiva in promotionReasons) {
        promotionReasons[r.mencion_positiva]++
      }
      // Ignore mentions not in the predefined list
    })

  // Detraction reasons (only from detractors — nps 0-6, only predefined topics)
  const detractionReasons: Record<string, number> = {}
  NEGATIVE_TOPICS.forEach(t => (detractionReasons[t] = 0))
  parsed
    .filter(r => r.nps <= 6 && r.mencion_negativa)
    .forEach(r => {
      if (r.mencion_negativa in detractionReasons) {
        detractionReasons[r.mencion_negativa]++
      }
      // Ignore mentions not in the predefined list
    })

  const openComments = dataRows
    .map(row => row[COL.comentario]?.trim())
    .filter((v): v is string => !!v && v.length > 2)

  const monthData: MonthlyNPSData = {
    month: detectedMonth,
    survey_type: surveyType,
    impressions,
    total_responses: total,
    nps_score: npsScore,
    promoters_count: promoters,
    neutrals_count: neutrals,
    detractors_count: detractors,
    score_distribution: scoreDistribution,
    promotion_reasons: promotionReasons,
    detraction_reasons: detractionReasons,
    open_comments: openComments,
  }

  return { data: monthData, detectedMonth, rowCount: total }
}
