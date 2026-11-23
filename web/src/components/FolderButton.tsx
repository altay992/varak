import { FolderOpen } from 'lucide-react'
import { useI18n } from '@/i18n/I18nProvider'
import { Button } from './ui/button'

export function FolderButton({ onClick }: { onClick: () => void }) {
  const { t } = useI18n()
  return <Button onClick={onClick}><FolderOpen size={14} strokeWidth={1.75} />{t.common.openFolder}</Button>
}
