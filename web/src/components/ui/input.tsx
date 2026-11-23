import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const field = 'w-full rounded-lg border border-input bg-card text-text outline-none focus:border-info disabled:opacity-50'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(field, 'h-8 px-2.5 text-[13px]', className)} {...props} />
}

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return <textarea className={cn(field, 'resize-y px-3 py-2.5 font-mono text-xs leading-[21px]', className)} {...props} />
}
