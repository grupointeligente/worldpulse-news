import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase'
import { CATEGORIES, type Lang } from '@/lib/categories'
import ArticleCard from '@/components/news/ArticleCard'
import CategorySection from '@/components/news/CategorySection'
import TickerBar from '@/components/news/TickerBar'
import type { Article } from '@/lib/supabase'

export const revalidate = 30 // ISR: revalida a cada 30 segundos

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'WorldPulse'

export async function generateStaticParams() {
  return [{ lang: 'pt' }, { lang: 'en' }]
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const isPt = lang === 'pt'
  return {
    title: isPt
      ? `${siteName} — Notícias do Mundo em Tempo Real`
      : `${siteName} — World News in Real Time`,
    description: isPt
      ? 'As notícias mais relevantes do mundo, curadas por IA. Economia, Tecnologia, Esportes, Ciência e mais.'
      : 'The world\'s most relevant news, curated by AI. Economy, Technology, Sports, Science and more.',
    alternates: {
      canonical: `/${lang}`,
      languages: { 'pt-BR': '/pt', 'en-US': '/en' },
    },
  }
}

async function getHomeData(lang: Lang) {
  const supabase = createServerClient()
  const h48 = new Date(Date.now() - 48 * 3600 * 1000).toISOString()
  const d7 = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()

  // Hero: artigos recentes (48h) com imagem, ranqueados por relevância
  let { data: heroPool } = await supabase
    .from('articles_with_stats')
    .select('*')
    .not('image_url', 'is', null)
    .gte('published_at', h48)
    .order('relevance_score', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(8)

  // Fallback: se as 48h renderem pouco, amplia para 7 dias
  if (!heroPool || heroPool.length < 4) {
    const { data: wider } = await supabase
      .from('articles_with_stats')
      .select('*')
      .not('image_url', 'is', null)
      .gte('published_at', d7)
      .order('relevance_score', { ascending: false })
      .order('published_at', { ascending: false })
      .limit(8)
    if (wider && wider.length > (heroPool?.length || 0)) heroPool = wider
  }
  const featured = (heroPool || []) as Article[]

  // Ticker: breaking recente (48h); sem breaking recente, cai nas últimas
  const { data: breakingRaw } = await supabase
    .from('articles_with_stats')
    .select('*')
    .eq('breaking', true)
    .not('image_url', 'is', null)
    .gte('published_at', h48)
    .order('published_at', { ascending: false })
    .limit(10)

  // Últimas notícias (sempre com imagem; exclui as que já estão no hero)
  const { data: latestRaw } = await supabase
    .from('articles_with_stats')
    .select('*')
    .not('image_url', 'is', null)
    .order('published_at', { ascending: false })
    .limit(24)

  const featuredIds = new Set(featured.slice(0, 4).map(a => a.id))
  const latest = ((latestRaw || []) as Article[]).filter(a => !featuredIds.has(a.id))

  const breaking = (breakingRaw && breakingRaw.length > 0 ? breakingRaw : latest.slice(0, 10)) as Article[]

  // Artigos por categoria (sempre com imagem)
  const categoryArticles: Record<string, Article[]> = {}
  for (const cat of CATEGORIES) {
    const { data } = await supabase
      .from('articles_with_stats')
      .select('*')
      .eq('category_slug', cat.slug)
      .not('image_url', 'is', null)
      .order('published_at', { ascending: false })
      .limit(7)
    if (data?.length) categoryArticles[cat.slug] = data as Article[]
  }

  return {
    featured,
    breaking,
    latest,
    categoryArticles,
  }
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: rawLang } = await params
  if (rawLang !== 'pt' && rawLang !== 'en') notFound()
  const lang = rawLang as Lang

  const { featured, breaking, latest, categoryArticles } = await getHomeData(lang)

  const isPt = lang === 'pt'

  // Placeholder data quando não há conteúdo ainda
  const hasContent = featured.length > 0 || latest.length > 0

  return (
    <>
      {/* Breaking news ticker */}
      {breaking.length > 0 && <TickerBar articles={breaking} lang={lang} />}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {!hasContent ? (
          /* Estado vazio — antes do robô rodar */
          <div className="text-center py-24">
            <div className="text-8xl mb-6">🤖</div>
            <h1 className="text-3xl font-black text-slate-900 mb-3">
              {isPt ? 'O Robô está iniciando...' : 'The Robot is starting up...'}
            </h1>
            <p className="text-slate-500 max-w-md mx-auto text-lg">
              {isPt
                ? 'As notícias serão carregadas assim que o robô de coleta processar as primeiras fontes. Configure sua chave da API Anthropic e dispare o robô via /api/robot.'
                : 'News will appear as soon as the collection robot processes the first sources. Configure your Anthropic API key and trigger the robot via /api/robot.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-3 justify-center">
              {CATEGORIES.map(cat => (
                <span
                  key={cat.slug}
                  className="px-4 py-2 rounded-full text-sm font-medium border"
                  style={{ borderColor: cat.color, color: cat.color }}
                >
                  {cat.icon} {isPt ? cat.name_pt : cat.name_en}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Hero — destaques */}
            {featured.length > 0 && (
              <section className="mb-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Hero principal */}
                  <div className="lg:col-span-2">
                    <ArticleCard article={featured[0]} lang={lang} size="hero" />
                  </div>
                  {/* Secundários */}
                  <div className="flex flex-col gap-4">
                    {featured.slice(1, 4).map(article => (
                      <ArticleCard key={article.id} article={article} lang={lang} size="sm" showImage={true} />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Últimas notícias */}
            {latest.length > 0 && (
              <section className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-6 rounded-full bg-red-600" />
                  <h2 className="text-xl font-black text-slate-900">
                    {isPt ? '⚡ Últimas Notícias' : '⚡ Latest News'}
                  </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {latest.slice(0, 12).map(article => (
                    <ArticleCard key={article.id} article={article} lang={lang} size="md" />
                  ))}
                </div>
              </section>
            )}

            {/* Seções por editoria */}
            {CATEGORIES.map(cat => {
              const articles = categoryArticles[cat.slug]
              if (!articles?.length) return null
              return (
                <CategorySection
                  key={cat.slug}
                  slug={cat.slug}
                  name={isPt ? cat.name_pt : cat.name_en}
                  color={cat.color}
                  icon={cat.icon}
                  articles={articles}
                  lang={lang}
                />
              )
            })}
          </>
        )}
      </div>

      {/* JSON-LD — Structured data para Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteName,
            url: process.env.NEXT_PUBLIC_SITE_URL,
            description: isPt
              ? 'Notícias do mundo em tempo real, curadas por inteligência artificial'
              : 'World news in real time, curated by artificial intelligence',
            potentialAction: {
              '@type': 'SearchAction',
              target: {
                '@type': 'EntryPoint',
                urlTemplate: `${process.env.NEXT_PUBLIC_SITE_URL}/${lang}/search?q={search_term_string}`,
              },
              'query-input': 'required name=search_term_string',
            },
          }),
        }}
      />
    </>
  )
}
