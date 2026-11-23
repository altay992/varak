import { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import type { Page } from '@/types/state'

/** Seçili parçayı sunucudan getirir; geç gelen eski yanıtları yok sayar. */
export function usePage(index: number, run: number): Page | null {
  const [page, setPage] = useState<Page | null>(null)
  useEffect(() => {
    let live = true
    if (index < 0) setPage(null)
    else api.page(index).then((p) => { if (live) setPage(p) }, () => {})
    return () => { live = false }
  }, [index, run])
  return page
}
