import type {ICatalog, IUserPreference} from '@frontdesk/types'
import {t} from '../i18n'
import {locate, quickPickSummary} from './quickPick'
import {usePreferences} from './usePreferences'
import styles from './QuickPicks.module.css'

// One-tap quick pick strip. Same cards as the Requests member view, reused for
// any catalog group (Breakfast). Shows only picks whose item lives in THIS
// group's catalog, so a Requests saved pick never leaks into Breakfast.
export function QuickPicks({
  catalog,
  onPick,
  onAdd,
}: {
  catalog: ICatalog
  onPick: (pref: IUserPreference) => void
  onAdd: () => void
}) {
  const {preferences} = usePreferences()
  const picks = preferences.filter(pref => locate(catalog, pref.itemKey))

  return (
    <section className={styles.fdQuickSection}>
      <h2 className={styles.fdSectionTitle}>{t('member.quickPicks')}</h2>
      {picks.length === 0 ? (
        <button type="button" className={styles.fdQuickEmpty} onClick={onAdd}>
          <span className={styles.fdQuickEmptyIcon} aria-hidden="true">
            ＋
          </span>
          <span>{t('member.quickPicksEmpty')}</span>
        </button>
      ) : (
        <div className={styles.fdQuickRow}>
          {picks.map(pref => {
            const located = locate(catalog, pref.itemKey)
            if (!located) return null
            const {item} = located
            return (
              <button
                key={pref.itemKey}
                type="button"
                className={styles.fdQuickCard}
                onClick={() => onPick(pref)}
              >
                {pref.isDefault && (
                  <span className={styles.fdQuickStar} aria-hidden="true">
                    ★
                  </span>
                )}
                <span className={styles.fdQuickEmoji} aria-hidden="true">
                  {item.emoji}
                </span>
                <span className={styles.fdQuickMeta}>
                  <span className={styles.fdQuickName}>{t(item.labelKey)}</span>
                  <span className={styles.fdQuickSub}>{quickPickSummary(item, pref.options)}</span>
                </span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
