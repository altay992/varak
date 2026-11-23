import { useEffect, useState } from 'react'

/** Canlı bir şey ekrandayken her saniye yeniden çizer; şu anki zamanı döndürür. */
export function useTick(active: boolean): number {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!active) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [active])
  return now
}
