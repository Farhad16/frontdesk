import {WuButton, WuInput, WuLoader} from '@npm-questionpro/wick-ui-lib'
import {Fragment, useEffect, useRef, useState, type FormEvent} from 'react'
import {useParams} from 'react-router-dom'
import {useAuth} from '../auth/AuthContext'
import {t} from '../i18n'
import {MessageBubble} from './MessageBubble'
import {RequestBuilder} from './RequestBuilder'
import {dayKey, dayLabel} from './threadFormat'
import {useGroupConfig} from './useGroupConfig'
import {useThread} from './useThread'
import styles from './Thread.module.css'

export function Thread() {
  const {key = ''} = useParams()
  const {user} = useAuth()
  const config = useGroupConfig(key)
  const {messages, loading, error, sending, send, sendRequest, updateStatus} = useThread(key)
  const [draft, setDraft] = useState('')
  const [builderOpen, setBuilderOpen] = useState(false)
  const bodyRef = useRef<HTMLDivElement>(null)

  const hasCatalog = Boolean(config?.catalog && config.catalog.length > 0)

  useEffect(() => {
    bodyRef.current?.scrollTo({top: bodyRef.current.scrollHeight})
  }, [messages])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || sending) return
    setDraft('')
    try {
      await send(text)
    } catch {
      setDraft(text)
    }
  }

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
          const key = dayKey(message.createdAt)
          const newDay = key !== lastDay
          lastDay = key
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
              />
            </Fragment>
          )
        })}
      </div>

      <form className={styles.fdComposer} onSubmit={handleSubmit}>
        {hasCatalog && (
          <WuButton
            type="button"
            variant="iconOnly"
            className={styles.fdComposerAdd}
            Icon={<span aria-hidden="true">＋</span>}
            aria-label={t('builder.newRequest')}
            onClick={() => setBuilderOpen(true)}
          />
        )}
        <WuInput
          variant="outlined"
          type="text"
          placeholder={t('thread.inputPlaceholder')}
          value={draft}
          onChange={event => setDraft(event.target.value)}
        />
        <WuButton type="submit" variant="primary" loading={sending} disabled={!draft.trim()}>
          {t('thread.send')}
        </WuButton>
      </form>

      {builderOpen && config && (
        <RequestBuilder
          config={config}
          sending={sending}
          onClose={() => setBuilderOpen(false)}
          onSend={sendRequest}
        />
      )}
    </div>
  )
}
