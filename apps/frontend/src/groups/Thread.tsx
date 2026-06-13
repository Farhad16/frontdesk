import {WuLoader} from '@npm-questionpro/wick-ui-lib'
import {Fragment, useEffect, useRef} from 'react'
import {useParams} from 'react-router-dom'
import {useAuth} from '../auth/AuthContext'
import {t} from '../i18n'
import {Composer} from './Composer'
import {MessageBubble} from './MessageBubble'
import {dayKey, dayLabel} from './threadFormat'
import {useThread} from './useThread'
import styles from './Thread.module.css'

export function Thread() {
  const {key = ''} = useParams()
  const {user} = useAuth()
  const {messages, loading, error, updateStatus, deleteMessage} = useThread(key)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bodyRef.current?.scrollTo({top: bodyRef.current.scrollHeight})
  }, [messages])

  let lastDay = ''

  return (
    <div className={styles.fdThread}>
      <div ref={bodyRef} className={styles.fdThreadBody}>
        {loading && (
          <div className={styles.fdThreadState}>
            <WuLoader size="sm" variant="spinner" />
          </div>
        )}
        {error && <div className={styles.fdThreadState}>{t('thread.loadError')}</div>}
        {!loading && !error && messages.length === 0 && (
          <div className={styles.fdThreadState}>{t('thread.empty')}</div>
        )}

        {messages.map(message => {
          const dKey = dayKey(message.createdAt)
          const newDay = dKey !== lastDay
          lastDay = dKey
          return (
            <Fragment key={message.id}>
              {newDay && (
                <div className={styles.fdDay}>
                  <span>{dayLabel(message.createdAt)}</span>
                </div>
              )}
              <MessageBubble
                message={message}
                isOwn={message.sender.id === user?.id}
                currentUserId={user?.id}
                currentRole={user?.role}
                onUpdateStatus={updateStatus}
                onDelete={deleteMessage}
              />
            </Fragment>
          )
        })}
      </div>

      <Composer groupKey={key} />
    </div>
  )
}
