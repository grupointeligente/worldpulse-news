/**
 * ROBÔ DE NOTÍCIAS — Motor principal de coleta e processamento com IA
 *
 * Fluxo:
 * 1. Busca RSS feeds das fontes ativas no Supabase
 * 2. Para cada item: verifica duplicata (URL já existe?)
 * 3. Chama Claude API para: resumo PT+EN, título SEO, score de relevância, categoria, tags
 * 4. Salva no Supabase com status 'pending' (aguarda curadoria) ou 'published' (auto-publish se score >= 8)
 */

import Anthropic from '@anthropic-ai/sdk'
import Parser from 'rss-parser'
import { createClient } from '@supabase/supabase-js'

// ─── Setup ────────────────────────────────────────────────────────────────────

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; WorldPulse/1.0; +https://newsbot-cyan.vercel.app)',
    Accept: 'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['content:encoded', 'content:encoded'],
      ['itunes:image', 'itunes.image'],
    ],
  },
  timeout: 15000,
})

// ─── Types ────────────────────────────────────────────────────────────────────

interface RSSItem {
  title?: string
  link?: string
  contentSnippet?: string
  content?: string
  'content:encoded'?: string
  isoDate?: string
  pubDate?: string
  enclosure?: { url?: string }
  mediaContent?: { $?: { url?: string } }
  mediaThumbnail?: { $?: { url?: string } }
  itunes?: { image?: string }
}

interface ProcessedArticle {
  title_pt: string
  title_en: string
  slug: string
  summary_pt: string
  summary_en: string
  meta_title_pt: string
  meta_title_en: string
  meta_desc_pt: string
  meta_desc_en: string
  tags: string[]
  relevance_score: number
  category_slug: string
  breaking: boolean
}

// ─── Utilidades ───────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 100)
}

function extractImage(item: RSSItem): string | null {
  // 1. Standard media fields
  const direct =
    item.enclosure?.url ||
    item.mediaContent?.$?.url ||
    item.mediaThumbnail?.$?.url ||
    item.itunes?.image ||
    null
  if (direct && isValidImageUrl(direct)) return direct

  // 2. Extract from HTML content (content:encoded or content)
  const html = item['content:encoded'] || item.content || ''
  if (html) {
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i)
    const candidate = imgMatch?.[1]
    if (candidate && isValidImageUrl(candidate)) return candidate
  }

  return null
}

function isValidImageUrl(url: string): boolean {
  if (!url.startsWith('http')) return false
  // Skip tracking pixels and known garbage URLs
  const skip = ['pixel.gif', '1x1', 'tracking', 'beacon', '.gif?', 'logo', 'icon']
  if (skip.some(s => url.toLowerCase().includes(s))) return false
  // Must look like an image (or CDN url without extension is OK)
  const imageExtensions = /\.(jpg|jpeg|png|webp|avif|svg)/i
  const cdnPattern = /images\.|cdn\.|media\.|static\.|img\./i
  return imageExtensions.test(url) || cdnPattern.test(url)
}

async function extractOgImage(articleUrl: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)
    const res = await fetch(articleUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WorldPulse/1.0; +https://newsbot-cyan.vercel.app)',
        'Accept': 'text/html',
      },
    })
    clearTimeout(timeout)
    if (!res.ok) return null
    // Read only first 20KB to find og:image in <head>
    const reader = res.body?.getReader()
    if (!reader) return null
    let html = ''
    while (html.length < 20000) {
      const { done, value } = await reader.read()
      if (done) break
      html += new TextDecoder().decode(value)
      if (html.includes('</head>')) break
    }
    reader.cancel().catch(() => {})
    const match = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
              || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    const candidate = match?.[1]
    if (candidate && isValidImageUrl(candidate)) return candidate
  } catch {
    // timeout or network error — silently skip
  }
  return null
}

function cleanText(text?: string): string {
  if (!text) return ''
  return text
    .replace(/<[^>]*>/g, '')  // remove HTML
    .replace(/&[a-z]+;/g, ' ')  // remove HTML entities
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 2000)
}

// ─── Validação de imagem (obrigatória para publicar) ──────────────────────────

