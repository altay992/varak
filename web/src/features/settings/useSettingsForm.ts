import { useEffect, useMemo, useState } from 'react'
import { useApp } from '@/app/AppProvider'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/lib/api'
import { EDITION_KEYS, type Settings } from '@/types/settings'

/** Ayarlar formunun durumu: düzenlenen kopya, sürüm değişikliği kararı, kaydetme. */
export function useSettingsForm() {
  const { state: s, run, toast, setPendingDecision } = useApp()
  const { t } = useI18n()
  const [form, setForm] = useState<Settings>(s.cfg)

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setForm((f) => ({ ...f, [key]: value }))
  const changed = (key: keyof Settings) => form[key] !== s.cfg[key]

  const editionChanged = EDITION_KEYS.some(changed)
  const dirty = (Object.keys(form) as Array<keyof Settings>).some(changed)
  /** Çeviri sürerken sürüm ayarı değişti: kullanıcı karar vermeli. */
  const decision = s.busy && editionChanged
  const next = useMemo(() => ({ ...s.cfg, ...form }), [s.cfg, form])

  useEffect(() => { setPendingDecision(decision) }, [decision, setPendingDecision])
  useEffect(() => () => setPendingDecision(false), [setPendingDecision])

  return {
    form,
    next,
    set,
    changed,
    dirty,
    decision,
    reset: () => setForm(s.cfg),
    /** Sürüm ayarlarını geri al, diğer değişiklikleri koru. */
    stay: () => setForm((f) => ({ ...f, ...Object.fromEntries(EDITION_KEYS.map((k) => [k, s.cfg[k]])) })),
    save: () => run(async () => {
      await api.saveSettings(form)
      toast(s.busy ? t.settings.savedWhileRunning : t.settings.saved)
    }),
    switchEdition: () => run(async () => {
      await api.switchEdition(form)
      toast(t.settings.switched)
    })
  }
}

export type SettingsForm = ReturnType<typeof useSettingsForm>
