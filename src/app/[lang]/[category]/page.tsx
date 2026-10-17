import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase'
import { CATEGORIES, getCategoryBySlug, type Lang } from '@/lib/categories'
import ArticleCard from '@/components/news/ArticleCard'
import MaternaBanner from '@/components/promo/MaternaBanner'
import type { Article } from '@/lib/supabase'
import { ChevronRight } from 'lucide-react'

export const revalidate = 30

export async function generateStaticParams() {
  return ['pt', 'en'].flatMap(lang =>
    CATEGORIES.map(cat => ({ lang, category: cat.slug }))
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; category: string }>
}): Promise<Metadata> {
  const { lang, category } = await params
  const cat = getCategoryBySlug(category)
  if (!cat) return {}
  const isPt = lang === 'pt'
  const name = isPt ? cat.name_pt : cat.name_en
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'WorldPulse'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || ''
  return {
    title: `${cat.icon} ${name}`,
    description: isPt
      ? `Notícias de ${name} atualizadas em tempo real. As mais relevantes do mundo.`
      : `Latest ${name} news updated in real time. The most relevant from around the world.`,
    openGraph: {
      title: `${name} | ${siteName}`,
      url: `${siteUrl}/${lang}/${category}`,
    },
    alternates: {
      canonical: `/${lang}/${category}`,
      languages: {
        'pt-BR': `/pt/${category}`,
        'en-US': `/en/${category}`,
      },
    },
  }
}

async function getCategoryArticles(categorySlug: string): Promise<Article[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('articles_with_stats')
    .select('*')
    .eq('category_slug', categorySlug)
    .not('image_url', 'is', null)
    .order('published_at', { ascending: false })
    .limit(40)
  return (data || []) as Article[]
}

async function getMaternalArticles(): Promise<Article[]> {
  const supabase = createServerClient()
  const { data } = await supabase
    .from('articles_with_stats')
    .select('*')
    .eq('category_slug', 'saude')
    .contains('tags', ['maternal'])
    .not('image_url', 'is', null)
    .order('published_at', { ascending: false })
    .limit(8)
  return (data || []) as Article[]
}

