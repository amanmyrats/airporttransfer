export const environment = {
  production: false,
  apiBase: 'https://dev.backend.airporttransferhub.com/api/v1',
  authBase: 'https://dev.backend.airporttransferhub.com/api/v1/auth',
  baseUrl: 'https://dev.backend.airporttransferhub.com/',
  apiV1: 'api/v1/',
  googleClientId: '455481319488-6gcbh9g2vh7oh2ust3q4e3lrbhtgu4u2.apps.googleusercontent.com',
  appleClientId: 'YOUR_APPLE_CLIENT_ID',
  appleRedirectUri: 'https://airporttransferhub.com/auth/social/apple/callback',
  buildTimestamp: new Date().toISOString(),
  pagination: {
    defaultPageSize: 10,
    defaultBlogPageSize: 9,
  },
};