async function validateImageUrl(imgUrl: string): Promise<boolean> {
  const UA = 'Mozilla/5.0 (compatible; WorldPulse/1.0; +https://newsbot-cyan.vercel.app)'
  try {
    const c1 = new AbortController()
    const t1 = setTimeout(() => c1.abort(), 5000)
    const head = await fetch(imgUrl, { method: 'HEAD', signal: c1.signal, headers: { 'User-Agent': UA } })
    clearTimeout(t1)
    if (head.ok && (head.headers.get('content-type') || '').startsWith('image/')) return true

    // Alguns CDNs não suportam HEAD ou omitem content-type — tenta GET leve
    const c2 = new AbortController()
    const t2 = setTimeout(() => c2.abort(), 5000)
    const res = await fetch(imgUrl, { signal: c2.signal, headers: { 'User-Agent': UA, Range: 'bytes=0-2047' } })
    clearTimeout(t2)
    const ok = (res.ok || res.status === 206) && (res.headers.get('content-type') || '').startsWith('image/')
    try { await res.body?.cancel() } catch {}
    return ok
  } catch {
    return false
  }
}

// ─── Verificação de duplicata ──────────────────────────────────────────────────

async function isDuplicate(url: string): Promise<boolean> {
  const { data } = await supabase
    .from('articles')
    .select('id')
    .eq('source_url', url)
    .limit(1)
  return (data?.length || 0) > 0
}

// ─── Processamento com Claude ──────────────────────────────────────────────────

async function processWithClaude(
  title: string,
  content: string,
  sourceName: string,
  sourceLang: 'pt' | 'en'
): Promise<ProcessedArticle | null> {
  const systemPrompt = `You are a professional news editor and SEO expert for a global bilingual news portal (Portuguese + English).

Your task: analyze a news article and produce structured output.

CATEGORIES available (use the slug):
- mundo (World/International)
- politica (Politics)
- economia (Economy/Finance/Business)
- tecnologia (Technology/AI/Innovation)
- ciencia (Science/Research)
- saude (Health/Medicine)
- esportes (Sports)
- entretenimento (Entertainment/Culture/Celebrity)

RULES:
1. Summaries must be ORIGINAL TEXT — do NOT copy from the source. Write in your own words.
2. PT summary: 300-500 words in Brazilian Portuguese, journalistic tone.
3. EN summary: 300-500 words in American English, journalistic tone.
4. PARAGRAPH STRUCTURE (mandatory): split each summary into 3-5 short paragraphs separated by a blank line (use "\\n\\n" inside the JSON string). Paragraph 1 = strong lead (who/what/when/where). Middle paragraphs = development and details. Final paragraph = context or outlook. NEVER return a single-block summary.
5. Relevance score 1-10: global importance, reader interest, timeliness.
6. Breaking = true only for major urgent events (disasters, elections results, major deaths, wars).
7. Tags: 3-6 keywords in English, lowercase.
8. SEO titles: max 60 chars. Meta descriptions: 150-160 chars.
9. Slug: English words, no accents, hyphens only.

Respond ONLY with valid JSON, no markdown, no explanation.`

  const userPrompt = `Analyze this article:

SOURCE: ${sourceName} (language: ${sourceLang})
TITLE: ${title}
CONTENT: ${content}

Return JSON with this exact structure:
{
  "title_pt": "...",
  "title_en": "...",
  "slug": "...",
  "summary_pt": "...",
  "summary_en": "...",
  "meta_title_pt": "...",
  "meta_title_en": "...",
  "meta_desc_pt": "...",
  "meta_desc_en": "...",
  "tags": ["...", "..."],
  "relevance_score": 7.5,
  "category_slug": "tecnologia",
  "breaking": false
}`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',  // rápido e barato para volume alto
      max_tokens: 2500,  // espaço para 2 resumos de 300-500 palavras com parágrafos
      messages: [{ role: 'user', content: userPrompt }],
      system: systemPrompt,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('No JSON in response')
    return JSON.parse(jsonMatch[0]) as ProcessedArticle
  } catch (err) {
    console.error('Claude processing error:', err)
    return null
  }
}

// ─── Busca categorias do Supabase ─────────────────────────────────────────────

async function getCategoryId(slug: string): Promise<string | null> {
  const { data } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .single()
  return data?.id || null
}

// ─── Processa um item RSS ────────────────────────────────────────────────────

