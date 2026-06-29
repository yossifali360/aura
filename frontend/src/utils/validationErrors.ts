import axios from 'axios'

export function mapBackendValidationErrors(error: unknown): Record<string, string> | null {
  if (!axios.isAxiosError(error) || error.response?.status !== 422) {
    return null
  }

  const errors = error.response.data?.errors as Record<string, string[]> | undefined
  if (!errors) return null

  return Object.fromEntries(
    Object.entries(errors).map(([field, messages]) => [field, messages[0] ?? '']),
  )
}
