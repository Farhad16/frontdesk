import type {ICatalogItem} from '@frontdesk/types'
import {useEffect, useState} from 'react'
import {apiClient} from '../lib/apiClient'

export function useCatalog(): ICatalogItem[] {
  const [items, setItems] = useState<ICatalogItem[]>([])
  useEffect(() => {
    let active = true
    apiClient
      .get<ICatalogItem[]>('/catalog/items')
      .then(list => active && setItems(list))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])
  return items
}
