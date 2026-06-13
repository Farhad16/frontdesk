import type {IMessage, IRequestPayload, Role, Status} from '@frontdesk/types'
import {t} from '../i18n'
import {actionsFor} from './statusActions'
import {formatTime} from './threadFormat'
import styles from './MessageBubble.module.css'

function isRequestPayload(payload: IMessage['payload']): payload is IRequestPayload {
  return Boolean(payload && 'items' in payload)
}

const ACTION_GLYPH: Record<Status, string> = {
  PENDING: '',
  IN_PROGRESS: '▸',
  DONE: '✓',
  CANCELLED: '✕',
}

interface IMessageBubbleProps {
  message: IMessage
  isOwn: boolean
  currentUserId?: string
  currentRole?: Role
  onUpdateStatus: (messageId: string, status: Status) => void
  onDelete?: (messageId: string) => void
}

export function MessageBubble({
  message,
  isOwn,
  currentUserId,
  currentRole,
  onUpdateStatus,
  onDelete,
}: IMessageBubbleProps) {
  if (message.type === 'SYSTEM') {
    return (
      <div className={styles.fdSystem}>
        {message.text ?? message.summary} · {formatTime(message.createdAt)}
      </div>
    )
  }

  const initial = message.sender.name.charAt(0).toUpperCase()
  const showSender = !isOwn

  if (message.deletedAt) {
    return (
      <div className={isOwn ? `${styles.fdRow} ${styles.fdRowOwn}` : styles.fdRow}>
        {showSender && (
          <span className={styles.fdRowAvatar} aria-hidden="true">
            {initial}
          </span>
        )}
        <div className={`${styles.fdBubble} ${styles.fdTombstone}`}>{t('thread.deleted')}</div>
      </div>
    )
  }

  const staffClosable =
    currentRole === 'STAFF' &&
    message.type === 'REQUEST' &&
    (message.status === 'DONE' || message.status === 'CANCELLED')
  const canDelete = onDelete && (message.sender.id === currentUserId || staffClosable)

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
            {message.payload.items.map((item, index) => (
              <span key={index} className={styles.fdRequestLine}>
                {item.summary ?? `${item.quantity} × ${item.item}`}
              </span>
            ))}
            {message.status &&
              (() => {
                const actions = currentRole
                  ? actionsFor(message.status, currentRole, message.sender.id === currentUserId)
                  : []
                return (
                  <div className={styles.fdRequestFooter}>
                    <span className={styles.fdStatus} data-status={message.status.toLowerCase()}>
                      {t(`status.${message.status.toLowerCase()}`)}
                    </span>
                    {actions.map(action => (
                      <button
                        key={action.next}
                        type="button"
                        className={styles.fdActionBtn}
                        data-next={action.next.toLowerCase()}
                        onClick={() => onUpdateStatus(message.id, action.next)}
                      >
                        {ACTION_GLYPH[action.next]} {action.label}
                      </button>
                    ))}
                  </div>
                )
              })()}
          </div>
        ) : (
          <span className={styles.fdText}>
            {message.type === 'QUICK' && message.text
              ? t(message.text)
              : (message.text ?? message.summary)}
          </span>
        )}

        <span className={styles.fdMeta}>
          {canDelete && (
            <button
              type="button"
              className={styles.fdDelete}
              onClick={() => onDelete?.(message.id)}
            >
              {t('thread.delete')}
            </button>
          )}
          <span className={styles.fdTime}>{formatTime(message.createdAt)}</span>
        </span>
      </div>
    </div>
  )
}
