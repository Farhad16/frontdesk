import type {IMessage} from '@frontdesk/types'
import {useCallback, useState} from 'react'
import {apiClient} from '../lib/apiClient'
import type {ISendRequestInput} from './useThread'

interface IComposeState {
  sending: boolean
  sendText: (text: string) => Promise<void>
  sendQuick: (quickActionKey: string) => Promise<void>
  sendRequest: (input: ISendRequestInput) => Promise<void>
}

// Post-only composer hook (no fetch/SSE). The open thread receives the new
// message via its own SSE subscription, so this does not track state.
export function useCompose(groupKey: string): IComposeState {
  const [sending, setSending] = useState(false)

  const sendText = useCallback(
    async (text: string) => {
      setSending(true)
      try {
        await apiClient.post<IMessage>(`/groups/${groupKey}/messages`, {text})
      } finally {
        setSending(false)
      }
    },
    [groupKey],
  )

  const sendQuick = useCallback(
    async (quickActionKey: string) => {
      await apiClient.post<IMessage>(`/groups/${groupKey}/messages/quick`, {quickActionKey})
    },
    [groupKey],
  )

  const sendRequest = useCallback(
    async (input: ISendRequestInput) => {
      setSending(true)
      try {
        await apiClient.post<IMessage>(`/groups/${groupKey}/messages/request`, input)
      } finally {
        setSending(false)
      }
    },
    [groupKey],
  )

  return {sending, sendText, sendQuick, sendRequest}
}
