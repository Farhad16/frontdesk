import {WuButton} from '@npm-questionpro/wick-ui-lib'
import {useLocation, useNavigate} from 'react-router-dom'
import {useAuth} from '../auth/AuthContext'
import {t} from '../i18n'
import {setViewMode} from '../lib/viewMode'
import styles from './AppHeader.module.css'

export function AppHeader() {
  const {user, logout} = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const onQueue = location.pathname.startsWith('/queue')

  function go(mode: 'thread' | 'queue') {
    setViewMode(mode)
    navigate(mode === 'queue' ? '/queue' : '/groups')
  }

  return (
    <header className={styles.fdHeader}>
      <div className={styles.fdHeaderBrand}>
        <img src="/questionpro-logo.svg" alt="QuestionPro" />
        <span className={styles.fdHeaderTitle}>{t('auth.brand')}</span>
      </div>

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

      <div className={styles.fdHeaderUser}>
        <span className={styles.fdAvatar} aria-hidden="true">
          {user?.name?.charAt(0).toUpperCase()}
        </span>
        <WuButton variant="outline" size="sm" onClick={logout}>
          {t('home.logout')}
        </WuButton>
      </div>
    </header>
  )
}
