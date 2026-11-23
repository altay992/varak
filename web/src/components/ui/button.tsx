import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const button = cva(
  [
    'group/button inline-flex h-7 cursor-default items-center gap-1.5 rounded-[7px] px-2.5 text-[13px] whitespace-nowrap text-text-2',
    'transition-[background-color,opacity,transform] duration-200 ease-nobet active:scale-[.97]',
    'hover:bg-muted hover:text-text disabled:pointer-events-none disabled:opacity-45 [&_svg]:text-text-3'
  ],
  {
    variants: {
      variant: {
        ghost: '',
        outline: 'border border-input text-text [&_svg]:text-text-2',
        primary: 'bg-primary font-medium text-primary-foreground hover:bg-primary hover:text-primary-foreground hover:opacity-90 [&_svg]:text-primary-foreground'
      },
      size: {
        sm: '',
        md: 'h-8 px-3',
        icon: 'w-7 justify-center px-0'
      }
    },
    defaultVariants: { variant: 'ghost', size: 'sm' }
  }
)

export type ButtonProps = ComponentProps<'button'> & VariantProps<typeof button>

export function Button({ className, variant, size, type = 'button', ...props }: ButtonProps) {
  return <button type={type} data-variant={variant ?? 'ghost'} className={cn(button({ variant, size }), className)} {...props} />
}
