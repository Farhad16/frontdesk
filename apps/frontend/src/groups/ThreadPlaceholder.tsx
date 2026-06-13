import {WuButton} from '@npm-questionpro/wick-ui-lib'
import {useNavigate, useParams} from 'react-router-dom'
import {t} from '../i18n'
import styles from './ThreadPlaceholder.module.css'
import {useGroups} from './useGroups'

export function ThreadPlaceholder() {
  const {key = ''} = useParams()
  const navigate = useNavigate()
  const {groups} = useGroups()
  const group = groups.find(item => item.key === key)

  return (
    <div className={styles.fdThread}>
      <header className={styles.fdThreadBar}>
        <WuButton
          variant="iconOnly"
          className={styles.fdThreadBack}
          Icon={<span aria-hidden="true">‹</span>}
          aria-label={t('groups.back')}
          onClick={() => navigate('/groups')}
        />
        <span className={styles.fdThreadEmoji} aria-hidden="true">
          {group?.emoji}
        </span>
        <span className={styles.fdThreadName}>{group ? t(group.nameKey) : key}</span>
      </header>
      <div className={styles.fdThreadBody}>{t('groups.threadComingSoon')}</div>
    </div>
  )
}
