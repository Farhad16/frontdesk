import {en, type TranslationKey} from './en'

export function t(key: TranslationKey): string
export function t(key: string): string
export function t(key: string): string {
  return (en as Record<string, string>)[key] ?? key
}
