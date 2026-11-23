import { WordIcon } from '@/components/WordIcon'
import { useEditionLabel } from '@/hooks/useEditionLabel'
import { useI18n } from '@/i18n/I18nProvider'
import { cn } from '@/lib/utils'
import type { ArchiveFile } from '@/types/archive'

export function FileList({ files, loading, selected, onSelect }: {
  files: ArchiveFile[]; loading: boolean; selected: string; onSelect: (id: string) => void
}) {
  const { t, f } = useI18n()
  const edition = useEditionLabel()
  return (
    <div className="w-[340px] shrink-0 overflow-y-auto border-r border-line p-2">
      {loading ? <p className="p-3 text-[13px] text-text-3">{t.common.loading}</p>
        : !files.length ? <p className="p-3 text-[13px] text-text-3">{t.outputs.empty}</p>
          : files.map((file) => (
            <button key={file.id} type="button" onClick={() => onSelect(file.id)}
              className={cn('flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left', file.id === selected ? 'bg-secondary' : 'hover:bg-muted')}>
              <WordIcon className="scale-[.8]" />
              <div className="min-w-0">
                <div className="truncate text-[13px]">{file.name}</div>
                <div className="tabular-nums truncate text-xs text-text-3">
                  {[file.kind === 'Okuma kopyası' ? t.outputs.readingCopy : '', file.edition ? edition.fromFolder(file.edition) : '', f.size(file.size), f.dateTime(file.date)]
                    .filter(Boolean).join(' · ')}
                </div>
              </div>
            </button>
          ))}
    </div>
  )
}
