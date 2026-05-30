describe('API_URL', () => {
  const loadApiUrl = (isDev: boolean) => {
    const previousDev = (global as any).__DEV__;
    (global as any).__DEV__ = isDev;

    jest.resetModules();
    jest.doMock('../app/utils/authTokenStorage', () => ({
      clearAuthTokens: jest.fn(),
      getAuthTokens: jest.fn(),
      saveAuthTokens: jest.fn(),
    }));

    const { API_URL } = require('../app/utils/api');

    (global as any).__DEV__ = previousDev;
    return API_URL;
  };

  it('uses the testing API in debug builds', () => {
    expect(loadApiUrl(true)).toBe('https://api.comeback.website');
  });

  it('uses the load balancer API in release builds', () => {
    expect(loadApiUrl(false)).toBe('https://touch-load-balancer.ij-roy.workers.dev');
  });
});
