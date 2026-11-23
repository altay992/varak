import { useI18n } from '@/i18n/I18nProvider'
import { engine } from '@/lib/config'
import { NumberField } from './NumberField'
import { SectionHeader, SettingRow } from './SettingRow'
import type { SettingsForm } from './useSettingsForm'

/** Sürümü etkilemeyen çalışma ayarları; çeviri sürerken de kaydedilebilir. */
export function WorkSection({ settings }: { settings: SettingsForm }) {
  const { t } = useI18n()
  const { form, set } = settings
  const [triesLow, triesHigh] = engine.ranges.tries
  const [intervalLow, intervalHigh] = engine.ranges.interval
  return (
    <section id="work" className="mt-8">
      <SectionHeader title={t.settings.sections.work} />
      <SettingRow label={t.settings.work.tries} sub={t.settings.work.triesSub}>
        <NumberField value={form.tries} onChange={(v) => set('tries', v)} min={triesLow} max={triesHigh} unit={t.settings.units.tries} />
      </SettingRow>
      <SettingRow label={t.settings.work.interval} sub={t.settings.work.intervalSub}>
        <NumberField value={form.interval} onChange={(v) => set('interval', v)} min={intervalLow} max={intervalHigh} unit={t.settings.units.parts} />
      </SettingRow>
    </section>
  )
}
