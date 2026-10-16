import Link from 'next/link'
import { CATEGORIES } from '@/lib/categories'

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'WorldPulse'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-[#101828] text-[#98A2B3] mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-[#F97316] rounded-[9px] flex items-center justify-center">
                <span className="text-white font-black text-sm">W</span>
              </div>
              <span className="text-white font-black text-lg tracking-tight">{siteName}</span>
            </div>
            <p className="text-sm leading-relaxed">
              As notícias mais relevantes do mundo, processadas por inteligência artificial e com fontes sempre citadas.
            </p>
            <p className="text-sm mt-3 text-[#667085]">
              The world&apos;s most relevant news, powered by AI.
            </p>
          </div>

          {/* Editorias PT */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Editorias</h3>
            <ul className="space-y-2">
              {CATEGORIES.slice(0, 4).map(cat => (
                <li key={cat.slug}>
                  <Link href={`/pt/${cat.slug}`} className="text-sm hover:text-white transition-colors">
                    {cat.name_pt}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Editorias (continuação) */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Mais seções</h3>
            <ul className="space-y-2">
              {CATEGORIES.slice(4).map(cat => (
                <li key={cat.slug}>
                  <Link href={`/pt/${cat.slug}`} className="text-sm hover:text-white transition-colors">
                    {cat.name_pt}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Institucional</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/pt/sobre" className="hover:text-white transition-colors">Sobre o {siteName}</Link></li>
              <li><Link href="/pt/privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link></li>
              <li><Link href="/pt/termos" className="hover:text-white transition-colors">Termos de Uso</Link></li>
              <li><Link href="/pt/contato" className="hover:text-white transition-colors">Contato</Link></li>
              <li><a href="/sitemap.xml" className="hover:text-white transition-colors">Sitemap</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#667085]">
            © {year} {siteName}. Resumos produzidos por IA com curadoria editorial · Fontes originais sempre citadas e linkadas.
          </p>
          <div className="flex items-center gap-4 text-xs text-[#667085]">
            <span>Atualizado 24/7</span>
            <span>·</span>
            <span>PT · EN</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
