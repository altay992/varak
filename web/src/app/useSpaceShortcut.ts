import { useEffect } from 'react'
import { api } from '@/lib/api'
import { useApp } from './AppProvider'

/** Space başlatır ya da duraklatır; yazı alanlarında ve Ayarlar'da çalışmaz. */
export function useSpaceShortcut() {
  const { state, view, run, start } = useApp()
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space' || e.repeat || view === 'settings') return
      if ((e.target as HTMLElement).closest('input, textarea, select, button, [role="combobox"], [contenteditable]')) return
      e.preventDefault()
      if (state.busy) run(api.pause)
      else if (state.book && !state.planning) start()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [state, view, run, start])
}
