import { useI18n } from '@/i18n/I18nProvider'
import { finishTime, percent, segmentCounts } from '@/lib/run'
import type { AppState } from '@/types/state'
import { cn } from '@/lib/utils'
import { Strip } from './Strip'

export function Progress({ state: s }: { state: AppState }) {
  const { t, f } = useI18n()
  const { kept, done, todo } = segmentCounts(s)
  const live = s.busy || s.phase === 'Hazır'
  return (
    <div>
      <div className="flex items-baseline gap-3 whitespace-nowrap">
        <span className="tabular-nums text-[20px] font-medium">
          {s.done} <span className="text-text-3">/ {t.common.parts(s.total)}</span>
        </span>
        <span className="tabular-nums text-[13px] text-text-2">
          {f.percent(percent(s))}
          {todo > 0 && live && <> · {t.progress.remaining(f.duration(s.eta), f.clock(finishTime(s)))}</>}
        </span>
        {s.measured && <span className="tabular-nums ml-auto text-xs text-text-3">{t.progress.perPart(f.seconds(s.average))}</span>}
      </div>
      <div className="mt-3"><Strip state={s} /></div>
      <div className="mt-2.5 flex gap-4 text-xs text-text-3 tabular-nums">
        <span><Swatch className="bg-seg-kept" />{t.progress.kept(kept)}</span>
        <span><Swatch className="bg-seg-done" />{t.progress.done(done)}</span>
        <span><Swatch className="bg-seg-todo shadow-[inset_0_0_0_1px_var(--input)]" />{t.progress.todo(todo)}</span>
      </div>
    </div>
  )
}

function Swatch({ className }: { className: string }) {
  return <i className={cn('mr-1.5 inline-block size-2 rounded-[2px] align-[-0.5px]', className)} />
}
