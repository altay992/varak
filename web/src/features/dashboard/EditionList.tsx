import { useApp } from '@/app/AppProvider'
import { Dot } from '@/components/ui/dot'
import { useEditionLabel } from '@/hooks/useEditionLabel'
import { useI18n } from '@/i18n/I18nProvider'

/** Aynı kitabın ayarlara göre ayrı çeviri sürümleri. */
export function EditionList() {
  const { state: s } = useApp()
  const { t } = useI18n()
  const label = useEditionLabel()
  if (!s.editions.length) return null
  return (
    <div className="mt-6">
      <div className="mb-1 flex justify-between text-[13px]">{t.artifact.editions}<span className="text-xs text-text-3">{t.artifact.sameBook}</span></div>
      {s.editions.map((e) => (
        <div key={e.name} className="flex items-center gap-2.5 border-b border-line py-2.5">
          <Dot tone={e.current ? 'ok' : 'idle'} />
          <span className="font-mono text-xs min-w-0 flex-1 truncate">{label.fromFolder(e.name)}</span>
          <span className="tabular-nums shrink-0 text-xs text-text-3">
            {e.current && s.total ? `${s.done} / ${s.total}` : t.artifact.saved(e.saved)}
          </span>
        </div>
      ))}
    </div>
  )
}
