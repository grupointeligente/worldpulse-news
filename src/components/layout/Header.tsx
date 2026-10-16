'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { CATEGORIES, type Lang } from '@/lib/categories'
import { Menu, X, Search, Globe } from 'lucide-react'

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'WorldPulse'

export default function Header() {
  const [lang, setLang] = useState<Lang>('pt')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [today, setToday] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang
    if (stored === 'en' || stored === 'pt') setLang(stored)
  }, [])

  useEffect(() => {
    const locale = lang === 'pt' ? 'pt-BR' : 'en-US'
    setToday(new Date().toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' }))
  }, [lang])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function toggleLang() {
    const next = lang === 'pt' ? 'en' : 'pt'
    setLang(next)
    localStorage.setItem('lang', next)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/${lang}/search?q=${encodeURIComponent(searchQuery)}`
    }
  }

  return (
    <header className={`sticky top-0 z-50 bg-[#101828] text-white transition-shadow ${scrolled ? 'shadow-lg shadow-black/20' : ''}`}>
      {/* Top bar — data + status */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-8 text-[11px] tracking-wide text-[#98A2B3]">
          <span className="uppercase">{today}</span>
          <span className="flex items-center gap-1.5 font-semibold uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] breaking-pulse" />
            {lang === 'pt' ? 'Cobertura contínua · 24h' : 'Continuous coverage · 24/7'}
          </span>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-[68px]">
          {/* Logo */}
          <Link href={`/${lang}`} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-[#F97316] rounded-[10px] flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-base">W</span>
            </div>
            <span className="font-black text-[22px] tracking-tight text-white">
              {siteName}
            </span>
          </Link>

          {/* Desktop nav actions */}
          <div className="hidden md:flex items-center gap-2.5">
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder={lang === 'pt' ? 'Buscar notícias...' : 'Search news...'}
                  className="bg-white/10 border border-white/15 rounded-lg px-3 py-1.5 text-sm w-60 text-white placeholder:text-white/40 focus:outline-none focus:border-[#F97316]"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="text-white/50 hover:text-white">
                  <X size={18} />
                </button>
              </form>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-white/70 hover:text-[#F97316] transition-colors"
                aria-label={lang === 'pt' ? 'Buscar' : 'Search'}
              >
                <Search size={18} />
              </button>
            )}

            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/20 text-sm font-semibold text-white/80 hover:border-[#F97316] hover:text-[#F97316] transition-all"
            >
              <Globe size={14} />
              {lang === 'pt' ? 'EN' : 'PT'}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-white/80"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Category nav */}
      <nav className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto scrollbar-none">
            <Link
              href={`/${lang}`}
              className="shrink-0 px-3.5 py-3 text-sm font-semibold text-white border-b-2 border-[#F97316]"
            >
              {lang === 'pt' ? 'Início' : 'Home'}
            </Link>
            {CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                href={`/${lang}/${cat.slug}`}
                className="shrink-0 px-3.5 py-3 text-sm font-semibold text-[#D0D5DD] border-b-2 border-transparent hover:text-white hover:border-[#F97316] transition-colors"
              >
                {lang === 'pt' ? cat.name_pt : cat.name_en}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#101828] py-4 px-4">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={lang === 'pt' ? 'Buscar notícias...' : 'Search news...'}
              className="flex-1 bg-white/10 border border-white/15 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#F97316]"
            />
            <button type="submit" className="px-3 py-2 bg-[#F97316] text-white rounded-lg text-sm" aria-label="Buscar">
              <Search size={16} />
            </button>
          </form>
          <div className="grid grid-cols-2 gap-1.5">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.slug}
                href={`/${lang}/${cat.slug}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-white/85 hover:bg-white/10"
              >
                <span>{cat.icon}</span>
                {lang === 'pt' ? cat.name_pt : cat.name_en}
              </Link>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-white/10">
            <button onClick={toggleLang} className="flex items-center gap-2 text-sm text-white/70 hover:text-white">
              <Globe size={14} />
              {lang === 'pt' ? 'Switch to English' : 'Mudar para Português'}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
