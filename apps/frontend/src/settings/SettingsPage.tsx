import type {Availability, ICatalogItem, IUserPreference, NotificationPref} from '@frontdesk/types'
import {WuButton, WuInput} from '@npm-questionpro/wick-ui-lib'
import {useEffect, useState, type ChangeEvent} from 'react'
import {useAuth} from '../auth/AuthContext'
import {AppHeader} from '../components/AppHeader'
import {useCatalog} from '../groups/useCatalog'
import {usePreferences} from '../groups/usePreferences'
import {t, type Locale} from '../i18n'
import {useLanguage} from '../i18n/LanguageContext'
import {enablePush, getPushStatus, type PushStatus} from '../lib/push'
import {QuickPickEditor} from './QuickPickEditor'
import styles from './SettingsPage.module.css'

type SectionKey = 'profile' | 'language' | 'notifications' | 'availability' | 'quickPicks' | 'addOns'

function preferenceSummary(
  options: Record<string, string | string[]>,
  item?: ICatalogItem,
): string {
  const parts: string[] = []
  Object.entries(options).forEach(([key, value]) => {
    if (key === 'addOns' && Array.isArray(value)) {
      parts.push(...value)
      return
    }
    if (typeof value !== 'string') return
    const option = item?.modifiers?.find(m => m.key === key)?.options.find(o => o.key === value)
    parts.push(option ? t(option.labelKey) : t(`${key}.${value}`))
  })
  return parts.join(' · ')
}

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
  const {user, updateUser, logout} = useAuth()
  const {setLocale} = useLanguage()
  const {preferences, save, remove, find} = usePreferences()
  const catalogSections = useCatalog()
  const [addOnDraft, setAddOnDraft] = useState('')
  const [pushStatus, setPushStatus] = useState<PushStatus>(() => getPushStatus())
  const [active, setActive] = useState<SectionKey | null>(null)
  const [picking, setPicking] = useState(false)
  const [editorItem, setEditorItem] = useState<ICatalogItem | null>(null)
  const [nameDraft, setNameDraft] = useState('')
  const [photoError, setPhotoError] = useState(false)

  useEffect(() => {
    if (user) setNameDraft(user.name)
  }, [user?.name])

  function openEditor(item: ICatalogItem) {
    setEditorItem(item)
    setPicking(false)
  }

  function saveName() {
    const next = nameDraft.trim()
    if (next && next !== user?.name) void updateUser({name: next})
  }

  function handlePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (file.size > 1_000_000) {
      setPhotoError(true)
      return
    }
    setPhotoError(false)
    const reader = new FileReader()
    reader.onload = () => void updateUser({photoUrl: String(reader.result)})
    reader.readAsDataURL(file)
  }

  function saveQuickPick(options: IUserPreference['options'], isDefault: boolean) {
    if (!editorItem) return
    void save(editorItem.key, options, isDefault)
    setEditorItem(null)
  }

  if (!user) return null
  const isStaff = user.role === 'STAFF'

  const notifValue = NOTIF_OPTIONS.find(o => o.value === user.notificationPref)
  const availValue = AVAILABILITY_OPTIONS.find(o => o.value === user.availability)

  type NavItem = {key: SectionKey; labelKey: string; icon: string; value?: string}
  const sections: NavItem[] = [
    {key: 'profile', labelKey: 'settings.profile', icon: '👤'},
    {key: 'language', labelKey: 'settings.language', icon: '🌐', value: user.locale === 'bn' ? 'বাংলা' : 'English'},
    // Staff: queue-focused — only Profile, Language, Availability. Members: prefs hub.
    ...(isStaff
      ? [
          {
            key: 'availability' as const,
            labelKey: 'settings.availability',
            icon: '🟢',
            value: availValue ? t(availValue.labelKey) : undefined,
          } as NavItem,
        ]
      : [
          {
            key: 'notifications' as const,
            labelKey: 'settings.notifications',
            icon: '🔔',
            value: notifValue ? t(notifValue.labelKey) : undefined,
          } as NavItem,
          {
            key: 'quickPicks' as const,
            labelKey: 'settings.quickPicks',
            icon: '⭐',
            value: String(preferences.length),
          } as NavItem,
          {
            key: 'addOns' as const,
            labelKey: 'settings.addOns',
            icon: '🧩',
            value: String(user.addOns.length),
          } as NavItem,
        ]),
  ]

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

  const nav = (
    <nav className={styles.fdNav}>
      <div className={styles.fdNavProfile}>
        {user.photoUrl ? (
          <img className={styles.fdNavAvatar} src={user.photoUrl} alt={user.name} />
        ) : (
          <span className={styles.fdNavAvatar}>{user.name.charAt(0).toUpperCase()}</span>
        )}
        <span className={styles.fdNavProfileText}>
          <span className={styles.fdNavProfileName}>{user.name}</span>
          <span className={styles.fdNavProfileMeta}>
            {user.email} · {user.role}
          </span>
        </span>
      </div>

      {sections.map(section => (
        <button
          key={section.key}
          type="button"
          className={
            section.key === active ? `${styles.fdNavItem} ${styles.fdNavItemOn}` : styles.fdNavItem
          }
          onClick={() => setActive(section.key)}
        >
          <span className={styles.fdNavIcon} aria-hidden="true">
            {section.icon}
          </span>
          <span className={styles.fdNavLabel}>{t(section.labelKey)}</span>
          {section.value && <span className={styles.fdNavValue}>{section.value}</span>}
        </button>
      ))}

      <button
        type="button"
        className={`${styles.fdNavItem} ${styles.fdNavLogout}`}
        onClick={() => void logout()}
      >
        <span className={styles.fdNavIcon} aria-hidden="true">
          🚪
        </span>
        <span className={styles.fdNavLabel}>{t('home.logout')}</span>
      </button>
    </nav>
  )

  return (
    <div className={styles.fdShell} data-selection={active !== null}>
      <AppHeader />
      <div className={styles.fdBody}>
        <aside className={styles.fdSidebar}>{nav}</aside>
        <main className={styles.fdMain}>
          {active === null ? (
            <div className={styles.fdEmpty}>{t('settings.pickPrompt')}</div>
          ) : (
            <section className={styles.fdContent}>
              <div className={styles.fdContentHead}>
                <WuButton
                  variant="iconOnly"
                  className={styles.fdBack}
                  Icon={<span aria-hidden="true">‹</span>}
                  aria-label={t('groups.back')}
                  onClick={() => setActive(null)}
                />
                <h2 className={styles.fdContentTitle}>
                  {t(sections.find(s => s.key === active)?.labelKey ?? 'settings.title')}
                </h2>
              </div>

              {active === 'profile' && (
            <div className={styles.fdProfileEdit}>
              <div className={styles.fdProfile}>
                {user.photoUrl ? (
                  <img className={styles.fdProfileAvatar} src={user.photoUrl} alt={user.name} />
                ) : (
                  <span className={styles.fdProfileAvatar}>{user.name.charAt(0).toUpperCase()}</span>
                )}
                <div>
                  <div className={styles.fdProfileMeta}>{user.email}</div>
                  <div className={styles.fdProfileMeta}>
                    {t('settings.role')}: {user.role}
                  </div>
                  <label className={styles.fdPhotoBtn}>
                    {t('settings.changePhoto')}
                    <input type="file" accept="image/*" hidden onChange={handlePhoto} />
                  </label>
                </div>
              </div>
              {photoError && <p className={styles.fdNote}>{t('settings.photoTooLarge')}</p>}
              <label className={styles.fdEditorLabel}>{t('settings.editName')}</label>
              <div className={styles.fdInline}>
                <WuInput
                  variant="outlined"
                  type="text"
                  value={nameDraft}
                  onChange={event => setNameDraft(event.target.value)}
                />
                <WuButton
                  variant="primary"
                  size="sm"
                  disabled={!nameDraft.trim() || nameDraft.trim() === user.name}
                  onClick={saveName}
                >
                  {t('settings.save')}
                </WuButton>
              </div>
            </div>
          )}

          {active === 'language' && (
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
          )}

          {active === 'notifications' && (
            <>
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
            </>
          )}

          {active === 'availability' && (
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
          )}

          {active === 'quickPicks' &&
            (editorItem ? (
              <QuickPickEditor
                item={editorItem}
                initialOptions={find(editorItem.key)?.options}
                initialDefault={find(editorItem.key)?.isDefault}
                addOnsLibrary={user.addOns}
                onSave={saveQuickPick}
                onCancel={() => setEditorItem(null)}
              />
            ) : picking ? (
              <>
                <button
                  type="button"
                  className={styles.fdEditorBack}
                  onClick={() => setPicking(false)}
                >
                  ‹ {t('settings.quickPicks')}
                </button>
                <span className={styles.fdEditorLabel}>{t('settings.chooseItem')}</span>
                {catalogSections.map(section => (
                  <div key={section.key} className={styles.fdPickerSection}>
                    <span className={styles.fdQuickPickGroup}>
                      {section.emoji} {t(section.labelKey)}
                    </span>
                    <div className={styles.fdChips}>
                      {section.items.map(item => (
                        <button
                          key={item.key}
                          type="button"
                          className={styles.fdChip}
                          onClick={() => openEditor(item)}
                        >
                          {item.emoji} {t(item.labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <p className={styles.fdNote}>{t('settings.quickPicksHint')}</p>
                {preferences.length === 0 ? (
                  <p className={styles.fdNote}>{t('settings.quickPicksEmpty')}</p>
                ) : (
                  catalogSections.map(section => {
                    const picks = preferences.filter(pref =>
                      section.items.some(item => item.key === pref.itemKey),
                    )
                    if (picks.length === 0) return null
                    return (
                      <div key={section.key} className={styles.fdPickerSection}>
                        <span className={styles.fdQuickPickGroup}>
                          {section.emoji} {t(section.labelKey)}
                        </span>
                        <ul className={styles.fdQuickPicks}>
                          {picks.map(pref => {
                            const item = section.items.find(i => i.key === pref.itemKey)
                            return (
                              <li key={pref.itemKey} className={styles.fdQuickPick}>
                                <span className={styles.fdQuickPickEmoji} aria-hidden="true">
                                  {item?.emoji ?? '⭐'}
                                </span>
                                <span className={styles.fdQuickPickText}>
                                  <span className={styles.fdQuickPickName}>
                                    {t(`item.${pref.itemKey}`)}
                                    {pref.isDefault && (
                                      <span className={styles.fdQuickPickStar}>
                                        {t('settings.default')}
                                      </span>
                                    )}
                                  </span>
                                  <span className={styles.fdQuickPickSummary}>
                                    {preferenceSummary(pref.options, item)}
                                  </span>
                                </span>
                                {item && (
                                  <button
                                    type="button"
                                    className={styles.fdQuickPickEdit}
                                    onClick={() => openEditor(item)}
                                  >
                                    {t('settings.edit')}
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className={styles.fdQuickPickRemove}
                                  aria-label={t('builder.remove')}
                                  onClick={() => void remove(pref.itemKey)}
                                >
                                  ✕
                                </button>
                              </li>
                            )
                          })}
                        </ul>
                      </div>
                    )
                  })
                )}
                <div className={styles.fdEditorActions}>
                  <WuButton variant="outline" size="sm" onClick={() => setPicking(true)}>
                    {t('settings.newQuickPick')}
                  </WuButton>
                </div>
              </>
            ))}

          {active === 'addOns' && (
            <>
              <p className={styles.fdNote}>{t('settings.addOnsHint')}</p>
              <div className={styles.fdChips}>
                {user.addOns.map(value => (
                  <span key={value} className={styles.fdAddOn}>
                    {value}
                    <button type="button" aria-label={t('builder.remove')} onClick={() => removeAddOn(value)}>
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
            </>
          )}
            </section>
          )}
        </main>
      </div>
    </div>
  )
}
