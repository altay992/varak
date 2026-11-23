import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { TooltipProvider } from './components/ui/tooltip'
import { I18nProvider } from './i18n/I18nProvider'
import { loadConfig } from './lib/config'
import './styles/globals.css'

const root = createRoot(document.getElementById('root')!)

// Motorun seçenekleri (modeller, diller, üsluplar) gelmeden arayüz çizilmez.
loadConfig().then(
  () => root.render(
    <StrictMode>
      <I18nProvider>
        <TooltipProvider delayDuration={300}>
          <App />
        </TooltipProvider>
      </I18nProvider>
    </StrictMode>
  ),
  (e: Error) => root.render(
    <div style={{ display: 'grid', placeItems: 'center', height: '100%', fontSize: 14 }}>Varak: {e.message}</div>
  )
)
