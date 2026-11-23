/** Motorun ayarları (KitapCevirmeni/cevirmen.py → DEFAULT). Alan adları dosyaya böyle yazılır. */
export interface Settings {
  system_prompt: string
  source_lang: string
  target_lang: string
  model: string
  limit: number
  tone: string
  tries: number
  interval: number
}

/** Bu ayarlar bir çeviri sürümünü tanımlar; değişirlerse ayrı bir sürüm başlar. */
export const EDITION_KEYS = ['source_lang', 'target_lang', 'model', 'tone', 'limit', 'system_prompt'] as const satisfies ReadonlyArray<keyof Settings>

export type Provider = string

export interface KeyStatus {
  saved: boolean
  environment: boolean
}

export const NO_KEY: KeyStatus = { saved: false, environment: false }

/** Sunucunun /api/meta yanıtı: motorun seçenek listeleri. */
export interface EngineMeta {
  catalog: Record<Provider, string[]>
  tones: string[]
  /** Türkçe ad → İngilizce ad, ör. "İngilizce" → "English". */
  langs: Record<string, string>
  prompt: string
  envKeys: Record<Provider, string>
  ranges: Record<'limit' | 'interval' | 'tries', [number, number]>
}
