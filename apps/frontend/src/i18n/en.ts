export const en = {
  'auth.brand': 'Frontdesk',
  'auth.signInHeading': 'Sign in',
  'auth.signInSubtitle': 'Use your work account to continue.',
  'auth.signUpHeading': 'Create your account',
  'auth.signUpSubtitle': 'Join your workspace as a member.',
  'auth.continueWithGoogle': 'Continue with Google',
  'auth.orContinueWith': 'or continue with',
  'auth.fullName': 'Full name',
  'auth.fullNamePlaceholder': 'Jane Cooper',
  'auth.email': 'Work email',
  'auth.emailPlaceholder': 'you@questionpro.com',
  'auth.password': 'Password',
  'auth.passwordPlaceholder': '••••••••',
  'auth.confirmPassword': 'Confirm password',
  'auth.passwordRule':
    'At least 8 characters with uppercase, lowercase, a number, and a special character.',
  'auth.errorPasswordWeak':
    'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character.',
  'auth.errorPasswordMismatch': 'Passwords do not match.',
  'auth.login': 'Sign in',
  'auth.createAccount': 'Create account',
  'auth.newHere': "Don't have an account?",
  'auth.signup': 'Sign up',
  'auth.alreadyHaveAccount': 'Already have an account?',
  'auth.googleComingSoon': 'Google sign-in is coming soon.',
  'home.loggedInAs': 'Logged in as',
  'home.logout': 'Log out',
} as const

export type TranslationKey = keyof typeof en
