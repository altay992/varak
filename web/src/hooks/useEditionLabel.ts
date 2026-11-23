import { useI18n } from '@/i18n/I18nProvider'
import { isCustomPrompt, parseEdition, recipeOf, type Recipe } from '@/lib/edition'
import type { Settings } from '@/types/settings'

/** Sürümü tek satırda gösterir: "claude-sonnet-5 · Edebî · 4.500 · özel prompt". */
export function useEditionLabel() {
  const { t, f, tone, language } = useI18n()
  const format = (r: Recipe) => [
    r.model,
    tone(r.tone),
    r.limit ? f.count(r.limit) : '',
    ...r.extra.map((x) => (isCustomPrompt(x) ? t.edition.customPrompt : language(x)))
  ].filter(Boolean).join(' · ')
  return {
    fromSettings: (cfg: Settings) => format(recipeOf(cfg)),
    fromFolder: (name: string) => format(parseEdition(name))
  }
}
