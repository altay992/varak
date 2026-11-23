import { useState } from 'react'
import { useApp } from '@/app/AppProvider'
import { Reading } from '@/components/Reading'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/I18nProvider'
import { EditionList } from './EditionList'
import { SeamPreview } from './SeamPreview'
import { StructureList } from './StructureList'
import { WordOutput } from './WordOutput'

type Tab = 'word' | 'page' | 'editions'

/** Sağ panel: Word çıktısı, son çevrilen parça ve sürümler. */
export function ArtifactPane() {
  const { state: s, go } = useApp()
  const { t, language } = useI18n()
  const [tab, setTab] = useState<Tab>('word')
  const seam = s.seam

  return (
    <aside className="hidden w-[360px] shrink-0 flex-col border-l border-line lg:flex">
      <div role="tablist" className="flex h-11 flex-none items-center gap-0.5 border-b border-line px-2.5">
        <TabButton active={tab === 'word'} onClick={() => setTab('word')}>{t.artifact.word}</TabButton>
        {seam && <TabButton active={tab === 'page'} onClick={() => setTab('page')}>{t.common.part(seam.n + 1)}</TabButton>}
        <TabButton active={tab === 'editions'} onClick={() => setTab('editions')}>
          {t.artifact.editions} <span className="text-xs text-text-3">{s.editions.length}</span>
        </TabButton>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {tab === 'word' && (
          <>
            <WordOutput />
            {seam && <SeamPreview seam={seam} />}
            {s.structure && <StructureList structure={s.structure} />}
            <EditionList />
          </>
        )}
        {tab === 'page' && seam && (
          <div>
            <div className="mb-2 text-xs text-text-3">{t.common.part(seam.n + 1)} · {language(s.cfg.target_lang)}</div>
            <Reading className="text-sm leading-6 whitespace-pre-line">{seam.tail}</Reading>
            <Button variant="outline" className="mt-3" onClick={() => go('reader')}>{t.artifact.openInReader}</Button>
          </div>
        )}
        {tab === 'editions' && <EditionList />}
      </div>
    </aside>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" role="tab" aria-selected={active} onClick={onClick}
      className="inline-flex h-7 items-center gap-1.5 rounded-[7px] px-2.5 text-[13px] whitespace-nowrap text-text-2 aria-selected:bg-secondary aria-selected:text-text">
      {children}
    </button>
  )
}
