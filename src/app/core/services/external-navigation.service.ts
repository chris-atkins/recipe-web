import { Injectable, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ExternalNavigationService {
  private get window(): Window {
    return this.document.defaultView as Window;
  }

  constructor(@Inject(DOCUMENT) private document: Document) {}

  navigateTo(location: string): void {
    this.window.location.href = location;
  }

  navigateToGoogleOAuthLogin(callbackPath: string): void {
    this.window.location.href = `/auth/google?callbackPath=${encodeURIComponent(callbackPath)}`;
  }
}
