import type {IMessage, IRequestPayload} from '@frontdesk/types'
import {t} from '../i18n'
import {formatTime} from './threadFormat'
import styles from './MessageBubble.module.css'

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In progress',
  DONE: 'Done',
  CANCELLED: 'Cancelled',
}

function isRequestPayload(payload: IMessage['payload']): payload is IRequestPayload {
  return Boolean(payload && 'items' in payload)
}

export function MessageBubble({message, isOwn}: {message: IMessage; isOwn: boolean}) {
  if (message.type === 'SYSTEM') {
    return (
      <div className={styles.fdSystem}>
        {message.text ?? message.summary} · {formatTime(message.createdAt)}
      </div>
    )
  }

  const initial = message.sender.name.charAt(0).toUpperCase()
  const showSender = !isOwn

  return (
    <div className={isOwn ? `${styles.fdRow} ${styles.fdRowOwn}` : styles.fdRow}>
      {showSender && (
        <span className={styles.fdRowAvatar} aria-hidden="true">
          {initial}
        </span>
      )}
      <div
        className={isOwn ? `${styles.fdBubble} ${styles.fdBubbleOwn}` : styles.fdBubble}
        data-type={message.type.toLowerCase()}
      >
        {showSender && (
          <span className={styles.fdSender}>
            {message.sender.name}
            {message.sender.role === 'STAFF' && (
              <span className={styles.fdSenderTag}>{t('thread.staffTag')}</span>
            )}
          </span>
        )}

        {message.type === 'REQUEST' && isRequestPayload(message.payload) ? (
          <div className={styles.fdRequest}>
            {message.summary && <span className={styles.fdRequestSummary}>{message.summary}</span>}
            {message.payload.items.map((item, index) => (
              <span key={index} className={styles.fdRequestLine}>
                {item.summary ?? `${item.quantity} × ${item.item}`}
              </span>
            ))}
            {message.status && (
              <span className={styles.fdStatus} data-status={message.status.toLowerCase()}>
                {STATUS_LABEL[message.status] ?? message.status}
              </span>
            )}
          </div>
        ) : (
          <span className={styles.fdText}>{message.text ?? message.summary}</span>
        )}

        <span className={styles.fdTime}>{formatTime(message.createdAt)}</span>
      </div>
    </div>
  )
}
