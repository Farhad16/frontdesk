import type {IMessage, IRequestPayload, ISseEvent, IStatusUpdateResult, Status} from '@frontdesk/types'
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

function upsert(list: IMessage[], message: IMessage): IMessage[] {
  const index = list.findIndex(item => item.id === message.id)
  if (index === -1) return [...list, message]
  const copy = [...list]
  copy[index] = message
  return copy
}

export function useThread(groupKey: string): IThreadState {
  const [messages, setMessages] = useState<IMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const load = useCallback(() => {
    return apiClient
      .get<IMessage[]>(`/groups/${groupKey}/messages`)
      .then(list => setMessages(list))
      .catch(caught => setError(String(caught)))
  }, [groupKey])

  useEffect(() => {
    setLoading(true)
    setError(null)
    load().finally(() => setLoading(false))

    const source = new EventSource('/api/stream', {withCredentials: true})
    source.onopen = () => {
      void load()
    }
    source.onmessage = event => {
      const data = JSON.parse(event.data) as ISseEvent
      if ('groupKey' in data && data.groupKey !== groupKey) return
      if (data.type === 'message:new' || data.type === 'message:status') {
        setMessages(prev => upsert(prev, data.message))
      } else if (data.type === 'message:deleted') {
        setMessages(prev => prev.filter(message => message.id !== data.messageId))
      }
    }
    return () => source.close()
  }, [groupKey, load])

  const send = useCallback(
    async (text: string) => {
      setSending(true)
      try {
        const message = await apiClient.post<IMessage>(`/groups/${groupKey}/messages`, {text})
        setMessages(prev => upsert(prev, message))
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
        const message = await apiClient.post<IMessage>(`/groups/${groupKey}/messages/request`, input)
        setMessages(prev => upsert(prev, message))
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
      setMessages(prev => upsert(upsert(prev, result.message), result.system))
    },
    [groupKey],
  )

  return {messages, loading, error, sending, send, sendRequest, updateStatus}
}
