import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useApp } from '@/app/AppProvider'
import { TopBar } from '@/components/layout/TopBar'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useI18n } from '@/i18n/I18nProvider'
import { FileList } from './FileList'
import { FilePreview } from './FilePreview'

const ALL = '__all__'

/** Çıktı dosyaları: solda liste, sağda metin önizlemesi. */
export function OutputsView() {
  const { archive, loadArchive, bookFilter, setBookFilter } = useApp()
  const { t } = useI18n()
  const [selected, setSelected] = useState('')
  const files = archive?.files.filter((file) => !bookFilter || file.project === bookFilter) ?? []
  const active = files.find((file) => file.id === selected)

  return (
    <>
      <TopBar section={t.outputs.title}>
        <Select value={bookFilter || ALL} onValueChange={(v) => setBookFilter(v === ALL ? '' : v)}>
          <SelectTrigger aria-label={t.outputs.book} className="h-7 w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value={ALL}>{t.outputs.allBooks}</SelectItem>
            {archive?.books.map((b) => <SelectItem key={b.id} value={b.id}>{b.title}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={loadArchive}><RefreshCw size={14} strokeWidth={1.75} />{t.common.refresh}</Button>
      </TopBar>
      <div className="flex min-h-0 flex-1">
        <FileList files={files} loading={!archive} selected={selected} onSelect={setSelected} />
        <FilePreview file={active} />
      </div>
    </>
  )
}
