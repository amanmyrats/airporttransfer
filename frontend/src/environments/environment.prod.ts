export const environment = {
  production: true,
  apiBase: 'https://backend.airporttransfer.transfertakip.com/api/v1',
  authBase: 'https://backend.airporttransfer.transfertakip.com/api/v1/auth',
  apiV1: 'api/v1/',
  baseUrl: 'https://backend.airporttransfer.transfertakip.com/',
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID',
  appleClientId: 'YOUR_APPLE_CLIENT_ID',
  appleRedirectUri: 'https://airporttransferhub.com/auth/social/apple/callback',
  buildTimestamp: new Date().toISOString(),
  pagination: {
    defaultPageSize: 10,
    defaultBlogPageSize: 9,
  },
};
