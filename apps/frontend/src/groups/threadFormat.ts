import {t} from '../i18n'

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {hour: 'numeric', minute: '2-digit'})
}

function dayStart(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function dayKey(iso: string): string {
  const date = new Date(iso)
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

export function dayLabel(iso: string): string {
  const date = new Date(iso)
  const today = dayStart(new Date())
  const that = dayStart(date)
  const oneDay = 24 * 60 * 60 * 1000
  if (that === today) return t('thread.today')
  if (that === today - oneDay) return t('thread.yesterday')
  return date.toLocaleDateString([], {day: 'numeric', month: 'short', year: 'numeric'})
}
