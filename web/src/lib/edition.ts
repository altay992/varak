import type { Settings } from '@/types/settings'

export interface Recipe {
  model: string
  tone: string
  limit: number
  extra: string[]
}

export const recipeOf = (cfg: Settings): Recipe => ({ model: cfg.model, tone: cfg.tone, limit: cfg.limit, extra: [] })

/** Sürüm klasörü adından tarif: "gpt-5-nano_4500_Doğal_Arapça_Türkçe_anlam_prompt-…". */
export function parseEdition(name: string): Recipe {
  const [model = '', limit = '', tone = '', ...rest] = name.split('_')
  return { model, tone, limit: Number(limit) || 0, extra: rest.filter((r) => r !== 'anlam') }
}

export const isCustomPrompt = (part: string) => part.startsWith('prompt-')
