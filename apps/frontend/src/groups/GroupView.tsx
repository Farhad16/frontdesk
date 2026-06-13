import {WuButton} from '@npm-questionpro/wick-ui-lib'
import {useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useAuth} from '../auth/AuthContext'
import {ViewToggle} from '../components/ViewToggle'
import {t} from '../i18n'
import {getViewMode, setViewMode, type ViewMode} from '../lib/viewMode'
import {QueueView} from '../queue/QueueView'
import styles from './GroupView.module.css'
import {Thread} from './Thread'
import {useGroups} from './useGroups'

export function GroupView() {
  const {key = ''} = useParams()
  const navigate = useNavigate()
  const {user} = useAuth()
  const {groups} = useGroups()
  const [mode, setMode] = useState<ViewMode>(() => getViewMode(user?.role))

  const group = groups.find(item => item.key === key)

  function change(next: ViewMode) {
    setMode(next)
    setViewMode(next)
  }

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
        <span className={styles.fdToggleSlot}>
          <ViewToggle mode={mode} onChange={change} />
        </span>
      </header>

      <div className={styles.fdViewBody}>{mode === 'queue' ? <QueueView /> : <Thread />}</div>
    </div>
  )
}
