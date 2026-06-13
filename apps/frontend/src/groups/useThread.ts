import type {IMessage} from '@frontdesk/types'
import {useCallback, useEffect, useState} from 'react'
import {apiClient} from '../lib/apiClient'

interface IThreadState {
  messages: IMessage[]
  loading: boolean
  error: string | null
  sending: boolean
  send: (text: string) => Promise<void>
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

  return {messages, loading, error, sending, send}
}
