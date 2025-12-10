export const environment = {
  production: false,
  apiBase: 'http://localhost:8000/api/v1',
  authBase: 'http://localhost:8000/api/v1/auth',
  baseUrl: 'http://localhost:8000/',
  apiV1: 'api/v1/',
  googleClientId: '455481319488-6gcbh9g2vh7oh2ust3q4e3lrbhtgu4u2.apps.googleusercontent.com',
  appleClientId: 'YOUR_APPLE_CLIENT_ID',
  appleRedirectUri: 'http://localhost:4200/auth/social/apple/callback',
  // Other development-specific variables (e.g., logging levels)
  buildTimestamp: new Date().toISOString(),

  pagination: {
    defaultPageSize: 2,
    defaultBlogPageSize: 3,
  },
  TT_ATH_NEW_ORDER_CALLBACK_URL: 'http://localhost:8000/api/v1/airporttransferhub/ATHETYXYMD/acceptneworder/',
  TT_ATH_ORDER_CHANGE_CALLBACK_URL: 'http://localhost:8000/api/v1/airporttransferhub/ATHETYXYMD/acceptorderchange/',


  };
  
