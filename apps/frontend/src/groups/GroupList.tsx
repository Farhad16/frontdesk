import {WuInput, WuLoader} from '@npm-questionpro/wick-ui-lib'
import {useState} from 'react'
import {NavLink} from 'react-router-dom'
import {t} from '../i18n'
import styles from './GroupList.module.css'
import {useGroups} from './useGroups'

export function GroupList() {
  const {groups, loading, error} = useGroups()
  const [query, setQuery] = useState('')

  const visible = groups.filter(group =>
    t(group.nameKey).toLowerCase().includes(query.trim().toLowerCase()),
  )

  return (
    <div className={styles.fdGroupList}>
      <div className={styles.fdGroupSearch}>
        <WuInput
          variant="outlined"
          type="search"
          placeholder={t('groups.searchPlaceholder')}
          value={query}
          onChange={event => setQuery(event.target.value)}
        />
      </div>

      {loading && (
        <div className={styles.fdGroupState}>
          <WuLoader size="sm" variant="spinner" />
        </div>
      )}

      {error && <div className={styles.fdGroupState}>{error}</div>}

      {!loading && !error && visible.length === 0 && (
        <div className={styles.fdGroupState}>{t('groups.noResults')}</div>
      )}

      <nav className={styles.fdGroupItems}>
        {visible.map(group => (
          <NavLink
            key={group.key}
            to={`/groups/${group.key}`}
            className={({isActive}) =>
              isActive ? `${styles.fdGroupItem} ${styles.fdGroupItemActive}` : styles.fdGroupItem
            }
          >
            <span className={styles.fdGroupEmoji} aria-hidden="true">
              {group.emoji}
            </span>
            <span className={styles.fdGroupText}>
              <span className={styles.fdGroupName}>{t(group.nameKey)}</span>
              <span className={styles.fdGroupPreview}>{t('groups.noMessages')}</span>
            </span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
