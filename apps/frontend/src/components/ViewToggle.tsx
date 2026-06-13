import {useLocation, useNavigate} from 'react-router-dom'
import {t} from '../i18n'
import {setViewMode} from '../lib/viewMode'
import styles from './ViewToggle.module.css'

export function ViewToggle() {
  const navigate = useNavigate()
  const location = useLocation()
  const onQueue = location.pathname.startsWith('/groups/queue')

  function go(mode: 'thread' | 'queue') {
    setViewMode(mode)
    navigate(mode === 'queue' ? '/groups/queue' : '/groups')
  }

  return (
    <div className={styles.fdToggle} role="tablist">
      <button
        type="button"
        className={!onQueue ? `${styles.fdToggleBtn} ${styles.fdToggleOn}` : styles.fdToggleBtn}
        onClick={() => go('thread')}
      >
        {t('view.thread')}
      </button>
      <button
        type="button"
        className={onQueue ? `${styles.fdToggleBtn} ${styles.fdToggleOn}` : styles.fdToggleBtn}
        onClick={() => go('queue')}
      >
        {t('view.queue')}
      </button>
    </div>
  )
}
