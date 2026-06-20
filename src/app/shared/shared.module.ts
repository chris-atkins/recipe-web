import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { ImageUploadComponent } from './components/image-upload/image-upload.component';
import { ImageUploadModalComponent } from './components/image-upload-modal/image-upload-modal.component';
import { RecipeElementComponent } from './components/recipe-element/recipe-element.component';
import { RecipeCardWallComponent } from './components/recipe-card-wall/recipe-card-wall.component';
import { RecipePreviewComponent } from './components/recipe-preview/recipe-preview.component';
import { CategoryTagFilterComponent } from './components/category-tag-filter/category-tag-filter.component';

@NgModule({
  declarations: [
    NavbarComponent,
    AutoFocusDirective,
    ImageUploadComponent,
    ImageUploadModalComponent,
    RecipeElementComponent,
    RecipeCardWallComponent,
    RecipePreviewComponent,
    CategoryTagFilterComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ImageCropperComponent
  ],
  exports: [
    NavbarComponent,
    AutoFocusDirective,
    ImageUploadComponent,
    ImageUploadModalComponent,
    RecipeElementComponent,
    RecipeCardWallComponent,
    RecipePreviewComponent,
    CategoryTagFilterComponent
  ]
})
export class SharedModule { }
