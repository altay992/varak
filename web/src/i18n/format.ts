export type Locale = 'tr' | 'en'

const TAG: Record<Locale, string> = { tr: 'tr-TR', en: 'en-GB' }
const UNITS: Record<Locale, { s: string; m: string; h: string }> = {
  tr: { s: 'sn', m: 'dk', h: 'sa' },
  en: { s: 's', m: 'min', h: 'h' }
}

/** Dile göre sayı, saat, süre ve boyut biçimleri. */
export function createFormat(locale: Locale) {
  const tag = TAG[locale]
  const u = UNITS[locale]
  return {
    clock: (ms: number) => new Date(ms).toLocaleTimeString(tag, { hour: '2-digit', minute: '2-digit' }),
    day: (ms: number) => new Date(ms).toLocaleDateString(tag, { day: 'numeric', month: 'short' }),
    dateTime: (ms: number) => new Date(ms).toLocaleString(tag, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
    count: (n: number) => n.toLocaleString(tag),
    /** Türkçede "%25", İngilizcede "25%". */
    percent: (n: number) => (n / 100).toLocaleString(tag, { style: 'percent' }),
    seconds: (n: number) => `${Math.max(0, Math.round(n))} ${u.s}`,
    duration(seconds: number): string {
      const s = Math.max(0, Math.round(seconds))
      if (s < 60) return `${s} ${u.s}`
      if (s < 3600) return `${Math.round(s / 60)} ${u.m}`
      const h = Math.floor(s / 3600)
      const m = Math.round((s % 3600) / 60)
      return m ? `${h} ${u.h} ${String(m).padStart(2, '0')} ${u.m}` : `${h} ${u.h}`
    },
    size(bytes: number): string {
      if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
      return `${(bytes / 1024 / 1024).toLocaleString(tag, { maximumFractionDigits: 1 })} MB`
    }
  }
}

export type Format = ReturnType<typeof createFormat>
