import { useAuthStore } from '@/stores/auth-store'

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

/**
 * Error shape thrown by the API client for any non-2xx response, mirroring
 * the `{ error, details? }` body documented in ADMIN_API.md.
 */
export class ApiError extends Error {
  status: number
  details?: string[]

  constructor(status: number, message: string, details?: string[]) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

type QueryValue = string | number | boolean | undefined | null

type RequestOptions = {
  method?: string
  body?: unknown
  query?: Record<string, QueryValue>
  headers?: Record<string, string>
}

function isFormData(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData
}

function buildUrl(path: string, query?: Record<string, QueryValue>): string {
  const url = new URL(path.replace(/^\//, ''), API_BASE_URL + '/')
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
}

async function request<T>(
  path: string,
  { method = 'GET', body, query, headers }: RequestOptions = {}
): Promise<T> {
  const token = useAuthStore.getState().auth.accessToken
  const formData = isFormData(body)

  const response = await fetch(buildUrl(path, query), {
    method,
    headers: {
      // Omit Content-Type for FormData — the browser sets the multipart
      // boundary itself; setting it manually breaks the parse on the server.
      ...(formData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: formData
      ? body
      : body !== undefined
        ? JSON.stringify(body)
        : undefined,
  })

  if (response.status === 401 || response.status === 403) {
    useAuthStore.getState().auth.reset()
    if (
      typeof window !== 'undefined' &&
      window.location.pathname !== '/sign-in'
    ) {
      window.location.href = '/sign-in'
    }
  }

  if (response.status === 204) {
    return undefined as T
  }

  let data: unknown = null
  try {
    data = await response.json()
  } catch {
    // No JSON body (or an empty one) — treat as no data.
  }

  if (!response.ok) {
    const errorBody = (data ?? {}) as { error?: string; details?: string[] }
    const message =
      typeof errorBody.error === 'string' && errorBody.error.length > 0
        ? errorBody.error
        : `Request failed with status ${response.status}`
    throw new ApiError(response.status, message, errorBody.details)
  }

  return data as T
}

export const apiClient = {
  get: <T>(path: string, query?: Record<string, QueryValue>) =>
    request<T>(path, { method: 'GET', query }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  // FormData variants for endpoints that accept an optional image upload
  // alongside other fields (multipart/form-data instead of JSON).
  postForm: <T>(path: string, body: FormData) =>
    request<T>(path, { method: 'POST', body }),
  patchForm: <T>(path: string, body: FormData) =>
    request<T>(path, { method: 'PATCH', body }),
}
