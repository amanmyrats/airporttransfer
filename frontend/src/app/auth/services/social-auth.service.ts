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

  loadGoogle(): void {
    if (!this.isBrowser() || this.googleLoaded) {
      return;
    }
    const scriptId = 'google-gis-sdk';
    if (document.getElementById(scriptId)) {
      this.googleLoaded = true;
      return;
    }
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      this.googleLoaded = true;
    };
    document.head.appendChild(script);
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
    return this.googleLoaded && typeof google !== 'undefined';
  }

  appleInitialized(): boolean {
    return this.appleLoaded && typeof AppleID !== 'undefined';
  }

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }
}
