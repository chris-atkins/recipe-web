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
  });

  describe('imageCropped', () => {
    it('should store the cropped image and set processing to false', () => {
      component.processing = true;
      const mockEvent = { base64: 'data:image/png;base64,abc123' } as any;

      component.imageCropped(mockEvent);

      expect(component.croppedImage).toBe('data:image/png;base64,abc123');
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

      component.upload();

      httpMock.expectNone('/api/image');
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

    it('should handle upload error', () => {
      component.croppedImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      component.upload();

      const req = httpMock.expectOne('/api/image');
      req.flush('Error', { status: 500, statusText: 'Server Error' });

      expect(component.loading).toBe(false);
      expect(component.errorMsg).toBe('Error uploading image.');
    });
  });
});
