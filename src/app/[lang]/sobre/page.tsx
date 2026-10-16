import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'WorldPulse'

export async function generateStaticParams() {
  return [{ lang: 'pt' }, { lang: 'en' }]
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  return { title: lang === 'pt' ? `Sobre o ${siteName}` : `About ${siteName}` }
}

export default async function SobrePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (lang !== 'pt' && lang !== 'en') notFound()
  const isPt = lang === 'pt'

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black tracking-tight mb-6">{isPt ? `Sobre o ${siteName}` : `About ${siteName}`}</h1>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 space-y-4 text-[15px] leading-relaxed text-[#374151]">
        {isPt ? (
          <>
            <p>O {siteName} é um portal de notícias internacionais que monitora, 24 horas por dia, dezenas de fontes jornalísticas reconhecidas — como BBC, The Guardian, Al Jazeera, NPR, G1 e Agência Brasil — e publica resumos bilíngues (português e inglês) dos acontecimentos mais relevantes do mundo.</p>
            <p><strong>Como funciona:</strong> nossos sistemas de inteligência artificial leem as matérias originais e produzem resumos próprios, escritos do zero, com avaliação de relevância e classificação por editoria. Nenhum texto é copiado das fontes: a matéria original é sempre citada e linkada ao final de cada resumo, e recomendamos sua leitura na íntegra.</p>
            <p><strong>Transparência:</strong> todo o conteúdo é produzido por IA com supervisão e curadoria editorial humana. Datas e horários de publicação são sempre exibidos. Erros podem ocorrer — se você encontrar algum, fale conosco e corrigiremos.</p>
            <p><strong>Responsável editorial:</strong> Halder Fernandes Leal · SIR METHOD (Goiânia, GO, Brasil).</p>
          </>
        ) : (
          <>
            <p>{siteName} is an international news portal that monitors dozens of recognized journalistic sources 24/7 — including BBC, The Guardian, Al Jazeera, NPR, G1 and Agência Brasil — and publishes bilingual summaries (Portuguese and English) of the world&apos;s most relevant events.</p>
            <p><strong>How it works:</strong> our AI systems read the original stories and produce original summaries, written from scratch, with relevance scoring and section classification. No text is copied from sources: the original story is always cited and linked, and we encourage you to read it in full.</p>
            <p><strong>Transparency:</strong> all content is AI-produced under human editorial supervision. Publication dates and times are always displayed. Errors can happen — if you find one, contact us and we will correct it.</p>
            <p><strong>Editorial responsibility:</strong> Halder Fernandes Leal · SIR METHOD (Goiânia, GO, Brazil).</p>
          </>
        )}
      </div>
    </div>
  )
}
