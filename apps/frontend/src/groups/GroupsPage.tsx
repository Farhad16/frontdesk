import {WuButton} from '@npm-questionpro/wick-ui-lib'
import {Outlet, useMatch} from 'react-router-dom'
import {useAuth} from '../auth/AuthContext'
import {t} from '../i18n'
import {GroupList} from './GroupList'
import styles from './GroupsPage.module.css'

export function GroupsPage() {
  const {user, logout} = useAuth()
  const hasSelection = useMatch('/groups/:key') !== null

  return (
    <div className={styles.fdShell} data-selection={hasSelection}>
      <header className={styles.fdHeader}>
        <div className={styles.fdHeaderBrand}>
          <img src="/questionpro-logo.svg" alt="QuestionPro" />
          <span className={styles.fdHeaderTitle}>{t('auth.brand')}</span>
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

      <div className={styles.fdBody}>
        <aside className={styles.fdSidebar}>
          <GroupList />
        </aside>
        <main className={styles.fdMain}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
