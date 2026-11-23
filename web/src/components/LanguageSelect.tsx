import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useI18n } from '@/i18n/I18nProvider'
import { engine } from '@/lib/config'

/** Motorun dil listesinden seçim; değer motorun anahtarıdır, görünen ad seçili arayüz dilinde. */
export function LanguageSelect({ value, onChange, label }: { value: string; onChange: (lang: string) => void; label: string }) {
  const { language } = useI18n()
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="max-h-80">
        {engine.langs.map((lang) => (
          <SelectItem key={lang} value={lang}>{language(lang)}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
