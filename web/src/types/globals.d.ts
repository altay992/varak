declare module '*.css'

interface Window {
  /** Yalnızca Electron'da var: desktop/preload.cjs */
  varakDesktop?: {
    choose(): Promise<string | null>
    /** Boş anahtar kaydı siler. */
    saveKey(provider: string, key: string): Promise<void>
  }
}
