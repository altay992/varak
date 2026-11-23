import type { Archive } from '@/types/archive'
import type { EngineMeta, Provider, Settings } from '@/types/settings'
import type { AppState, Page } from '@/types/state'
import { call, upload } from './client'
import { desktop, pickFile } from './desktop'

const DOCX = '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document'

/** Sunucudaki tüm işlemler. Masaüstüne özgü olanlar (dosya seçme, anahtar saklama) burada ayrılır. */
export const api = {
  meta: () => call<EngineMeta>('meta'),
  state: () => call<AppState>('state'),

  /** Kitap seç: masaüstünde yerel pencere, tarayıcıda yükleme. */
  async chooseBook() {
    if (desktop) {
      const path = await desktop.choose()
      if (path) await call('select', { path })
      return
    }
    const file = await pickFile(DOCX)
    if (file) await upload(file)
  },

  saveSettings: (settings: Settings) => call('save', { settings }),
  switchEdition: (settings: Settings) => call('switch-edition', { settings }),

  /** Masaüstünde işletim sisteminin anahtarlığına, tarayıcıda sunucuya kaydeder. Boş anahtar siler. */
  saveKey: (provider: Provider, key: string) =>
    desktop ? desktop.saveKey(provider, key) : call('key', { provider, key }),

  start: () => call('start'),
  pause: () => call('pause'),
  page: (index: number) => call<Page | null>('page', { index }),
  openWord: () => call('open-word'),
  openFolder: () => call('open-folder'),

  archive: () => call<Archive>('archive'),
  preview: (id: string) => call<string>('preview', { id }),
  openOutput: (id: string) => call('open-output', { id }),
  revealOutput: (id: string) => call('reveal-output', { id })
}

export { ApiError } from './client'
export { isDesktop } from './desktop'
