import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('block size-3 animate-spin rounded-full border-[1.5px] border-text-3 border-r-transparent', className)} />
}
