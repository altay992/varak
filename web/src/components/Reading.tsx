import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

/** Kitap metni için okuma tipografisi. Paragraf numaraları (.key) sol boşluğa asılır. */
export function Reading({ className, ...props }: ComponentProps<'article'>) {
  return <article className={cn('text-[15.5px] leading-[27px] text-text [&_p]:relative [&_p]:mt-0 [&_p]:mb-3.5', className)} {...props} />
}

export function ParagraphKey({ children }: { children: React.ReactNode }) {
  return <span className="absolute top-[3px] -left-9 font-mono text-[10.5px] text-text-3 select-none">{children}</span>
}
