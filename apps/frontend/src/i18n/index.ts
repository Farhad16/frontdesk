import {bn} from './bn'
import {en, type TranslationKey} from './en'

export type Locale = 'en' | 'bn'

const dictionaries: Record<Locale, Partial<Record<string, string>>> = {en, bn}

let activeLocale: Locale = 'en'

export function setActiveLocale(locale: Locale): void {
  activeLocale = dictionaries[locale] ? locale : 'en'
}

export function t(key: TranslationKey): string
export function t(key: string): string
export function t(key: string): string {
  return dictionaries[activeLocale][key] ?? (en as Record<string, string>)[key] ?? key
}
