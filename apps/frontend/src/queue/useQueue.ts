import type {IRequestQueueItem, ISseEvent, IStatusUpdateResult, Status} from '@frontdesk/types'
import {useCallback, useEffect, useState} from 'react'
import {apiClient} from '../lib/apiClient'

interface IQueueState {
  items: IRequestQueueItem[]
  loading: boolean
  error: string | null
  updateStatus: (groupKey: string, messageId: string, status: Status) => Promise<void>
  deleteMessage: (groupKey: string, messageId: string) => Promise<void>
}

function upsert(list: IRequestQueueItem[], item: IRequestQueueItem): IRequestQueueItem[] {
  const index = list.findIndex(entry => entry.message.id === item.message.id)
  if (index === -1) return [item, ...list]
  const copy = [...list]
  copy[index] = item
  return copy
}

export function useQueue(): IQueueState {
  const [items, setItems] = useState<IRequestQueueItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    return apiClient
      .get<IRequestQueueItem[]>('/requests')
      .then(list => setItems(list))
      .catch(caught => setError(String(caught)))
  }, [])

  useEffect(() => {
    setLoading(true)
    load().finally(() => setLoading(false))

    const source = new EventSource('/api/stream', {withCredentials: true})
    source.onopen = () => void load()
    source.onmessage = event => {
      const data = JSON.parse(event.data) as ISseEvent
      if (data.type === 'message:new' || data.type === 'message:status') {
        if (data.message.type !== 'REQUEST') return
        setItems(prev => upsert(prev, {groupKey: data.groupKey, message: data.message}))
      } else if (data.type === 'message:deleted') {
        setItems(prev => prev.filter(entry => entry.message.id !== data.messageId))
      }
    }
    return () => source.close()
  }, [load])

  const updateStatus = useCallback(
    async (groupKey: string, messageId: string, status: Status) => {
      const result = await apiClient.patch<IStatusUpdateResult>(
        `/groups/${groupKey}/messages/${messageId}/status`,
        {status},
      )
      setItems(prev => upsert(prev, {groupKey, message: result.message}))
    },
    [],
  )

  const deleteMessage = useCallback(async (groupKey: string, messageId: string) => {
    await apiClient.delete(`/groups/${groupKey}/messages/${messageId}`)
    setItems(prev => prev.filter(entry => entry.message.id !== messageId))
  }, [])

  return {items, loading, error, updateStatus, deleteMessage}
}