async function processItem(item: RSSItem, source: { id: string; name: string; language: string }) {
  const url = item.link
  if (!url || !item.title) return null

  // Verifica duplicata
  if (await isDuplicate(url)) return null

  const title = cleanText(item.title)
  const content = cleanText(item.contentSnippet || item.content || item.title)

  // Imagem obrigatória: resolve e valida ANTES de gastar com a IA
  const rssImage = extractImage(item)
  let imageUrl: string | null = null
  if (rssImage && (await validateImageUrl(rssImage))) imageUrl = rssImage
  if (!imageUrl) {
    const ogImage = await extractOgImage(url)
    if (ogImage && (await validateImageUrl(ogImage))) imageUrl = ogImage
  }
  if (!imageUrl) {
    console.log(`  ⛔ Sem imagem válida — descartado: ${title.slice(0, 60)}`)
    return null
  }

  console.log(`  Processing: ${title.slice(0, 60)}...`)

  // Processa com Claude
  const processed = await processWithClaude(title, content, source.name, source.language as 'pt' | 'en')
  if (!processed) return null

  // Busca category_id
  const categoryId = await getCategoryId(processed.category_slug)

  // Garante slug único
  let finalSlug = processed.slug || slugify(processed.title_en)
  const { data: existing } = await supabase
    .from('articles')
    .select('id')
    .eq('slug', finalSlug)
    .limit(1)
  if (existing?.length) {
    finalSlug = `${finalSlug}-${Date.now().toString(36)}`
  }

  // Determina status automático (score >= 7.0 publica direto)
  const autoPublish = processed.relevance_score >= 7.0
  const autoFeatured = processed.relevance_score >= 9.0  // top artigos entram no destaque
  const status = autoPublish ? 'published' : 'pending'
  const publishedAt = autoPublish ? new Date().toISOString() : null

  // Salva no Supabase
  const { error } = await supabase.from('articles').insert({
    title_pt: processed.title_pt,
    title_en: processed.title_en,
    slug: finalSlug,
    summary_pt: processed.summary_pt,
    summary_en: processed.summary_en,
    meta_title_pt: processed.meta_title_pt,
    meta_title_en: processed.meta_title_en,
    meta_desc_pt: processed.meta_desc_pt,
    meta_desc_en: processed.meta_desc_en,
    tags: processed.tags,
    source_url: url,
    source_name: source.name,
    source_id: source.id,
    original_lang: source.language,
    category_id: categoryId,
    image_url: imageUrl,
    relevance_score: processed.relevance_score,
    breaking: processed.breaking,
    featured: autoFeatured,
    status,
    published_at: publishedAt,
    original_pub_at: item.isoDate || item.pubDate || null,
    ai_model: 'claude-haiku-4-5',
  })

  if (error) {
    console.error('  Supabase insert error:', error.message)
    return null
  }

  return { title: finalSlug, status }
}

// ─── Função principal do robô ─────────────────────────────────────────────────

export async function runRobot(options: { maxSources?: number; maxItemsPerSource?: number } = {}) {
  const { maxSources = 50, maxItemsPerSource = 10 } = options
  const startedAt = Date.now()
  const TIME_BUDGET_MS = 240_000 // para com folga antes do timeout de 300s da Vercel
  const budgetExceeded = () => Date.now() - startedAt > TIME_BUDGET_MS

  console.log(`🤖 Robot starting — ${new Date().toISOString()}`)

  // Busca fontes ativas
  const { data: sources, error: sourcesErr } = await supabase
    .from('sources')
    .select('id, name, url, rss_url, language, priority')
    .eq('active', true)
    .order('priority', { ascending: true })
    .order('last_fetched', { ascending: true, nullsFirst: true })  // rodízio: menos buscadas primeiro
    .limit(maxSources)

  if (sourcesErr || !sources?.length) {
    console.error('No active sources found:', sourcesErr?.message)
    return { processed: 0, published: 0, pending: 0 }
  }

  let processed = 0
  let published = 0
  let pending = 0

  for (const source of sources) {
    if (budgetExceeded()) {
      console.log('⏱ Time budget atingido — encerrando com resultado parcial')
      break
    }
    const rssUrl = source.rss_url || source.url
    console.log(`\n📡 Fetching: ${source.name} (${rssUrl})`)

    try {
      const feed = await parser.parseURL(rssUrl)
      const items = feed.items.slice(0, maxItemsPerSource)

      for (const item of items) {
        if (budgetExceeded()) break
        const result = await processItem(item as RSSItem, source)
        if (result) {
          processed++
          if (result.status === 'published') published++
          else pending++
        }
        // Rate limiting — não sobrecarrega a API
        await new Promise(r => setTimeout(r, 500))
      }

      // Atualiza last_fetched
      await supabase
        .from('sources')
        .update({ last_fetched: new Date().toISOString() })
        .eq('id', source.id)

    } catch (err) {
      console.error(`  Error fetching ${source.name}:`, (err as Error).message)
      await supabase
        .from('sources')
        .update({ error_count: supabase.rpc('increment', { row_id: source.id }) })
        .eq('id', source.id)
    }
  }

  console.log(`\n✅ Robot done — Processed: ${processed}, Published: ${published}, Pending: ${pending}`)
  return { processed, published, pending }
}
