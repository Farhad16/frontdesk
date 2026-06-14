import type {IGroupLastMessage} from '@frontdesk/types'
import {WuLoader} from '@npm-questionpro/wick-ui-lib'
import {useEffect, useReducer} from 'react'
import {NavLink} from 'react-router-dom'
import {t} from '../i18n'
import {getGroupReadAt, subscribeReads} from '../lib/reads'
import styles from './GroupList.module.css'
import {relativeTime} from './threadFormat'
import {useGroups} from './useGroups'

function previewText(last: IGroupLastMessage): string {
  const body =
    last.type === 'REQUEST'
      ? (last.summary ?? '')
      : last.type === 'QUICK' && last.text
        ? t(last.text)
        : (last.text ?? last.summary ?? '')
  return `${last.senderName}: ${body}`
}

export function GroupList() {
  const {groups, loading, error} = useGroups()
  const [, bump] = useReducer((n: number) => n + 1, 0)

  useEffect(() => subscribeReads(bump), [])

  const visible = groups

  return (
    <div className={styles.fdGroupList}>
      {loading && (
        <div className={styles.fdGroupState}>
          <WuLoader size="sm" variant="spinner" />
        </div>
      )}

      {error && <div className={styles.fdGroupState}>{error}</div>}

      {!loading && !error && visible.length === 0 && (
        <div className={styles.fdGroupState}>{t('groups.noResults')}</div>
      )}

      <nav className={styles.fdGroupItems}>
        {visible.map(group => {
          const last = group.lastMessage
          const readAt = getGroupReadAt(group.key)
          const unread = Boolean(last && (!readAt || last.createdAt > readAt))
          return (
            <NavLink
              key={group.key}
              to={`/groups/${group.key}`}
              title={t(group.nameKey)}
              className={({isActive}) =>
                isActive ? `${styles.fdGroupItem} ${styles.fdGroupItemActive}` : styles.fdGroupItem
              }
            >
              <span className={styles.fdGroupEmoji} aria-hidden="true">
                {group.emoji}
              </span>
              <span className={styles.fdGroupText}>
                <span className={styles.fdGroupTop}>
                  <span className={styles.fdGroupName}>{t(group.nameKey)}</span>
                  {last && <span className={styles.fdGroupTime}>{relativeTime(last.createdAt)}</span>}
                </span>
                <span className={styles.fdGroupBottom}>
                  <span className={styles.fdGroupPreview}>
                    {last ? previewText(last) : t('groups.noMessages')}
                  </span>
                  {unread && <span className={styles.fdGroupDot} aria-label="unread" />}
                </span>
              </span>
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
