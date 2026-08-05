import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, type RenderResult } from 'vitest-browser-react'
import { type Locator, userEvent } from 'vitest/browser'
import { UserAuthForm } from './user-auth-form'

const FORM_MESSAGES = {
  emailEmpty: 'Please enter your email.',
  passwordEmpty: 'Please enter your password.',
} as const

const {
  navigate,
  setUserMock,
  setAccessTokenMock,
  postMock,
  toastError,
  toastSuccess,
  MockApiError,
} = vi.hoisted(() => {
  class MockApiError extends Error {
    status: number
    details?: string[]
    constructor(status: number, message: string, details?: string[]) {
      super(message)
      this.name = 'ApiError'
      this.status = status
      this.details = details
    }
  }

  return {
    navigate: vi.fn(),
    setUserMock: vi.fn(),
    setAccessTokenMock: vi.fn(),
    postMock: vi.fn(),
    toastError: vi.fn(),
    toastSuccess: vi.fn(),
    MockApiError,
  }
})

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    auth: {
      setUser: setUserMock,
      setAccessToken: setAccessTokenMock,
    },
  }),
}))

vi.mock('@/lib/api-client', () => ({
  ApiError: MockApiError,
  apiClient: { post: (...args: unknown[]) => postMock(...args) },
  API_BASE_URL: 'http://localhost:3000',
}))

vi.mock('sonner', () => ({
  toast: { error: toastError, success: toastSuccess },
}))

vi.mock('@tanstack/react-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-router')>()
  return {
    ...actual,
    useNavigate: () => navigate,
  }
})

const ADMIN_USER = {
  user_id: 'u_1',
  email: 'a@b.com',
  full_name: 'Admin User',
  role: 'admin',
}

describe('UserAuthForm', () => {
  let screen: RenderResult
  let emailInput: Locator
  let passwordInput: Locator
  let signInButton: Locator

  beforeEach(async () => {
    vi.clearAllMocks()
    screen = await render(<UserAuthForm />)
    emailInput = screen.getByRole('textbox', { name: /^Email$/i })
    passwordInput = screen.getByLabelText(/^Password$/i)
    signInButton = screen.getByRole('button', { name: /^Sign in$/i })
  })

  it('renders fields and submit button', async () => {
    await expect.element(emailInput).toBeInTheDocument()
    await expect.element(passwordInput).toBeInTheDocument()
    await expect.element(signInButton).toBeInTheDocument()
  })

  it('shows validation messages when submitting empty form', async () => {
    await userEvent.click(signInButton)

    await expect
      .element(screen.getByText(FORM_MESSAGES.emailEmpty))
      .toBeInTheDocument()
    await expect
      .element(screen.getByText(FORM_MESSAGES.passwordEmpty))
      .toBeInTheDocument()
  })

  it('logs in and navigates to default route when the account is an admin', async () => {
    postMock.mockResolvedValueOnce({ token: 'jwt-token', user: ADMIN_USER })

    await userEvent.fill(emailInput, 'a@b.com')
    await userEvent.fill(passwordInput, 'S3cur3Pass!')
    await userEvent.click(signInButton)

    await vi.waitFor(() => expect(setUserMock).toHaveBeenCalledOnce())
    expect(setUserMock).toHaveBeenCalledWith(ADMIN_USER)
    expect(setAccessTokenMock).toHaveBeenCalledWith('jwt-token')

    await vi.waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({ to: '/', replace: true })
    )
  })

  it('rejects a non-admin account without storing credentials', async () => {
    postMock.mockResolvedValueOnce({
      token: 'jwt-token',
      user: { ...ADMIN_USER, role: 'user' },
    })

    await userEvent.fill(emailInput, 'a@b.com')
    await userEvent.fill(passwordInput, 'S3cur3Pass!')
    await userEvent.click(signInButton)

    await vi.waitFor(() => expect(toastError).toHaveBeenCalledOnce())
    expect(setUserMock).not.toHaveBeenCalled()
    expect(setAccessTokenMock).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
  })

  it('shows the server error message on invalid credentials', async () => {
    const { ApiError } = await import('@/lib/api-client')
    postMock.mockRejectedValueOnce(new ApiError(401, 'Invalid credentials'))

    await userEvent.fill(emailInput, 'a@b.com')
    await userEvent.fill(passwordInput, 'wrongpass')
    await userEvent.click(signInButton)

    await vi.waitFor(() =>
      expect(toastError).toHaveBeenCalledWith('Invalid credentials')
    )
    expect(setUserMock).not.toHaveBeenCalled()
  })
})
