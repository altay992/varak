import type { ReactNode } from 'react'
import { useI18n } from '@/i18n/I18nProvider'
import { finishTime, isComplete, isPaused, segmentCounts } from '@/lib/run'
import type { AppState } from '@/types/state'

/** Varak'ın ne yaptığını söyleyen tek cümle. */
export function Plan({ state: s }: { state: AppState }) {
  const { t, f, language, tone } = useI18n()
  const { kept, todo } = segmentCounts(s)
  const route = {
    title: s.title,
    src: language(s.cfg.source_lang),
    dst: language(s.cfg.target_lang),
    model: <code>{s.cfg.model}</code>,
    tone: tone(s.cfg.tone)
  }

  let text: ReactNode
  if (s.error) text = t.plan.error(s.done, s.total)
  else if (isComplete(s)) text = t.plan.complete(s.title, route.dst, s.total)
  else if (isPaused(s)) text = t.plan.paused(s.done, s.total)
  else if (s.busy) text = t.plan.running(route, kept, todo, f.clock(finishTime(s)))
  else if (todo === 0) text = t.plan.upToDate(route)
  else text = t.plan.ready(route, kept, todo, f.duration(s.eta))

  return (
    <p className="m-0 text-base leading-[26px] tracking-[-.003em] text-pretty text-text [&_code]:rounded-[5px] [&_code]:bg-secondary [&_code]:px-[5px] [&_code]:py-px [&_code]:font-mono [&_code]:text-[13.5px]">
      {text}
    </p>
  )
}
