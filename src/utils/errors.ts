import { isAxiosError } from 'axios';

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_ERROR_MESSAGE = 'Could not reach the server. Check your connection and try again.';

export function getErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return FALLBACK_MESSAGE;
  }

  const data = error.response?.data as { message?: string | string[] } | undefined;
  if (Array.isArray(data?.message) && data.message.length > 0) {
    return data.message[0];
  }
  if (typeof data?.message === 'string') {
    return data.message;
  }
  if (!error.response) {
    return NETWORK_ERROR_MESSAGE;
  }

  return FALLBACK_MESSAGE;
}
