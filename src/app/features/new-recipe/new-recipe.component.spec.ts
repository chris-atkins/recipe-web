import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { NewRecipeComponent } from './new-recipe.component';
import { RecipeService, Recipe, RecipeImage } from '../../core/services/recipe.service';
import { UserService } from '../../core/services/user.service';

// Mock Navbar component
@Component({
  selector: 'app-navbar',
  template: '<div class="mock-navbar"></div>'
})
class MockNavbarComponent {}

// Mock ImageUploadModal component
@Component({
  selector: 'app-image-upload-modal',
  template: '<div class="mock-image-upload-modal"></div>'
})
class MockImageUploadModalComponent {
  @Output() imageSaved = new EventEmitter<RecipeImage>();
}

describe('NewRecipeComponent', () => {
  let component: NewRecipeComponent;
  let fixture: ComponentFixture<NewRecipeComponent>;
  let mockRecipeService: jasmine.SpyObj<RecipeService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockRecipeService = jasmine.createSpyObj('RecipeService', ['saveRecipe']);
    mockUserService = jasmine.createSpyObj('UserService', ['isLoggedIn']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      declarations: [
        NewRecipeComponent,
        MockNavbarComponent,
        MockImageUploadModalComponent
      ],
      imports: [FormsModule, QuillModule.forRoot()],
      providers: [
        { provide: RecipeService, useValue: mockRecipeService },
        { provide: UserService, useValue: mockUserService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NewRecipeComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should have empty recipe name', () => {
      expect(component.newRecipeName).toBe('');
    });

    it('should have empty recipe content', () => {
      expect(component.newRecipeContent).toBe('');
    });

    it('should have no image', () => {
      expect(component.newImage).toBeNull();
    });

    it('should not show error message initially', () => {
      expect(component.shouldShowErrorMessage()).toBe(false);
    });
  });

  describe('hasImage', () => {
    it('should return false when no image', () => {
      expect(component.hasImage()).toBe(false);
    });

    it('should return true when image exists', () => {
      component.newImage = { imageUrl: 'http://example.com/image.jpg' };
      expect(component.hasImage()).toBe(true);
    });
  });

  describe('imageSaved', () => {
    it('should update newImage when image is saved', () => {
      const newImage: RecipeImage = { imageUrl: 'http://example.com/new-image.jpg' };
      component.imageSaved(newImage);
      expect(component.newImage).toEqual(newImage);
    });
  });

  describe('shouldShowErrorMessage', () => {
    it('should return false when user is logged in', () => {
      mockUserService.isLoggedIn.and.returnValue(true);
      expect(component.shouldShowErrorMessage()).toBe(false);
    });

    it('should return false when user has not attempted to save', () => {
      mockUserService.isLoggedIn.and.returnValue(false);
      expect(component.shouldShowErrorMessage()).toBe(false);
    });

    it('should return true when user attempted to save without login', () => {
      mockUserService.isLoggedIn.and.returnValue(false);
      component.saveRecipeAndNavigate();
      expect(component.shouldShowErrorMessage()).toBe(true);
    });

    it('should return false after user logs in following failed save attempt', () => {
      mockUserService.isLoggedIn.and.returnValue(false);
      component.saveRecipeAndNavigate();
      expect(component.shouldShowErrorMessage()).toBe(true);

      // User logs in
      mockUserService.isLoggedIn.and.returnValue(true);
      expect(component.shouldShowErrorMessage()).toBe(false);
    });
  });

  describe('saveRecipeAndNavigate', () => {
    it('should not save recipe when user is not logged in', () => {
      mockUserService.isLoggedIn.and.returnValue(false);
      component.newRecipeName = 'Test Recipe';
      component.newRecipeContent = 'Test Content';

      component.saveRecipeAndNavigate();

      expect(mockRecipeService.saveRecipe).not.toHaveBeenCalled();
    });

    it('should save recipe when user is logged in', (done) => {
      const savedRecipe: Recipe = {
        recipeId: 'newRecipeId123',
        recipeName: 'Test Recipe',
        recipeContent: 'Test Content'
      };
      mockUserService.isLoggedIn.and.returnValue(true);
      mockRecipeService.saveRecipe.and.returnValue(Promise.resolve(savedRecipe));

      component.newRecipeName = 'Test Recipe';
      component.newRecipeContent = 'Test Content';

      component.saveRecipeAndNavigate();

      setTimeout(() => {
        expect(mockRecipeService.saveRecipe).toHaveBeenCalledWith({
          recipeName: 'Test Recipe',
          recipeContent: 'Test Content',
          image: null
        });
        done();
      }, 10);
    });

    it('should save recipe with image when image is set', (done) => {
      const testImage: RecipeImage = { imageUrl: 'http://example.com/image.jpg' };
      const savedRecipe: Recipe = {
        recipeId: 'newRecipeId123',
        recipeName: 'Test Recipe',
        recipeContent: 'Test Content',
        image: testImage
      };
      mockUserService.isLoggedIn.and.returnValue(true);
      mockRecipeService.saveRecipe.and.returnValue(Promise.resolve(savedRecipe));

      component.newRecipeName = 'Test Recipe';
      component.newRecipeContent = 'Test Content';
      component.newImage = testImage;

      component.saveRecipeAndNavigate();

      setTimeout(() => {
        expect(mockRecipeService.saveRecipe).toHaveBeenCalledWith({
          recipeName: 'Test Recipe',
          recipeContent: 'Test Content',
          image: testImage
        });
        done();
      }, 10);
    });

    it('should navigate to view-recipe after successful save', (done) => {
      const savedRecipe: Recipe = {
        recipeId: 'newRecipeId123',
        recipeName: 'Test Recipe',
        recipeContent: 'Test Content'
      };
      mockUserService.isLoggedIn.and.returnValue(true);
      mockRecipeService.saveRecipe.and.returnValue(Promise.resolve(savedRecipe));

      component.newRecipeName = 'Test Recipe';
      component.newRecipeContent = 'Test Content';

      component.saveRecipeAndNavigate();

      setTimeout(() => {
        expect(mockRouter.navigate).toHaveBeenCalledWith(['/view-recipe', 'newRecipeId123']);
        done();
      }, 10);
    });

    it('should handle error when saving recipe fails', (done) => {
      const consoleSpy = spyOn(console, 'error');
      mockUserService.isLoggedIn.and.returnValue(true);
      mockRecipeService.saveRecipe.and.returnValue(Promise.reject('Save failed'));

      component.newRecipeName = 'Test Recipe';
      component.newRecipeContent = 'Test Content';

      component.saveRecipeAndNavigate();

      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error saving recipe:', 'Save failed');
        done();
      }, 10);
    });
  });

  describe('template', () => {
    beforeEach(() => {
      mockUserService.isLoggedIn.and.returnValue(true);
      fixture.detectChanges();
    });

    it('should display page title', () => {
      const titleElement = fixture.nativeElement.querySelector('#new-recipe-page-title');
      expect(titleElement.textContent).toBe('New Recipe');
    });

    it('should have recipe name input', () => {
      const nameInput = fixture.nativeElement.querySelector('#recipe-name-input');
      expect(nameInput).toBeTruthy();
      expect(nameInput.getAttribute('placeholder')).toBe('Recipe Name');
    });

    it('should have recipe content editor', () => {
      const contentEditor = fixture.nativeElement.querySelector('quill-editor');
      expect(contentEditor).toBeTruthy();
    });

    it('should have save button', () => {
      const saveButton = fixture.nativeElement.querySelector('.save-button');
      expect(saveButton).toBeTruthy();
      expect(saveButton.textContent).toBe('Save Recipe');
    });

    it('should not show error message when user is logged in', () => {
      const errorMessage = fixture.nativeElement.querySelector('.save-error-message');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.hasAttribute('hidden')).toBe(true);
    });

    it('should show error message when user tries to save without login', () => {
      mockUserService.isLoggedIn.and.returnValue(false);
      component.saveRecipeAndNavigate();
      fixture.detectChanges();

      const errorMessage = fixture.nativeElement.querySelector('.save-error-message');
      expect(errorMessage).toBeTruthy();
      expect(errorMessage.hasAttribute('hidden')).toBe(false);
      expect(errorMessage.textContent).toContain('In order to save a recipe you must be logged in');
    });

    it('should not show image when no image is set', () => {
      const recipeImage = fixture.nativeElement.querySelector('.recipe-image');
      expect(recipeImage).toBeFalsy();
    });

    it('should show image when image is set', () => {
      component.newImage = { imageUrl: 'http://example.com/image.jpg' };
      fixture.detectChanges();

      const recipeImage = fixture.nativeElement.querySelector('.recipe-image');
      expect(recipeImage).toBeTruthy();
      expect(recipeImage.getAttribute('src')).toBe('http://example.com/image.jpg');
    });
  });
});
