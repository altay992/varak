import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StepRowProps {
  icon: ReactNode
  title: ReactNode
  meta?: ReactNode
  sub?: ReactNode
  duration?: ReactNode
  at?: ReactNode
  /** Henüz olmamış adım (ör. "Sırada 20 parça"): soluk gösterilir. */
  muted?: boolean
  /** Yeni eklenen satır yukarı kayarak girer. */
  animate?: boolean
}

/** Adım akışında tek satır: simge, başlık, süre, saat. */
export function StepRow({ icon, title, meta, sub, duration, at, muted, animate }: StepRowProps) {
  return (
    <div className={cn(
      'relative grid min-h-7 grid-cols-[28px_1fr_auto_auto] text-[13px] leading-5',
      sub ? 'items-start py-1' : 'items-center',
      muted ? 'text-text-3' : 'text-text-2',
      animate && 'animate-rise'
    )}>
      <div className={cn('relative z-[1] flex w-7 text-text-3', sub && 'pt-0.5')}>
        <span className="grid size-4 place-items-center bg-card">{icon}</span>
      </div>
      <div className={cn('flex min-w-0 overflow-hidden', sub ? 'flex-col items-start' : 'items-baseline gap-2 whitespace-nowrap')}>
        <span className="flex items-baseline gap-2">
          <b className={cn('font-normal', muted ? 'text-text-3' : 'text-text')}>{title}</b>
          {meta && <span className="overflow-hidden text-ellipsis text-text-3">{meta}</span>}
        </span>
        {sub && <span className="text-text-3">{sub}</span>}
      </div>
      <div className="w-14 text-right text-xs text-text-3 tabular-nums">{duration}</div>
      <div className="w-[52px] text-right text-xs text-text-3 tabular-nums">{at}</div>
    </div>
  )
}

export const stepIcon = { size: 13, strokeWidth: 1.75 }

/** Adımları birleştiren dikey çizgi. */
export const timelineClass = 'relative before:absolute before:top-3.5 before:bottom-3.5 before:left-[7.5px] before:w-px before:bg-line'
