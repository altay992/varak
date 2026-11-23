import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { selectTriggerClass } from '@/components/ui/select'
import { useI18n } from '@/i18n/I18nProvider'
import { engine, providerFor } from '@/lib/config'
import { NO_KEY, type KeyStatus, type Provider } from '@/types/settings'
import { ProviderIcon } from './brand/ProviderIcon'
import { Dot } from './ui/dot'

interface Props {
  value: string
  onChange: (model: string) => void
  keys: Record<Provider, KeyStatus | undefined>
  disabled?: boolean
}

/** Sağlayıcıya göre gruplu, aranabilir model seçici. */
export function ModelPicker({ value, onChange, keys, disabled }: Props) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const provider = providerFor(value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" role="combobox" aria-expanded={open} disabled={disabled} className={selectTriggerClass}>
          <ProviderIcon provider={provider} />
          <span className="font-mono text-xs min-w-0 flex-1 truncate text-left text-[13px]!">{value}</span>
          <span className="text-xs text-text-3">{provider}</span>
          <ChevronsUpDown size={13} className="shrink-0 text-text-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-(--radix-popover-trigger-width) min-w-80 overflow-hidden rounded-lg border-0 p-0">
        <Command loop className="rounded-none bg-popover">
          <CommandInput placeholder={t.settings.picker.search} className="h-9 text-[13px]" />
          <CommandList className="max-h-[340px]">
            <CommandEmpty className="py-6 text-center text-[13px] text-text-3">{t.settings.picker.empty}</CommandEmpty>
            {engine.providers.map((p) => (
              <CommandGroup key={p} heading={<ProviderHeading provider={p} status={keys[p] ?? NO_KEY} />}>
                {(engine.catalog[p] ?? []).map((model) => (
                  <CommandItem
                    key={model}
                    value={model}
                    keywords={[p]}
                    onSelect={() => { onChange(model); setOpen(false) }}
                    className="h-8 rounded-md pl-7 text-text-2 data-[selected=true]:text-text"
                  >
                    <span className="font-mono text-xs flex-1 truncate text-[13px]!">{model}</span>
                    {model === value && <Check className="size-3.5 text-text" />}
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function ProviderHeading({ provider, status }: { provider: Provider; status: KeyStatus }) {
  const { t } = useI18n()
  const ready = status.saved || status.environment
  const label = status.saved ? t.settings.keyState.saved : status.environment ? t.settings.keyState.environment : t.settings.picker.noKey
  return (
    <span className="flex items-center gap-2 font-normal">
      <ProviderIcon provider={provider} size={12} />
      <span className="text-text-2">{provider}</span>
      <span className="ml-auto flex items-center gap-1.5"><Dot tone={ready ? 'ok' : 'idle'} />{label}</span>
    </span>
  )
}
