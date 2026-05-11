import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Extrae el mensaje de un error desconocido de forma segura.
 *  Cubre: Error, string, PostgrestError (objeto plano con `.message`). */
export function getErrorMessage(err: unknown, fallback = 'Ocurrió un error inesperado.'): string {
  if (err instanceof Error) return err.message
  if (typeof err === 'string') return err
  if (err && typeof err === 'object' && 'message' in err && typeof (err as Record<string, unknown>).message === 'string') {
    return (err as { message: string }).message
  }
  return fallback
}

/** Parsea un string a entero. Si el string está vacío o el resultado es NaN retorna `fallback`. */
export function toInt(s: string, fallback = 0): number {
  const n = parseInt(s, 10)
  return isNaN(n) ? fallback : n
}
