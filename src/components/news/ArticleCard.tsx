import Link from 'next/link'
import { formatTimeAgo, getCategoryTones, type Lang } from '@/lib/categories'
import type { Article } from '@/lib/supabase'
import { MessageCircle, Clock } from 'lucide-react'
import SmartImage from './SmartImage'

interface Props {
  article: Article
  lang: Lang
  size?: 'sm' | 'md' | 'lg' | 'hero'
  showImage?: boolean
}

function CategoryBadge({ slug, name, solid = false }: { slug?: string | null; name?: string | null; solid?: boolean }) {
  const tones = getCategoryTones(slug)
  if (!name) return null
  if (solid) {
    return (
      <span
        className="inline-flex items-center w-fit px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider text-white"
        style={{ backgroundColor: tones.color }}
      >
        {name}
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center w-fit px-2 py-0.5 rounded-md text-[11px] font-extrabold uppercase tracking-wider"
      style={{ backgroundColor: tones.tint, color: tones.deep }}
    >
      {name}
    </span>
  )
}

export default function ArticleCard({ article, lang, size = 'md', showImage = true }: Props) {
  const title = lang === 'pt' ? article.title_pt : article.title_en
  const summary = lang === 'pt' ? article.summary_pt : article.summary_en
  const timeAgo = formatTimeAgo(article.published_at || article.created_at, lang)
  const href = `/${lang}/${article.category_slug || 'mundo'}/${article.slug}`
  const tones = getCategoryTones(article.category_slug)
  const catName = lang === 'pt' ? article.category_name_pt : article.category_name_en
  const catIcon = article.category_icon || '🌍'

  if (size === 'hero') {
    return (
      <article className="news-card relative rounded-[22px] overflow-hidden group cursor-pointer h-[480px] md:h-[520px] border border-[#E5E7EB] bg-white">
        <Link href={href} className="block h-full">
          <div className="absolute inset-0">
            <SmartImage
              src={article.image_url || ''}
              alt={article.image_alt || title || ''}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
              sizes="(max-width: 768px) 100vw, 65vw"
              fallbackIcon={catIcon}
              fallbackColor={tones.color}
              fallbackSize="hero"
            />
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-9 text-white">
            <div className="flex items-center gap-2 mb-3.5">
              {article.breaking && (
                <span className="bg-[#DC2626] text-white text-[11px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md breaking-pulse">
                  {lang === 'pt' ? 'Urgente' : 'Breaking'}
                </span>
              )}
              <CategoryBadge slug={article.category_slug} name={catName} solid />
            </div>
            <h1 className="text-[26px] md:text-4xl font-black leading-[1.13] tracking-tight mb-3 group-hover:text-[#FDBA74] transition-colors">
              {title}
            </h1>
            <p className="text-sm text-white/75 line-clamp-2 mb-4 max-w-2xl">{summary}</p>
            <div className="flex items-center gap-4 text-xs text-white/60">
              <span className="flex items-center gap-1"><Clock size={12} />{timeAgo}</span>
              <span>{article.source_name}</span>
              {article.comment_count ? (
                <span className="flex items-center gap-1"><MessageCircle size={12} />{article.comment_count}</span>
              ) : null}
            </div>
          </div>
        </Link>
      </article>
    )
  }

  if (size === 'lg') {
    return (
      <article className="news-card rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white group cursor-pointer">
        <Link href={href} className="block">
          {showImage && (
            <div className="relative h-48 overflow-hidden bg-[#E5E7EB]">
              <SmartImage
                src={article.image_url || ''}
                alt={article.image_alt || title || ''}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
                fallbackIcon={catIcon}
                fallbackColor={tones.color}
                fallbackSize="lg"
              />
            </div>
          )}
          <div className="p-5">
            <div className="flex items-center gap-2 mb-2.5">
              <CategoryBadge slug={article.category_slug} name={catName} />
              {article.breaking && (
                <span className="text-[11px] bg-[#FEE2E2] text-[#B91C1C] font-extrabold uppercase px-1.5 py-0.5 rounded-md breaking-pulse">
                  {lang === 'pt' ? 'Urgente' : 'Breaking'}
                </span>
              )}
            </div>
            <h2 className="font-bold text-[17px] leading-snug tracking-tight mb-2 line-clamp-3 group-hover:text-[#EA580C] transition-colors text-[#111827]">
              {title}
            </h2>
            <p className="text-sm text-[#667085] line-clamp-2">{summary}</p>
            <div className="flex items-center justify-between gap-3 text-xs text-[#667085] mt-4 pt-3 border-t border-[#F2F4F7]">
              <span>{article.source_name}</span>
              <span className="flex items-center gap-1"><Clock size={11} />{timeAgo}</span>
            </div>
          </div>
        </Link>
      </article>
    )
  }

  if (size === 'sm') {
    return (
      <article className="news-card rounded-xl border border-[#E5E7EB] bg-white group cursor-pointer">
        <Link href={href} className="flex gap-3 items-start p-3">
          {showImage && (
            <div className="relative w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-[#E5E7EB]">
              <SmartImage
                src={article.image_url || ''}
                alt={article.image_alt || title || ''}
                fill
                className="object-cover"
                sizes="80px"
                fallbackIcon={catIcon}
                fallbackColor={tones.color}
                fallbackSize="sm"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-wider mb-1" style={{ color: tones.deep }}>{catName}</p>
            <h3 className="text-sm font-semibold leading-snug line-clamp-2 group-hover:text-[#EA580C] transition-colors text-[#111827]">
              {title}
            </h3>
            <p className="text-[11px] text-[#98A2B3] mt-1 flex items-center gap-1">
              <Clock size={10} />{timeAgo} · {article.source_name}
            </p>
          </div>
        </Link>
      </article>
    )
  }

  // Default: md
  return (
    <article className="news-card rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white group cursor-pointer">
      <Link href={href} className="block">
        {showImage && (
          <div className="relative h-40 overflow-hidden bg-[#E5E7EB]">
            <SmartImage
              src={article.image_url || ''}
              alt={article.image_alt || title || ''}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, 25vw"
              fallbackIcon={catIcon}
              fallbackColor={tones.color}
              fallbackSize="md"
            />
          </div>
        )}
        <div className="p-4">
          <div className="mb-2">
            <CategoryBadge slug={article.category_slug} name={catName} />
          </div>
          <h2 className="font-bold text-[15px] leading-snug tracking-tight line-clamp-3 group-hover:text-[#EA580C] transition-colors text-[#111827]">
            {title}
          </h2>
          <p className="text-[11px] text-[#98A2B3] mt-2.5 flex items-center gap-1">
            <Clock size={10} />{timeAgo}
          </p>
        </div>
      </Link>
    </article>
  )
}
