import { Component, EventEmitter, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';

export interface ImageUploadResult {
  imageUrl: string;
}

@Component({
  selector: 'app-image-upload',
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent {
  @Output() imageSaved = new EventEmitter<ImageUploadResult>();

  imageChangedEvent: Event | null = null;
  croppedImage: string = '';
  loading = false;
  processing = false;
  result: ImageUploadResult | null = null;
  errorMsg = '';

  constructor(private http: HttpClient) {}

  fileChangeEvent(event: Event): void {
    this.processing = true;
    this.imageChangedEvent = event;
    this.result = null;
    this.errorMsg = '';
  }

  imageCropped(event: ImageCroppedEvent): void {
    this.croppedImage = event.base64 || '';
    this.processing = false;
  }

  imageLoaded(image: LoadedImage): void {
    this.processing = false;
  }

  cropperReady(): void {
    this.processing = false;
  }

  loadImageFailed(): void {
    this.processing = false;
    this.errorMsg = 'Failed to load image';
  }

  upload(): void {
    if (!this.croppedImage) {
      return;
    }

    this.loading = true;
    this.errorMsg = '';

    // Convert base64 to blob
    const blob = this.dataURLtoBlob(this.croppedImage);
    const formData = new FormData();
    formData.append('file', blob, 'image.png');

    this.http.post<any>('/api/image', formData).subscribe({
      next: (response) => {
        this.loading = false;
        // Handle the response - it may come as a string that needs parsing
        const result = typeof response.body === 'string' ? JSON.parse(response.body) : response;
        this.result = result;
        this.imageSaved.emit(result);
      },
      error: (error) => {
        this.loading = false;
        this.errorMsg = 'Error uploading image.';
        console.error('Image upload error:', error);
      }
    });
  }

  private dataURLtoBlob(dataURL: string): Blob {
    const arr = dataURL.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  }
}
