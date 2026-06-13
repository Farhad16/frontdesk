const PREFIX = 'fd.read.'
const listeners = new Set<() => void>()

export function markGroupRead(groupKey: string): void {
  localStorage.setItem(PREFIX + groupKey, new Date().toISOString())
  listeners.forEach(listener => listener())
}

export function getGroupReadAt(groupKey: string): string | null {
  return localStorage.getItem(PREFIX + groupKey)
}

export function subscribeReads(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}
