import { cn } from '@/lib/utils'
import type { AppState, Segment } from '@/types/state'

const DENSE_AFTER = 120
const CELL: Record<Segment, string> = { kept: 'bg-seg-kept', done: 'bg-seg-done', todo: 'bg-seg-todo' }

/** Her parça bir hücre: kayıttan gelen, bu oturumda çevrilen, kalan; çevrilmekte olan yanıp söner. */
export function Strip({ state: s, thin }: { state: AppState; thin?: boolean }) {
  return (
    <div className={cn('flex', s.segments.length > DENSE_AFTER ? 'gap-px' : 'gap-0.5')} aria-label={`${s.done} / ${s.total}`}>
      {s.segments.map((seg, i) => (
        <i key={i} className={cn(
          'min-w-px flex-1 rounded-[2px]',
          thin ? 'h-2.5' : 'h-3.5',
          i === s.current ? 'animate-blink bg-seg-done' : CELL[seg]
        )} />
      ))}
    </div>
  )
}
