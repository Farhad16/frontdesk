import type {ICurrentUser, ILoginInput, ISignupInput} from '@frontdesk/types'
import {createContext, useCallback, useContext, useEffect, useState, type ReactNode} from 'react'
import {apiClient} from '../lib/apiClient'
import {resubscribePush} from '../lib/push'

interface IAuthContext {
  user: ICurrentUser | null
  loading: boolean
  login: (input: ILoginInput) => Promise<void>
  signup: (input: ISignupInput) => Promise<void>
  logout: () => Promise<void>
  updateUser: (patch: Partial<ICurrentUser>) => Promise<ICurrentUser>
}

const AuthContext = createContext<IAuthContext | null>(null)

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<ICurrentUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiClient
      .get<ICurrentUser>('/auth/me')
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  // Self-heal the push subscription whenever a user is active (login or restored
  // session). Silent — only acts if notification permission is already granted.
  useEffect(() => {
    if (user) void resubscribePush()
  }, [user])

  const login = useCallback(async (input: ILoginInput) => {
    setUser(await apiClient.post<ICurrentUser>('/auth/login', input))
  }, [])

  const signup = useCallback(async (input: ISignupInput) => {
    setUser(await apiClient.post<ICurrentUser>('/auth/signup', input))
  }, [])

  const logout = useCallback(async () => {
    await apiClient.post('/auth/logout')
    setUser(null)
  }, [])

  const updateUser = useCallback(async (patch: Partial<ICurrentUser>) => {
    const updated = await apiClient.patch<ICurrentUser>('/users/me', patch)
    setUser(updated)
    return updated
  }, [])

  return (
    <AuthContext.Provider value={{user, loading, login, signup, logout, updateUser}}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): IAuthContext {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
