import type {Role} from '@frontdesk/types'

const KEY = 'frontdesk.view'

export type ViewMode = 'thread' | 'queue'

export function getViewMode(role?: Role): ViewMode {
  const saved = localStorage.getItem(KEY)
  if (saved === 'thread' || saved === 'queue') return saved
  return role === 'STAFF' ? 'queue' : 'thread'
}

export function setViewMode(mode: ViewMode): void {
  localStorage.setItem(KEY, mode)
}
