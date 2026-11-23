import type { ReactNode } from 'react'
import { useI18n } from '@/i18n/I18nProvider'
import type { AppState } from '@/types/state'
import { Chip } from '../ui/chip'

/** İçerik panelinin üstündeki 48px çubuk: bölüm yolu, sürüm çipi, sessiz işlemler. */
export function TopBar({ section, state, children }: { section: string; state?: AppState; children?: ReactNode }) {
  const { f, tone } = useI18n()
  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line px-4 text-[13px]">
      <span className="text-text-3">{section}</span>
      {state?.title && (
        <>
          <span className="text-text-3">/</span>
          <span className="truncate">{state.title}</span>
          <Chip mono>{state.cfg.model} · {tone(state.cfg.tone)} · {f.count(state.cfg.limit)}</Chip>
        </>
      )}
      <div className="ml-auto flex shrink-0 items-center gap-1">{children}</div>
    </header>
  )
}
