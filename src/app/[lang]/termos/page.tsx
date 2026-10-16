import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'WorldPulse'

export async function generateStaticParams() {
  return [{ lang: 'pt' }, { lang: 'en' }]
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  return { title: lang === 'pt' ? 'Termos de Uso' : 'Terms of Use' }
}

export default async function TermosPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (lang !== 'pt' && lang !== 'en') notFound()
  const isPt = lang === 'pt'

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black tracking-tight mb-6">{isPt ? 'Termos de Uso' : 'Terms of Use'}</h1>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 space-y-4 text-[15px] leading-relaxed text-[#374151]">
        {isPt ? (
          <>
            <p><strong>Conteúdo:</strong> os resumos publicados no {siteName} são textos originais produzidos por inteligência artificial com curadoria editorial, a partir de matérias de veículos jornalísticos devidamente citados e linkados. Os direitos sobre as matérias originais pertencem aos seus respectivos veículos.</p>
            <p><strong>Uso do site:</strong> o conteúdo é oferecido para fins informativos. É permitido compartilhar links para nossas páginas; não é permitido reproduzir nossos resumos em escala sem autorização.</p>
            <p><strong>Isenção de responsabilidade:</strong> apesar da curadoria, conteúdo automatizado pode conter imprecisões. As informações não constituem aconselhamento profissional de qualquer natureza. Para decisões relevantes, consulte sempre as fontes originais.</p>
            <p><strong>Correções:</strong> solicitações de correção ou remoção podem ser enviadas pela página de contato e serão tratadas com prioridade.</p>
            <p className="text-sm text-[#667085]">Última atualização: outubro de 2026.</p>
          </>
        ) : (
          <>
            <p><strong>Content:</strong> the summaries published on {siteName} are original texts produced by artificial intelligence with editorial curation, based on stories from journalistic outlets that are always cited and linked. Rights over the original stories belong to their respective outlets.</p>
            <p><strong>Use of the site:</strong> content is offered for informational purposes. Sharing links to our pages is allowed; reproducing our summaries at scale without authorization is not.</p>
            <p><strong>Disclaimer:</strong> despite curation, automated content may contain inaccuracies. The information does not constitute professional advice of any kind. For important decisions, always consult the original sources.</p>
            <p><strong>Corrections:</strong> correction or removal requests can be sent through the contact page and will be handled with priority.</p>
            <p className="text-sm text-[#667085]">Last updated: October 2026.</p>
          </>
        )}
      </div>
    </div>
  )
}
