import {WuButton, WuInput} from '@npm-questionpro/wick-ui-lib'
import {useState, type FormEvent} from 'react'
import {useAuth} from '../auth/AuthContext'
import {t} from '../i18n'
import {RequestBuilder} from './RequestBuilder'
import {useCompose} from './useCompose'
import {useGroupConfig} from './useGroupConfig'
import styles from './Composer.module.css'

export function Composer({groupKey}: {groupKey: string}) {
  const {user} = useAuth()
  const config = useGroupConfig(groupKey)
  const {sending, sendText, sendQuick, sendRequest} = useCompose(groupKey)
  const [draft, setDraft] = useState('')
  const [builderOpen, setBuilderOpen] = useState(false)

  const hasCatalog = Boolean(config?.catalog && config.catalog.length > 0)
  const quickActions = (config?.quickActions ?? []).filter(
    action =>
      action.messageKey &&
      !action.opensDatePicker &&
      (!action.visibleToRole || action.visibleToRole === user?.role),
  )

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
      {quickActions.length > 0 && (
        <div className={styles.quickRow}>
          {quickActions.map(action => (
            <button
              key={action.key}
              type="button"
              className={styles.quickBtn}
              disabled={sending}
              onClick={() => void sendQuick(action.key)}
            >
              {t(`quick.${action.key}`)}
            </button>
          ))}
        </div>
      )}

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
