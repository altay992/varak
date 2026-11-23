import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '@/app/AppProvider'
import { ParagraphKey, Reading } from '@/components/Reading'
import { Button } from '@/components/ui/button'
import { Segmented } from '@/components/ui/segmented'
import { Spinner } from '@/components/ui/spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/lib/api'
import { usePage } from './usePage'

/** Parça seçici ve okuma alanı. "Son parçayı izle" açıkken yeni biten parça kendiliğinden açılır. */
export function PageView() {
  const { state: s, run } = useApp()
  const { t, f, language } = useI18n()
  const [follow, setFollow] = useState(true)
  const [picked, setPicked] = useState(-1)
  const [showSource, setShowSource] = useState(false)
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => { setPicked(-1); setFollow(true) }, [s.run])
  const current = s.pages ? (follow || picked < 0 || picked >= s.pages ? s.pages - 1 : picked) : -1
  const page = usePage(current, s.run)
  useEffect(() => { scroller.current?.scrollTo(0, 0) }, [current, showSource])

  const pick = (i: number) => { setPicked(Math.max(0, Math.min(s.pages - 1, i))); setFollow(false) }
  const paragraphs = page ? (showSource ? page.source : page.target).split('\n\n') : []

  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-line px-3">
        <Segmented value={showSource ? 'source' : 'target'} onChange={(v) => setShowSource(v === 'source')}
          options={[{ value: 'target', label: language(s.cfg.target_lang) }, { value: 'source', label: language(s.cfg.source_lang) }]} />
        <div className="flex items-center gap-1">
          <Button size="icon" disabled={current <= 0} onClick={() => pick(current - 1)} aria-label={t.reader.previous}><ChevronLeft size={14} /></Button>
          <Select value={current >= 0 ? String(current) : undefined} onValueChange={(v) => pick(Number(v))} disabled={!s.pages}>
            <SelectTrigger aria-label={t.reader.part} className="h-7 w-32">
              <SelectValue placeholder={`${t.reader.part} —`} />
            </SelectTrigger>
            <SelectContent className="max-h-80">
              {Array.from({ length: s.pages }, (_, i) => (
                <SelectItem key={i} value={String(i)}>{t.common.part(i + 1)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button size="icon" disabled={current < 0 || current >= s.pages - 1} onClick={() => pick(current + 1)} aria-label={t.reader.next}><ChevronRight size={14} /></Button>
        </div>
        <span className="tabular-nums text-[13px] text-text-3">{t.common.parts(s.pages)}</span>
        <label className="ml-auto flex items-center gap-2 text-[13px] text-text-2">
          <input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} />
          {t.reader.follow}
        </label>
        <Button variant="outline" onClick={() => run(api.openWord)} disabled={!s.word}>{t.common.openInWord}</Button>
      </div>

      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto">
        {!page ? (
          <div className="grid h-full place-items-center p-8 text-center text-[13px] text-text-3">
            {s.busy ? t.reader.firstPartHere : t.reader.startToRead}
          </div>
        ) : (
          <div className="mx-auto max-w-[584px] px-10 py-7">
            <div className="tabular-nums mb-4 text-xs text-text-3">
              {[t.common.part(page.n + 1), f.clock(page.at), page.seconds !== null ? f.seconds(page.seconds) : t.reader.fromRecord, t.reader.paragraphs(paragraphs.length)].join(' · ')}
            </div>
            <Reading>
              {paragraphs.map((p, i) => <p key={i}><ParagraphKey>p{i + 1}</ParagraphKey>{p}</p>)}
            </Reading>
            {follow && s.busy && (
              <div className="mt-6 flex items-center gap-2 border-t border-line pt-3 text-[13px] text-text-3">
                <Spinner />{t.reader.following}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
