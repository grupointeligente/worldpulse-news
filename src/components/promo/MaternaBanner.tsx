import type { Lang } from '@/lib/categories'

/**
 * Banners do Saúde Materna App — cliques vão para a página /baixar
 * (detecta iPhone/Android e abre a loja) ou para a landing page.
 */
const BAIXAR = 'https://www.saudematerna.app.br/baixar'
const SITE = 'https://www.saudematerna.app.br'

function utm(base: string, content: string) {
  return `${base}?utm_source=worldpulse&utm_medium=banner&utm_campaign=editoria_saude&utm_content=${content}`
}

interface Props {
  lang: Lang
  variant?: 'hero' | 'inline' | 'sidebar'
}

export default function MaternaBanner({ lang, variant = 'inline' }: Props) {
  const isPt = lang === 'pt'

  if (variant === 'hero') {
    return (
      <aside className="rounded-[22px] overflow-hidden bg-gradient-to-br from-[#DB2777] via-[#C02669] to-[#9D174D] text-white p-6 md:p-9">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="text-6xl md:text-7xl shrink-0 leading-none" aria-hidden>🤰</div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-white/80 mb-1.5">
              {isPt ? 'App gratuito para mães e gestantes' : 'Free app for moms and moms-to-be'}
            </p>
            <h2 className="text-2xl md:text-[28px] font-black leading-tight tracking-tight mb-2">
              {isPt ? 'Grávida ou mamãe? Baixe o Saúde Materna' : 'Pregnant or a new mom? Get Saúde Materna'}
            </h2>
            <p className="text-sm text-white/85 max-w-2xl">
              {isPt
                ? 'Contador de contrações, mobilograma, calculadora gestacional, acompanhamento da gestação e uma comunidade de mães — 100% grátis.'
                : 'Contraction counter, kick tracker, due-date calculator, pregnancy tracking and a community of moms — 100% free.'}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <a
              href={utm(BAIXAR, 'saude_hero_download')}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-[#9D174D] font-extrabold text-sm hover:bg-[#FCE7F3] transition-colors"
            >
              📲 {isPt ? 'Baixar o app grátis' : 'Download free app'}
            </a>
            <a
              href={utm(SITE, 'saude_hero_site')}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-white/40 text-white font-bold text-sm hover:bg-white/10 transition-colors"
            >
              {isPt ? 'Conhecer o site' : 'Visit the website'}
            </a>
          </div>
        </div>
      </aside>
    )
  }

  if (variant === 'sidebar') {
    return (
      <aside className="rounded-2xl overflow-hidden bg-gradient-to-b from-[#DB2777] to-[#9D174D] text-white p-5 text-center">
        <div className="text-5xl mb-2" aria-hidden>🤰</div>
        <h3 className="font-black text-lg leading-tight tracking-tight mb-1.5">Saúde Materna</h3>
        <p className="text-[13px] text-white/85 mb-4">
          {isPt
            ? 'O app gratuito que acompanha sua gestação: contrações, mobilograma e comunidade de mães.'
            : 'The free app for your pregnancy: contractions, kick tracker and a community of moms.'}
        </p>
        <a
          href={utm(BAIXAR, 'saude_sidebar_download')}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-white text-[#9D174D] font-extrabold text-sm hover:bg-[#FCE7F3] transition-colors"
        >
          📲 {isPt ? 'Baixar grátis' : 'Download free'}
        </a>
      </aside>
    )
  }

  // inline
  return (
    <aside className="rounded-2xl border border-[#FBCFE8] bg-[#FDF2F8] p-5 flex flex-col sm:flex-row sm:items-center gap-4">
      <div className="text-4xl shrink-0" aria-hidden>🤰</div>
      <div className="flex-1 min-w-0">
        <h3 className="font-extrabold text-[15px] text-[#9D174D] leading-snug">
          {isPt ? 'Acompanhe sua gestação com o app Saúde Materna' : 'Track your pregnancy with the Saúde Materna app'}
        </h3>
        <p className="text-[13px] text-[#BE185D]/80 mt-0.5">
          {isPt ? 'Contrações, mobilograma, consultas e comunidade — gratuito para mães.' : 'Contractions, kick tracker, appointments and community — free for moms.'}
        </p>
      </div>
      <a
        href={utm(BAIXAR, 'saude_inline_download')}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#DB2777] text-white font-extrabold text-sm hover:bg-[#BE185D] transition-colors shrink-0"
      >
        📲 {isPt ? 'Baixar grátis' : 'Download free'}
      </a>
    </aside>
  )
}
