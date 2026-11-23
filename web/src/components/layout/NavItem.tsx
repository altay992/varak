import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Kenar çubuğu ve Ayarlar bölüm listesindeki satırların görünümü. */
export const navItemClass = cn(
  'flex h-[30px] w-full items-center gap-2.5 rounded-[7px] px-2 text-left text-[13px] whitespace-nowrap text-text-2',
  'hover:bg-muted aria-[current]:bg-secondary aria-[current]:text-text',
  '[&_svg]:text-text-3 aria-[current]:[&_svg]:text-text'
)

export function NavItem({ className, ...props }: ComponentProps<'button'>) {
  return <button type="button" className={cn(navItemClass, className)} {...props} />
}

/** Satırın sağındaki sayı ya da kısa bilgi. */
export function NavBadge({ children }: { children: ReactNode }) {
  return <span className="ml-auto text-xs text-text-3 tabular-nums">{children}</span>
}
