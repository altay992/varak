import { useEffect, useState } from 'react'
import { ExternalLink, Eye, EyeOff } from 'lucide-react'
import { useApp } from '@/app/AppProvider'
import { ProviderIcon } from '@/components/brand/ProviderIcon'
import { Button } from '@/components/ui/button'
import { Dot } from '@/components/ui/dot'
import { Input } from '@/components/ui/input'
import { useI18n } from '@/i18n/I18nProvider'
import { api, isDesktop } from '@/lib/api'
import { engine, KEY_PAGES, providerFor } from '@/lib/config'
import { cn } from '@/lib/utils'
import { NO_KEY, type KeyStatus, type Provider } from '@/types/settings'
import { SectionHeader } from './SettingRow'

/** Kendi anahtarını getir: sağlayıcıyı seç, anahtarını yapıştır. */
export function ApiKeysSection({ model }: { model: string }) {
  const { state: s } = useApp()
  const { t } = useI18n()
  const modelProvider = providerFor(model)
  const [selected, setSelected] = useState<Provider>(modelProvider)

  // Model başka sağlayıcıya geçince anahtar paneli de ona geçsin.
  useEffect(() => { if (modelProvider) setSelected(modelProvider) }, [modelProvider])

  return (
    <section id="keys" className="mt-8">
      <SectionHeader title={t.settings.sections.keys} />
      <p className="mt-3 mb-3 text-[13px] text-text-2">{t.settings.keys.intro}</p>
      <div role="radiogroup" aria-label={t.settings.sections.keys} className="grid grid-cols-3 gap-2">
        {engine.providers.map((p) => (
          <ProviderCard key={p} provider={p} status={s.keys[p] ?? NO_KEY} selected={p === selected}
            usedByModel={p === modelProvider} onSelect={() => setSelected(p)} />
        ))}
      </div>
      {selected && <KeyPanel provider={selected} status={s.keys[selected] ?? NO_KEY} />}
    </section>
  )
}

function statusOf(status: KeyStatus) {
  if (status.saved) return 'saved' as const
  if (status.environment) return 'environment' as const
  return 'missing' as const
}

function ProviderCard({ provider, status, selected, usedByModel, onSelect }: {
  provider: Provider; status: KeyStatus; selected: boolean; usedByModel: boolean; onSelect: () => void
}) {
  const { t } = useI18n()
  const state = statusOf(status)
  const text = { saved: t.settings.keys.connected, environment: t.settings.keys.fromEnvironment, missing: t.settings.keys.notConnected }[state]
  return (
    <button type="button" role="radio" aria-checked={selected} onClick={onSelect} 
      className={cn(
        'flex flex-col gap-1.5 rounded-[10px] border border-line bg-card px-3 py-2.5 text-left',
        'transition-colors duration-150 hover:bg-muted aria-checked:border-text-3 aria-checked:bg-muted'
      )}>
      <span className="flex items-center gap-2">
        <ProviderIcon provider={provider} size={16} />
        <span className="text-[13px] text-text">{provider}</span>
        {usedByModel && <span className="ml-auto text-[11px] text-text-3">{t.settings.keys.usedByModel}</span>}
      </span>
      <span className="flex items-center gap-1.5 text-xs text-text-3">
        <Dot tone={state === 'missing' ? 'idle' : 'ok'} />{text}
      </span>
    </button>
  )
}

function KeyPanel({ provider, status }: { provider: Provider; status: KeyStatus }) {
  const { run, toast } = useApp()
  const { t } = useI18n()
  const [key, setKey] = useState('')
  const [visible, setVisible] = useState(false)
  const keys = t.settings.keys

  useEffect(() => { setKey(''); setVisible(false) }, [provider])

  const save = () => run(async () => {
    await api.saveKey(provider, key.trim())
    setKey('')
    toast(keys.saved(provider))
  })
  const remove = () => run(async () => {
    await api.saveKey(provider, '')
    toast(keys.removed(provider))
  })

  const placeholder = status.saved ? keys.replacePlaceholder
    : status.environment ? keys.environmentPlaceholder(engine.envKey(provider))
      : keys.placeholder(provider)

  return (
    <div className="mt-3 rounded-lg border border-line p-3">
      <div className="mb-2 flex items-center gap-2">
        <label htmlFor="api-key" className="text-[13px]">{keys.label(provider)}</label>
        {KEY_PAGES[provider] && (
          <a href={KEY_PAGES[provider]} target="_blank" rel="noreferrer" className="ml-auto inline-flex items-center gap-1 text-xs text-text-3 hover:text-text">
            {keys.getKey}<ExternalLink size={11} />
          </a>
        )}
      </div>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (key.trim()) save() }}>
        <div className="relative min-w-0 flex-1">
          <Input id="api-key" type={visible ? 'text' : 'password'} autoComplete="off" spellCheck={false}
            className="pr-9 font-mono text-xs" value={key} onChange={(e) => setKey(e.target.value)} placeholder={placeholder} />
          <button type="button" className="absolute top-1/2 right-2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-text-3 hover:text-text"
            onClick={() => setVisible(!visible)} aria-label={visible ? keys.hide : keys.show}>
            {visible ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        <Button type="submit" variant="primary" size="md" disabled={!key.trim()}>{t.common.save}</Button>
      </form>
      <div className="mt-2 flex items-center gap-2 text-xs text-text-3">
        <span>{isDesktop ? keys.storedDesktop : keys.storedWeb}</span>
        {status.saved && <Button className="ml-auto h-6! text-xs!" onClick={remove}>{t.common.remove}</Button>}
      </div>
    </div>
  )
}

