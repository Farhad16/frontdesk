import type {ICatalogItem, ICatalogModifier} from '@frontdesk/types'
import {t} from '../i18n'

export function modifierOptionLabel(modifier: ICatalogModifier, optionKey: string): string {
  const option = modifier.options.find(opt => opt.key === optionKey)
  return option ? t(option.labelKey) : optionKey
}

export function buildLineSummary(
  item: ICatalogItem,
  selections: Record<string, string>,
  quantity: number,
  addOns: string[],
): string {
  const emoji = item.emoji ? `${item.emoji} ` : ''
  const base = `${emoji}${t(item.labelKey)} ×${quantity}`

  const modifierParts = (item.modifiers ?? [])
    .map(modifier => {
      const value = selections[modifier.key]
      if (!value || value === 'none') return null
      return modifierOptionLabel(modifier, value)
    })
    .filter((value): value is string => value !== null)

  const extras = [...modifierParts, ...addOns]
  return extras.length > 0 ? `${base} — ${extras.join(', ')}` : base
}
