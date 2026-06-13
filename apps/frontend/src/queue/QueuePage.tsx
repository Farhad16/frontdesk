import type {Status} from '@frontdesk/types'
import {WuInput, WuLoader} from '@npm-questionpro/wick-ui-lib'
import {useMemo, useState} from 'react'
import {AppHeader} from '../components/AppHeader'
import {useAuth} from '../auth/AuthContext'
import {useGroups} from '../groups/useGroups'
import {dayKey} from '../groups/threadFormat'
import {t} from '../i18n'
import {QueueRow} from './QueueRow'
import {useQueue} from './useQueue'
import styles from './QueuePage.module.css'

const STATUSES: Array<Status | 'ALL'> = ['ALL', 'PENDING', 'IN_PROGRESS', 'DONE', 'CANCELLED']

export function QueuePage() {
  const {user} = useAuth()
  const {groups} = useGroups()
  const {items, loading, error, updateStatus} = useQueue()
  const [status, setStatus] = useState<Status | 'ALL'>('ALL')
  const [groupKey, setGroupKey] = useState('ALL')
  const [name, setName] = useState('')
  const [todayOnly, setTodayOnly] = useState(false)

  const todayKey = dayKey(new Date().toISOString())

  const visible = useMemo(() => {
    return items.filter(item => {
      if (status !== 'ALL' && item.message.status !== status) return false
      if (groupKey !== 'ALL' && item.groupKey !== groupKey) return false
      if (todayOnly && dayKey(item.message.createdAt) !== todayKey) return false
      if (name.trim() && !item.message.sender.name.toLowerCase().includes(name.trim().toLowerCase()))
        return false
      return true
    })
  }, [items, status, groupKey, name, todayOnly, todayKey])

  return (
    <div className={styles.fdQueue}>
      <AppHeader />

      <div className={styles.fdQueueFilters}>
        <div className={styles.fdChips}>
          {STATUSES.map(value => (
            <button
              key={value}
              type="button"
              className={value === status ? `${styles.fdChip} ${styles.fdChipOn}` : styles.fdChip}
              onClick={() => setStatus(value)}
            >
              {value === 'ALL' ? t('queue.filterAllStatus') : t(`status.${value.toLowerCase()}`)}
            </button>
          ))}
        </div>
        <div className={styles.fdChips}>
          <button
            type="button"
            className={groupKey === 'ALL' ? `${styles.fdChip} ${styles.fdChipOn}` : styles.fdChip}
            onClick={() => setGroupKey('ALL')}
          >
            {t('queue.filterAllGroups')}
          </button>
          {groups.map(group => (
            <button
              key={group.key}
              type="button"
              className={group.key === groupKey ? `${styles.fdChip} ${styles.fdChipOn}` : styles.fdChip}
              onClick={() => setGroupKey(group.key)}
            >
              {group.emoji} {t(group.nameKey)}
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
              <span>{t('queue.colGroup')}</span>
              <span>{t('queue.colRequest')}</span>
              <span>{t('queue.colTime')}</span>
              <span>{t('queue.colStatus')}</span>
              <span>{t('queue.colActions')}</span>
            </div>
            {visible.map(item => (
              <QueueRow
                key={item.message.id}
                item={item}
                group={groups.find(group => group.key === item.groupKey)}
                currentUserId={user?.id}
                currentRole={user?.role}
                onUpdateStatus={updateStatus}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
