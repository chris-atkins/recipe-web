import { Component, EventEmitter, Output } from '@angular/core';
import { ImageUploadResult } from '../image-upload/image-upload.component';

@Component({
  selector: 'app-image-upload-modal',
  templateUrl: './image-upload-modal.component.html',
  styleUrls: ['./image-upload-modal.component.css']
})
export class ImageUploadModalComponent {
  @Output() imageSaved = new EventEmitter<ImageUploadResult>();

  onImageSaved(result: ImageUploadResult): void {
    this.imageSaved.emit(result);
  }
}
