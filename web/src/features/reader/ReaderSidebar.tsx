import { Pause, Play } from 'lucide-react'
import { useApp } from '@/app/AppProvider'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Kbd } from '@/components/ui/kbd'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/lib/api'
import { finishTime } from '@/lib/run'
import { Steps } from '../run/Steps'
import { Strip } from '../run/Strip'

export function ReaderSidebar() {
  const { state: s, run, start } = useApp()
  const { t, f, language, tone } = useI18n()
  const src = language(s.cfg.source_lang)
  const dst = language(s.cfg.target_lang)
  return (
    <div className="flex w-[320px] shrink-0 flex-col border-r border-line">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pt-5">
        <div className="mb-2 flex items-center gap-2 text-[13px]"><Avatar />Varak</div>
        <p className="m-0 text-[13px] leading-5 text-text">
          {!s.book ? <span className="text-text-3">{t.reader.noBook}</span>
            : s.busy ? t.reader.running(src, dst, tone(s.cfg.tone), f.clock(finishTime(s)))
              : t.reader.idle(src, dst, tone(s.cfg.tone))}
        </p>
        {s.total > 0 && (
          <>
            <div className="tabular-nums mt-4 flex items-baseline justify-between">
              <span className="text-base font-medium">{s.done} <span className="text-text-3">/ {t.common.parts(s.total)}</span></span>
              {s.busy && <span className="text-xs text-text-3">≈ {f.duration(s.eta)} · {f.clock(finishTime(s))}</span>}
            </div>
            <div className="mt-2"><Strip state={s} thin /></div>
          </>
        )}
        {s.steps.length > 0 && (
          <div className="mt-4 border-t border-line pt-3">
            <Steps state={s} compact onOpenWord={() => run(api.openWord)} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 border-t border-line px-3 py-3">
        <div className="min-w-0 flex-1 leading-tight">
          <div className="text-[13px]">{s.busy ? t.reader.pauseFree : t.reader.resumes}</div>
          <div className="text-xs text-text-3">{t.reader.saved}</div>
        </div>
        {s.busy ? (
          <Button variant="primary" size="md" onClick={() => run(api.pause)} disabled={s.stopping}>
            <Pause size={13} strokeWidth={2} />{t.common.pause}<Kbd>Space</Kbd>
          </Button>
        ) : (
          <Button variant="primary" size="md" onClick={start} disabled={!s.total || s.planning}>
            <Play size={13} strokeWidth={2} />{s.done ? t.common.resume : t.common.start}
          </Button>
        )}
      </div>
    </div>
  )
}
