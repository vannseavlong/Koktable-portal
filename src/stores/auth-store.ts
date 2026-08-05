import { create } from 'zustand'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

const ACCESS_TOKEN_COOKIE = 'paw_admin_access_token'
const USER_COOKIE = 'paw_admin_user'

/**
 * Shape of the `user` object returned by `POST /user/auth/login` (see
 * ADMIN_API.md / FLUTTER_GUIDE.md) for an account with `role: "admin"` or
 * `role: "merchant"`.
 */
export interface AuthUser {
  user_id: string
  email: string
  full_name: string
  picture?: string
  role: string
  auth_provider?: string
  actor_sheet_id?: string
  status?: string
  /** Only present when `role === 'merchant'` — scopes `/merchant/*` requests. */
  restaurant_id?: string
}

interface AuthState {
  auth: {
    user: AuthUser | null
    setUser: (user: AuthUser | null) => void
    accessToken: string
    setAccessToken: (accessToken: string) => void
    resetAccessToken: () => void
    reset: () => void
  }
}

function readPersistedToken(): string {
  const cookieState = getCookie(ACCESS_TOKEN_COOKIE)
  if (!cookieState) return ''
  try {
    return JSON.parse(cookieState) as string
  } catch {
    return ''
  }
}

function readPersistedUser(): AuthUser | null {
  const cookieState = getCookie(USER_COOKIE)
  if (!cookieState) return null
  try {
    return JSON.parse(cookieState) as AuthUser
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>()((set) => {
  return {
    auth: {
      user: readPersistedUser(),
      setUser: (user) =>
        set((state) => {
          if (user) setCookie(USER_COOKIE, JSON.stringify(user))
          else removeCookie(USER_COOKIE)
          return { ...state, auth: { ...state.auth, user } }
        }),
      accessToken: readPersistedToken(),
      setAccessToken: (accessToken) =>
        set((state) => {
          setCookie(ACCESS_TOKEN_COOKIE, JSON.stringify(accessToken))
          return { ...state, auth: { ...state.auth, accessToken } }
        }),
      resetAccessToken: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN_COOKIE)
          return { ...state, auth: { ...state.auth, accessToken: '' } }
        }),
      reset: () =>
        set((state) => {
          removeCookie(ACCESS_TOKEN_COOKIE)
          removeCookie(USER_COOKIE)
          return {
            ...state,
            auth: { ...state.auth, user: null, accessToken: '' },
          }
        }),
    },
  }
})
