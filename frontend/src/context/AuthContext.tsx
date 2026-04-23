import { createContext, useContext, useReducer, ReactNode, useCallback, useEffect } from 'react'

import { AuthState, LoginCredentials, AuthResult, User } from '@/types/auth'
import { normalizeUser } from '@/utils/normalizeUser'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

type AuthAction =
  | { type: 'LOGIN_SUCCESS'; payload: { token: string; user: User } }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }

const AuthStateContext = createContext<AuthState | null>(null)
const AuthActionsContext = createContext<any>(null)

// 🔥 estado inicial consistente
const getInitialState = (): AuthState => {
  const token = localStorage.getItem('token')
  const user = localStorage.getItem('user')

  return {
    token,
    user: user ? JSON.parse(user) : null,
    isAuthenticated: !!token,
    isLoading: !!token,
  }
}

function reducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      }

    case 'LOGOUT':
      return {
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }

    default:
      return state
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, getInitialState())

  // 🔐 LOGIN
  const login = useCallback(async (credentials: LoginCredentials): Promise<AuthResult> => {
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: credentials.email,
          senha: credentials.password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        dispatch({ type: 'SET_LOADING', payload: false })
        return { success: false, error: data.message }
      }

      const token = data.data.token
      const refreshToken = data.data.refreshToken
      const user = normalizeUser(data.data.user)

      localStorage.setItem('token', token)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { token, user },
      })

      return { success: true, error: null }
    } catch {
      dispatch({ type: 'SET_LOADING', payload: false })
      return { success: false, error: 'Erro de login' }
    }
  }, [])

  // 🔄 BOOTSTRAP (REFRESH)
  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('token')

      if (!token) {
        dispatch({ type: 'SET_LOADING', payload: false })
        return
      }

      try {
        const res = await fetch(`${API_URL}/api/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await res.json()

        const user = normalizeUser(data.data.user)

        localStorage.setItem('user', JSON.stringify(user))

        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: { token, user },
        })
      } catch {
        localStorage.clear()
        dispatch({ type: 'LOGOUT' })
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    bootstrap()
  }, [])

  const logout = useCallback(() => {
    localStorage.clear()
    dispatch({ type: 'LOGOUT' })
  }, [])

  return (
    <AuthStateContext.Provider value={state}>
      <AuthActionsContext.Provider value={{ login, logout }}>
        {children}
      </AuthActionsContext.Provider>
    </AuthStateContext.Provider>
  )
}

export function useAuth() {
  const state = useContext(AuthStateContext)
  const actions = useContext(AuthActionsContext)

  if (!state || !actions) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return { ...state, ...actions }
}
