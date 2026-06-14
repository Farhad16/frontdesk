import {WuButton} from '@npm-questionpro/wick-ui-lib'
import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {useAuth} from '../auth/AuthContext'
import {ViewToggle} from '../components/ViewToggle'
import {Composer} from './Composer'
import {t} from '../i18n'
import {markGroupRead} from '../lib/reads'
import {getViewMode, setViewMode, type ViewMode} from '../lib/viewMode'
import {LunchQueue} from '../queue/LunchQueue'
import {MessageQueue} from '../queue/MessageQueue'
import {QueueView} from '../queue/QueueView'
import {BreakfastMemberView} from './BreakfastMemberView'
import styles from './GroupView.module.css'
import {RequestMemberView} from './RequestMemberView'
import {Thread} from './Thread'
import {useGroupConfig} from './useGroupConfig'
import {useGroups} from './useGroups'

export function GroupView() {
  const {key = ''} = useParams()
  const navigate = useNavigate()
  const {user} = useAuth()
  const {groups} = useGroups()
  const config = useGroupConfig(key)
  const [mode, setMode] = useState<ViewMode>(() => getViewMode(user?.role))

  useEffect(() => {
    if (key) markGroupRead(key)
  }, [key])

  function changeMode(next: ViewMode) {
    setMode(next)
    setViewMode(next)
  }

  const group = groups.find(item => item.key === key)
  const isStaff = user?.role === 'STAFF'
  const tracksStatus = Boolean(config?.statusTracking)
  const hasCatalog = Boolean(config?.catalog && config.catalog.length > 0)
  const isLunch = Boolean(config) && !hasCatalog
  // Members get a Thread/Queue toggle on Lunch only.
  const memberToggle = !isStaff && isLunch

  let body
  if (isStaff) {
    if (tracksStatus) body = <QueueView /> // Requests: order queue + status
    else if (hasCatalog) body = <MessageQueue /> // Breakfast: staff/member sections
    else body = <LunchQueue /> // Lunch: date-driven off list
  } else if (tracksStatus) {
    body = <RequestMemberView /> // Requests member: order tool (no chat thread)
  } else if (hasCatalog) {
    body = <BreakfastMemberView /> // Breakfast member: thread + quick pick column
  } else if (memberToggle && mode === 'queue') {
    body = <LunchQueue />
  } else {
    body = <Thread pinnedLunchOff={isLunch} />
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
        {memberToggle && (
          <span className={styles.fdToggleSlot}>
            <ViewToggle mode={mode} onChange={changeMode} />
          </span>
        )}
      </header>

      <div className={styles.fdViewBody}>{body}</div>
      {isStaff && !tracksStatus && <Composer groupKey={key} actionsOnly />}
      {memberToggle && mode === 'queue' && <Composer groupKey={key} />}
    </div>
  )
}
