import { getSupabase } from '@/lib/supabase'
import type { ResumJocs } from '@/lib/database.types'

export async function getResumJocs(): Promise<ResumJocs> {
  const supabase = getSupabase()
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  if (sessionError) throw new Error('No s’ha pogut comprovar la sessió.')
  if (!session) throw new Error('Inicia sessió per consultar el resum de la col·lecció.')
  const { data, error } = await supabase.rpc('resum_jocs').single()
  if (error) throw new Error('No s’ha pogut carregar el resum. Comprova la connexió i les migracions de Supabase.')
  return data
}
