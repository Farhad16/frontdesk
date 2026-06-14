import type {ILunchOffPayload, IMessage} from '@frontdesk/types'
import {WuLoader} from '@npm-questionpro/wick-ui-lib'
import {useParams} from 'react-router-dom'
import {dayKey, formatTime} from '../groups/threadFormat'
import {useThread} from '../groups/useThread'
import {t} from '../i18n'
import styles from './QueuePage.module.css'

function isLunchOff(payload: IMessage['payload']): payload is ILunchOffPayload {
  return Boolean(payload && 'lunchOff' in payload)
}

function messageText(message: IMessage): string {
  if (isLunchOff(message.payload)) {
    const {from, to} = message.payload.lunchOff
    const prefix = message.payload.scope === 'office' ? t('lunchoff.office') : t('lunchoff.mine')
    const fmt = (iso: string) => new Date(iso).toLocaleDateString([], {day: 'numeric', month: 'short'})
    const when =
      from === to
        ? `${t('lunchoff.on')} ${fmt(from)}`
        : `${t('lunchoff.from')} ${fmt(from)} ${t('lunchoff.to')} ${fmt(to)}`
    return `${prefix} ${when}`
  }
  if (message.type === 'QUICK' && message.text) return t(message.text)
  return message.text ?? message.summary ?? ''
}

// Collapse repeated canned "ask" messages (same QUICK text) to the latest one
// per day; keep everything else (orders, free text) as-is.
function dedupeAsks(messages: IMessage[]): IMessage[] {
  const latestAsk = new Map<string, IMessage>()
  const others: IMessage[] = []
  for (const message of messages) {
    if (message.type === 'QUICK' && message.text) {
      const dayKeyVal = `${message.text}|${dayKey(message.createdAt)}`
      const current = latestAsk.get(dayKeyVal)
      if (!current || message.createdAt > current.createdAt) latestAsk.set(dayKeyVal, message)
    } else {
      others.push(message)
    }
  }
  return [...others, ...latestAsk.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
}

function MessageRows({messages}: {messages: IMessage[]}) {
  if (messages.length === 0) return <p className={styles.fdSectionEmpty}>{t('msgq.empty')}</p>
  return (
    <div className={styles.fdTable}>
      {messages.map(message => (
        <div key={message.id} className={styles.fdMsgRow}>
          <span className={styles.fdMember} data-label={t('queue.colMember')}>
            <span className={styles.fdAvatar} aria-hidden="true">
              {message.sender.name.charAt(0).toUpperCase()}
            </span>
            {message.sender.name}
          </span>
          <span className={styles.fdRequest} data-label={t('queue.colRequest')}>
            {messageText(message)}
          </span>
          <span className={styles.fdTimeCell} data-label={t('queue.colTime')}>
            {formatTime(message.createdAt)}
          </span>
        </div>
      ))}
    </div>
  )
}

// Today's messages split into Staff (top) and Member (below) sections — for
// chat-style groups (Lunch, Breakfast) in the staff queue. Read-only.
export function MessageQueue() {
  const {key = ''} = useParams()
  const {messages, loading, error} = useThread(key)
  const today = dayKey(new Date().toISOString())
  const visible = messages.filter(
    m => !m.deletedAt && m.type !== 'SYSTEM' && dayKey(m.createdAt) === today,
  )
  const staffMessages = dedupeAsks(visible.filter(m => m.sender.role === 'STAFF'))
  const memberMessages = visible.filter(m => m.sender.role !== 'STAFF')

  return (
    <div className={styles.fdQueue}>
      <div className={styles.fdQueueBody}>
        {loading && (
          <div className={styles.fdQueueState}>
            <WuLoader size="sm" variant="spinner" />
          </div>
        )}
        {error && <div className={styles.fdQueueState}>{error}</div>}

        {!loading && !error && (
          <>
            <h3 className={styles.fdSectionTitle}>{t('msgq.staff')}</h3>
            <MessageRows messages={staffMessages} />
            <h3 className={styles.fdSectionTitle}>{t('msgq.members')}</h3>
            <MessageRows messages={memberMessages} />
          </>
        )}
      </div>
    </div>
  )
}
