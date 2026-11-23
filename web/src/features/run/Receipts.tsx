import type { ReactNode } from 'react'
import { AlertCircle, CircleCheck, Lock, Pause } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { WordIcon } from '@/components/WordIcon'
import { useI18n } from '@/i18n/I18nProvider'
import type { AppState, StepOf } from '@/types/state'

/** Akışa düşen kart: başlık satırı (simge, metin, saat) ve altında ayrıntı. */
function Receipt({ icon, title, at, children }: { icon: ReactNode; title: ReactNode; at: number; children?: ReactNode }) {
  const { f } = useI18n()
  return (
    <div className="mt-1.5 mb-2 ml-7 animate-rise rounded-xl border border-line bg-card px-3.5 py-3">
      <div className="flex items-start gap-2 text-[13px]">
        <span className="mt-0.5 shrink-0">{icon}</span>
        <span className="select-text min-w-0">{title}</span>
        <span className="tabular-nums ml-auto shrink-0 text-xs text-text-3">{f.clock(at)}</span>
      </div>
      {children}
    </div>
  )
}

export function WordReceipt({ step, state: s, onOpen }: { step: StepOf<'word'>; state: AppState; onOpen: () => void }) {
  const { t, f, language } = useI18n()
  const dst = language(s.cfg.target_lang)
  return (
    <Receipt icon={<CircleCheck size={15} strokeWidth={1.75} className="text-ok" />} title={step.renamed ? t.receipt.renamed : t.receipt.updated} at={step.at}>
      <div className="mt-3 flex items-center gap-3">
        <WordIcon />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13px]">{step.name}</div>
          <div className="tabular-nums truncate text-xs text-text-3">
            {f.size(step.size)} · {step.upTo < s.total ? t.receipt.partial(step.upTo, dst, language(s.cfg.source_lang)) : t.receipt.whole(dst)}
          </div>
        </div>
        <Button variant="outline" size="md" onClick={onOpen}>{t.common.openInWord}</Button>
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-line pt-2.5 text-xs text-text-3">
        <Lock size={12} strokeWidth={1.75} />
        {step.renamed ? t.receipt.lockedNote : t.receipt.copyNote} {t.receipt.every(s.cfg.interval)}
      </div>
    </Receipt>
  )
}

export function PausedReceipt({ step }: { step: StepOf<'paused'> }) {
  const { t } = useI18n()
  return (
    <Receipt icon={<Pause size={14} strokeWidth={1.75} className="text-text-2" />} title={t.steps.paused(step.done, step.total)} at={step.at}>
      <div className="mt-1 text-xs text-text-3">{t.steps.pausedSub}</div>
    </Receipt>
  )
}

export function CompleteReceipt({ step, state: s }: { step: StepOf<'complete'>; state: AppState }) {
  const { t, f } = useI18n()
  return (
    <Receipt icon={<CircleCheck size={15} strokeWidth={1.75} className="text-ok" />} title={t.steps.complete(f.count(step.total), f.duration(step.seconds))} at={step.at}>
      {s.structure && (
        <div className="mt-1 text-xs text-text-3">{t.steps.structureKept(s.structure.headings, s.structure.tables, s.structure.images)}</div>
      )}
    </Receipt>
  )
}

export function ErrorReceipt({ step, state: s, onSettings, onRetry }: {
  step: StepOf<'error'>; state: AppState; onSettings?: () => void; onRetry?: () => void
}) {
  const { t, message } = useI18n()
  return (
    <Receipt icon={<AlertCircle size={15} strokeWidth={1.75} className="text-bad" />} title={message(step.message)} at={step.at}>
      <div className="mt-1 text-xs text-text-3">{t.steps.errorSaved(step.done, s.total)}</div>
      {(onSettings || onRetry) && (
        <div className="mt-3 flex gap-2">
          {onSettings && <Button variant="outline" onClick={onSettings}>{t.steps.goToSettings}</Button>}
          {onRetry && <Button variant="outline" onClick={onRetry}>{t.steps.retry}</Button>}
        </div>
      )}
    </Receipt>
  )
}
