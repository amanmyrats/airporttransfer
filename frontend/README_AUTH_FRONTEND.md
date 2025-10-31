# Frontend Authentication Guide

This document outlines the SPA-side authentication and account experience that complements the Django `/api/v1/auth/` backend.

## Environment Variables

Configure `src/environments/` to supply client IDs and base URLs. Each file exposes:

```
apiBase: '<protocol>//<host>/api/v1'
authBase: '<protocol>//<host>/api/v1/auth'
baseUrl: '<protocol>//<host>/'           # legacy compatibility
apiV1: 'api/v1/'                         # legacy compatibility for existing services
googleClientId: '<Google OAuth client id>'
appleClientId: '<Apple services id>'
appleRedirectUri: 'https://airporttransferhub.com/auth/social/apple/callback'
```

For local development update `environment.local.ts` and run with `ng serve --configuration local`.

## Session Lifecycle

`AuthService` (signals-based) persists `access`, `refresh`, and `user` JSON in `localStorage`. On boot (`APP_INITIALIZER`) it restores tokens, then calls `/me/` if needed. The service exposes `user`, `accessToken`, `refreshToken`, and `isAuthenticated` signals for other components.

## HTTP Interceptor

`jwt.interceptor.ts` attaches `Authorization: Bearer <access>` for requests targeting `environment.apiBase`. On `401` it queues a refresh via `/token/refresh/`. If refresh fails, it clears session data, stores the current URL in `localStorage` (`auth.returnUrl`), and redirects to `/auth/login` with a `returnUrl` query param.

## Routes

```
/auth/login
/auth/register
/auth/verify-email?key=...
/auth/forgot-password
/auth/reset-password?uid=...&token=...
/auth/social/apple/callback

/account                (AccountShellComponent + ClientAuthGuard)
/account/profile
/account/reservations
/account/reservations/:id
```

Auth screens are standalone Angular components built with semantic HTML/CSS (no PrimeNG dependency) and SSR-safe checks. The account area remains PrimeNG-driven but now loads through `account/account.routes.ts` with its own theme.

## Social Sign-In

- **Google**: Loads `https://accounts.google.com/gsi/client` on demand. Buttons call `google.accounts.id.initialize` / `prompt` and exchange the `credential` with `/social/google/`.
- **Apple**: Loads `https://appleid.cdn-apple.com/.../appleid.auth.js`. Uses popup mode (`usePopup: true`). The `/auth/social/apple/callback` route also supports redirect fallback by reading `id_token` and calling `/social/apple/`.

## Account Area

- **AccountShell**: Sidebar navigation + logout button (POST `/logout/`). Uses a dedicated PrimeNG theme preset (`Material`) applied via route providers, mirroring the admin area approach.
- **Dashboard**: Placeholder cards with user info.
- **Profile**: Edits `first_name`, `last_name`, and `customer_profile` fields (`PATCH /me/`).
- **Reservations**: List & detail placeholders for future integration.

## Bootstrap Checklist

1. Populate environment files (dev/prod/local) with backend URLs and social client IDs.
2. Run `npm install` to ensure PrimeNG dependencies are available.
3. Start the app; `AuthService` restores sessions and fetches `/me/` automatically.
4. Validate flows (register → email verify → login → refresh → logout).

## SSR Notes

- All direct DOM or storage access is guarded with `isPlatformBrowser` checks.
- Social scripts are injected only in the browser.

## Manual Test Scenarios

1. Register a new user → expect verify notice prompting email confirmation.
2. Visit email link → `/auth/verify-email?key=...` shows success and allows login.
3. Login with email/password → redirected to `/account`.
4. Trigger forgot/reset password flow → verify success message and ability to log in with new password.
5. Use Google Sign-In (requires valid client ID) → forwards to `/account` and stores session.
6. Use Apple Sign-In with popup → returns to `/account`.
7. Edit profile fields → saved via `/me/` and reflected in sidebar.
8. Force token expiry (or revoke) → interceptor refreshes tokens once; on failure redirects to login preserving `returnUrl`.

> **Language prefixes:** `/auth` and `/account` routes accept optional `/en|de|ru|tr` prefixes. Guards and helper utilities keep redirects and return URLs inside the active language shell.

For issues or enhancements, update the relevant standalone component under `src/app/auth/` or `src/app/account/`.
