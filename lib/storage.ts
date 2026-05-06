'use client'

import { MonthlyNPSData } from '@/types'
import { isSupabaseConfigured } from './supabase'
import { getBrowserClient } from './supabase-browser'

const LOCAL_STORAGE_KEY = 'nps_dashboard_data'

function getLocalData(): MonthlyNPSData[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalData(data: MonthlyNPSData[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data))
}

export async function getAllMonths(): Promise<MonthlyNPSData[]> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getBrowserClient()
      .from('nps_monthly_data')
      .select('*')
      .order('month', { ascending: true })
    if (error) throw error
    return data ?? []
  }
  return getLocalData().sort((a, b) => a.month.localeCompare(b.month))
}

export async function getMonthData(month: string): Promise<MonthlyNPSData | null> {
  if (isSupabaseConfigured()) {
    const { data, error } = await getBrowserClient()
      .from('nps_monthly_data')
      .select('*')
      .eq('month', month)
      .single()
    if (error) return null
    return data
  }
  const all = getLocalData()
  return all.find(d => d.month === month) ?? null
}

export async function upsertMonthData(data: MonthlyNPSData): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await getBrowserClient()
      .from('nps_monthly_data')
      .upsert({ ...data, updated_at: new Date().toISOString() }, { onConflict: 'month,survey_type' })
    if (error) throw error
    return
  }
  const all = getLocalData()
  const idx = all.findIndex(d => d.month === data.month && d.survey_type === data.survey_type)
  if (idx >= 0) {
    all[idx] = { ...data, updated_at: new Date().toISOString() }
  } else {
    all.push({ ...data, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
  }
  saveLocalData(all)
}

export async function deleteMonthData(month: string, surveyType = 'post_purchase'): Promise<void> {
  if (isSupabaseConfigured()) {
    const { error } = await getBrowserClient()
      .from('nps_monthly_data')
      .delete()
      .eq('month', month)
      .eq('survey_type', surveyType)
    if (error) throw error
    return
  }
  const all = getLocalData()
  saveLocalData(all.filter(d => !(d.month === month && d.survey_type === surveyType)))
}
