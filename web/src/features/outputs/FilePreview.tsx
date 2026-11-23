import { useEffect, useState } from 'react'
import { useApp } from '@/app/AppProvider'
import { Reading } from '@/components/Reading'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/i18n/I18nProvider'
import { api } from '@/lib/api'
import type { ArchiveFile } from '@/types/archive'

export function FilePreview({ file }: { file?: ArchiveFile }) {
  const { run } = useApp()
  const { t, message } = useI18n()
  const [text, setText] = useState<string | null>(null)

  useEffect(() => {
    if (!file) return
    let live = true
    setText(null)
    api.preview(file.id).then(
      (value) => { if (live) setText(value) },
      (e: Error) => { if (live) setText(message(e.message)) }
    )
    return () => { live = false }
  }, [file?.id, message])

  if (!file) return <div className="grid flex-1 place-items-center text-[13px] text-text-3">{t.outputs.pick}</div>
  return (
    <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-line px-4">
        <span className="truncate text-[13px]">{file.name}</span>
        <div className="ml-auto flex shrink-0 gap-1">
          <Button variant="outline" onClick={() => run(() => api.openOutput(file.id))}>{t.common.openInWord}</Button>
          <Button onClick={() => run(() => api.revealOutput(file.id))}>{t.common.revealInFolder}</Button>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <Reading className="mx-auto max-w-[584px] px-10 py-7 whitespace-pre-wrap">{text ?? t.outputs.readingFile}</Reading>
      </div>
    </div>
  )
}
