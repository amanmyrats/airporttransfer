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
      console.log('[FB] loadFacebook: not in browser');
      return Promise.resolve();
    }
    if (this.facebookLoadPromise) {
      console.log('[FB] loadFacebook: reusing promise');
      return this.facebookLoadPromise;
    }
    const appId = environment.facebookAppId;
    if (!appId) {
      console.warn('[FB] loadFacebook: missing appId');
      return Promise.reject(new Error('facebook_unavailable'));
    }
    const scriptId = 'facebook-jssdk';
    const ensureInit = (): Promise<void> => {
      const w = window as any;
      console.log('[FB] ensureInit: start', { hasFB: Boolean(w.FB), initialized: Boolean(w.__fbInitialized) });
      if (!w.FB) {
        return Promise.reject(new Error('facebook_unavailable'));
      }
      if (w.__fbInitialized) {
        console.log('[FB] ensureInit: already initialized');
        return Promise.resolve();
      }
      return new Promise<void>((resolve, reject) => {
        try {
          console.log('[FB] ensureInit: calling FB.init');
          w.FB.init({
            appId,
            cookie: true,
            xfbml: false,
            version: 'v24.0',
          });
          console.log('[FB] ensureInit: calling FB.getLoginStatus');
          w.FB.getLoginStatus(() => {
            w.__fbInitialized = true;
            this.facebookLoaded = true;
            console.log('[FB] ensureInit: init complete');
            resolve();
          });
        } catch (error) {
          console.error('[FB] ensureInit: init failed', error);
          reject(error);
        }
      });
    };

    this.facebookLoadPromise = new Promise<void>((resolve, reject) => {
      const existing = document.getElementById(scriptId) as HTMLScriptElement | null;
      const afterScriptReady = () => {
        console.log('[FB] afterScriptReady');
        ensureInit()
          .then(resolve)
          .catch(error => {
            console.error('[FB] afterScriptReady: init failed', error);
            reject(new Error('facebook_init_failed'));
          });
      };

      if ((window as any).FB) {
        console.log('[FB] loadFacebook: FB already on window');
        afterScriptReady();
        return;
      }

      if (existing) {
        console.log('[FB] loadFacebook: script tag exists');
        existing.addEventListener('load', afterScriptReady);
        existing.addEventListener('error', () => reject(new Error('facebook_load_failed')));
        return;
      }

      console.log('[FB] loadFacebook: setting fbAsyncInit and injecting SDK');
      (window as any).fbAsyncInit = () => {
        console.log('[FB] fbAsyncInit fired');
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
        console.warn('[FB] loadFacebook: not loaded, clearing promise');
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
