import type {Availability, NotificationPref} from '@frontdesk/types'
import {WuButton, WuInput} from '@npm-questionpro/wick-ui-lib'
import {useState} from 'react'
import {useAuth} from '../auth/AuthContext'
import {AppHeader} from '../components/AppHeader'
import {t, type Locale} from '../i18n'
import {useLanguage} from '../i18n/LanguageContext'
import {enablePush, getPushStatus, type PushStatus} from '../lib/push'
import styles from './SettingsPage.module.css'

const NOTIF_OPTIONS: Array<{value: NotificationPref; labelKey: string}> = [
  {value: 'ALL', labelKey: 'settings.notifAll'},
  {value: 'NEW_MESSAGES', labelKey: 'settings.notifNewMessages'},
  {value: 'MY_UPDATES', labelKey: 'settings.notifMyUpdates'},
  {value: 'OFF', labelKey: 'settings.notifOff'},
]

const AVAILABILITY_OPTIONS: Array<{value: Availability; labelKey: string}> = [
  {value: 'AVAILABLE', labelKey: 'settings.availabilityAvailable'},
  {value: 'BUSY', labelKey: 'settings.availabilityBusy'},
  {value: 'AWAY', labelKey: 'settings.availabilityAway'},
]

export function SettingsPage() {
  const {user, updateUser} = useAuth()
  const {setLocale} = useLanguage()
  const [addOnDraft, setAddOnDraft] = useState('')
  const [pushStatus, setPushStatus] = useState<PushStatus>(() => getPushStatus())

  if (!user) return null
  const isStaff = user.role === 'STAFF'

  async function handleEnablePush() {
    setPushStatus(await enablePush())
  }

  function changeLanguage(locale: Locale) {
    setLocale(locale)
    void updateUser({locale})
  }

  function addAddOn() {
    const value = addOnDraft.trim()
    if (!value || user!.addOns.includes(value)) return
    setAddOnDraft('')
    void updateUser({addOns: [...user!.addOns, value]})
  }

  function removeAddOn(value: string) {
    void updateUser({addOns: user!.addOns.filter(item => item !== value)})
  }

  return (
    <div className={styles.fdSettings}>
      <AppHeader />
      <div className={styles.fdSettingsBody}>
        <h1 className={styles.fdSettingsTitle}>{t('settings.title')}</h1>

        <section className={styles.fdCard}>
          <h2 className={styles.fdCardTitle}>{t('settings.profile')}</h2>
          <div className={styles.fdProfile}>
            <span className={styles.fdProfileAvatar}>{user.name.charAt(0).toUpperCase()}</span>
            <div>
              <div className={styles.fdProfileName}>{user.name}</div>
              <div className={styles.fdProfileMeta}>{user.email}</div>
              <div className={styles.fdProfileMeta}>
                {t('settings.role')}: {user.role}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.fdCard}>
          <h2 className={styles.fdCardTitle}>{t('settings.language')}</h2>
          <div className={styles.fdChips}>
            <button
              type="button"
              className={user.locale === 'en' ? `${styles.fdChip} ${styles.fdChipOn}` : styles.fdChip}
              onClick={() => changeLanguage('en')}
            >
              {t('settings.languageEn')}
            </button>
            <button
              type="button"
              className={user.locale === 'bn' ? `${styles.fdChip} ${styles.fdChipOn}` : styles.fdChip}
              onClick={() => changeLanguage('bn')}
            >
              {t('settings.languageBn')}
            </button>
          </div>
        </section>

        <section className={styles.fdCard}>
          <h2 className={styles.fdCardTitle}>{t('settings.notifications')}</h2>
          <div className={styles.fdPushRow}>
            {pushStatus === 'granted' ? (
              <span className={styles.fdPushOn}>✓ {t('settings.notificationsEnabled')}</span>
            ) : pushStatus === 'denied' ? (
              <span className={styles.fdNote}>{t('settings.notificationsBlocked')}</span>
            ) : pushStatus === 'unsupported' ? null : (
              <WuButton variant="primary" size="sm" onClick={handleEnablePush}>
                {t('settings.enableNotifications')}
              </WuButton>
            )}
          </div>
          {isStaff ? (
            <p className={styles.fdNote}>{t('settings.notifStaffForced')}</p>
          ) : (
            <div className={styles.fdRadioList}>
              {NOTIF_OPTIONS.map(option => (
                <label key={option.value} className={styles.fdRadio}>
                  <input
                    type="radio"
                    name="notif"
                    checked={user.notificationPref === option.value}
                    onChange={() => void updateUser({notificationPref: option.value})}
                  />
                  {t(option.labelKey)}
                </label>
              ))}
            </div>
          )}
        </section>

        {isStaff && (
          <section className={styles.fdCard}>
            <h2 className={styles.fdCardTitle}>{t('settings.availability')}</h2>
            <div className={styles.fdChips}>
              {AVAILABILITY_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={
                    user.availability === option.value
                      ? `${styles.fdChip} ${styles.fdChipOn}`
                      : styles.fdChip
                  }
                  onClick={() => void updateUser({availability: option.value})}
                >
                  {t(option.labelKey)}
                </button>
              ))}
            </div>
          </section>
        )}

        <section className={styles.fdCard}>
          <h2 className={styles.fdCardTitle}>{t('settings.addOns')}</h2>
          <p className={styles.fdNote}>{t('settings.addOnsHint')}</p>
          <div className={styles.fdChips}>
            {user.addOns.map(value => (
              <span key={value} className={styles.fdAddOn}>
                {value}
                <button type="button" aria-label="remove" onClick={() => removeAddOn(value)}>
                  ✕
                </button>
              </span>
            ))}
          </div>
          <div className={styles.fdInline}>
            <WuInput
              variant="outlined"
              type="text"
              placeholder={t('settings.addOnPlaceholder')}
              value={addOnDraft}
              onChange={event => setAddOnDraft(event.target.value)}
            />
            <WuButton variant="outline" size="sm" disabled={!addOnDraft.trim()} onClick={addAddOn}>
              {t('settings.add')}
            </WuButton>
          </div>
        </section>
      </div>
    </div>
  )
}
