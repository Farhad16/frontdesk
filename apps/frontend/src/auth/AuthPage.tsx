import {WuButton, WuInput} from '@npm-questionpro/wick-ui-lib'
import {useState, type FormEvent} from 'react'
import {GoogleIcon} from '../components/GoogleIcon'
import {googleSsoEnabled, googleSsoStartUrl} from '../config'
import {ApiError} from '../lib/apiClient'
import {t} from '../i18n'
import {useAuth} from './AuthContext'
import styles from './AuthPage.module.css'

type AuthMode = 'login' | 'signup'

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

export function AuthPage() {
  const {login, signup} = useAuth()
  const [mode, setMode] = useState<AuthMode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const isSignup = mode === 'signup'

  function switchMode(next: AuthMode) {
    setMode(next)
    setError(null)
    setPassword('')
    setConfirmPassword('')
  }

  function handleSso() {
    if (!googleSsoEnabled) {
      setError(t('auth.googleComingSoon'))
      return
    }
    window.location.href = googleSsoStartUrl
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    if (isSignup) {
      if (!PASSWORD_PATTERN.test(password)) {
        setError(t('auth.errorPasswordWeak'))
        return
      }
      if (password !== confirmPassword) {
        setError(t('auth.errorPasswordMismatch'))
        return
      }
    }
    setSubmitting(true)
    try {
      if (isSignup) {
        await signup({name, email, password})
      } else {
        await login({email, password})
      }
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : String(caught))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.fdAuthPage}>
      <div className={styles.fdAuthCard}>
        <div className={styles.fdAuthBrand}>
          <img src="/questionpro-logo.svg" alt="QuestionPro" />
          <span className={styles.fdAuthBrandLabel}>{t('auth.brand')}</span>
        </div>

        <header className={styles.fdAuthHeader}>
          <h1 className={styles.fdAuthHeading}>
            {isSignup ? t('auth.signUpHeading') : t('auth.signInHeading')}
          </h1>
          <p className={styles.fdAuthSubtitle}>
            {isSignup ? t('auth.signUpSubtitle') : t('auth.signInSubtitle')}
          </p>
        </header>

        <form className={styles.fdAuthForm} onSubmit={handleSubmit}>
          {isSignup && (
            <label className={styles.fdAuthField}>
              <span className={styles.fdAuthLabel}>{t('auth.fullName')}</span>
              <WuInput
                variant="outlined"
                type="text"
                placeholder={t('auth.fullNamePlaceholder')}
                value={name}
                onChange={event => setName(event.target.value)}
                required
              />
            </label>
          )}

          <label className={styles.fdAuthField}>
            <span className={styles.fdAuthLabel}>{t('auth.email')}</span>
            <WuInput
              variant="outlined"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              value={email}
              onChange={event => setEmail(event.target.value)}
              required
            />
          </label>

          {isSignup ? (
            <div className={styles.fdAuthRow}>
              <label className={styles.fdAuthField}>
                <span className={styles.fdAuthLabel}>{t('auth.password')}</span>
                <WuInput
                  variant="outlined"
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  required
                />
              </label>
              <label className={styles.fdAuthField}>
                <span className={styles.fdAuthLabel}>{t('auth.confirmPassword')}</span>
                <WuInput
                  variant="outlined"
                  type="password"
                  placeholder={t('auth.passwordPlaceholder')}
                  value={confirmPassword}
                  onChange={event => setConfirmPassword(event.target.value)}
                  required
                />
              </label>
            </div>
          ) : (
            <label className={styles.fdAuthField}>
              <span className={styles.fdAuthLabel}>{t('auth.password')}</span>
              <WuInput
                variant="outlined"
                type="password"
                placeholder={t('auth.passwordPlaceholder')}
                value={password}
                onChange={event => setPassword(event.target.value)}
                required
              />
            </label>
          )}

          {error && <div className={styles.fdAuthError}>{error}</div>}

          <WuButton type="submit" variant="primary" loading={submitting} className={styles.fdAuthSubmit}>
            {isSignup ? t('auth.createAccount') : t('auth.login')}
          </WuButton>
        </form>

        <div className={styles.fdAuthDivider}>
          <span>{t('auth.orContinueWith')}</span>
        </div>

        <div className={styles.fdAuthSsoRow}>
          <button
            type="button"
            className={styles.fdAuthSso}
            onClick={handleSso}
            title={t('auth.continueWithGoogle')}
            aria-label={t('auth.continueWithGoogle')}
          >
            <GoogleIcon size={20} />
          </button>
        </div>

        <p className={styles.fdAuthSwitch}>
          {isSignup ? t('auth.alreadyHaveAccount') : t('auth.newHere')}{' '}
          <button
            type="button"
            className={styles.fdAuthSwitchButton}
            onClick={() => switchMode(isSignup ? 'login' : 'signup')}
          >
            {isSignup ? t('auth.login') : t('auth.signup')}
          </button>
        </p>
      </div>
    </div>
  )
}
