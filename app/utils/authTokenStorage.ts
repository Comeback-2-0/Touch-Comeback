import * as Keychain from 'react-native-keychain';

const SERVICE = 'touch-auth-tokens';
const USERNAME = 'touch-auth';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export const saveAuthTokens = async (tokens: AuthTokens) => {
  await Keychain.setGenericPassword(USERNAME, JSON.stringify(tokens), {
    service: SERVICE,
  });
};

export const getAuthTokens = async (): Promise<AuthTokens | null> => {
  const credentials = await Keychain.getGenericPassword({ service: SERVICE });
  if (!credentials) return null;

  return JSON.parse(credentials.password) as AuthTokens;
};

export const clearAuthTokens = async () => {
  await Keychain.resetGenericPassword({ service: SERVICE });
};
