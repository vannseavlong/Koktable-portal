import { describe, expect, it, vi } from 'vitest'
import { render } from 'vitest-browser-react'
import { ErrorBoundary } from './error-boundary'

function Bomb(): never {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  it('renders children when nothing throws', async () => {
    const { getByText } = await render(
      <ErrorBoundary>
        <p>All good</p>
      </ErrorBoundary>
    )

    await expect.element(getByText('All good')).toBeInTheDocument()
  })

  it('renders a fallback instead of crashing when a child throws', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const { getByText } = await render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    )

    await expect.element(getByText(/something went wrong/i)).toBeInTheDocument()

    vi.restoreAllMocks()
  })
})
