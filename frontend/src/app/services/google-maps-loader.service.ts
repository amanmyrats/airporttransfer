import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type GoogleMapsLoaderState =
  | { status: 'loading'; message?: string }
  | { status: 'ready'; message?: string }
  | { status: 'failed'; message: string };

@Injectable({
  providedIn: 'root',
})
export class GoogleMapsLoaderService {
  private readonly stateSubject = new BehaviorSubject<GoogleMapsLoaderState>({
    status: 'loading',
    message: 'Loading Google Places…',
  });

  readonly state$ = this.stateSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {
    if (!isPlatformBrowser(this.platformId)) {
      this.stateSubject.next({ status: 'ready' });
      return;
    }

    this.monitorGoogleMapsScript();
  }

  private monitorGoogleMapsScript(): void {
    if (this.hasGoogleMaps()) {
      this.stateSubject.next({ status: 'ready' });
      return;
    }

    const script = this.findMapsScriptTag();
    if (script) {
      script.addEventListener('load', this.onScriptLoad);
      script.addEventListener('error', this.onScriptError);
    }

    const pollInterval = window.setInterval(() => {
      if (this.hasGoogleMaps()) {
        this.transitionToReady();
        clearInterval(pollInterval);
        clearTimeout(timeoutHandle);
      }
    }, 120);

    const timeoutHandle = window.setTimeout(() => {
      clearInterval(pollInterval);
      if (this.stateSubject.value.status === 'loading') {
        this.transitionToFailed(
          'We could not load Google Places suggestions. Please refresh the page or contact us on WhatsApp.',
        );
      }
    }, 10000);
  }

  private onScriptLoad = (): void => {
    if (this.stateSubject.value.status !== 'loading') {
      return;
    }

    if (this.hasGoogleMaps()) {
      this.transitionToReady();
    }
  };

  private onScriptError = (): void => {
    if (this.stateSubject.value.status === 'loading') {
      this.transitionToFailed(
        'Google Places is temporarily unavailable. Please check your connection and reload the page.',
      );
    }
  };

  private transitionToReady(): void {
    this.cleanupScriptListeners();
    this.stateSubject.next({ status: 'ready' });
  }

  private transitionToFailed(message: string): void {
    this.cleanupScriptListeners();
    this.stateSubject.next({ status: 'failed', message });
  }

  private cleanupScriptListeners(): void {
    const script = this.findMapsScriptTag();
    if (script) {
      script.removeEventListener('load', this.onScriptLoad);
      script.removeEventListener('error', this.onScriptError);
    }
  }

  private hasGoogleMaps(): boolean {
    const googleRef = (window as typeof window & { google?: typeof google }).google;
    return !!googleRef?.maps?.importLibrary;
  }

  private findMapsScriptTag(): HTMLScriptElement | null {
    return document.querySelector<HTMLScriptElement>('script[src*="maps.googleapis.com/maps/api/js"]');
  }
}
