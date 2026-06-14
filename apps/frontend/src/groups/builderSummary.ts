import type {ICatalog, ICatalogItem, ICatalogModifier, IRequestLineItem} from '@frontdesk/types'
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

// Re-render a request line in the CURRENT locale from its structured keys
// (i18n rule: never show the sender-locale string stored at send time).
// Free-text lines have no catalog item → shown as typed.
export function localizeLine(line: IRequestLineItem, catalog: ICatalog): string {
  if (!line.item || line.item === 'freeText') return line.summary ?? ''
  let item: ICatalogItem | undefined
  for (const category of catalog) {
    const found = category.items?.find(it => it.key === line.item)
    if (found) {
      item = found
      break
    }
  }
  if (!item) return line.summary ?? ''
  const selections: Record<string, string> = {}
  let addOns: string[] = []
  Object.entries(line.options ?? {}).forEach(([key, value]) => {
    if (key === 'addOns' && Array.isArray(value)) addOns = value
    else if (typeof value === 'string') selections[key] = value
  })
  return buildLineSummary(item, selections, line.quantity || 1, addOns)
}

export function localizeRequestSummary(items: IRequestLineItem[], catalog: ICatalog): string {
  return items.map(line => localizeLine(line, catalog)).join(', ')
}
