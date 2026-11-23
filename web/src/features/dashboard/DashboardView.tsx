import { useEffect, useRef, useState } from 'react'
import { Download, PanelRight } from 'lucide-react'
import { useApp } from '@/app/AppProvider'
import { FolderButton } from '@/components/FolderButton'
import { TopBar } from '@/components/layout/TopBar'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/lib/api'
import { Dock } from '../run/Dock'
import { Plan } from '../run/Plan'
import { Progress } from '../run/Progress'
import { StepRow } from '../run/StepRow'
import { Steps } from '../run/Steps'
import { useTick } from '../run/useTick'
import { ArtifactPane } from './ArtifactPane'
import { EmptyState } from './EmptyState'

/** Pinned: kullanıcı yukarı kaydırıp okumuyorsa akış en yeni adımda kalır. */
const PIN_THRESHOLD = 80

export function DashboardView() {
  const { state: s, run, go, start } = useApp()
  const { t, f } = useI18n()
  const [pane, setPane] = useState(true)
  const now = useTick(s.busy)
  const scroller = useRef<HTMLDivElement>(null)
  const pinned = useRef(true)

  useEffect(() => {
    const el = scroller.current
    if (el && pinned.current) el.scrollTop = el.scrollHeight
  }, [s.steps.length, s.current, s.book])

  return (
    <>
      <TopBar section={t.app.books} state={s.book ? s : undefined}>
        <FolderButton onClick={() => run(api.openFolder)} />
        <Button onClick={() => run(api.chooseBook)} disabled={s.busy}>
          <Download size={14} strokeWidth={1.75} />{t.common.chooseBook}
        </Button>
        {s.book && (
          <Button size="icon" onClick={() => setPane(!pane)} aria-label={t.app.togglePane} aria-pressed={pane}>
            <PanelRight size={15} strokeWidth={1.75} />
          </Button>
        )}
      </TopBar>

      {!s.book ? <EmptyState onChoose={() => run(api.chooseBook)} /> : (
        <div className="flex min-h-0 flex-1">
          <div className="relative min-w-0 flex-1">
            <div
              ref={scroller}
              className="h-full overflow-y-auto px-8 pt-7 pb-44"
              onScroll={(e) => {
                const el = e.currentTarget
                pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < PIN_THRESHOLD
              }}
            >
              <div className="mx-auto max-w-[720px]">
                <div className="mb-2.5 flex items-center gap-2 text-[13px]">
                  <Avatar />
                  <span>Varak</span>
                  {s.startedAt > 0 && (
                    <span className="tabular-nums text-text-3">
                      · {t.dashboard.started(f.clock(s.startedAt))}
                      {s.busy && ` · ${t.dashboard.elapsed(f.duration((now - s.startedAt) / 1000))}`}
                    </span>
                  )}
                </div>

                {s.planning ? (
                  <StepRow icon={<Spinner />} title={t.dashboard.reading} />
                ) : (
                  <>
                    <Plan state={s} />
                    {s.total > 0 && <div className="mt-5"><Progress state={s} /></div>}
                    {(s.steps.length > 0 || s.busy) && (
                      <div className="mt-6 border-t border-line pt-5">
                        <Steps state={s} onOpenWord={() => run(api.openWord)} onRetry={start} onSettings={() => go('settings')} />
                      </div>
                    )}
                    {!s.steps.length && !s.busy && s.error && <InspectionError text={s.error} />}
                  </>
                )}
              </div>
            </div>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center bg-[linear-gradient(to_bottom,transparent,var(--card)_45%)] pt-10 pb-4">
              <Dock state={s} onStart={start} onPause={() => run(api.pause)} onRead={s.pages ? () => go('reader') : undefined} />
            </div>
          </div>
          {pane && <ArtifactPane />}
        </div>
      )}
    </>
  )
}

function InspectionError({ text }: { text: string }) {
  const { message } = useI18n()
  return <p className="mt-6 rounded-lg bg-bad-tint px-3 py-2 text-[13px] text-bad">{message(text)}</p>
}
