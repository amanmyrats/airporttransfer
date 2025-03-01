import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router, NavigationEnd } from '@angular/router';
import { GoogleTagManagerService } from 'angular-google-tag-manager';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'airporttransfer';

  private gtmService = inject(GoogleTagManagerService);
  private router = inject(Router);

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const gtmTag = {
          event: 'page_view',
          pagePath: event.urlAfterRedirects
        };
        // console.log('before Pushing GTM Tag:', gtmTag);
        this.gtmService.pushTag(gtmTag);
        // console.log('after Pushing GTM Tag:', gtmTag);
      }
    });
  }
}

