export const environment = {
  production: false,
  apiBase: '/api/v1',
  authBase: '/api/v1/auth',
  apiV1: 'api/v1/',
  baseUrl: 'https://backend.airporttransfer.transfertakip.com/',
  googleClientId: '455481319488-6gcbh9g2vh7oh2ust3q4e3lrbhtgu4u2.apps.googleusercontent.com',
  appleClientId: 'YOUR_APPLE_CLIENT_ID',
  appleRedirectUri: 'http://localhost:4200/auth/social/apple/callback',
  buildTimestamp: new Date().toISOString(),
  pagination: {
    defaultPageSize: 10,
    defaultBlogPageSize: 9,
  },
};
