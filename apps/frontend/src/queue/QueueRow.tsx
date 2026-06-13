import type {IGroupSummary, IRequestQueueItem, Role, Status} from '@frontdesk/types'
import {WuButton} from '@npm-questionpro/wick-ui-lib'
import {actionsFor} from '../groups/statusActions'
import {formatTime} from '../groups/threadFormat'
import {t} from '../i18n'
import styles from './QueuePage.module.css'

interface IQueueRowProps {
  item: IRequestQueueItem
  group?: IGroupSummary
  currentUserId?: string
  currentRole?: Role
  onUpdateStatus: (groupKey: string, messageId: string, status: Status) => void
}

export function QueueRow({item, group, currentUserId, currentRole, onUpdateStatus}: IQueueRowProps) {
  const {message, groupKey} = item
  const actions =
    message.status && currentRole
      ? actionsFor(message.status, currentRole, message.sender.id === currentUserId)
      : []

  return (
    <div className={styles.fdRow}>
      <span className={styles.fdMember} data-label={t('queue.colMember')}>
        <span className={styles.fdAvatar} aria-hidden="true">
          {message.sender.name.charAt(0).toUpperCase()}
        </span>
        {message.sender.name}
      </span>
      <span className={styles.fdGroupCell} data-label={t('queue.colGroup')}>
        {group ? `${group.emoji} ${t(group.nameKey)}` : groupKey}
      </span>
      <span className={styles.fdRequest} data-label={t('queue.colRequest')}>
        {message.summary}
      </span>
      <span className={styles.fdTimeCell} data-label={t('queue.colTime')}>
        {formatTime(message.createdAt)}
      </span>
      <span className={styles.fdStatusCell} data-label={t('queue.colStatus')}>
        {message.status && (
          <span className={styles.fdStatusChip} data-status={message.status.toLowerCase()}>
            {t(`status.${message.status.toLowerCase()}`)}
          </span>
        )}
      </span>
      <span className={styles.fdActionsCell} data-label={t('queue.colActions')}>
        {actions.map(action => (
          <WuButton
            key={action.next}
            size="sm"
            variant={action.primary ? 'primary' : 'outline'}
            onClick={() => onUpdateStatus(groupKey, message.id, action.next)}
          >
            {action.label}
          </WuButton>
        ))}
      </span>
    </div>
  )
}
