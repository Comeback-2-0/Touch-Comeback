import * as Keychain from 'react-native-keychain';
import {
  clearAuthTokens,
  getAuthTokens,
  saveAuthTokens,
} from '../app/utils/authTokenStorage';

jest.mock('react-native-keychain', () => ({
  getGenericPassword: jest.fn(),
  resetGenericPassword: jest.fn(),
  setGenericPassword: jest.fn(),
}));

describe('authTokenStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('stores access and refresh tokens in keychain', async () => {
    await saveAuthTokens({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
      'touch-auth',
      JSON.stringify({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
      expect.objectContaining({ service: 'touch-auth-tokens' }),
    );
  });

  it('reads stored auth tokens', async () => {
    jest.mocked(Keychain.getGenericPassword).mockResolvedValue({
      username: 'touch-auth',
      password: JSON.stringify({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
      service: 'touch-auth-tokens',
    } as Keychain.UserCredentials);

    await expect(getAuthTokens()).resolves.toEqual({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });
  });

  it('clears stored auth tokens', async () => {
    await clearAuthTokens();

    expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
      service: 'touch-auth-tokens',
    });
  });
});
