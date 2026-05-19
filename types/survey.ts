// ============================================================
// Survey module shared types
// ============================================================

export type QuestionType =
  | 'nps'
  | 'short_text'
  | 'long_text'
  | 'reaction'
  | 'single_choice'
  | 'multiple_choice'
  | 'announcement'
  | 'divisor'

export type SurveyStatus = 'active' | 'paused'

// ---- Config per question type ----

export interface NPSConfig {
  label_low: string
  label_high: string
}

export interface ReactionConfig {
  label_low: string
  label_high: string
  display: 'numbers' | 'faces' | 'stars'
}

export interface ChoiceConfig {
  options: string[]
  randomize: boolean
  max_selections?: number // only for multiple_choice
}

export interface AnnouncementConfig {
  content: string
}

export type QuestionConfig =
  | NPSConfig
  | ReactionConfig
  | ChoiceConfig
  | AnnouncementConfig
  | Record<string, never>

// ---- Logic (branching) ----

// Destination: 'next' | 'end' | question uuid
export type LogicTarget = 'next' | 'end' | string

export interface NPSLogic {
  detractors: LogicTarget
  neutrals: LogicTarget
  promoters: LogicTarget
}

export interface ReactionLogic {
  negative: LogicTarget
  neutral: LogicTarget
  positive: LogicTarget
}

export interface DefaultLogic {
  default: LogicTarget
}

/** Per-option logic for single_choice. Keys are option indices (as strings). */
export interface SingleChoiceLogic {
  options: Record<string, LogicTarget>
  default: LogicTarget
}

export type QuestionLogic = NPSLogic | ReactionLogic | SingleChoiceLogic | DefaultLogic | Record<string, never>

// ---- Question ----

export interface SurveyQuestion {
  id: string
  survey_id: string
  position: number
  type: QuestionType
  question: string
  required: boolean
  config: QuestionConfig
  logic: QuestionLogic
  created_at: string
}

// ---- Survey ----

export interface Survey {
  id: string
  slug: string
  name: string
  description: string | null
  header_image_url: string | null
  footer_text: string
  status: SurveyStatus
  close_at: string | null
  thanks_title: string
  thanks_body: string
  thanks_duration_seconds: number | null
  redirect_url: string | null
  var1_name: string | null
  var2_name: string | null
  var3_name: string | null
  allow_multiple_responses: boolean
  created_by: string | null
  created_at: string
  updated_at: string
  // joined
  survey_questions?: SurveyQuestion[]
}

// ---- Survey with response count (for list) ----

export interface SurveyListItem extends Survey {
  response_count: number
  creator_email: string | null
}

// ---- Response + answers ----

export interface SurveyResponse {
  id: string
  survey_id: string
  var1: string | null
  var2: string | null
  var3: string | null
  completed_at: string
}

export interface SurveyAnswer {
  id: string
  response_id: string
  question_id: string
  value: string | number | number[]
}

// ---- Builder wizard state ----

export interface BuilderQuestion {
  id: string           // temp uuid for new questions, real uuid for existing
  type: QuestionType
  question: string
  required: boolean
  config: QuestionConfig
  logic: QuestionLogic
}

export interface BuilderState {
  // Step 1
  name: string
  description: string
  headerImageFile: File | null
  headerImageUrl: string | null  // existing URL when editing
  footerText: string
  // Step 2
  questions: BuilderQuestion[]
  // Step 3
  slug: string
  status: SurveyStatus
  closeAt: string       // ISO datetime string or ''
  thanksTitle: string
  thanksBody: string
  thanksDuration: string  // seconds as string or ''
  redirectUrl: string
  // Variables (optional URL params)
  var1Name: string
  var2Name: string
  var3Name: string
  // Response limits
  allowMultipleResponses: boolean
}

export function defaultBuilderState(): BuilderState {
  return {
    name: '',
    description: '',
    headerImageFile: null,
    headerImageUrl: null,
    footerText: `Sus respuestas son anónimas y se utilizarán únicamente para mejorar nuestros servicios. ${new Date().getFullYear()} Frávega`,
    questions: [],
    slug: '',
    status: 'active',
    closeAt: '',
    thanksTitle: '¡Gracias por tu participación!',
    thanksBody: 'Tu opinión es fundamental para ayudarnos a mejorar nuestros servicios.',
    thanksDuration: '',
    redirectUrl: '',
    var1Name: '',
    var2Name: '',
    var3Name: '',
    allowMultipleResponses: false,
  }
}

export function defaultConfig(type: QuestionType): QuestionConfig {
  switch (type) {
    case 'nps':
      return { label_low: '0 = Nada probable', label_high: '10 = Muy probable' } as NPSConfig
    case 'reaction':
      return { label_low: '1 = Muy mala', label_high: '5 = Muy buena', display: 'numbers' } as ReactionConfig
    case 'single_choice':
    case 'multiple_choice':
      return { options: ['Opción 1'], randomize: false } as ChoiceConfig
    case 'announcement':
      return { content: '' } as AnnouncementConfig
    default:
      return {}
  }
}

export function defaultLogic(type: QuestionType): QuestionLogic {
  switch (type) {
    case 'nps':
      return { detractors: 'next', neutrals: 'next', promoters: 'next' } as NPSLogic
    case 'reaction':
      return { negative: 'next', neutral: 'next', positive: 'next' } as ReactionLogic
    case 'single_choice':
      return { options: {}, default: 'next' } as SingleChoiceLogic
    default:
      return { default: 'next' } as DefaultLogic
  }
}

/** Returns true if the question is structural (not a real question the user answers) */
export function isStructural(type: QuestionType): boolean {
  return type === 'divisor'
}
