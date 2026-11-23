import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { api } from '@/lib/api'
import { providerFor } from '@/lib/config'
import { Toast } from '@/components/Toast'
import { useI18n } from '@/i18n/I18nProvider'
import type { Archive } from '@/types/archive'
import { NO_KEY } from '@/types/settings'
import type { AppState } from '@/types/state'
import type { View } from './views'

const POLL_MS = 750
const TOAST_MS = 5500

interface AppContextValue {
  state: AppState
  archive: Archive | null
  loadArchive: () => Promise<void>
  view: View
  /** Görünüme geç; Çıktı Dosyaları için kitap filtresi verilebilir. */
  go: (view: View, bookFilter?: string) => void
  bookFilter: string
  setBookFilter: (id: string) => void
  /** İşlemi çalıştırır, durumu yeniler, hatayı bildirim olarak gösterir. */
  run: (action: () => Promise<unknown>) => Promise<void>
  toast: (text: string) => void
  /** Başlat; kitap ya da anahtar eksikse kullanıcıyı gereken yere götürür. */
  start: () => Promise<void>
  /** Ayarlar'da çeviri sürerken bekleyen sürüm kararı (kenar çubuğunda "1 karar"). */
  pendingDecision: boolean
  setPendingDecision: (pending: boolean) => void
}

const Context = createContext<AppContextValue | null>(null)

/** Sunucu durumunu yoklar; durum gelene kadar yükleme ekranı gösterir. */
export function AppProvider({ children, fallback }: { children: ReactNode; fallback: (failure: string) => ReactNode }) {
  const { t, message } = useI18n()
  const [state, setState] = useState<AppState | null>(null)
  const [failure, setFailure] = useState('')
  const [archive, setArchive] = useState<Archive | null>(null)
  const [view, setView] = useState<View>('dashboard')
  const [bookFilter, setBookFilter] = useState('')
  const [notice, setNotice] = useState('')
  const [pendingDecision, setPendingDecision] = useState(false)
  const timer = useRef<number>(undefined)

  const refresh = useCallback(async () => {
    try {
      setState(await api.state())
      setFailure('')
    } catch (e) {
      setFailure(message((e as Error).message))
    }
  }, [message])

  const loadArchive = useCallback(async () => {
    try { setArchive(await api.archive()) } catch { /* listede gösterilir */ }
  }, [])

  useEffect(() => {
    refresh()
    const id = window.setInterval(refresh, POLL_MS)
    return () => window.clearInterval(id)
  }, [refresh])

  // Her Word yazımında yeni dosya çıkar; çeviri durumu değişince listeyi yenile.
  const wrote = state?.steps.some((s) => s.kind === 'word') ?? false
  useEffect(() => { loadArchive() }, [loadArchive, state?.run, state?.busy, wrote])

  const toast = useCallback((text: string) => {
    setNotice(text)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setNotice(''), TOAST_MS)
  }, [])

  const run = useCallback(async (action: () => Promise<unknown>) => {
    try {
      await action()
      await refresh()
    } catch (e) {
      toast(message((e as Error).message) || t.common.unknownError)
    }
  }, [refresh, toast, message, t])

  const go = useCallback((next: View, filter?: string) => {
    if (filter !== undefined) setBookFilter(filter)
    setView(next)
  }, [])

  const start = useCallback(async () => {
    if (!state) return
    if (!state.book) return run(api.chooseBook)
    const provider = providerFor(state.cfg.model)
    const key = state.keys[provider] ?? NO_KEY
    if (!key.saved && !key.environment) {
      setView('settings')
      toast(t.app.needKey(provider))
      return
    }
    await run(api.start)
  }, [state, run, toast, t])

  if (!state) return <>{fallback(failure)}</>

  const value: AppContextValue = {
    state, archive, loadArchive, view, go, bookFilter, setBookFilter, run, toast, start, pendingDecision, setPendingDecision
  }
  return (
    <Context.Provider value={value}>
      {children}
      <Toast text={notice} />
    </Context.Provider>
  )
}

export function useApp(): AppContextValue {
  const value = useContext(Context)
  if (!value) throw new Error('useApp must be used inside AppProvider')
  return value
}
