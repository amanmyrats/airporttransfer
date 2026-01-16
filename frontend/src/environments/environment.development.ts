export const environment = {
  production: false,
  apiBase: 'https://dev.backend.airporttransferhub.com/api/v1',
  authBase: 'https://dev.backend.airporttransferhub.com/api/v1/auth',
  baseUrl: 'https://dev.backend.airporttransferhub.com/',
  apiV1: 'api/v1/',
  googleClientId: '455481319488-6gcbh9g2vh7oh2ust3q4e3lrbhtgu4u2.apps.googleusercontent.com',
  appleClientId: 'YOUR_APPLE_CLIENT_ID',
  appleRedirectUri: 'https://dev.airporttransferhub.com/auth/social/apple/callback',
  facebookAppId: 'YOUR_FACEBOOK_APP_ID',
  buildTimestamp: new Date().toISOString(),
  pagination: {
    defaultPageSize: 10,
    defaultBlogPageSize: 9,
  },
  TT_ATH_NEW_ORDER_CALLBACK_URL: 'https://dev.backend.airporttransferhub.com/api/v1/airporttransferhub/ATHETYXYMD/acceptneworder/',
  TT_ATH_ORDER_CHANGE_CALLBACK_URL: 'https://dev.backend.airporttransferhub.com/api/v1/airporttransferhub/ATHETYXYMD/acceptorderchange/',
};
