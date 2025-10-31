export const environment = {
  production: false,
  apiBase: 'https://dev.backend.airporttransferhub.com/api/v1',
  authBase: 'https://dev.backend.airporttransferhub.com/api/v1/auth',
  baseUrl: 'https://dev.backend.airporttransferhub.com/',
  apiV1: 'api/v1/',
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID',
  appleClientId: 'YOUR_APPLE_CLIENT_ID',
  appleRedirectUri: 'https://airporttransferhub.com/auth/social/apple/callback',
  buildTimestamp: new Date().toISOString(),
  pagination: {
    defaultPageSize: 10,
    defaultBlogPageSize: 9,
  },
};
