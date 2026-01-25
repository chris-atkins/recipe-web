import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageUploadModalComponent } from './image-upload-modal.component';
import { ImageUploadComponent, ImageUploadResult } from '../image-upload/image-upload.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ImageCropperComponent } from 'ngx-image-cropper';

describe('ImageUploadModalComponent', () => {
  let component: ImageUploadModalComponent;
  let fixture: ComponentFixture<ImageUploadModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImageUploadModalComponent, ImageUploadComponent],
      imports: [HttpClientTestingModule, ImageCropperComponent]
    });

    fixture = TestBed.createComponent(ImageUploadModalComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit imageSaved when onImageSaved is called', (done) => {
    const mockResult: ImageUploadResult = { imageUrl: 'https://example.com/image.png' };

    component.imageSaved.subscribe((result: ImageUploadResult) => {
      expect(result).toEqual(mockResult);
      done();
    });

    component.onImageSaved(mockResult);
  });

  it('should render the upload button', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.image-upload-toggle');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Upload Image');
  });

  it('should render the modal structure', () => {
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('.image-upload-modal');
    expect(modal).toBeTruthy();
    expect(modal.classList.contains('modal')).toBe(true);
    expect(modal.classList.contains('fade')).toBe(true);
  });

  it('should include the image upload component in the modal body', () => {
    fixture.detectChanges();
    const imageUpload = fixture.nativeElement.querySelector('app-image-upload');
    expect(imageUpload).toBeTruthy();
  });

  it('should display the modal title', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('#image-upload-modal-title');
    expect(title).toBeTruthy();
    expect(title.textContent).toContain('Image Upload');
  });

  it('should have close button in header', () => {
    fixture.detectChanges();
    const closeX = fixture.nativeElement.querySelector('.close-upload-image-x');
    expect(closeX).toBeTruthy();
    expect(closeX.getAttribute('data-dismiss')).toBe('modal');
  });

  it('should have close button in footer', () => {
    fixture.detectChanges();
    const closeBtn = fixture.nativeElement.querySelector('.close-upload-image-button');
    expect(closeBtn).toBeTruthy();
    expect(closeBtn.textContent).toContain('Close');
    expect(closeBtn.getAttribute('data-dismiss')).toBe('modal');
  });

  it('should have correct modal accessibility attributes', () => {
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('.image-upload-modal');
    expect(modal.getAttribute('role')).toBe('dialog');
    expect(modal.getAttribute('aria-labelledby')).toBe('image-upload-modal-title');
    expect(modal.getAttribute('aria-hidden')).toBe('true');
  });
});
