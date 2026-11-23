import { cn } from '@/lib/utils'

/** Varak'ın küçük altın küresi. */
export function Avatar({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('block size-4 shrink-0 rounded-full bg-(image:--avatar)', className)} />
}
