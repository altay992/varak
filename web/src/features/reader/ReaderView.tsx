import { useState } from 'react'
import { Maximize2, Minimize2 } from 'lucide-react'
import { useApp } from '@/app/AppProvider'
import { FolderButton } from '@/components/FolderButton'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/lib/api'
import { PageView } from './PageView'
import { ReaderSidebar } from './ReaderSidebar'

/** Canlı Okuma: solda akışın kısa hali, sağda biten parçanın metni. */
export function ReaderView() {
  const { state: s, run } = useApp()
  const { t } = useI18n()
  const [focus, setFocus] = useState(false)
  return (
    <>
      <TopBar section={t.reader.title} state={s.book ? s : undefined}>
        <FolderButton onClick={() => run(api.openFolder)} />
        <Button size="icon" onClick={() => setFocus(!focus)} aria-label={t.reader.focus} aria-pressed={focus}>
          {focus ? <Minimize2 size={14} strokeWidth={1.75} /> : <Maximize2 size={14} strokeWidth={1.75} />}
        </Button>
      </TopBar>
      <div className="flex min-h-0 flex-1">
        {!focus && <ReaderSidebar />}
        <PageView />
      </div>
    </>
  )
}
