import type { KeyStatus, Provider, Settings } from './settings'

/** Sunucunun gönderdiği aşama adları. Arayüz metni bunlardan i18n ile türetilir. */
export type Phase = 'Hazır' | 'Hazırlanıyor' | 'Çevriliyor' | 'Duraklatıldı' | 'Tamamlandı' | 'İşlem durdu'

/** Her parça: önceki kayıttan, bu oturumda çevrildi ya da hâlâ kaynak dilde. */
export type Segment = 'kept' | 'done' | 'todo'

/** Çeviri günlüğünün bir satırı. Zamanlar epoch ms, parça numaraları 0'dan başlar. */
export type Step =
  | { kind: 'read'; at: number; total: number; kept: number; resumeFrom: number }
  | { kind: 'chunk'; at: number; n: number; seconds: number | null; retries: number }
  | { kind: 'word'; at: number; path: string; name: string; size: number; upTo: number; renamed: boolean }
  | { kind: 'paused'; at: number; done: number; total: number }
  | { kind: 'complete'; at: number; total: number; seconds: number }
  | { kind: 'error'; at: number; message: string; done: number }

export type StepOf<K extends Step['kind']> = Extract<Step, { kind: K }>

export interface Structure {
  headings: number
  tables: number
  images: number
}

export interface Edition {
  name: string
  saved: number
  current: boolean
}

export interface Seam {
  n: number
  tail: string
  next: string
}

export interface AppState {
  /** Seçili kitabın dosya adı; seçilmediyse boş. */
  book: string
  title: string
  phase: Phase
  busy: boolean
  stopping: boolean
  /** Parçalar ve kayıtlar sayılıyor. */
  planning: boolean
  done: number
  total: number
  error: string
  /** Son yazılan Word dosyası. */
  word: string
  /** Her çeviride artar; okuyucu bununla sıfırlanır. */
  run: number
  pages: number
  segments: Segment[]
  /** Modelden yanıt beklenen parça, yoksa -1. */
  current: number
  currentSince: number
  steps: Step[]
  startedAt: number
  /** Bu çeviride istek başına ortalama saniye. */
  average: number
  /** Kalan tahmini saniye. */
  eta: number
  measured: boolean
  structure: Structure | null
  editions: Edition[]
  seam: Seam | null
  cfg: Settings
  keys: Record<Provider, KeyStatus | undefined>
  outputDir: string
}

export interface Page {
  n: number
  source: string
  target: string
  at: number
  seconds: number | null
}
