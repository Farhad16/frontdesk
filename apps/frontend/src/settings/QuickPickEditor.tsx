import type {ICatalogItem, IUserPreference} from '@frontdesk/types'
import {WuButton, WuInput} from '@npm-questionpro/wick-ui-lib'
import {useMemo, useState} from 'react'
import {buildLineSummary} from '../groups/builderSummary'
import {t} from '../i18n'
import styles from './SettingsPage.module.css'

interface IQuickPickEditorProps {
  item: ICatalogItem
  initialOptions?: IUserPreference['options']
  initialDefault?: boolean
  addOnsLibrary: string[]
  onSave: (options: IUserPreference['options'], isDefault: boolean) => void
  onCancel: () => void
}

export function QuickPickEditor({
  item,
  initialOptions,
  initialDefault,
  addOnsLibrary,
  onSave,
  onCancel,
}: IQuickPickEditorProps) {
  const [isDefault, setIsDefault] = useState(Boolean(initialDefault))
  const [selections, setSelections] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {}
    Object.entries(initialOptions ?? {}).forEach(([key, value]) => {
      if (key !== 'addOns' && typeof value === 'string') initial[key] = value
    })
    return initial
  })
  const [addOns, setAddOns] = useState<string[]>(() => {
    const value = initialOptions?.addOns
    return Array.isArray(value) ? value : []
  })
  const [addOnDraft, setAddOnDraft] = useState('')

  const requiredMet = useMemo(
    () =>
      (item.modifiers ?? [])
        .filter(modifier => !modifier.optional)
        .every(modifier => Boolean(selections[modifier.key])),
    [item, selections],
  )

  function toggleAddOn(value: string) {
    setAddOns(prev => (prev.includes(value) ? prev.filter(a => a !== value) : [...prev, value]))
  }

  function commitAddOnDraft() {
    const value = addOnDraft.trim()
    if (!value || addOns.includes(value)) return
    setAddOns(prev => [...prev, value])
    setAddOnDraft('')
  }

  function save() {
    if (!requiredMet) return
    const options: IUserPreference['options'] = {...selections}
    if (addOns.length > 0) options.addOns = addOns
    onSave(options, isDefault)
  }

  const review = requiredMet ? buildLineSummary(item, selections, 1, addOns) : ''

  return (
    <div className={styles.fdEditor}>
      <button type="button" className={styles.fdEditorBack} onClick={onCancel}>
        ‹ {t('settings.quickPicks')}
      </button>
      <div className={styles.fdEditorHead}>
        <span className={styles.fdEditorEmoji}>{item.emoji}</span>
        <span className={styles.fdEditorName}>{t(item.labelKey)}</span>
      </div>

      {item.modifiers?.map(modifier => (
        <div key={modifier.key} className={styles.fdEditorPick}>
          <span className={styles.fdEditorLabel}>{t(modifier.labelKey)}</span>
          <div className={styles.fdChips}>
            {modifier.options.map(option => (
              <button
                key={option.key}
                type="button"
                className={
                  selections[modifier.key] === option.key
                    ? `${styles.fdChip} ${styles.fdChipOn}`
                    : styles.fdChip
                }
                onClick={() => setSelections(prev => ({...prev, [modifier.key]: option.key}))}
              >
                {option.emoji} {t(option.labelKey)}
              </button>
            ))}
          </div>
        </div>
      ))}

      {item.allowAddOns && (
        <div className={styles.fdEditorPick}>
          <span className={styles.fdEditorLabel}>{t('builder.addOns')}</span>
          <div className={styles.fdChips}>
            {[...new Set([...addOnsLibrary, ...addOns])].map(value => (
              <button
                key={value}
                type="button"
                className={addOns.includes(value) ? `${styles.fdChip} ${styles.fdChipOn}` : styles.fdChip}
                onClick={() => toggleAddOn(value)}
              >
                {value}
              </button>
            ))}
          </div>
          <div className={styles.fdInline}>
            <WuInput
              variant="outlined"
              type="text"
              placeholder={t('builder.addOnPlaceholder')}
              value={addOnDraft}
              onChange={event => setAddOnDraft(event.target.value)}
            />
            <WuButton variant="outline" size="sm" onClick={commitAddOnDraft}>
              {t('builder.addOnAdd')}
            </WuButton>
          </div>
        </div>
      )}

      <label className={styles.fdDefaultToggle}>
        <input type="checkbox" checked={isDefault} onChange={() => setIsDefault(v => !v)} />
        {t('settings.setDefault')}
      </label>

      {review && <div className={styles.fdReview}>{review}</div>}

      <div className={styles.fdEditorActions}>
        <WuButton variant="primary" size="sm" disabled={!requiredMet} onClick={save}>
          {t('settings.save')}
        </WuButton>
        <WuButton variant="outline" size="sm" onClick={onCancel}>
          {t('lunchoff.cancel')}
        </WuButton>
      </div>
    </div>
  )
}
