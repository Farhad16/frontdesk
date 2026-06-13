import {WuPopover} from '@npm-questionpro/wick-ui-lib'
import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {useAuth} from '../auth/AuthContext'
import {t} from '../i18n'
import {getViewMode} from '../lib/viewMode'
import styles from './AppHeader.module.css'

export function AppHeader() {
  const {user, logout} = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function goHome() {
    navigate(getViewMode(user?.role) === 'queue' ? '/groups/queue' : '/groups')
  }

  return (
    <header className={styles.fdHeader}>
      <button type="button" className={styles.fdHeaderBrand} onClick={goHome} aria-label={t('auth.brand')}>
        <img src="/questionpro-logo.svg" alt="QuestionPro" />
        <span className={styles.fdHeaderTitle}>{t('auth.brand')}</span>
      </button>

      <WuPopover
        open={menuOpen}
        onOpenChange={setMenuOpen}
        align="end"
        sideOffset={8}
        Trigger={
          <button type="button" className={styles.fdAvatar} aria-label={user?.name}>
            {user?.name?.charAt(0).toUpperCase()}
          </button>
        }
      >
        <div className={styles.fdMenu}>
          <div className={styles.fdMenuUser}>
            <div className={styles.fdMenuName}>{user?.name}</div>
            <div className={styles.fdMenuEmail}>{user?.email}</div>
          </div>
          <button
            type="button"
            className={styles.fdMenuItem}
            onClick={() => {
              setMenuOpen(false)
              navigate('/settings')
            }}
          >
            ⚙ {t('settings.title')}
          </button>
          <button
            type="button"
            className={styles.fdMenuItem}
            onClick={() => {
              setMenuOpen(false)
              void logout()
            }}
          >
            ⎋ {t('home.logout')}
          </button>
        </div>
      </WuPopover>
    </header>
  )
}
