import {WuButton, WuLoader} from '@npm-questionpro/wick-ui-lib'
import {AuthPage} from './auth/AuthPage'
import {useAuth} from './auth/AuthContext'
import {t} from './i18n'

export default function App() {
  const {user, loading, logout} = useAuth()

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
    <div style={{padding: 24}}>
      <h1>{t('auth.brand')}</h1>
      <p>
        {t('home.loggedInAs')} <strong>{user.name}</strong> ({user.role})
      </p>
      <WuButton variant="outline" onClick={logout}>
        {t('home.logout')}
      </WuButton>
    </div>
  )
}
