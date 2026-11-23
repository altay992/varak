import { useState, type ReactNode } from 'react'
import { Check, ChevronDown, ChevronUp, CircleCheck, FileText, RotateCw } from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'
import { finishTime, isKind, lastStep, segmentCounts } from '@/lib/run'
import type { AppState, StepOf } from '@/types/state'
import { CompleteReceipt, ErrorReceipt, PausedReceipt, WordReceipt } from './Receipts'
import { Spinner } from '@/components/ui/spinner'
import { StepRow, stepIcon, timelineClass } from './StepRow'
import { useTick } from './useTick'

/** Bu kadar yeni parça açık kalır; eskileri tek özet satırında toplanır. */
const RECENT = 5
const RECENT_COMPACT = 3

interface StepsProps {
  state: AppState
  onOpenWord: () => void
  onRetry?: () => void
  onSettings?: () => void
  /** Canlı Okuma'nın dar sütunu: okuma adımı ve makbuzlar gizlenir. */
  compact?: boolean
}

/** Çevirinin adım akışı: okundu, parça çevrildi, Word yazıldı, duraklatıldı… */
export function Steps({ state: s, onOpenWord, onRetry, onSettings, compact }: StepsProps) {
  const { t, f } = useI18n()
  const [expanded, setExpanded] = useState(false)
  const now = useTick(s.busy)

  const chunks = s.steps.filter(isKind('chunk'))
  const lastWord = lastStep(s.steps, 'word')
  const folded = expanded ? [] : chunks.slice(0, Math.max(0, chunks.length - (compact ? RECENT_COMPACT : RECENT)))
  const foldedSet = new Set<StepOf<'chunk'>>(folded)
  const seconds = (list: StepOf<'chunk'>[]) => list.reduce((sum, c) => sum + (c.seconds ?? 0), 0)

  const rows: ReactNode[] = []
  let summarized = false

  s.steps.forEach((step, i) => {
    switch (step.kind) {
      case 'chunk':
        if (foldedSet.has(step)) {
          if (summarized) return
          summarized = true
          const last = folded[folded.length - 1]!
          rows.push(
            <StepRow key="fold" icon={<ChevronUp {...stepIcon} />}
              title={t.steps.foldedTitle(folded[0]!.n + 1, last.n + 1)}
              meta={compact ? undefined : t.steps.foldedMeta(folded.length, f.seconds(seconds(folded) / folded.length))}
              duration={f.duration(seconds(folded))} at={f.clock(last.at)} />
          )
          return
        }
        rows.push(
          <StepRow key={i} animate icon={step.retries ? <RotateCw {...stepIcon} /> : <Check {...stepIcon} />}
            title={t.steps.chunk(step.n + 1)}
            sub={step.retries ? t.steps.retried(step.retries) : undefined}
            duration={step.seconds !== null ? f.seconds(step.seconds) : undefined} at={f.clock(step.at)} />
        )
        return
      case 'read':
        if (compact) return
        rows.push(
          <StepRow key={i} icon={<FileText {...stepIcon} />} title={t.steps.read} at={f.clock(step.at)}
            sub={t.steps.readSub(step.total, step.kept, step.resumeFrom > 0 && step.resumeFrom < step.total ? step.resumeFrom + 1 : undefined)} />
        )
        return
      case 'word':
        if (step !== lastWord) return
        rows.push(compact
          ? <StepRow key={i} icon={<CircleCheck {...stepIcon} className="text-ok" />} title={t.steps.wordUpdated} at={f.clock(step.at)} />
          : <WordReceipt key={i} step={step} state={s} onOpen={onOpenWord} />)
        return
      case 'paused':
        rows.push(<PausedReceipt key={i} step={step} />)
        return
      case 'complete':
        rows.push(<CompleteReceipt key={i} step={step} state={s} />)
        return
      case 'error':
        rows.push(<ErrorReceipt key={i} step={step} state={s} onSettings={onSettings} onRetry={onRetry} />)
    }
  })

  if (s.busy && s.current >= 0) {
    rows.push(
      <StepRow key="now" icon={<Spinner />}
        title={s.stopping ? t.steps.pausingAfter(s.current + 1) : t.steps.translating(s.current + 1)}
        duration={f.seconds((now - s.currentSince) / 1000)} />
    )
  } else if (s.busy && !s.steps.length) {
    rows.push(<StepRow key="reading" icon={<Spinner />} title={t.dashboard.reading} />)
  }

  const todo = segmentCounts(s).todo
  if (s.busy && !s.stopping && todo > 1 && !compact) {
    rows.push(
      <StepRow key="next" muted icon={<span className="block size-[11px] rounded-full border border-dashed border-text-3" />}
        title={t.steps.next(todo - 1)} duration={`≈ ${f.duration(s.eta)}`} at={f.clock(finishTime(s))} />
    )
  }

  return (
    <div>
      {chunks.length > 0 && (
        <button type="button" onClick={() => setExpanded(!expanded)} aria-expanded={expanded}
          className="mb-2 -ml-2 inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-[13px] text-text-2 hover:bg-muted [&_svg]:text-text-3">
          {t.steps.summary(chunks.length, f.duration(seconds(chunks)))}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}
      <div className={timelineClass}>{rows}</div>
    </div>
  )
}
