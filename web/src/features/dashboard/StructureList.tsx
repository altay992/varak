import { useI18n } from '@/i18n/I18nProvider'
import type { Structure } from '@/types/state'

export function StructureList({ structure }: { structure: Structure }) {
  const { t, f } = useI18n()
  const rows: Array<[string, number, string]> = [
    [t.artifact.headings, structure.headings, t.artifact.headingsNote],
    [t.artifact.tables, structure.tables, ''],
    [t.artifact.images, structure.images, t.artifact.imagesNote]
  ]
  return (
    <div className="mt-6">
      <div className="mb-1 text-[13px]">{t.artifact.structure}</div>
      {rows.map(([label, n, note]) => (
        <div key={label} className="grid grid-cols-[94px_1fr_auto] gap-2.5 border-b border-line py-[7px] text-[13px]">
          <span className="text-text-2">{label}</span>
          <span className="tabular-nums">{f.count(n)}</span>
          <span className="text-xs text-text-3">{note}</span>
        </div>
      ))}
    </div>
  )
}
