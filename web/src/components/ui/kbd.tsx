import type { ReactNode } from 'react'

/** Klavye kısayolu rozeti. Birincil düğmenin içinde rengini düğmeden alır. */
export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="inline-grid h-[18px] min-w-[18px] place-items-center rounded-[5px] border border-input px-1 font-mono text-[11px] leading-4 text-text-3 group-data-[variant=primary]/button:border-primary-foreground/30 group-data-[variant=primary]/button:text-primary-foreground/65">
      {children}
    </kbd>
  )
}
