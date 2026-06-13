import {Outlet, useLocation} from 'react-router-dom'
import {AppHeader} from '../components/AppHeader'
import {GroupList} from './GroupList'
import styles from './GroupsPage.module.css'

export function GroupsPage() {
  const hasSelection = useLocation().pathname !== '/groups'

  return (
    <div className={styles.fdShell} data-selection={hasSelection}>
      <AppHeader />
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