async function getOtherCategoryArticles(
  excludeSlug: string,
  lang: Lang
): Promise<{ cat: typeof CATEGORIES[0]; articles: Article[] }[]> {
  const supabase = createServerClient()
  const otherCats = CATEGORIES.filter(c => c.slug !== excludeSlug).slice(0, 3)
  const results = await Promise.all(
    otherCats.map(async (cat) => {
      const { data } = await supabase
        .from('articles_with_stats')
        .select('*')
        .eq('category_slug', cat.slug)
        .not('image_url', 'is', null)
        .order('published_at', { ascending: false })
        .limit(4)
      return { cat, articles: (data || []) as Article[] }
    })
  )
  return results.filter(r => r.articles.length > 0)
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ lang: string; category: string }>
}) {
  const { lang: rawLang, category } = await params
  if (rawLang !== 'pt' && rawLang !== 'en') notFound()
  const lang = rawLang as Lang

  const cat = getCategoryBySlug(category)
  if (!cat) notFound()

  const isSaude = category === 'saude'
  const [articlesRaw, otherSections, maternalArticles] = await Promise.all([
    getCategoryArticles(category),
    getOtherCategoryArticles(category, lang),
    isSaude ? getMaternalArticles() : Promise.resolve([] as Article[]),
  ])

  // Na editoria Saúde, a seção materna tem espaço próprio — evita duplicar no grid geral
  const maternalIds = new Set(maternalArticles.map(a => a.id))
  const articles = isSaude ? articlesRaw.filter(a => !maternalIds.has(a.id)) : articlesRaw

  const isPt = lang === 'pt'
  const catName = isPt ? cat.name_pt : cat.name_en
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'WorldPulse'

  // Layout slices
  const heroArticle = articles[0]
  const featuredStrip = articles.slice(1, 5)    // 4 cards lado a lado
  const secondaryStrip = articles.slice(5, 9)   // mais 4
  const gridArticles = articles.slice(9)         // resto em grid

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* ── Category header ─────────────────────────────── */}
      <div className="mb-8 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: cat.color }} />
          <span className="text-5xl">{cat.icon}</span>
          <div>
            <h1 className="text-3xl font-black text-slate-900">{catName}</h1>
            <p className="text-slate-500 text-sm mt-0.5">
              {isPt
                ? `Notícias de ${catName} atualizadas em tempo real`
                : `${catName} news updated in real time`}
            </p>
          </div>
          {articles.length > 0 && (
            <span className="ml-auto text-sm text-slate-400">
              {articles.length}{isPt ? ' artigos' : ' articles'}
            </span>
          )}
        </div>
      </div>

      {/* ── Saúde Materna: banner + destaque (50% da editoria) ── */}
      {isSaude && (
        <>
          <div className="mb-8">
            <MaternaBanner variant="hero" lang={lang} />
          </div>
          {maternalArticles.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-7 rounded-full bg-[#DB2777]" />
                <h2 className="text-[22px] font-black tracking-tight text-[#111827]">
                  {isPt ? '🤰 Saúde Materna' : '🤰 Maternal Health'}
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {maternalArticles.map(a => (
                  <ArticleCard key={a.id} article={a} lang={lang} size="md" />
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {articles.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-5xl mb-4">{cat.icon}</p>
          <p className="text-slate-500">
            {isPt
              ? 'Aguardando as primeiras notícias desta editoria...'
              : 'Waiting for the first articles in this section...'}
          </p>
        </div>
      ) : (
        <>
          {/* ── Hero + 4 artigos principais ──────────────── */}
          {heroArticle && (
            <section className="mb-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Hero grande */}
                <div className="lg:col-span-2">
                  <ArticleCard article={heroArticle} lang={lang} size="hero" />
                </div>
                {/* Strip de 3 na coluna direita */}
                <div className="flex flex-col gap-4">
                  {featuredStrip.slice(0, 3).map(a => (
                    <ArticleCard key={a.id} article={a} lang={lang} size="sm" showImage />
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── Segunda faixa: 4 cards médios ────────────── */}
          {featuredStrip.length > 3 && (
            <section className="mb-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[featuredStrip[3], ...secondaryStrip].slice(0, 4).map(a => (
                  <ArticleCard key={a.id} article={a} lang={lang} size="lg" />
                ))}
              </div>
            </section>
          )}

          {/* ── Terceira faixa: mais 4 cards médios ─────── */}
          {secondaryStrip.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1 h-5 rounded-full" style={{ backgroundColor: cat.color }} />
                <h2 className="font-bold text-slate-900">
                  {isPt ? 'Mais recentes' : 'Latest'}
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {secondaryStrip.slice(1).map(a => (
                  <ArticleCard key={a.id} article={a} lang={lang} size="md" />
                ))}
              </div>
            </section>
          )}

          {/* ── Grid principal: restante ──────────────────── */}
          {gridArticles.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-5 pt-4 border-t border-slate-100">
                <div className="w-1 h-5 rounded-full bg-slate-300" />
                <h2 className="font-bold text-slate-700">
                  {isPt ? 'Arquivo' : 'Archive'}
                </h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gridArticles.map(a => (
                  <ArticleCard key={a.id} article={a} lang={lang} size="md" />
                ))}
              </div>
            </section>
          )}

          {/* ── Banner Saúde Materna (meio de página) ─────── */}
          {isSaude && (
            <div className="mb-10">
              <MaternaBanner variant="inline" lang={lang} />
            </div>
          )}

          {/* ── Outras editorias ──────────────────────────── */}
          {otherSections.length > 0 && (
            <section className="mt-8 pt-8 border-t border-slate-100">
              <h2 className="text-xl font-black text-slate-900 mb-8">
                {isPt ? '📰 Outras editorias' : '📰 More sections'}
              </h2>
              <div className="space-y-10">
                {otherSections.map(({ cat: otherCat, articles: otherArticles }) => {
                  const otherName = isPt ? otherCat.name_pt : otherCat.name_en
                  return (
                    <div key={otherCat.slug}>
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                          <div className="w-1 h-5 rounded-full" style={{ backgroundColor: otherCat.color }} />
                          {otherCat.icon} {otherName}
                        </h3>
                        <Link
                          href={`/${lang}/${otherCat.slug}`}
                          className="text-xs font-medium flex items-center gap-0.5 hover:opacity-80"
                          style={{ color: otherCat.color }}
                        >
                          {isPt ? 'Ver tudo' : 'See all'} <ChevronRight size={13} />
                        </Link>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {otherArticles.map(a => (
                          <ArticleCard key={a.id} article={a} lang={lang} size="md" />
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}
        </>
      )}

      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: `${catName} | ${siteName}`,
            description: isPt
              ? `Notícias de ${catName} atualizadas em tempo real`
              : `${catName} news in real time`,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/${lang}/${category}`,
          }),
        }}
      />
    </div>
  )
}
