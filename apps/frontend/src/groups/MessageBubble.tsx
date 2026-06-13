import type {IMessage, IRequestPayload, Role, Status} from '@frontdesk/types'
import {WuButton} from '@npm-questionpro/wick-ui-lib'
import {t} from '../i18n'
import {formatTime} from './threadFormat'
import styles from './MessageBubble.module.css'

function isRequestPayload(payload: IMessage['payload']): payload is IRequestPayload {
  return Boolean(payload && 'items' in payload)
}

interface IStatusAction {
  label: string
  next: Status
  primary: boolean
}

function actionsFor(status: Status, role: Role, isOwner: boolean): IStatusAction[] {
  if (role === 'STAFF') {
    if (status === 'PENDING') return [{label: t('status.start'), next: 'IN_PROGRESS', primary: true}]
    if (status === 'IN_PROGRESS') return [{label: t('status.markDone'), next: 'DONE', primary: true}]
    return []
  }
  if (isOwner && status === 'PENDING') {
    return [{label: t('status.cancel'), next: 'CANCELLED', primary: false}]
  }
  return []
}

interface IMessageBubbleProps {
  message: IMessage
  isOwn: boolean
  currentUserId?: string
  currentRole?: Role
  onUpdateStatus: (messageId: string, status: Status) => void
}

export function MessageBubble({
  message,
  isOwn,
  currentUserId,
  currentRole,
  onUpdateStatus,
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
                {t(`status.${message.status.toLowerCase()}`)}
              </span>
            )}
            {message.status &&
              currentRole &&
              (() => {
                const actions = actionsFor(
                  message.status,
                  currentRole,
                  message.sender.id === currentUserId,
                )
                if (actions.length === 0) return null
                return (
                  <div className={styles.fdActions}>
                    {actions.map(action => (
                      <WuButton
                        key={action.next}
                        size="sm"
                        variant={action.primary ? 'primary' : 'outline'}
                        onClick={() => onUpdateStatus(message.id, action.next)}
                      >
                        {action.label}
                      </WuButton>
                    ))}
                  </div>
                )
              })()}
          </div>
        ) : (
          <span className={styles.fdText}>{message.text ?? message.summary}</span>
        )}

        <span className={styles.fdTime}>{formatTime(message.createdAt)}</span>
      </div>
    </div>
  )
}
