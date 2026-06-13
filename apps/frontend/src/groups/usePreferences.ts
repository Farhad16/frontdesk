import type {IUserPreference} from '@frontdesk/types'
import {useCallback, useEffect, useState} from 'react'
import {apiClient} from '../lib/apiClient'

export function usePreferences() {
  const [preferences, setPreferences] = useState<IUserPreference[]>([])

  useEffect(() => {
    let active = true
    apiClient
      .get<IUserPreference[]>('/preferences')
      .then(list => active && setPreferences(list))
      .catch(() => {})
    return () => {
      active = false
    }
  }, [])

  const save = useCallback(async (itemKey: string, options: IUserPreference['options']) => {
    const saved = await apiClient.put<IUserPreference>(`/preferences/${itemKey}`, {options})
    setPreferences(prev => [...prev.filter(p => p.itemKey !== itemKey), saved])
  }, [])

  const find = useCallback(
    (itemKey: string) => preferences.find(p => p.itemKey === itemKey),
    [preferences],
  )

  return {preferences, save, find}
}
