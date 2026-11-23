/** localStorage gizli pencerede ya da kapalıyken hata verebilir; burada sessizce geçilir. */
export const storage = {
  get(key: string): string | null {
    try { return localStorage.getItem(key) } catch { return null }
  },
  set(key: string, value: string) {
    try { localStorage.setItem(key, value) } catch { /* kalıcı olmaz, sorun değil */ }
  }
}
