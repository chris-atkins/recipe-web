import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ImageUploadComponent, ImageUploadResult } from './image-upload.component';
import { ImageCropperComponent } from 'ngx-image-cropper';

describe('ImageUploadComponent', () => {
  let component: ImageUploadComponent;
  let fixture: ComponentFixture<ImageUploadComponent>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImageUploadComponent],
      imports: [HttpClientTestingModule, ImageCropperComponent]
    });

    fixture = TestBed.createComponent(ImageUploadComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.imageChangedEvent).toBeNull();
    expect(component.croppedImage).toBe('');
    expect(component.loading).toBe(false);
    expect(component.processing).toBe(false);
    expect(component.result).toBeNull();
    expect(component.errorMsg).toBe('');
  });

  describe('fileChangeEvent', () => {
    it('should set processing to true and store the event', () => {
      const mockEvent = new Event('change');

      component.fileChangeEvent(mockEvent);

      expect(component.processing).toBe(true);
      expect(component.imageChangedEvent).toBe(mockEvent);
      expect(component.result).toBeNull();
      expect(component.errorMsg).toBe('');
    });

    it('should clear previous result and error when new file is selected', () => {
      component.result = { imageUrl: 'http://example.com/old.png' };
      component.errorMsg = 'Previous error';
      const mockEvent = new Event('change');

      component.fileChangeEvent(mockEvent);

      expect(component.result).toBeNull();
      expect(component.errorMsg).toBe('');
    });
  });

  describe('imageCropped', () => {
    it('should store the cropped image and set processing to false', () => {
      component.processing = true;
      const mockEvent = { base64: 'data:image/png;base64,abc123' } as any;

      component.imageCropped(mockEvent);

      expect(component.croppedImage).toBe('data:image/png;base64,abc123');
      expect(component.processing).toBe(false);
    });

    it('should handle undefined base64 gracefully', () => {
      component.processing = true;
      const mockEvent = { base64: undefined } as any;

      component.imageCropped(mockEvent);

      expect(component.croppedImage).toBe('');
      expect(component.processing).toBe(false);
    });
  });

  describe('imageLoaded', () => {
    it('should set processing to false when image is loaded', () => {
      component.processing = true;

      component.imageLoaded({} as any);

      expect(component.processing).toBe(false);
    });
  });

  describe('cropperReady', () => {
    it('should set processing to false when cropper is ready', () => {
      component.processing = true;

      component.cropperReady();

      expect(component.processing).toBe(false);
    });
  });

  describe('loadImageFailed', () => {
    it('should set error message and processing to false', () => {
      component.processing = true;

      component.loadImageFailed();

      expect(component.processing).toBe(false);
      expect(component.errorMsg).toBe('Failed to load image');
    });
  });

  describe('upload', () => {
    it('should not upload if no cropped image', () => {
      component.croppedImage = '';
      component.loading = false;

      component.upload();

      // Verify no HTTP request was made
      httpMock.expectNone('/api/image');
      // Verify loading state wasn't changed
      expect(component.loading).toBe(false);
    });

    it('should upload cropped image and emit result', (done) => {
      const mockResult: ImageUploadResult = { imageUrl: 'https://example.com/image.png' };
      component.croppedImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      component.imageSaved.subscribe((result: ImageUploadResult) => {
        expect(result).toEqual(mockResult);
        done();
      });

      component.upload();

      expect(component.loading).toBe(true);

      const req = httpMock.expectOne('/api/image');
      expect(req.request.method).toBe('POST');
      req.flush(mockResult);

      expect(component.loading).toBe(false);
      expect(component.result).toEqual(mockResult);
    });

    it('should clear error message before upload', () => {
      component.croppedImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      component.errorMsg = 'Previous error';

      component.upload();

      expect(component.errorMsg).toBe('');

      const req = httpMock.expectOne('/api/image');
      req.flush({ imageUrl: 'test.png' });
    });

    it('should handle upload error', () => {
      component.croppedImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      component.upload();

      const req = httpMock.expectOne('/api/image');
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      expect(component.loading).toBe(false);
      expect(component.errorMsg).toBe('Error uploading image.');
    });

    it('should send FormData with correct structure', () => {
      component.croppedImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      component.upload();

      const req = httpMock.expectOne('/api/image');
      expect(req.request.body instanceof FormData).toBe(true);
      req.flush({ imageUrl: 'test.png' });
    });
  });

  describe('template rendering', () => {
    it('should show file input button', () => {
      fixture.detectChanges();
      const input = fixture.nativeElement.querySelector('.select-image-button');
      expect(input).toBeTruthy();
      expect(input.getAttribute('type')).toBe('file');
      expect(input.getAttribute('accept')).toBe('image/*');
    });

    it('should show processing message when processing', () => {
      component.processing = true;
      fixture.detectChanges();
      const message = fixture.nativeElement.querySelector('.processing-message');
      expect(message).toBeTruthy();
      expect(message.textContent).toContain('Processing...');
    });

    it('should hide processing message when not processing', () => {
      component.processing = false;
      fixture.detectChanges();
      const message = fixture.nativeElement.querySelector('.processing-message');
      expect(message).toBeFalsy();
    });

    it('should show cropped image preview when croppedImage is set', () => {
      component.croppedImage = 'data:image/png;base64,abc123';
      fixture.detectChanges();
      const preview = fixture.nativeElement.querySelector('.cropped-image img');
      expect(preview).toBeTruthy();
      expect(preview.getAttribute('src')).toBe('data:image/png;base64,abc123');
    });

    it('should show upload button when croppedImage is set', () => {
      component.croppedImage = 'data:image/png;base64,abc123';
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('.upload-image-button');
      expect(button).toBeTruthy();
      expect(button.textContent).toBe('Submit');
    });

    it('should disable upload button when loading', () => {
      component.croppedImage = 'data:image/png;base64,abc123';
      component.loading = true;
      fixture.detectChanges();
      const button = fixture.nativeElement.querySelector('.upload-image-button');
      expect(button.disabled).toBe(true);
    });

    it('should show loading message when loading', () => {
      component.croppedImage = 'data:image/png;base64,abc123';
      component.loading = true;
      fixture.detectChanges();
      const message = fixture.nativeElement.querySelector('.loading-message');
      expect(message).toBeTruthy();
      expect(message.textContent).toContain('Working...');
    });

    it('should show success message when result is set', () => {
      component.croppedImage = 'data:image/png;base64,abc123';
      component.result = { imageUrl: 'http://example.com/image.png' };
      fixture.detectChanges();
      const message = fixture.nativeElement.querySelector('.success-message');
      expect(message).toBeTruthy();
      expect(message.textContent).toContain('Image uploaded.');
    });

    it('should show error message when errorMsg is set', () => {
      component.croppedImage = 'data:image/png;base64,abc123';
      component.errorMsg = 'Upload failed';
      fixture.detectChanges();
      const message = fixture.nativeElement.querySelector('.error-message');
      expect(message).toBeTruthy();
      expect(message.textContent).toContain('Upload failed');
    });

    it('should show image cropper when image is selected', () => {
      component.imageChangedEvent = new Event('change');
      fixture.detectChanges();
      const cropper = fixture.nativeElement.querySelector('image-cropper');
      expect(cropper).toBeTruthy();
    });

    it('should hide image cropper when no image is selected', () => {
      component.imageChangedEvent = null;
      fixture.detectChanges();
      const cropper = fixture.nativeElement.querySelector('image-cropper');
      expect(cropper).toBeFalsy();
    });
  });
});
