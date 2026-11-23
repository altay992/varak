import { useApp } from '@/app/AppProvider'
import { Button } from '@/components/ui/button'
import { WordIcon } from '@/components/WordIcon'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/lib/api'
import { lastStep } from '@/lib/run'

/** Son yazılan Word dosyası ve açma düğmeleri. */
export function WordOutput() {
  const { state: s, run } = useApp()
  const { t, f } = useI18n()
  const last = lastStep(s.steps, 'word')
  if (!last) return <p className="m-0 text-[13px] text-text-3">{t.artifact.wordPending}</p>
  return (
    <>
      <div className="flex items-center gap-3">
        <WordIcon />
        <div className="min-w-0">
          <div className="truncate text-[13px]">{last.name}</div>
          <div className="tabular-nums truncate text-xs text-text-3">{f.size(last.size)} · {f.dateTime(last.at)}</div>
        </div>
      </div>
      <div className="mt-3 flex gap-1">
        <Button variant="outline" onClick={() => run(api.openWord)}>{t.common.openInWord}</Button>
        <Button onClick={() => run(api.openFolder)}>{t.common.openFolder}</Button>
      </div>
    </>
  )
}
