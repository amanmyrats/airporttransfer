
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { signal } from '@angular/core';

@Component({
  selector: 'app-cookie-consent',
  imports: [
    CommonModule, 
  ],
  templateUrl: './cookie-consent.component.html',
  styleUrl: './cookie-consent.component.scss'
})
export class CookieConsentComponent implements OnInit {
  showBanner = signal(false);
  currentLang = signal('en'); // fallback

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const consent = localStorage.getItem('cookie_consent');
      if (!consent) {
        this.showBanner.set(true);
      }
  
      setTimeout(() => {
        const segments = this.router.url.split('/');
        if (segments.length > 1 && segments[1].length === 2) {
          this.currentLang.set(segments[1]);
        }
      });
    }
  }

  acceptCookies() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cookie_consent', 'accepted');
      this.showBanner.set(false);
    }
  }
}
