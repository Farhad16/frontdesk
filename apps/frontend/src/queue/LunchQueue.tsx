import type {ILunchOffPayload, IMessage} from '@frontdesk/types'
import {WuInput, WuLoader, WuSelect} from '@npm-questionpro/wick-ui-lib'
import {useState} from 'react'
import {useParams} from 'react-router-dom'
import {formatTime} from '../groups/threadFormat'
import {useThread} from '../groups/useThread'
import {t} from '../i18n'
import {
  activeOfficeOff,
  deriveOffEntries,
  latestStaffAsk,
  toDateKey,
  weekdayDateKey,
} from '../lib/lunch'
import styles from './QueuePage.module.css'

const DAYS = [
  {value: '1', label: t('day.mon')},
  {value: '2', label: t('day.tue')},
  {value: '3', label: t('day.wed')},
  {value: '4', label: t('day.thu')},
  {value: '5', label: t('day.fri')},
]

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString([], {day: 'numeric', month: 'short'})
}

function offText(message: IMessage): string {
  const payload = message.payload as ILunchOffPayload | undefined
  if (payload && 'lunchOff' in payload) {
    const {from, to} = payload.lunchOff
    return from === to
      ? `${t('lunchoff.on')} ${fmtDate(from)}`
      : `${t('lunchoff.from')} ${fmtDate(from)} ${t('lunchoff.to')} ${fmtDate(to)}`
  }
  return t('lunch.msg.offToday')
}

export function LunchQueue() {
  const {key = ''} = useParams()
  const {messages, loading, error} = useThread(key)
  const [date, setDate] = useState(() => toDateKey(new Date()))
  const [name, setName] = useState('')

  const office = activeOfficeOff(messages, date)
  const staffAsk = latestStaffAsk(messages, date)
  const entries = deriveOffEntries(messages, date).filter(entry =>
    entry.member.name.toLowerCase().includes(name.trim().toLowerCase()),
  )

  return (
    <div className={styles.fdQueue}>
      <div className={styles.fdQueueFilters}>
        <div className={styles.fdChips}>
          <label className={styles.fdDateField}>
            {t('lunch.filterDate')}
            <input type="date" value={date} onChange={event => setDate(event.target.value)} />
          </label>
          <WuSelect
            data={DAYS}
            accessorKey={{value: 'value', label: 'label'}}
            placeholder={t('lunch.filterDay')}
            onSelect={value => {
              const day = Array.isArray(value) ? value[0] : value
              if (day) setDate(weekdayDateKey(Number(day.value)))
            }}
          />
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
        {office && (
          <div className={styles.fdPinned}>
            📌 {t('lunch.officePinned')} · {offText(office)}
          </div>
        )}

        {loading && (
          <div className={styles.fdQueueState}>
            <WuLoader size="sm" variant="spinner" />
          </div>
        )}
        {error && <div className={styles.fdQueueState}>{error}</div>}

        {!loading && !error && (
          <>
            <h3 className={styles.fdSectionTitle}>{t('msgq.staff')}</h3>
            {staffAsk && staffAsk.text ? (
              <div className={styles.fdTable}>
                <div className={styles.fdMsgRow}>
                  <span className={styles.fdMember} data-label={t('queue.colMember')}>
                    <span className={styles.fdAvatar} aria-hidden="true">
                      {staffAsk.sender.name.charAt(0).toUpperCase()}
                    </span>
                    {staffAsk.sender.name}
                  </span>
                  <span className={styles.fdRequest} data-label={t('queue.colRequest')}>
                    {t(staffAsk.text)}
                  </span>
                  <span className={styles.fdTimeCell} data-label={t('queue.colTime')}>
                    {formatTime(staffAsk.createdAt)}
                  </span>
                </div>
              </div>
            ) : (
              <p className={styles.fdSectionEmpty}>{t('msgq.empty')}</p>
            )}

            <h3 className={styles.fdSectionTitle}>{t('msgq.members')}</h3>
            {entries.length === 0 ? (
              <p className={styles.fdSectionEmpty}>{t('lunch.noneOff')}</p>
            ) : (
              <div className={styles.fdTable}>
                {entries.map(entry => (
                  <div key={entry.member.id} className={styles.fdMsgRow}>
                    <span className={styles.fdMember} data-label={t('queue.colMember')}>
                      <span className={styles.fdAvatar} aria-hidden="true">
                        {entry.member.name.charAt(0).toUpperCase()}
                      </span>
                      {entry.member.name}
                    </span>
                    <span className={styles.fdRequest} data-label={t('queue.colRequest')}>
                      🚫 {offText(entry.message)}
                    </span>
                    <span className={styles.fdTimeCell} data-label={t('queue.colTime')}>
                      {formatTime(entry.message.createdAt)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
