import type { ReactNode } from 'react'
import { Dot } from '@/components/ui/dot'

/** Ayar satırı: solda ad ve açıklama (değiştiyse eski → yeni), sağda denetim. */
export function SettingRow({ label, sub, changed, children }: { label: string; sub?: ReactNode; changed?: ReactNode; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_300px] items-center gap-6 border-b border-line py-2.5">
      <div>
        <div className="text-sm text-text">{label}</div>
        {changed
          ? <div className="flex items-center gap-1.5 text-xs leading-[18px] text-wait"><Dot tone="wait" />{changed}</div>
          : sub && <div className="text-xs leading-[18px] text-text-3">{sub}</div>}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export function SectionHeader({ title, aside }: { title: string; aside?: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-b border-line pb-2">
      <span className="text-sm">{title}</span>
      {aside}
    </div>
  )
}
