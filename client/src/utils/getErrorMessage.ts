import axios from 'axios'

/**
 * Returns the backend's error message (error.response.data.message)
 * when it exists, otherwise the generic fallback text.
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const message = error.response?.data?.message
    if (typeof message === 'string' && message.trim() !== '') return message
  }
  return fallback
}
