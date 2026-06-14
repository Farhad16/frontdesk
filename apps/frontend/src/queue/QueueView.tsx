import type {Status} from '@frontdesk/types'
import {WuInput, WuLoader} from '@npm-questionpro/wick-ui-lib'
import {useEffect, useMemo, useState} from 'react'
import {useParams} from 'react-router-dom'
import {useAuth} from '../auth/AuthContext'
import {Composer} from '../groups/Composer'
import {dayKey} from '../groups/threadFormat'
import {useGroupConfig} from '../groups/useGroupConfig'
import {t} from '../i18n'
import {QueueRow} from './QueueRow'
import {useQueue} from './useQueue'
import styles from './QueuePage.module.css'

const STATUS_VALUES: Status[] = ['PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED']

export function QueueView() {
  const {key = ''} = useParams()
  const {user} = useAuth()
  const config = useGroupConfig(key)
  const {items, loading, error, updateStatus, deleteMessage} = useQueue()
  const [statuses, setStatuses] = useState<Status[]>([])
  const [name, setName] = useState('')
  const [todayOnly, setTodayOnly] = useState(false)
  const [initialised, setInitialised] = useState(false)

  const tracksStatus = Boolean(config?.statusTracking)
  const todayKey = dayKey(new Date().toISOString())

  // Defaults once the group config arrives: status-tracking groups (Requests) →
  // Today + Pending + In progress; others (Breakfast) → Today only, no filters.
  useEffect(() => {
    if (!config || initialised) return
    setTodayOnly(true)
    if (config.statusTracking) setStatuses(['PENDING', 'IN_PROGRESS'])
    setInitialised(true)
  }, [config, initialised])

  function toggleStatus(value: Status) {
    setStatuses(prev => (prev.includes(value) ? prev.filter(s => s !== value) : [...prev, value]))
  }

  const visible = useMemo(() => {
    return items.filter(item => {
      if (item.groupKey !== key) return false
      if (statuses.length > 0 && (!item.message.status || !statuses.includes(item.message.status)))
        return false
      if (todayOnly && dayKey(item.message.createdAt) !== todayKey) return false
      if (name.trim() && !item.message.sender.name.toLowerCase().includes(name.trim().toLowerCase()))
        return false
      return true
    })
  }, [items, key, statuses, name, todayOnly, todayKey])

  return (
    <div className={styles.fdQueue}>
      {tracksStatus && (
        <div className={styles.fdQueueFilters}>
          <div className={styles.fdChips}>
            <button
              type="button"
              className={statuses.length === 0 ? `${styles.fdChip} ${styles.fdChipOn}` : styles.fdChip}
              onClick={() => setStatuses([])}
            >
              {t('queue.filterAllStatus')}
            </button>
            {STATUS_VALUES.map(value => (
              <button
                key={value}
                type="button"
                className={statuses.includes(value) ? `${styles.fdChip} ${styles.fdChipOn}` : styles.fdChip}
                onClick={() => toggleStatus(value)}
              >
                {t(`status.${value.toLowerCase()}`)}
              </button>
            ))}
            <button
              type="button"
              className={todayOnly ? `${styles.fdChip} ${styles.fdChipOn}` : styles.fdChip}
              onClick={() => setTodayOnly(value => !value)}
            >
              {t('queue.today')}
            </button>
          </div>
          <div className={styles.fdSearch}>
            <WuInput
              variant="outlined"
              type="search"
              placeholder={t('queue.searchPlaceholder')}
              value={name}
              onChange={event => setName(event.target.value)}
            />
          </div>
        </div>
      )}

      <div className={styles.fdQueueBody}>
        {loading && (
          <div className={styles.fdQueueState}>
            <WuLoader size="sm" variant="spinner" />
          </div>
        )}
        {error && <div className={styles.fdQueueState}>{error}</div>}
        {!loading && !error && visible.length === 0 && (
          <div className={styles.fdQueueState}>{t('queue.empty')}</div>
        )}

        {visible.length > 0 && (
          <div className={styles.fdTable}>
            <div className={`${styles.fdRow} ${styles.fdHead}`}>
              <span>{t('queue.colMember')}</span>
              <span>{t('queue.colRequest')}</span>
              <span>{t('queue.colTime')}</span>
              <span>{t('queue.colStatus')}</span>
              <span>{t('queue.colActions')}</span>
            </div>
            {visible.map(item => (
              <QueueRow
                key={item.message.id}
                item={item}
                currentUserId={user?.id}
                currentRole={user?.role}
                onUpdateStatus={updateStatus}
                onDelete={deleteMessage}
              />
            ))}
          </div>
        )}
      </div>

      <Composer groupKey={key} actionsOnly />
    </div>
  )
}
