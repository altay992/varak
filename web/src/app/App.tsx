import { DashboardView } from '@/features/dashboard/DashboardView'
import { LibraryView } from '@/features/library/LibraryView'
import { OutputsView } from '@/features/outputs/OutputsView'
import { ReaderView } from '@/features/reader/ReaderView'
import { SettingsView } from '@/features/settings/SettingsView'
import { useI18n } from '@/i18n/I18nProvider'
import { AppProvider, useApp } from './AppProvider'
import { Sidebar } from './Sidebar'
import { useSpaceShortcut } from './useSpaceShortcut'
import type { View } from './views'

const VIEWS: Record<View, () => React.JSX.Element> = {
  dashboard: DashboardView,
  reader: ReaderView,
  library: LibraryView,
  outputs: OutputsView,
  settings: SettingsView
}

export function App() {
  const { t } = useI18n()
  return (
    <AppProvider fallback={(failure) => (
      <div className="grid h-full place-items-center p-8 text-sm text-text-2">{failure ? t.app.serverDown(failure) : t.app.opening}</div>
    )}>
      <Shell />
    </AppProvider>
  )
}

function Shell() {
  const { view } = useApp()
  useSpaceShortcut()
  const Current = VIEWS[view]
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="my-2 mr-2 flex min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-line bg-card">
        <Current />
      </main>
    </div>
  )
}
