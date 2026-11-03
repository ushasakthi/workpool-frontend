import { isAxiosError } from 'axios';

const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';
const NETWORK_ERROR_MESSAGE = 'Could not reach the server. Check your connection and try again.';
const TIMEOUT_MESSAGE = 'The server took too long to respond. Please try again.';
const SERVER_ERROR_MESSAGE = 'Something went wrong on our side. Please try again in a moment.';
const RATE_LIMIT_MESSAGE = 'Too many attempts. Please wait a minute and try again.';

// One place that turns any failed request into a sentence a user can act on.
export function getErrorMessage(error: unknown): string {
  if (!isAxiosError(error)) {
    return FALLBACK_MESSAGE;
  }

  // no reply at all
  if (!error.response) {
    return error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
      ? TIMEOUT_MESSAGE
      : NETWORK_ERROR_MESSAGE;
  }

  const { status } = error.response;
  // server faults: its own message ("Internal server error") isn't useful to users
  if (status >= 500) {
    return SERVER_ERROR_MESSAGE;
  }
  if (status === 429) {
    return RATE_LIMIT_MESSAGE;
  }

  // 4xx: the backend's validation / business message is written for users
  const data = error.response.data as { message?: string | string[] } | undefined;
  if (Array.isArray(data?.message) && data.message.length > 0) {
    return data.message[0];
  }
  if (typeof data?.message === 'string') {
    return data.message;
  }
  return FALLBACK_MESSAGE;
}
