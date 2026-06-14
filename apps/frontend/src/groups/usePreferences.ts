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

  const save = useCallback(
    async (itemKey: string, options: IUserPreference['options'], isDefault = false) => {
      const saved = await apiClient.put<IUserPreference>(`/preferences/${itemKey}`, {
        options,
        isDefault,
      })
      setPreferences(prev => {
        const others = prev
          .filter(p => p.itemKey !== itemKey)
          .map(p => (isDefault ? {...p, isDefault: false} : p))
        return [...others, saved]
      })
    },
    [],
  )

  const remove = useCallback(async (itemKey: string) => {
    await apiClient.delete(`/preferences/${itemKey}`)
    setPreferences(prev => prev.filter(p => p.itemKey !== itemKey))
  }, [])

  const find = useCallback(
    (itemKey: string) => preferences.find(p => p.itemKey === itemKey),
    [preferences],
  )

  return {preferences, save, find, remove}
}
