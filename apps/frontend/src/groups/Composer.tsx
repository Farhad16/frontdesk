import {WuButton, WuInput} from '@npm-questionpro/wick-ui-lib'
import {useState, type FormEvent} from 'react'
import {useAuth} from '../auth/AuthContext'
import {t} from '../i18n'
import {RequestBuilder} from './RequestBuilder'
import {useCompose} from './useCompose'
import {useGroupConfig} from './useGroupConfig'
import styles from './Composer.module.css'

export function Composer({groupKey, actionsOnly = false}: {groupKey: string; actionsOnly?: boolean}) {
  const {user} = useAuth()
  const config = useGroupConfig(groupKey)
  const {sending, sendText, sendQuick, sendRequest, sendLunchOff} = useCompose(groupKey)
  const [draft, setDraft] = useState('')
  const [builderOpen, setBuilderOpen] = useState(false)
  const [dateOpen, setDateOpen] = useState(false)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sentAt, setSentAt] = useState(0)

  const roleVisible = (visibleToRole?: string) => !visibleToRole || visibleToRole === user?.role
  const hasCatalog = Boolean(config?.catalog && config.catalog.length > 0)
  const quickActions = (config?.quickActions ?? []).filter(
    action => action.messageKey && !action.opensDatePicker && roleVisible(action.visibleToRole),
  )
  const dateAction = (config?.quickActions ?? []).find(
    action => action.opensDatePicker && roleVisible(action.visibleToRole),
  )

  function flashSent() {
    setSentAt(Date.now())
    setTimeout(() => setSentAt(at => (Date.now() - at >= 1900 ? 0 : at)), 2000)
  }

  async function postQuick(key: string) {
    await sendQuick(key)
    flashSent()
  }

  async function postLunchOff() {
    if (!from) return
    await sendLunchOff(from, to || from)
    setDateOpen(false)
    setFrom('')
    setTo('')
    flashSent()
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const text = draft.trim()
    if (!text || sending) return
    setDraft('')
    try {
      await sendText(text)
    } catch {
      setDraft(text)
    }
  }

  return (
    <>
      {(quickActions.length > 0 || dateAction) && (
        <div className={styles.quickRow}>
          {quickActions.map(action => (
            <button
              key={action.key}
              type="button"
              className={styles.quickBtn}
              disabled={sending}
              onClick={() => void postQuick(action.key)}
            >
              {t(`quick.${action.key}`)}
            </button>
          ))}
          {dateAction && (
            <button
              type="button"
              className={styles.quickBtn}
              onClick={() => setDateOpen(open => !open)}
            >
              {t(`quick.${dateAction.key}`)}
            </button>
          )}
          {sentAt > 0 && <span className={styles.sent}>{t('thread.sent')}</span>}
        </div>
      )}

      {dateOpen && (
        <div className={styles.dateRow}>
          <label className={styles.dateField}>
            {t('lunchoff.from')}
            <input type="date" value={from} onChange={event => setFrom(event.target.value)} />
          </label>
          <label className={styles.dateField}>
            {t('lunchoff.to')}
            <input type="date" value={to} onChange={event => setTo(event.target.value)} />
          </label>
          <WuButton size="sm" variant="primary" disabled={!from} onClick={postLunchOff}>
            {t('lunchoff.post')}
          </WuButton>
        </div>
      )}

      {!actionsOnly && (
        <form className={styles.composer} onSubmit={handleSubmit}>
          {hasCatalog && (
            <WuButton
              type="button"
              variant="iconOnly"
              className={styles.composerAdd}
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
      )}

      {builderOpen && config && (
        <RequestBuilder
          config={config}
          sending={sending}
          onClose={() => setBuilderOpen(false)}
          onSend={sendRequest}
        />
      )}
    </>
  )
}
