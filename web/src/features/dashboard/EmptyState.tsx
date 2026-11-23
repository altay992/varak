import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/I18nProvider'

export function EmptyState({ onChoose }: { onChoose: () => void }) {
  const { t } = useI18n()
  return (
    <div className="grid flex-1 place-items-center p-8">
      <div className="max-w-sm text-center">
        <Avatar className="mx-auto size-7" />
        <p className="mt-4 text-[15px] text-text">{t.dashboard.empty.title}</p>
        <p className="mt-1 text-[13px] text-text-3">{t.dashboard.empty.body}</p>
        <Button variant="primary" size="md" className="mt-5" onClick={onChoose}>{t.common.chooseBook}</Button>
      </div>
    </div>
  )
}
