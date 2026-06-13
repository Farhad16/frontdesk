import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import {BrowserRouter} from 'react-router-dom'
import '@npm-questionpro/wick-ui-lib/dist/style.css'
import '@npm-questionpro/wick-ui-icon/dist/wu-icon.css'
import './index.css'
import App from './App'
import {AuthProvider} from './auth/AuthContext'
import {LanguageProvider} from './i18n/LanguageContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
