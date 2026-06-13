import type {IGroupConfig} from '@frontdesk/types'
import {useEffect, useState} from 'react'
import {apiClient} from '../lib/apiClient'

export function useGroupConfig(groupKey: string) {
  const [config, setConfig] = useState<IGroupConfig | null>(null)

  useEffect(() => {
    let active = true
    setConfig(null)
    apiClient
      .get<IGroupConfig>(`/groups/${groupKey}/config`)
      .then(value => active && setConfig(value))
      .catch(() => active && setConfig(null))
    return () => {
      active = false
    }
  }, [groupKey])

  return config
}
