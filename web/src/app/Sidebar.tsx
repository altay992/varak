import type { ReactNode } from 'react'
import { BookOpen, Clock, File, Languages, LayoutDashboard, Moon, SlidersHorizontal, Sun } from 'lucide-react'
import { ProviderIcon } from '@/components/brand/ProviderIcon'
import { NavBadge, NavItem, navItemClass } from '@/components/layout/NavItem'
import { Avatar } from '@/components/ui/avatar'
import { Dot, type DotTone } from '@/components/ui/dot'
import { Segmented } from '@/components/ui/segmented'
import { LOCALES, useI18n } from '@/i18n/I18nProvider'
import { providerFor } from '@/lib/config'
import { isComplete, isPaused } from '@/lib/run'
import { useApp } from './AppProvider'
import { useTheme } from './useTheme'
import type { View } from './views'

const icon = { size: 15, strokeWidth: 1.75 }
const MAX_BOOKS = 12

export function Sidebar() {
  return (
    <aside className="flex w-[240px] shrink-0 flex-col py-2.5 pr-2.5 pl-3">
      <Brand />
      <MainNav />
      <BookList />
      <Footer />
    </aside>
  )
}

function Brand() {
  const { state: s, pendingDecision } = useApp()
  const { t } = useI18n()
  const status: { tone: DotTone; live?: boolean; text: string } = s.error ? { tone: 'bad', text: t.app.status.stopped }
    : s.busy ? { tone: 'ok', live: true, text: s.current >= 0 ? t.app.status.runningPart(s.current + 1) : t.app.status.running }
      : isComplete(s) ? { tone: 'ok', text: t.app.status.complete }
        : { tone: 'idle', text: isPaused(s) ? t.app.status.paused : t.app.status.ready }
  return (
    <div className="flex items-center gap-2.5 px-2 pt-2 pb-4">
      <Avatar className="size-5" />
      <div className="min-w-0 leading-tight">
        <div className="text-sm">Varak</div>
        <div className="flex items-center gap-1.5 truncate text-xs text-text-2">
          <Dot tone={status.tone} live={status.live} />{status.text}
          {pendingDecision && <span className="text-wait">· {t.app.status.decision}</span>}
        </div>
      </div>
    </div>
  )
}

function MainNav() {
  const { state: s, archive, view, go, pendingDecision } = useApp()
  const { t } = useI18n()
  const items: Array<[View, ReactNode, ReactNode?]> = [
    ['dashboard', <LayoutDashboard {...icon} />],
    ['reader', <BookOpen {...icon} />, s.pages || undefined],
    ['library', <Clock {...icon} />, archive?.books.length || undefined],
    ['outputs', <File {...icon} />, archive?.files.length || undefined],
    ['settings', <SlidersHorizontal {...icon} />,
      pendingDecision ? <span className="rounded-[5px] bg-[var(--status-waiting-tint)] px-1.5 leading-[18px] text-wait">1</span> : undefined]
  ]
  return (
    <nav className="space-y-0.5">
      {items.map(([id, glyph, badge]) => (
        <NavItem key={id} aria-current={view === id ? 'page' : undefined} onClick={() => go(id)}>
          {glyph}{t.app.nav[id]}{badge !== undefined && <NavBadge>{badge}</NavBadge>}
        </NavItem>
      ))}
    </nav>
  )
}

function BookList() {
  const { state: s, archive, go } = useApp()
  const { t, f } = useI18n()
  const current = s.book ? archive?.books.find((b) => b.title === s.title) : undefined
  return (
    <>
      <div className="mt-6 px-2 pb-1.5 text-xs text-text-3">{t.app.books}</div>
      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto">
        {archive && !archive.books.length && <div className="px-2 text-xs text-text-3">{t.app.noBooks}</div>}
        {archive?.books.slice(0, MAX_BOOKS).map((b) => {
          const active = b === current
          return (
            <NavItem key={b.id} onClick={() => go('outputs', b.id)}>
              <Dot className="ml-1" tone={active && s.error ? 'bad' : active ? 'ok' : 'idle'} live={active && s.busy} />
              <span className="truncate">{b.title}</span>
              <NavBadge>{active && s.total ? `${s.done} / ${s.total}` : b.date ? f.day(b.date) : ''}</NavBadge>
            </NavItem>
          )
        })}
      </div>
    </>
  )
}

function Footer() {
  const { state: s } = useApp()
  const { t, locale, setLocale } = useI18n()
  const { theme, toggle } = useTheme()
  const provider = providerFor(s.cfg.model)
  return (
    <div className="space-y-0.5 pt-2">
      <div className={navItemClass}>
        <span className="ml-0.5 grid w-[15px] place-items-center [&_svg]:text-text-2!"><ProviderIcon provider={provider} /></span>
        <span className="truncate font-mono text-xs text-text">{s.cfg.model}</span>
        <NavBadge>{provider}</NavBadge>
      </div>
      <div className={navItemClass}>
        <Languages {...icon} />{t.app.language}
        <Segmented size="xs" className="ml-auto" label={t.app.language} value={locale} onChange={setLocale}
          options={LOCALES.map((l) => ({ value: l, label: l.toUpperCase() }))} />
      </div>
      <NavItem onClick={toggle}>
        {theme === 'dark' ? <Moon {...icon} /> : <Sun {...icon} />}
        {t.app.theme}<NavBadge>{t.app.themes[theme]}</NavBadge>
      </NavItem>
    </div>
  )
}
