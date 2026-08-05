import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { toast } from 'sonner'
import { type AuthUser, useAuthStore } from '@/stores/auth-store'
import { apiClient } from '@/lib/api-client'

/**
 * Fetches and verifies the current user whenever we have an access token but
 * no user object cached yet — the state right after GET /admin/auth/google's
 * callback (see ADMIN_API.md) hands back `?token=`, which __root.tsx's
 * `beforeLoad` stores synchronously (before this ever runs, so it wins the
 * race against `_authenticated`'s route guard) but has no `user` to go with it.
 * Also covers the same "token without user" state after any other partial
 * session restore.
 */
export function useSessionBootstrap() {
  const navigate = useNavigate()
  const { accessToken, user, setUser, reset } = useAuthStore((s) => s.auth)

  useEffect(() => {
    if (!accessToken || user) return

    apiClient
      .get<{ user: AuthUser }>('/user/auth/me')
      .then(({ user: fetchedUser }) => {
        if (fetchedUser.role !== 'admin' && fetchedUser.role !== 'merchant') {
          toast.error('This account does not have access to Restaurant Admin.')
          reset()
          navigate({ to: '/sign-in', replace: true })
          return
        }
        setUser(fetchedUser)
        toast.success(`Welcome back, ${fetchedUser.full_name}!`)
      })
      .catch(() => {
        reset()
        navigate({ to: '/sign-in', replace: true })
      })
  }, [accessToken, user, setUser, reset, navigate])
}
