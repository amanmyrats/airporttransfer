import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../../environments/environment';

declare const google: any;
declare const AppleID: any;

@Injectable({ providedIn: 'root' })
export class SocialAuthService {
  private readonly platformId = inject(PLATFORM_ID);
  private googleLoaded = false;
  private appleLoaded = false;
  private googleLoadPromise: Promise<void> | null = null;

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

  googleInitialized(): boolean {
    return this.googleLoaded && typeof google !== 'undefined' && Boolean(google?.accounts?.id);
  }

  appleInitialized(): boolean {
    return this.appleLoaded && typeof AppleID !== 'undefined';
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
