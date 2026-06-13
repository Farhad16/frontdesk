import {t} from '../i18n'
import styles from './GroupsEmpty.module.css'

export function GroupsEmpty() {
  return <div className={styles.fdGroupsEmpty}>{t('groups.pickPrompt')}</div>
}
