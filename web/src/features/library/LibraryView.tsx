import { RefreshCw } from 'lucide-react'
import { useApp } from '@/app/AppProvider'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Dot } from '@/components/ui/dot'
import { useI18n } from '@/i18n/I18nProvider'

/** Çıktı klasöründeki kitaplar; birine tıklayınca çıktıları açılır. */
export function LibraryView() {
  const { archive, loadArchive, go, state: s } = useApp()
  const { t, f } = useI18n()
  return (
    <>
      <TopBar section={t.library.title}>
        <Button onClick={loadArchive}><RefreshCw size={14} strokeWidth={1.75} />{t.common.refresh}</Button>
      </TopBar>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-[720px] px-8 py-7">
          <h1 className="m-0 text-xl font-medium">{t.library.title}</h1>
          <p className="mt-1 mb-6 text-[13px] text-text-2">{t.library.intro}</p>
          {!archive ? <p className="text-[13px] text-text-3">{t.common.loading}</p>
            : !archive.books.length ? <p className="text-[13px] text-text-3">{t.library.empty(s.outputDir)}</p>
              : (
                <div className="border-t border-line">
                  {archive.books.map((b) => (
                    <button key={b.id} type="button" onClick={() => go('outputs', b.id)}
                      className="flex w-full items-center gap-3 border-b border-line px-1 py-3 text-left hover:bg-muted">
                      <Dot tone={b.title === s.title && s.busy ? 'ok' : 'idle'} live={b.title === s.title && s.busy} />
                      <span className="min-w-0 flex-1 truncate text-sm">{b.title}</span>
                      <span className="tabular-nums shrink-0 text-xs text-text-3">
                        {t.library.counts(b.outputs, b.copies)}{b.date ? ` · ${f.dateTime(b.date)}` : ''}
                      </span>
                    </button>
                  ))}
                </div>
              )}
        </div>
      </div>
    </>
  )
}
