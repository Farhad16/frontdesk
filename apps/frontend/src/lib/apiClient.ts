const BASE_URL = '/api'

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(BASE_URL + path, {
    credentials: 'include',
    headers: {'Content-Type': 'application/json', ...options.headers},
    ...options,
  })
  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    throw new ApiError(response.status, (body as {message?: string}).message ?? response.statusText)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {method: 'POST', body: body ? JSON.stringify(body) : undefined}),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, {method: 'PUT', body: body ? JSON.stringify(body) : undefined}),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {method: 'PATCH', body: body ? JSON.stringify(body) : undefined}),
  delete: <T>(path: string) => request<T>(path, {method: 'DELETE'}),
}
