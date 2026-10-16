import Link from 'next/link'
import ArticleCard from './ArticleCard'
import type { Article } from '@/lib/supabase'
import { getCategoryTones, type Lang } from '@/lib/categories'
import { ArrowRight } from 'lucide-react'

interface Props {
  slug: string
  name: string
  color: string
  icon: string
  articles: Article[]
  lang: Lang
}

export default function CategorySection({ slug, name, color, icon, articles, lang }: Props) {
  if (!articles.length) return null

  const tones = getCategoryTones(slug)
  const [featured, ...rest] = articles

  return (
    <section className="mb-12">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-7 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-xl">{icon}</span>
          <h2 className="text-[22px] font-black tracking-tight text-[#111827]">{name}</h2>
        </div>
        <Link
          href={`/${lang}/${slug}`}
          className="flex items-center gap-1 text-[13px] font-bold px-3 py-1.5 rounded-full transition-opacity hover:opacity-80"
          style={{ color: tones.deep, backgroundColor: tones.tint }}
        >
          {lang === 'pt' ? 'Ver tudo' : 'See all'}
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Grid: 1 featured + up to 3 smaller */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Featured — spans 2 cols on large */}
        <div className="lg:col-span-2">
          <ArticleCard article={featured} lang={lang} size="lg" />
        </div>

        {/* Smaller cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rest.slice(0, 4).map(article => (
            <ArticleCard key={article.id} article={article} lang={lang} size="md" />
          ))}
        </div>
      </div>
    </section>
  )
}
