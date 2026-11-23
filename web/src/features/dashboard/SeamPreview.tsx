import { useApp } from '@/app/AppProvider'
import { useI18n } from '@/i18n/I18nProvider'
import type { Seam } from '@/types/state'

/** Word'de çevrilen kısmın bittiği ve kaynak dilin başladığı yer. */
export function SeamPreview({ seam }: { seam: Seam }) {
  const { state: s } = useApp()
  const { t, language } = useI18n()
  return (
    <div className="mt-4">
      <div className="overflow-hidden rounded-[10px] bg-paper-well px-3.5 pt-3.5">
        <div className="rounded-t-md bg-paper px-5 py-[18px] text-[11px] leading-4 text-text-2 shadow-[0_0_0_.5px_var(--border)] select-text">
          <div className="mb-1 text-[11px] text-text">{t.artifact.partEnd(seam.n + 1)}</div>
          <div className="line-clamp-5 whitespace-pre-line">… {seam.tail}</div>
          {seam.next && (
            <>
              <div className="my-2.5 flex items-center gap-2 text-[10.5px] whitespace-nowrap text-text-3 before:flex-1 before:border-t before:border-dashed before:border-input before:content-[''] after:flex-1 after:border-t after:border-dashed after:border-input after:content-['']">{t.artifact.stillSource(seam.n + 2, language(s.cfg.source_lang))}</div>
              <div className="line-clamp-4 whitespace-pre-line text-text-3">{seam.next}</div>
            </>
          )}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs text-text-3">
        <span>{t.artifact.lastWritten(seam.n + 1)}</span>
        <span>{t.artifact.every(s.cfg.interval)}</span>
      </div>
    </div>
  )
}
