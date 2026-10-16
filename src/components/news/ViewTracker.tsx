'use client'

import { useEffect } from 'react'

/** Registra 1 visualização por artigo por sessão do navegador. */
export default function ViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    if (!articleId) return
    try {
      const key = `wp-viewed-${articleId}`
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      // storage indisponível — registra mesmo assim
    }
    fetch('/api/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: articleId }),
      keepalive: true,
    }).catch(() => {})
  }, [articleId])

  return null
}
