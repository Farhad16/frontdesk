import {WuLoader} from '@npm-questionpro/wick-ui-lib'
import {useEffect} from 'react'
import {Navigate, Route, Routes} from 'react-router-dom'
import {AuthPage} from './auth/AuthPage'
import {useAuth} from './auth/AuthContext'
import {GroupsEmpty} from './groups/GroupsEmpty'
import {GroupsPage} from './groups/GroupsPage'
import {GroupView} from './groups/GroupView'
import {useLanguage} from './i18n/LanguageContext'
import type {Locale} from './i18n'
import {SettingsPage} from './settings/SettingsPage'

export default function App() {
  const {user, loading} = useAuth()
  const {setLocale} = useLanguage()

  useEffect(() => {
    if (user?.locale) setLocale(user.locale as Locale)
  }, [user?.locale, setLocale])

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <WuLoader size="lg" variant="spinner" />
      </div>
    )
  }

  if (!user) return <AuthPage />

  return (
    <Routes>
      <Route path="/groups" element={<GroupsPage />}>
        <Route index element={<GroupsEmpty />} />
        <Route path=":key" element={<GroupView />} />
      </Route>
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/groups" replace />} />
    </Routes>
  )
}
