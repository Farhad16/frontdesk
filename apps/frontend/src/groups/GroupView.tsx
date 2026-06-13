import {WuButton} from '@npm-questionpro/wick-ui-lib'
import {useEffect} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useAuth} from '../auth/AuthContext'
import {t} from '../i18n'
import {markGroupRead} from '../lib/reads'
import {QueueView} from '../queue/QueueView'
import styles from './GroupView.module.css'
import {Thread} from './Thread'
import {useGroupConfig} from './useGroupConfig'
import {useGroups} from './useGroups'

export function GroupView() {
  const {key = ''} = useParams()
  const navigate = useNavigate()
  const {user} = useAuth()
  const {groups} = useGroups()
  const config = useGroupConfig(key)

  useEffect(() => {
    if (key) markGroupRead(key)
  }, [key])

  const group = groups.find(item => item.key === key)
  const hasCatalog = Boolean(config?.catalog && config.catalog.length > 0)
  // Staff get the queue only where there are orders to fulfil (catalog groups);
  // chat-only groups (e.g. Lunch) show the thread so posts are visible.
  const showQueue = user?.role === 'STAFF' && hasCatalog

  return (
    <div className={styles.fdGroupView}>
      <header className={styles.fdBar}>
        <WuButton
          variant="iconOnly"
          className={styles.fdBack}
          Icon={<span aria-hidden="true">‹</span>}
          aria-label={t('groups.back')}
          onClick={() => navigate('/groups')}
        />
        <span className={styles.fdEmoji} aria-hidden="true">
          {group?.emoji}
        </span>
        <span className={styles.fdName}>{group ? t(group.nameKey) : key}</span>
      </header>

      <div className={styles.fdViewBody}>{showQueue ? <QueueView /> : <Thread />}</div>
    </div>
  )
}
