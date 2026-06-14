import {WuButton} from '@npm-questionpro/wick-ui-lib'
import {useState} from 'react'
import {Outlet, useLocation, useNavigate} from 'react-router-dom'
import {useAuth} from '../auth/AuthContext'
import {t} from '../i18n'
import {GroupList} from './GroupList'
import styles from './GroupsPage.module.css'

const COLLAPSE_KEY = 'fd.sidebarCollapsed'

export function GroupsPage() {
  const hasSelection = useLocation().pathname !== '/groups'
  const navigate = useNavigate()
  const {user, logout} = useAuth()
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem(COLLAPSE_KEY) === '1',
  )

  function toggleCollapsed() {
    setCollapsed(prev => {
      const next = !prev
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      return next
    })
  }

  return (
    <div className={styles.fdShell} data-selection={hasSelection}>
      <aside className={styles.fdSidebar} data-collapsed={collapsed}>
        <div className={styles.fdSideTop}>
          <button
            type="button"
            className={styles.fdBrand}
            onClick={() => navigate('/groups')}
            aria-label={t('auth.brand')}
          >
            <img src="/questionpro-logo.svg" alt="" />
            <span className={styles.fdBrandTitle}>{t('auth.brand')}</span>
          </button>
          <WuButton
            type="button"
            variant="iconOnly"
            className={styles.fdCollapse}
            aria-label={t('groups.toggleSidebar')}
            aria-pressed={collapsed}
            Icon={
              <span
                className={collapsed ? 'wm-left-panel-open' : 'wm-left-panel-close'}
                aria-hidden="true"
              />
            }
            onClick={toggleCollapsed}
          />
        </div>

        <GroupList />

        <div className={styles.fdSideBottom}>
          <div className={styles.fdProfile} title={`${user?.name}\n${user?.email}`}>
            <span className={styles.fdProfileAvatar} aria-hidden="true">
              {user?.photoUrl ? (
                <img src={user.photoUrl} alt="" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </span>
            <span className={styles.fdProfileMeta}>
              <span className={styles.fdProfileName}>{user?.name}</span>
              <span className={styles.fdProfileEmail}>{user?.email}</span>
            </span>
          </div>
          <button
            type="button"
            className={styles.fdSideAction}
            title={t('settings.title')}
            onClick={() => navigate('/settings')}
          >
            <span className="wm-settings" aria-hidden="true" />
            <span className={styles.fdSideActionLabel}>{t('settings.title')}</span>
          </button>
          <button
            type="button"
            className={styles.fdSideAction}
            title={t('home.logout')}
            onClick={() => void logout()}
          >
            <span className="wm-logout" aria-hidden="true" />
            <span className={styles.fdSideActionLabel}>{t('home.logout')}</span>
          </button>
        </div>
      </aside>

      <main className={styles.fdMain}>
        <Outlet />
      </main>
    </div>
  )
}
