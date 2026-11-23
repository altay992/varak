import { useEffect } from 'react'
import { useApp } from '@/app/AppProvider'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { Dot } from '@/components/ui/dot'
import { Kbd } from '@/components/ui/kbd'
import { useEditionLabel } from '@/hooks/useEditionLabel'
import { useI18n } from '@/i18n/I18nProvider'
import type { SettingsForm } from './useSettingsForm'

/** Çeviri sürerken sürüm ayarı değişince satır içinde sorulan karar. Y: yeni sürüm, N: kal. */
export function DecisionCard({ settings }: { settings: SettingsForm }) {
  const { state: s } = useApp()
  const { t } = useI18n()
  const label = useEditionLabel()
  const { switchEdition, stay } = settings

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest('input, textarea, select, [role="combobox"]')) return
      if (e.key === 'y' || e.key === 'Y') switchEdition()
      if (e.key === 'n' || e.key === 'N') stay()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [switchEdition, stay])

  return (
    <div className="mt-1 mb-2.5 animate-rise rounded-xl border border-line px-4 pt-3 pb-3.5">
      <div className="flex items-center gap-2 text-xs">
        <Chip tone="wait"><Dot tone="wait" />{t.settings.decision.waiting}</Chip>
        <Avatar /><span className="text-text-3">Varak</span>
        <span className="ml-auto text-text-3">{t.settings.decision.continues}</span>
      </div>
      <p className="mt-2.5 mb-3 text-sm">{t.settings.decision.body(s.done, s.total)}</p>
      <div className="rounded-lg bg-muted px-3 py-1">
        <div className="flex items-center gap-2.5 py-2">
          <Dot tone="ok" /><span className="font-mono text-xs min-w-0 flex-1 truncate">{label.fromSettings(s.cfg)}</span>
          <span className="tabular-nums text-xs text-text-2">{t.settings.decision.kept(s.done, s.total)}</span>
        </div>
        <div className="flex items-center gap-2.5 border-t border-line py-2">
          <Dot tone="wait" /><span className="font-mono text-xs min-w-0 flex-1 truncate">{label.fromSettings(settings.next)}</span>
          <span className="tabular-nums text-xs text-text-2">{t.settings.decision.fresh}</span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button variant="primary" size="md" onClick={switchEdition}>{t.settings.decision.switch}<Kbd>Y</Kbd></Button>
        <Button variant="outline" size="md" onClick={stay}>{t.settings.decision.stay}<Kbd>N</Kbd></Button>
      </div>
    </div>
  )
}
