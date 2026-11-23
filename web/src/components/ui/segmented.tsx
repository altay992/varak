import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SegmentedProps<T extends string> {
  value: T
  options: ReadonlyArray<{ value: T; label: ReactNode }>
  onChange: (value: T) => void
  size?: 'md' | 'xs'
  className?: string
  label?: string
}

/** Birkaç seçenekten biri: üslup, dil, okuma dili. */
export function Segmented<T extends string>({ value, options, onChange, size = 'md', className, label }: SegmentedProps<T>) {
  return (
    <div role="group" aria-label={label} className={cn('flex rounded-lg bg-secondary p-0.5', className)}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
          className={cn(
            'flex-1 rounded-md whitespace-nowrap text-text-2 disabled:opacity-50',
            'aria-pressed:bg-card aria-pressed:text-text aria-pressed:shadow-[0_1px_2px_rgba(0,0,0,.08),0_0_0_.5px_rgba(0,0,0,.06)]',
            size === 'md' ? 'h-7 px-3 text-[13px]' : 'h-5 px-2 text-[11px]'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
