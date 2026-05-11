'use client'

import { PostEntregaMonthlyData } from '@/types'
import { getBrowserClient } from './supabase-browser'

const TABLE = 'nps_post_entrega_monthly'
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutos

let cache: { data: PostEntregaMonthlyData[]; ts: number } | null = null

function invalidateCache() {
  cache = null
}

export async function getAllPostEntregaMonths(): Promise<PostEntregaMonthlyData[]> {
  const now = Date.now()
  if (cache && now - cache.ts < CACHE_TTL_MS) return cache.data

  const { data, error } = await getBrowserClient()
    .from(TABLE)
    .select('*')
    .order('month', { ascending: true })
  if (error) throw error
  const result = data ?? []
  cache = { data: result, ts: now }
  return result
}

export async function upsertPostEntregaMonth(data: PostEntregaMonthlyData): Promise<void> {
  const { error } = await getBrowserClient()
    .from(TABLE)
    .upsert({ ...data, updated_at: new Date().toISOString() }, { onConflict: 'month' })
  if (error) throw error
  invalidateCache()
}

export async function deletePostEntregaMonth(month: string): Promise<void> {
  const { error } = await getBrowserClient()
    .from(TABLE)
    .delete()
    .eq('month', month)
  if (error) throw error
  invalidateCache()
}
