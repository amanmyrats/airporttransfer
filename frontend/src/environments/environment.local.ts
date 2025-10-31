export const environment = {
  production: false,
  apiBase: 'http://localhost:8000/api/v1',
  authBase: 'http://localhost:8000/api/v1/auth',
  baseUrl: 'http://localhost:8000/',
  apiV1: 'api/v1/',
  googleClientId: 'YOUR_GOOGLE_CLIENT_ID',
  appleClientId: 'YOUR_APPLE_CLIENT_ID',
  appleRedirectUri: 'http://localhost:4200/auth/social/apple/callback',
  // Other development-specific variables (e.g., logging levels)
  buildTimestamp: new Date().toISOString(),

  pagination: {
    defaultPageSize: 2,
    defaultBlogPageSize: 3,
  }

  };
  
