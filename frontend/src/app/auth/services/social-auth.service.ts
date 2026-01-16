import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

declare const google: any;
declare const AppleID: any;
declare const FB: any;

@Injectable({ providedIn: 'root' })
export class SocialAuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private googleLoaded = false;
  private appleLoaded = false;
  private googleLoadPromise: Promise<void> | null = null;
  private facebookLoaded = false;
  private facebookLoadPromise: Promise<void> | null = null;

  loadGoogle(): Promise<void> {
    if (!this.isBrowser()) {
      return Promise.resolve();
    }
    if (this.googleLoaded && typeof google !== 'undefined' && google?.accounts?.id) {
      return Promise.resolve();
    }
    if (this.googleLoadPromise) {
      return this.googleLoadPromise;
    }

    const scriptId = 'google-gis-sdk';
    this.googleLoadPromise = new Promise<void>((resolve, reject) => {
      const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (existing) {
        if (typeof google !== 'undefined' && google?.accounts?.id) {
          this.googleLoaded = true;
          resolve();
          return;
        }
        existing.addEventListener('load', () => {
          this.googleLoaded = true;
          resolve();
        });
        existing.addEventListener('error', () => reject(new Error('Google script failed to load')));
        return;
      }

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => {
        this.googleLoaded = true;
        resolve();
      };
      script.onerror = () => reject(new Error('Google script failed to load'));
      document.head.appendChild(script);
    }).finally(() => {
      // Keep the resolved promise for subsequent callers, only drop on failure.
      if (!this.googleLoaded) {
        this.googleLoadPromise = null;
      }
    });

    return this.googleLoadPromise;
  }

  loadApple(): void {
    if (!this.isBrowser() || this.appleLoaded) {
      return;
    }
    const scriptId = 'apple-signin-sdk';
    if (document.getElementById(scriptId)) {
      this.appleLoaded = true;
      return;
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.async = true;
    script.onload = () => {
      this.appleLoaded = true;
      if (typeof AppleID !== 'undefined' && AppleID?.auth?.init) {
        AppleID.auth.init({
          clientId: environment.appleClientId,
          scope: 'name email',
          redirectURI: environment.appleRedirectUri,
          usePopup: true,
        });
      }
    };
    document.head.appendChild(script);
  }

  loadFacebook(): Promise<void> {
    if (!this.isBrowser()) {
      return Promise.resolve();
    }
    if (this.facebookLoadPromise) {
      return this.facebookLoadPromise;
    }
    const appId = environment.facebookAppId;
    if (!appId) {
      return Promise.reject(new Error('facebook_unavailable'));
    }
    const scriptId = 'facebook-jssdk';
    const ensureInit = (): Promise<void> => {
      const w = window as any;
      if (!w.FB) {
        return Promise.reject(new Error('facebook_unavailable'));
      }
      if (w.__fbInitialized) {
        return Promise.resolve();
      }
      return new Promise<void>((resolve, reject) => {
        try {
          w.FB.init({
            appId,
            cookie: true,
            xfbml: false,
            version: 'v24.0',
          });
          w.FB.getLoginStatus(() => {
            w.__fbInitialized = true;
            this.facebookLoaded = true;
            resolve();
          });
        } catch (error) {
          reject(error);
        }
      });
    };

    this.facebookLoadPromise = new Promise<void>((resolve, reject) => {
      const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
      const afterScriptReady = () => {
        ensureInit()
          .then(resolve)
          .catch(() => reject(new Error('facebook_init_failed')));
      };

      if ((window as any).FB) {
        afterScriptReady();
        return;
      }

      if (existing) {
        existing.addEventListener('load', afterScriptReady);
        existing.addEventListener('error', () => reject(new Error('facebook_load_failed')));
        return;
      }

      (window as any).fbAsyncInit = () => {
        afterScriptReady();
      };

      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.onerror = () => reject(new Error('facebook_load_failed'));
      document.head.appendChild(script);
    }).finally(() => {
      if (!this.facebookLoaded) {
        this.facebookLoadPromise = null;
      }
    });
    return this.facebookLoadPromise;
  }

  googleInitialized(): boolean {
    return this.googleLoaded && typeof google !== 'undefined' && Boolean(google?.accounts?.id);
  }

  appleInitialized(): boolean {
    return this.appleLoaded && typeof AppleID !== 'undefined';
  }

  facebookInitialized(): boolean {
    return this.facebookLoaded && typeof FB !== 'undefined' && Boolean((window as any).__fbInitialized);
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
