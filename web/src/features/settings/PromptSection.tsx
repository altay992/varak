import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { Textarea } from '@/components/ui/input'
import { useI18n } from '@/i18n/I18nProvider'
import { engine } from '@/lib/config'
import type { SettingsForm } from './useSettingsForm'

export function PromptSection({ settings }: { settings: SettingsForm }) {
  const { t, language } = useI18n()
  const { form, set } = settings
  const isDefault = form.system_prompt.trim() === engine.prompt
  return (
    <section id="prompt" className="mt-8">
      <div className="flex items-center justify-between pb-2">
        <span className="text-sm">{t.settings.sections.prompt}</span>
        {isDefault ? <Chip>{t.settings.prompt.default}</Chip> : <Chip tone="wait">{t.settings.prompt.custom}</Chip>}
      </div>
      <div className="overflow-hidden rounded-lg border border-input">
        <div className="flex items-center justify-between border-b border-line px-3 py-1.5 text-xs text-text-3">
          {t.settings.prompt.forPair(language(form.source_lang), language(form.target_lang))}
          <Button onClick={() => set('system_prompt', engine.prompt)} disabled={isDefault}>{t.settings.prompt.loadDefault}</Button>
        </div>
        <Textarea rows={6} className="rounded-none border-0" value={form.system_prompt}
          onChange={(e) => set('system_prompt', e.target.value)} spellCheck={false} />
      </div>
      <p className="mt-2 text-xs text-text-3">
        {t.settings.prompt.note(<Chip tone="info" mono className="h-5!">{'{source}'}</Chip>, <Chip tone="info" mono className="h-5!">{'{target}'}</Chip>)}
      </p>
    </section>
  )
}
