import {Outlet, useMatch} from 'react-router-dom'
import {AppHeader} from '../components/AppHeader'
import {GroupList} from './GroupList'
import styles from './GroupsPage.module.css'

export function GroupsPage() {
  const hasSelection = useMatch('/groups/:key') !== null

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
