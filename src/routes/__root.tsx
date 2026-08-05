import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { useAuthStore } from '@/stores/auth-store'
import { useSessionBootstrap } from '@/hooks/use-session-bootstrap'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/navigation-progress'
import { GeneralError } from '@/features/errors/general-error'
import { NotFoundError } from '@/features/errors/not-found-error'

function RootComponent() {
  useSessionBootstrap()

  return (
    <>
      <NavigationProgress />
      <Outlet />
      <Toaster duration={5000} />
      {import.meta.env.MODE === 'development' && (
        <>
          <ReactQueryDevtools buttonPosition='bottom-left' />
          <TanStackRouterDevtools position='bottom-right' />
        </>
      )}
    </>
  )
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  // Runs before any child route's beforeLoad (e.g. _authenticated's token
  // check), so a GET /admin/auth/google redirect's `?token=` is captured
  // into the auth store before that guard can bounce us to /sign-in for
  // arriving with (momentarily) no stored token. Synchronous and storage-only
  // — role verification happens async in useSessionBootstrap once mounted.
  beforeLoad: () => {
    const url = new URL(window.location.href)
    const token = url.searchParams.get('token')
    if (!token) return

    url.searchParams.delete('token')
    window.history.replaceState({}, '', url.toString())
    useAuthStore.getState().auth.setAccessToken(token)
  },
  component: RootComponent,
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})
