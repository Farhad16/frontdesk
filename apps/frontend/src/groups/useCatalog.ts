import type {ICatalogSection} from '@frontdesk/types'
import {useEffect, useState} from 'react'
import {apiClient} from '../lib/apiClient'

export function useCatalog(): ICatalogSection[] {
  const [sections, setSections] = useState<ICatalogSection[]>([])
  useEffect(() => {
    let active = true
    apiClient
      .get<ICatalogSection[]>('/catalog/sections')
      .then(list => active && setSections(list))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])
  return sections
}
