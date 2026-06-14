import type {ILunchOffPayload, IMessage} from '@frontdesk/types'

export interface ILunchOffEntry {
  member: IMessage['sender']
  message: IMessage
  range?: {from: string; to: string}
}

export function toDateKey(value: Date | string): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toISOString().slice(0, 10)
}

function isLunchOff(payload: IMessage['payload']): payload is ILunchOffPayload {
  return Boolean(payload && 'lunchOff' in payload)
}

// Does this message mark its sender off on date D ('YYYY-MM-DD')?
function coversDate(message: IMessage, date: string): boolean {
  if (isLunchOff(message.payload)) {
    const {from, to} = message.payload.lunchOff
    return from <= date && date <= to
  }
  if (message.type === 'QUICK' && message.text === 'lunch.msg.offToday') {
    return toDateKey(message.createdAt) === date
  }
  return false
}

function active(messages: IMessage[]): IMessage[] {
  return messages.filter(m => !m.deletedAt)
}

// One entry per member who is off on D, using their latest qualifying message.
export function deriveOffEntries(messages: IMessage[], date: string): ILunchOffEntry[] {
  const latestByMember = new Map<string, IMessage>()
  for (const message of active(messages)) {
    if (message.sender.role === 'STAFF') continue
    if (!coversDate(message, date)) continue
    const current = latestByMember.get(message.sender.id)
    if (!current || message.createdAt > current.createdAt) {
      latestByMember.set(message.sender.id, message)
    }
  }
  return [...latestByMember.values()]
    .sort((a, b) => a.sender.name.localeCompare(b.sender.name))
    .map(message => ({
      member: message.sender,
      message,
      range: isLunchOff(message.payload) ? message.payload.lunchOff : undefined,
    }))
}

// Latest office-wide lunch-off covering D (for the pinned banner).
export function activeOfficeOff(messages: IMessage[], date: string): IMessage | undefined {
  let found: IMessage | undefined
  for (const message of active(messages)) {
    if (!isLunchOff(message.payload) || message.payload.scope !== 'office') continue
    const {from, to} = message.payload.lunchOff
    if (from <= date && date <= to && (!found || message.createdAt > found.createdAt)) {
      found = message
    }
  }
  return found
}

// Latest staff "ask" (QUICK) message posted on date D — one per day.
export function latestStaffAsk(messages: IMessage[], date: string): IMessage | undefined {
  let found: IMessage | undefined
  for (const message of active(messages)) {
    if (message.sender.role !== 'STAFF' || message.type !== 'QUICK') continue
    if (toDateKey(message.createdAt) !== date) continue
    if (!found || message.createdAt > found.createdAt) found = message
  }
  return found
}

// 'YYYY-MM-DD' for the given weekday (1=Mon..5=Fri) in the current week.
export function weekdayDateKey(weekday: number): string {
  const now = new Date()
  const current = now.getDay() === 0 ? 7 : now.getDay()
  const diff = weekday - current
  const target = new Date(now)
  target.setDate(now.getDate() + diff)
  return toDateKey(target)
}
