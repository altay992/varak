// Motorun seçenek listeleri. Uygulama açılırken bir kez /api/meta'dan yüklenir;
// tek doğru kaynak KitapCevirmeni/cevirmen.py.
import type { EngineMeta, Provider } from '@/types/settings'
import { api } from './api'

let meta: EngineMeta = {
  catalog: {}, tones: [], langs: {}, prompt: '', envKeys: {},
  ranges: { limit: [500, 16000], interval: [1, 100], tries: [1, 5] }
}

export async function loadConfig(): Promise<void> {
  meta = await api.meta()
}

export const engine = {
  get catalog() { return meta.catalog },
  get providers(): Provider[] { return Object.keys(meta.catalog) },
  get tones() { return meta.tones },
  /** Motorun dil anahtarları (Türkçe adlar). */
  get langs() { return Object.keys(meta.langs) },
  englishName: (lang: string) => meta.langs[lang] ?? lang,
  envKey: (provider: Provider) => meta.envKeys[provider] ?? provider,
  get prompt() { return meta.prompt },
  get ranges() { return meta.ranges }
}

export function providerFor(model: string): Provider {
  return engine.providers.find((p) => engine.catalog[p]?.includes(model)) ?? ''
}

/** Sağlayıcıların anahtar alınacak sayfaları. */
export const KEY_PAGES: Record<string, string> = {
  OpenAI: 'https://platform.openai.com/api-keys',
  Gemini: 'https://aistudio.google.com/apikey',
  Claude: 'https://console.anthropic.com/settings/keys'
}
