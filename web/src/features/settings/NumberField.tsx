import { Input } from '@/components/ui/input'

/** Sağında birim yazan sayı alanı. */
export function NumberField({ value, onChange, min, max, unit }: {
  value: number; onChange: (value: number) => void; min: number; max: number; unit: string
}) {
  return (
    <div className="relative">
      <Input type="number" className="pr-20" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-xs text-text-3">{unit}</span>
    </div>
  )
}
