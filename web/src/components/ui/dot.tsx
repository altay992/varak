import { cn } from '@/lib/utils'

export type DotTone = 'idle' | 'ok' | 'wait' | 'bad'
const TONE: Record<DotTone, string> = { idle: 'bg-idle', ok: 'bg-ok', wait: 'bg-wait', bad: 'bg-bad' }

/** Durum noktası; live çalışırken nabız atar. */
export function Dot({ tone = 'idle', live, className }: { tone?: DotTone; live?: boolean; className?: string }) {
  return <span aria-hidden="true" className={cn('size-1.5 shrink-0 rounded-full', TONE[tone], live && 'animate-ring', className)} />
}
