import type {IGroupConfig, IRequestLineItem} from '@frontdesk/types'
import {WuButton, WuInput} from '@npm-questionpro/wick-ui-lib'
import {useMemo, useState} from 'react'
import {useAuth} from '../auth/AuthContext'
import {t} from '../i18n'
import {buildLineSummary} from './builderSummary'
import {usePreferences} from './usePreferences'
import styles from './RequestBuilder.module.css'
import type {ISendRequestInput} from './useThread'

interface IRequestBuilderProps {
  config: IGroupConfig
  sending: boolean
  onClose: () => void
  onSend: (input: ISendRequestInput) => Promise<void>
  initialCart?: IRequestLineItem[]
}

export function RequestBuilder({config, sending, onClose, onSend, initialCart}: IRequestBuilderProps) {
  const {user, updateUser} = useAuth()
  const {find, save} = usePreferences()
  const catalog = config.catalog ?? []

  const [categoryKey, setCategoryKey] = useState(catalog[0]?.key ?? '')
  const [itemKey, setItemKey] = useState('')
  const [selections, setSelections] = useState<Record<string, string>>({})
  const [quantity, setQuantity] = useState(1)
  const [addOns, setAddOns] = useState<string[]>([])
  const [addOnDraft, setAddOnDraft] = useState('')
  const [freeText, setFreeText] = useState('')
  const [cart, setCart] = useState<IRequestLineItem[]>(initialCart ?? [])

  const category = catalog.find(cat => cat.key === categoryKey)
  const item = category?.items?.find(it => it.key === itemKey)

  const requiredMet = useMemo(() => {
    if (!item) return false
    return (item.modifiers ?? [])
      .filter(modifier => !modifier.optional)
      .every(modifier => Boolean(selections[modifier.key]))
  }, [item, selections])

  function resetItemSelection() {
    setItemKey('')
    setSelections({})
    setQuantity(1)
    setAddOns([])
    setAddOnDraft('')
  }

  function selectCategory(key: string) {
    setCategoryKey(key)
    resetItemSelection()
    setFreeText('')
  }

  function selectItem(key: string) {
    setItemKey(key)
    setQuantity(1)
    const pref = find(key)
    if (pref) {
      const sel: Record<string, string> = {}
      let prefAddOns: string[] = []
      Object.entries(pref.options).forEach(([optKey, value]) => {
        if (optKey === 'addOns' && Array.isArray(value)) prefAddOns = value
        else if (typeof value === 'string') sel[optKey] = value
      })
      setSelections(sel)
      setAddOns(prefAddOns)
    } else {
      setSelections({})
      setAddOns([])
    }
  }

  function saveQuickPick() {
    if (!item) return
    const options: IRequestLineItem['options'] = {...selections}
    if (addOns.length > 0) options.addOns = addOns
    void save(item.key, options)
  }

  function toggleAddOn(value: string) {
    setAddOns(prev => (prev.includes(value) ? prev.filter(a => a !== value) : [...prev, value]))
  }

  function commitAddOnDraft() {
    const value = addOnDraft.trim()
    if (!value) return
    if (!addOns.includes(value)) setAddOns(prev => [...prev, value])
    setAddOnDraft('')
    // Save a brand-new extra to the user's personal add-on library.
    if (user && !user.addOns.includes(value)) {
      void updateUser({addOns: [...user.addOns, value]})
    }
  }

  function addItemLine() {
    if (!category || !item || !requiredMet) return
    const options: IRequestLineItem['options'] = {...selections}
    if (addOns.length > 0) options.addOns = addOns
    const line: IRequestLineItem = {
      category: category.key,
      item: item.key,
      options: Object.keys(options).length > 0 ? options : undefined,
      quantity: item.quantity ? quantity : 1,
      summary: buildLineSummary(item, selections, item.quantity ? quantity : 1, addOns),
    }
    setCart(prev => [...prev, line])
    resetItemSelection()
  }

  function addFreeTextLine() {
    const text = freeText.trim()
    if (!category || !text) return
    setCart(prev => [...prev, {category: category.key, item: 'freeText', quantity: 1, summary: text}])
    setFreeText('')
  }

  function removeLine(index: number) {
    setCart(prev => prev.filter((_, i) => i !== index))
  }

  async function handleSend() {
    if (cart.length === 0) return
    await onSend({items: cart, summary: cart.map(line => line.summary).join(', ')})
    onClose()
  }

  return (
    <div className={styles.fdBuilderOverlay} role="dialog" aria-modal="true">
      <div className={styles.fdBuilder}>
        <header className={styles.fdBuilderBar}>
          <span className={styles.fdBuilderTitle}>{t('builder.title')}</span>
          <WuButton
            variant="iconOnly"
            Icon={<span aria-hidden="true">✕</span>}
            aria-label={t('builder.close')}
            onClick={onClose}
          />
        </header>

        <div className={styles.fdBuilderBody}>
          <div className={styles.fdBuilderPick}>
            <span className={styles.fdBuilderLabel}>{t('builder.category')}</span>
            <div className={styles.fdOptionRow}>
              {catalog.map(cat => (
                <button
                  key={cat.key}
                  type="button"
                  className={cat.key === categoryKey ? `${styles.fdOption} ${styles.fdOptionOn}` : styles.fdOption}
                  onClick={() => selectCategory(cat.key)}
                >
                  {cat.emoji} {t(cat.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {category?.items && (
            <div className={styles.fdBuilderPick}>
              <span className={styles.fdBuilderLabel}>{t('builder.item')}</span>
              <div className={styles.fdOptionRow}>
                {category.items.map(it => (
                  <button
                    key={it.key}
                    type="button"
                    className={it.key === itemKey ? `${styles.fdOption} ${styles.fdOptionOn}` : styles.fdOption}
                    onClick={() => selectItem(it.key)}
                  >
                    {it.emoji} {t(it.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {item?.modifiers?.map(modifier => (
            <div key={modifier.key} className={styles.fdBuilderPick}>
              <span className={styles.fdBuilderLabel}>{t(modifier.labelKey)}</span>
              <div className={styles.fdOptionRow}>
                {modifier.options.map(option => (
                  <button
                    key={option.key}
                    type="button"
                    className={
                      selections[modifier.key] === option.key
                        ? `${styles.fdOption} ${styles.fdOptionOn}`
                        : styles.fdOption
                    }
                    onClick={() =>
                      setSelections(prev => ({...prev, [modifier.key]: option.key}))
                    }
                  >
                    {option.emoji} {t(option.labelKey)}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {item?.allowAddOns && (
            <div className={styles.fdBuilderPick}>
              <span className={styles.fdBuilderLabel}>{t('builder.addOns')}</span>
              <div className={styles.fdOptionRow}>
                {[...new Set([...(user?.addOns ?? []), ...addOns])].map(value => (
                  <button
                    key={value}
                    type="button"
                    className={addOns.includes(value) ? `${styles.fdOption} ${styles.fdOptionOn}` : styles.fdOption}
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

          {item?.quantity && (
            <div className={styles.fdBuilderPick}>
              <span className={styles.fdBuilderLabel}>{t('builder.quantity')}</span>
              <div className={styles.fdStepper}>
                <button type="button" onClick={() => setQuantity(q => Math.max(1, q - 1))}>
                  −
                </button>
                <b>{quantity}</b>
                <button type="button" onClick={() => setQuantity(q => q + 1)}>
                  ＋
                </button>
              </div>
            </div>
          )}

          {category?.freeText ? (
            <div className={styles.fdBuilderPick}>
              <div className={styles.fdInline}>
                <WuInput
                  variant="outlined"
                  type="text"
                  placeholder={t('builder.freeTextPlaceholder')}
                  value={freeText}
                  onChange={event => setFreeText(event.target.value)}
                />
                <WuButton variant="outline" size="sm" disabled={!freeText.trim()} onClick={addFreeTextLine}>
                  {t('builder.addToOrder')}
                </WuButton>
              </div>
            </div>
          ) : (
            item && (
              <div className={styles.fdItemActions}>
                <WuButton variant="outline" disabled={!requiredMet} onClick={addItemLine}>
                  {t('builder.addToOrder')}
                </WuButton>
                <button
                  type="button"
                  className={styles.fdQuickPickSave}
                  disabled={!requiredMet}
                  onClick={saveQuickPick}
                >
                  {find(item.key) ? t('builder.updateQuickPick') : t('builder.saveQuickPick')}
                </button>
              </div>
            )
          )}

          <div className={styles.fdBuilderPick}>
            <span className={styles.fdBuilderLabel}>{t('builder.order')}</span>
            {cart.length === 0 ? (
              <p className={styles.fdCartEmpty}>{t('builder.empty')}</p>
            ) : (
              <ul className={styles.fdCart}>
                {cart.map((line, index) => (
                  <li key={index} className={styles.fdCartLine}>
                    <span>{line.summary}</span>
                    <button type="button" aria-label={t('builder.remove')} onClick={() => removeLine(index)}>
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <footer className={styles.fdBuilderFoot}>
          <WuButton
            variant="primary"
            className={styles.fdSend}
            loading={sending}
            disabled={cart.length === 0}
            onClick={handleSend}
          >
            {t('builder.send')}
          </WuButton>
        </footer>
      </div>
    </div>
  )
}
