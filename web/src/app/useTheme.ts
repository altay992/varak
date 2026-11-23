import { useEffect, useState } from 'react'
import { storage } from '@/lib/storage'

export type Theme = 'dark' | 'light'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => (storage.get('theme') === 'light' ? 'light' : 'dark'))
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    storage.set('theme', theme)
  }, [theme])
  return { theme, toggle: () => setTheme((x) => (x === 'dark' ? 'light' : 'dark')) }
}
