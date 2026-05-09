export interface BaseNPSDataPoint {
  month: string
  nps_score: number
  total_responses: number
  promoters_count: number
  neutrals_count: number
  detractors_count: number
}

export interface PostEntregaMonthlyData {
  id?: string
  month: string
  sent_count: number
  total_responses: number
  nps_score: number
  promoters_count: number
  neutrals_count: number
  detractors_count: number
  score_distribution: Record<string, number>
  ces_score: number
  ces_good_pct: number
  ces_regular_pct: number
  ces_bad_pct: number
  csat_puntualidad_score: number
  csat_puntualidad_good_pct: number
  csat_puntualidad_regular_pct: number
  csat_puntualidad_bad_pct: number
  csat_predisposicion_score: number
  csat_predisposicion_good_pct: number
  csat_predisposicion_regular_pct: number
  csat_predisposicion_bad_pct: number
  csat_condicion_score: number
  csat_condicion_good_pct: number
  csat_condicion_regular_pct: number
  csat_condicion_bad_pct: number
  open_comments?: string[]
  positive_aspects?: string[]
  negative_aspects?: string[]
  created_at?: string
  updated_at?: string
}

export interface MonthlyNPSData {
  id?: string
  month: string // YYYY-MM
  survey_type: 'post_purchase' | 'post_delivery'
  impressions: number
  total_responses: number
  nps_score: number
  promoters_count: number
  neutrals_count: number
  detractors_count: number
  score_distribution: Record<string, number> // {"0": n, "1": n, ..., "10": n}
  promotion_reasons: Record<string, number>
  detraction_reasons: Record<string, number>
  open_comments?: string[]
  positive_aspects?: string[]
  negative_aspects?: string[]
  created_at?: string
  updated_at?: string
}

export interface ParsedCSVRow {
  fecha: string
  pais: string
  device: string
  browser: string
  os: string
  nps: number
  mencion_negativa: string
  mencion_positiva: string
  comentario: string
  tipo_comentario: string
}

export const POSITIVE_TOPICS = [
  'La plataforma es rápida',
  'Las ofertas y promociones que ofrecen',
  'Variedad de opciones para retirar o recibir mi producto',
  'Buena información sobre los productos',
  'Poder usar cupones de descuento',
  'La plataforma me genera confianza',
  'La atención (chat o teléfono) fue útil',
  'Me resulto fácil encontrar lo que buscaba',
  'Los costos de envío son adecuados',
] as const

export const NEGATIVE_TOPICS = [
  'La plataforma es lenta',
  'Las ofertas y promociones no son claras',
  'Pocas opciones para retirar o recibir mi producto',
  'Poca información sobre los productos',
  'No pude ingresar el cupón de descuento',
  'La plataforma me genera desconfianza',
  'La atención (chat o teléfono) no fue útil',
  'Me resulto difícil encontrar lo que buscaba',
  'Los costos de envío son elevados',
] as const

export type PositiveTopic = (typeof POSITIVE_TOPICS)[number]
export type NegativeTopic = (typeof NEGATIVE_TOPICS)[number]

export const MONTH_NAMES_ES: Record<string, string> = {
  '01': 'Ene',
  '02': 'Feb',
  '03': 'Mar',
  '04': 'Abr',
  '05': 'May',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Ago',
  '09': 'Sep',
  '10': 'Oct',
  '11': 'Nov',
  '12': 'Dic',
}

export const MONTH_NAMES_FULL_ES: Record<string, string> = {
  '01': 'Enero',
  '02': 'Febrero',
  '03': 'Marzo',
  '04': 'Abril',
  '05': 'Mayo',
  '06': 'Junio',
  '07': 'Julio',
  '08': 'Agosto',
  '09': 'Septiembre',
  '10': 'Octubre',
  '11': 'Noviembre',
  '12': 'Diciembre',
}

export function formatMonthLabel(month: string): string {
  const [year, m] = month.split('-')
  return `${MONTH_NAMES_ES[m] ?? m} ${year}`
}

export function formatMonthLabelFull(month: string): string {
  const [year, m] = month.split('-')
  return `${MONTH_NAMES_FULL_ES[m] ?? m} ${year}`
}

export function getNPSColor(nps: number): string {
  if (nps >= 50) return '#10B981'
  if (nps >= 30) return '#3B82F6'
  if (nps >= 0) return '#F59E0B'
  return '#EF4444'
}

export function getNPSLabel(nps: number): string {
  if (nps >= 50) return 'Excelente'
  if (nps >= 30) return 'Bueno'
  if (nps >= 0) return 'Mejorable'
  return 'Crítico'
}
