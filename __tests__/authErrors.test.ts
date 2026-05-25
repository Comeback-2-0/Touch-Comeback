import {
  AUTH_ERROR_MESSAGES,
  getAuthErrorMessage,
  normalizeAuthError,
} from '../app/utils/authErrors';

describe('authErrors', () => {
  it('maps network failures to a friendly offline message', () => {
    const error = {request: {}, message: 'Network Error'};

    expect(normalizeAuthError(error)).toBe('network');
    expect(getAuthErrorMessage(error)).toBe(AUTH_ERROR_MESSAGES.network);
  });

  it('maps server failures without exposing status codes', () => {
    const error = {response: {status: 502}, message: 'Request failed with 502'};

    expect(normalizeAuthError(error)).toBe('server');
    expect(getAuthErrorMessage(error)).toBe(AUTH_ERROR_MESSAGES.server);
    expect(getAuthErrorMessage(error)).not.toContain('502');
  });

  it('maps cancelled Google sign-in to a calm message', () => {
    const error = {code: 'SIGN_IN_CANCELLED'};

    expect(normalizeAuthError(error)).toBe('cancelled');
    expect(getAuthErrorMessage(error)).toBe(AUTH_ERROR_MESSAGES.cancelled);
  });
});
