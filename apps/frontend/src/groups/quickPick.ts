import type {ICatalog, ICatalogItem, IUserPreference} from '@frontdesk/types'
import {t} from '../i18n'
import {buildLineSummary} from './builderSummary'
import type {ISendRequestInput} from './useThread'

// Locate the catalog item + its category for a saved quick pick (preference).
export function locate(catalog: ICatalog, itemKey: string) {
  for (const category of catalog) {
    const item = category.items?.find(it => it.key === itemKey)
    if (item) return {category, item}
  }
  return null
}

// Split a preference's stored options into modifier selections + add-ons.
export function splitOptions(options: IUserPreference['options']) {
  const selections: Record<string, string> = {}
  let addOns: string[] = []
  Object.entries(options).forEach(([key, value]) => {
    if (key === 'addOns' && Array.isArray(value)) addOns = value
    else if (typeof value === 'string') selections[key] = value
  })
  return {selections, addOns}
}

// Render a quick pick's option summary ("moderate sugar · ginger") for its card.
export function quickPickSummary(item: ICatalogItem, options: IUserPreference['options']): string {
  const {selections, addOns} = splitOptions(options)
  const parts: string[] = []
  Object.entries(selections).forEach(([key, value]) => {
    const option = item.modifiers?.find(m => m.key === key)?.options.find(o => o.key === value)
    if (value !== 'none') parts.push(option ? t(option.labelKey) : t(`${key}.${value}`))
  })
  parts.push(...addOns)
  return parts.join(' · ')
}

// Build the send-request input for a saved quick pick, or null if its item is
// not in this group's catalog.
export function buildQuickPickInput(
  catalog: ICatalog,
  pref: IUserPreference,
): ISendRequestInput | null {
  const located = locate(catalog, pref.itemKey)
  if (!located) return null
  const {category, item} = located
  const {selections, addOns} = splitOptions(pref.options)
  const summary = buildLineSummary(item, selections, 1, addOns)
  return {
    items: [{category: category.key, item: item.key, options: pref.options, quantity: 1, summary}],
    summary,
  }
}
