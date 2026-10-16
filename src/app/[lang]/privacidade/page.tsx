import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'WorldPulse'

export async function generateStaticParams() {
  return [{ lang: 'pt' }, { lang: 'en' }]
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  return { title: lang === 'pt' ? 'Política de Privacidade' : 'Privacy Policy' }
}

export default async function PrivacidadePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (lang !== 'pt' && lang !== 'en') notFound()
  const isPt = lang === 'pt'

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-black tracking-tight mb-6">{isPt ? 'Política de Privacidade' : 'Privacy Policy'}</h1>
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-6 md:p-8 space-y-4 text-[15px] leading-relaxed text-[#374151]">
        {isPt ? (
          <>
            <p>O {siteName} não exige cadastro e não coleta dados pessoais para leitura das notícias.</p>
            <p><strong>Dados coletados automaticamente:</strong> como qualquer site, nossa infraestrutura de hospedagem registra logs técnicos de acesso (endereço IP, navegador, páginas visitadas) usados apenas para segurança e operação do serviço. Contabilizamos visualizações de matérias de forma anônima e agregada, sem identificar o leitor.</p>
            <p><strong>Cookies:</strong> utilizamos apenas armazenamento local do navegador para preferências (como idioma). Caso o site passe a exibir publicidade, cookies de terceiros poderão ser utilizados pelos parceiros de anúncios mediante aviso e consentimento, e esta política será atualizada antes disso.</p>
            <p><strong>Seus direitos (LGPD):</strong> para qualquer solicitação relacionada a dados pessoais, entre em contato pela nossa página de contato.</p>
            <p className="text-sm text-[#667085]">Última atualização: outubro de 2026.</p>
          </>
        ) : (
          <>
            <p>{siteName} does not require registration and does not collect personal data for reading the news.</p>
            <p><strong>Automatically collected data:</strong> like any website, our hosting infrastructure records technical access logs (IP address, browser, pages visited) used solely for security and service operation. Article views are counted anonymously and in aggregate, without identifying the reader.</p>
            <p><strong>Cookies:</strong> we only use browser local storage for preferences (such as language). If the site begins displaying advertising, third-party cookies may be used by ad partners with notice and consent, and this policy will be updated beforehand.</p>
            <p><strong>Your rights:</strong> for any personal-data request, reach us through our contact page.</p>
            <p className="text-sm text-[#667085]">Last updated: October 2026.</p>
          </>
        )}
      </div>
    </div>
  )
}
