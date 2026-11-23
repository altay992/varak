import { cn } from '@/lib/utils'

/** Word belgesi simgesi: sayfa ve köşede "W" rozeti. */
export function WordIcon({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={cn(
      'relative block h-8 w-7 shrink-0 rounded border border-input bg-paper',
      'after:absolute after:-bottom-[3px] after:-left-[3px] after:size-3.5 after:rounded-[3px] after:bg-word',
      'after:text-center after:font-sans after:text-[9px] after:leading-[14px] after:font-semibold after:text-white after:content-["W"]',
      className
    )} />
  )
}
