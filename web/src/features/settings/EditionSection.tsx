import { ArrowRight } from 'lucide-react'
import { useApp } from '@/app/AppProvider'
import { LanguageSelect } from '@/components/LanguageSelect'
import { ModelPicker } from '@/components/ModelPicker'
import { Segmented } from '@/components/ui/segmented'
import { useEditionLabel } from '@/hooks/useEditionLabel'
import { useI18n } from '@/i18n/I18nProvider'
import { engine, providerFor } from '@/lib/config'
import { NO_KEY, type Settings } from '@/types/settings'
import { DecisionCard } from './DecisionCard'
import { NumberField } from './NumberField'
import { SectionHeader, SettingRow } from './SettingRow'
import type { SettingsForm } from './useSettingsForm'

/** Sürümü tanımlayan ayarlar: dil çifti, model, üslup, parça boyu. */
export function EditionSection({ settings }: { settings: SettingsForm }) {
  const { state: s } = useApp()
  const { t, f, language, tone } = useI18n()
  const label = useEditionLabel()
  const { form, set, changed } = settings
  const provider = providerFor(form.model)
  const key = s.keys[provider] ?? NO_KEY
  const keyState = key.saved ? t.settings.keyState.saved : key.environment ? t.settings.keyState.environment : t.settings.keyState.missing
  const [low, high] = engine.ranges.limit

  const diff = (k: keyof Settings, show: (v: never) => string = String) =>
    changed(k) ? t.settings.unsaved(show(s.cfg[k] as never), show(form[k] as never)) : undefined

  return (
    <section id="edition">
      <SectionHeader title={t.settings.sections.edition} aside={<span className="font-mono text-xs text-text-3">{label.fromSettings(settings.next)}</span>} />

      <SettingRow label={t.settings.languages} sub={t.settings.languagesSub(engine.langs.length)}
        changed={diff('source_lang', language) ?? diff('target_lang', language)}>
        <div className="flex items-center gap-2">
          <LanguageSelect label={t.settings.languages} value={form.source_lang} onChange={(v) => set('source_lang', v)} />
          <ArrowRight size={14} className="shrink-0 text-text-3" />
          <LanguageSelect label={t.settings.languages} value={form.target_lang} onChange={(v) => set('target_lang', v)} />
        </div>
      </SettingRow>

      <SettingRow label={t.settings.model} sub={t.settings.modelSub(provider, keyState)} changed={diff('model')}>
        <ModelPicker value={form.model} keys={s.keys} onChange={(m) => set('model', m)} />
      </SettingRow>

      <SettingRow label={t.settings.tone} changed={diff('tone', tone)}>
        <Segmented label={t.settings.tone} value={form.tone} onChange={(v) => set('tone', v)}
          options={engine.tones.map((name) => ({ value: name, label: tone(name) }))} />
      </SettingRow>

      {settings.decision && <DecisionCard settings={settings} />}

      <SettingRow label={t.settings.limit} changed={diff('limit', f.count)}
        sub={t.settings.limitSub(`${f.count(low)}–${f.count(high)}`, s.total && !changed('limit') ? s.total : undefined)}>
        <NumberField value={form.limit} onChange={(v) => set('limit', v)} min={low} max={high} unit={t.settings.units.characters} />
      </SettingRow>
    </section>
  )
}
