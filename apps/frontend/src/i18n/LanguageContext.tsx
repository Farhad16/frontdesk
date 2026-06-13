import {createContext, useCallback, useContext, useState, type ReactNode} from 'react'
import {setActiveLocale, type Locale} from './index'

interface ILanguageContext {
  locale: Locale
  setLocale: (locale: Locale) => void
}

const LanguageContext = createContext<ILanguageContext>({locale: 'en', setLocale: () => {}})

export function LanguageProvider({children}: {children: ReactNode}) {
  const [locale, setLocaleState] = useState<Locale>('en')

  const setLocale = useCallback((next: Locale) => {
    setActiveLocale(next)
    setLocaleState(next)
  }, [])

  return (
    <LanguageContext.Provider value={{locale, setLocale}}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage(): ILanguageContext {
  return useContext(LanguageContext)
}
