import { BookOpen, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { Spinner } from '@/components/ui/spinner'
import { useI18n } from '@/i18n/I18nProvider'
import { finishTime, isComplete, isPaused, segmentCounts } from '@/lib/run'
import type { AppState } from '@/types/state'

/** Alttaki yüzen çubuk: durum, canlı okuma, başlat/duraklat. */
export function Dock({ state: s, onStart, onPause, onRead }: {
  state: AppState; onStart: () => void; onPause: () => void; onRead?: () => void
}) {
  const { t, f } = useI18n()
  const complete = isComplete(s)

  const label = s.busy
    ? s.stopping ? t.dock.pausing : s.current >= 0 ? t.dock.translating(s.current + 1) : t.dock.readingRecords
    : s.planning ? t.dock.inspecting
      : complete ? t.dock.complete
        : s.error ? t.dock.stopped
          : isPaused(s) ? t.dock.paused
            : t.dock.ready

  return (
    <div className="pointer-events-auto flex flex-col items-center">
      <div className="flex h-[52px] items-center gap-2.5 rounded-[20px] bg-popover pr-2 pl-[18px] whitespace-nowrap shadow-float">
        {s.busy && <Spinner />}
        <span className="text-[13px]">{label}</span>
        <span className="tabular-nums text-[13px] text-text-3">
          {s.done} / {s.total}
          {s.busy && segmentCounts(s).todo > 0 && ` · ≈ ${f.duration(s.eta)} · ${f.clock(finishTime(s))}`}
        </span>
        {onRead && (
          <>
            <span className="mx-0.5 h-5 w-px bg-line" />
            <Button onClick={onRead}><BookOpen size={14} strokeWidth={1.75} />{t.dock.readLive}</Button>
          </>
        )}
        {s.busy ? (
          <Button variant="primary" size="md" onClick={onPause} disabled={s.stopping}>
            <Pause size={13} strokeWidth={2} />{t.common.pause}<Kbd>Space</Kbd>
          </Button>
        ) : (
          <Button variant="primary" size="md" onClick={onStart} disabled={s.planning || !s.total}>
            <Play size={13} strokeWidth={2} />{s.done > 0 && !complete ? t.common.resume : t.common.start}<Kbd>Space</Kbd>
          </Button>
        )}
      </div>
      <div className="pt-2 text-xs text-text-3">{t.dock.hint}</div>
    </div>
  )
}
