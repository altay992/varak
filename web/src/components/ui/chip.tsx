import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const chip = cva('inline-flex h-[22px] items-center gap-1.5 rounded-md px-[7px] text-xs whitespace-nowrap', {
  variants: {
    tone: {
      neutral: 'bg-secondary text-text-2',
      ok: 'bg-ok-tint text-ok',
      wait: 'bg-wait-tint text-wait',
      bad: 'bg-bad-tint text-bad',
      info: 'bg-info-tint text-info'
    },
    mono: { true: 'font-mono text-[11.5px]' }
  },
  defaultVariants: { tone: 'neutral' }
})

export type ChipTone = NonNullable<VariantProps<typeof chip>['tone']>

export function Chip({ tone, mono, className, ...props }: ComponentProps<'span'> & VariantProps<typeof chip>) {
  return <span className={cn(chip({ tone, mono }), className)} {...props} />
}
