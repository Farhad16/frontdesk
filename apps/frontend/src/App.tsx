import {WuLoader} from '@npm-questionpro/wick-ui-lib'
import {Navigate, Route, Routes} from 'react-router-dom'
import {AuthPage} from './auth/AuthPage'
import {useAuth} from './auth/AuthContext'
import {GroupsEmpty} from './groups/GroupsEmpty'
import {GroupsPage} from './groups/GroupsPage'
import {ThreadPlaceholder} from './groups/ThreadPlaceholder'

export default function App() {
  const {user, loading} = useAuth()

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
        <Route path=":key" element={<ThreadPlaceholder />} />
      </Route>
      <Route path="*" element={<Navigate to="/groups" replace />} />
    </Routes>
  )
}
