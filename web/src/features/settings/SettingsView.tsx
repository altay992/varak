import { useRef, useState } from 'react'
import { useApp } from '@/app/AppProvider'
import { NavItem } from '@/components/layout/NavItem'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Chip } from '@/components/ui/chip'
import { Dot } from '@/components/ui/dot'
import { useI18n } from '@/i18n/I18nProvider'
import { cn } from '@/lib/utils'
import { ApiKeysSection } from './ApiKeysSection'
import { EditionSection } from './EditionSection'
import { PromptSection } from './PromptSection'
import { useSettingsForm } from './useSettingsForm'
import { WorkSection } from './WorkSection'

const SECTIONS = ['edition', 'prompt', 'keys', 'work'] as const
type Section = (typeof SECTIONS)[number]

export function SettingsView() {
  const { state: s } = useApp()
  const { t } = useI18n()
  const settings = useSettingsForm()
  const [active, setActive] = useState<Section>('edition')
  const scroller = useRef<HTMLDivElement>(null)

  const jump = (id: Section) => {
    setActive(id)
    scroller.current?.querySelector(`#${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <TopBar section={t.settings.title} state={s.book ? s : undefined}>
        {s.busy && <Chip tone="ok" className="tabular-nums"><Dot tone="ok" />{t.settings.running(s.done, s.total)}</Chip>}
      </TopBar>
      <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto flex max-w-[860px] gap-12 px-8 pt-7 pb-24">
          <nav className="sticky top-7 hidden w-[150px] shrink-0 self-start md:block">
            {SECTIONS.map((id) => (
              <NavItem key={id} aria-current={active === id ? 'true' : undefined} onClick={() => jump(id)}>
                {t.settings.sections[id]}
                {id === 'edition' && settings.decision && <Dot tone="wait" className="ml-auto" />}
              </NavItem>
            ))}
            <p className="mt-6 px-2 text-xs leading-[18px] text-text-3">{t.settings.aside}</p>
          </nav>

          <div className="min-w-0 flex-1">
            <h1 className="m-0 text-xl font-medium">{t.settings.title}</h1>
            <p className="mt-1 mb-6 text-[13px] text-text-2">{t.settings.intro}</p>
            <EditionSection settings={settings} />
            <PromptSection settings={settings} />
            <ApiKeysSection model={settings.form.model} />
            <WorkSection settings={settings} />
          </div>
        </div>
      </div>
      <div className={cn('flex shrink-0 items-center justify-end gap-2 border-t border-line px-4 py-2.5', (!settings.dirty || settings.decision) && 'hidden')}>
        <span className="mr-auto text-xs text-text-3">{t.settings.footer}</span>
        <Button onClick={settings.reset}>{t.common.cancel}</Button>
        <Button variant="primary" size="md" onClick={settings.save}>{t.settings.saveAll}</Button>
      </div>
    </>
  )
}
