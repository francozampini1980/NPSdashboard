'use client'

import { PostEntregaMonthlyData } from '@/types'
import { getBrowserClient } from './supabase-browser'

const TABLE = 'nps_post_entrega_monthly'

export async function getAllPostEntregaMonths(): Promise<PostEntregaMonthlyData[]> {
  const { data, error } = await getBrowserClient()
    .from(TABLE)
    .select('*')
    .order('month', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function upsertPostEntregaMonth(data: PostEntregaMonthlyData): Promise<void> {
  const { error } = await getBrowserClient()
    .from(TABLE)
    .upsert({ ...data, updated_at: new Date().toISOString() }, { onConflict: 'month' })
  if (error) throw error
}

export async function deletePostEntregaMonth(month: string): Promise<void> {
  const { error } = await getBrowserClient()
    .from(TABLE)
    .delete()
    .eq('month', month)
  if (error) throw error
}
