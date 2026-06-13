import type {IMessage, IRequestPayload, IStatusUpdateResult, Status} from '@frontdesk/types'
import {useCallback, useEffect, useState} from 'react'
import {apiClient} from '../lib/apiClient'

export interface ISendRequestInput {
  items: IRequestPayload['items']
  note?: string
  summary: string
}

interface IThreadState {
  messages: IMessage[]
  loading: boolean
  error: string | null
  sending: boolean
  send: (text: string) => Promise<void>
  sendRequest: (input: ISendRequestInput) => Promise<void>
  updateStatus: (messageId: string, status: Status) => Promise<void>
}

export function useThread(groupKey: string): IThreadState {
  const [messages, setMessages] = useState<IMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    apiClient
      .get<IMessage[]>(`/groups/${groupKey}/messages`)
      .then(list => active && setMessages(list))
      .catch(caught => active && setError(String(caught)))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [groupKey])

  const send = useCallback(
    async (text: string) => {
      setSending(true)
      try {
        const message = await apiClient.post<IMessage>(`/groups/${groupKey}/messages`, {text})
        setMessages(prev => [...prev, message])
      } finally {
        setSending(false)
      }
    },
    [groupKey],
  )

  const sendRequest = useCallback(
    async (input: ISendRequestInput) => {
      setSending(true)
      try {
        const message = await apiClient.post<IMessage>(
          `/groups/${groupKey}/messages/request`,
          input,
        )
        setMessages(prev => [...prev, message])
      } finally {
        setSending(false)
      }
    },
    [groupKey],
  )

  const updateStatus = useCallback(
    async (messageId: string, status: Status) => {
      const result = await apiClient.patch<IStatusUpdateResult>(
        `/groups/${groupKey}/messages/${messageId}/status`,
        {status},
      )
      setMessages(prev => [
        ...prev.map(message => (message.id === result.message.id ? result.message : message)),
        result.system,
      ])
    },
    [groupKey],
  )

  return {messages, loading, error, sending, send, sendRequest, updateStatus}
}
