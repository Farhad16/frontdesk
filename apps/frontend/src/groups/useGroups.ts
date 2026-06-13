import type {IGroupSummary} from '@frontdesk/types'
import {useEffect, useState} from 'react'
import {apiClient} from '../lib/apiClient'

interface IGroupsState {
  groups: IGroupSummary[]
  loading: boolean
  error: string | null
}

export function useGroups(): IGroupsState {
  const [state, setState] = useState<IGroupsState>({groups: [], loading: true, error: null})

  useEffect(() => {
    let active = true
    apiClient
      .get<IGroupSummary[]>('/groups')
      .then(groups => active && setState({groups, loading: false, error: null}))
      .catch(error => active && setState({groups: [], loading: false, error: String(error)}))
    return () => {
      active = false
    }
  }, [])

  return state
}
