import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Mail } from 'lucide-react'

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'WorldPulse'
const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'halderleal.usa@gmail.com'

export async function generateStaticParams() {
  return [{ lang: 'pt' }, { lang: 'en' }]
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  return { title: lang === 'pt' ? 'Contato' : 'Contact' }
}

export default async function ContatoPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (lang !== 'pt' && lang !== 'en') notFound()
  const isPt = lang === 'pt'

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black tracking-tight mb-6">{isPt ? 'Contato' : 'Contact'}</h1>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 space-y-5 text-[15px] leading-relaxed text-[#374151]">
        <p>
          {isPt
            ? `Dúvidas, sugestões, solicitações de correção ou assuntos comerciais: fale com a equipe do ${siteName}.`
            : `Questions, suggestions, correction requests or business matters: get in touch with the ${siteName} team.`}
        </p>
        <a
          href={`mailto:${contactEmail}`}
          className="inline-flex items-center gap-2.5 px-5 py-3 rounded-xl bg-[#101828] text-white font-bold hover:bg-[#344054] transition-colors"
        >
          <Mail size={18} />
          {contactEmail}
        </a>
        <p className="text-sm text-[#667085]">
          {isPt
            ? 'Solicitações de correção de conteúdo são tratadas com prioridade.'
            : 'Content correction requests are handled with priority.'}
        </p>
      </div>
    </div>
  )
}
