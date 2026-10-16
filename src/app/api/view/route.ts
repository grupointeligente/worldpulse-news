/**
 * POST /api/view — registra uma visualização de artigo (contador do "Mais lidas")
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()
    if (!id || typeof id !== 'string' || id.length > 64) {
      return NextResponse.json({ ok: false }, { status: 400 })
    }
    await supabase.rpc('increment_article_views', { article_id: id })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
