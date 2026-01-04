import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { ExternalNavigationService } from './external-navigation.service';

describe('ExternalNavigationService', () => {
  let service: ExternalNavigationService;
  let mockWindow: any;

  beforeEach(() => {
    mockWindow = {
      location: {
        href: ''
      }
    };

    const mockDocument = {
      defaultView: mockWindow
    };

    TestBed.configureTestingModule({
      providers: [
        ExternalNavigationService,
        { provide: DOCUMENT, useValue: mockDocument }
      ]
    });
    service = TestBed.inject(ExternalNavigationService);
  });

  describe('navigateTo', () => {
    it('should navigate to the specified location', () => {
      service.navigateTo('https://example.com');

      expect(mockWindow.location.href).toBe('https://example.com');
    });
  });

  describe('navigateToGoogleOAuthLogin', () => {
    it('should navigate to Google OAuth with encoded callback path', () => {
      service.navigateToGoogleOAuthLogin('/home');

      expect(mockWindow.location.href).toBe('/auth/google?callbackPath=%2Fhome');
    });

    it('should properly encode callback path with special characters', () => {
      service.navigateToGoogleOAuthLogin('/recipe/view?id=123');

      expect(mockWindow.location.href).toBe('/auth/google?callbackPath=%2Frecipe%2Fview%3Fid%3D123');
    });
  });
});
