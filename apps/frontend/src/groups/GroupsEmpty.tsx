import {Navigate} from 'react-router-dom'
import {t} from '../i18n'
import styles from './GroupsEmpty.module.css'

export function GroupsEmpty() {
  // Desktop shows list + detail side by side, so land on Requests by default.
  // Mobile shows the group list at /groups, so leave it as the prompt.
  const isDesktop =
    typeof window !== 'undefined' && window.matchMedia('(min-width: 48rem)').matches
  if (isDesktop) return <Navigate to="requests" replace />

  return <div className={styles.fdGroupsEmpty}>{t('groups.pickPrompt')}</div>
}
