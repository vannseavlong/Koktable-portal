import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Top-level safety net for errors TanStack Router's own `errorComponent`
 * doesn't cover — anything thrown outside the router tree (context
 * providers, or `RouterProvider` itself failing to mount) — so a render
 * error shows a fallback instead of a blank screen. Route-tree errors are
 * already caught by `errorComponent: GeneralError` in `routes/__root.tsx`;
 * this can't reuse that component since it calls `useRouter()`, which would
 * itself throw if the router is what failed to mount.
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(error, errorInfo)
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className='flex h-svh w-full flex-col items-center justify-center gap-2'>
          <h1 className='text-[7rem] leading-tight font-bold'>500</h1>
          <span className='font-medium'>
            Oops! Something went wrong {`:')`}
          </span>
          <p className='text-center text-muted-foreground'>
            We apologize for the inconvenience. <br /> Please try reloading the
            page.
          </p>
          <button
            className='mt-6 rounded-md border px-4 py-2 text-sm font-medium'
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
