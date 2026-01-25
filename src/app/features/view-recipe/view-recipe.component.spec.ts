import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { of } from 'rxjs';
import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { FormsModule, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ViewRecipeComponent } from './view-recipe.component';
import { RecipeService, Recipe, RecipeImage } from '../../core/services/recipe.service';
import { RecipeBookService } from '../../core/services/recipe-book.service';
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

// Mock Quill editor component with ControlValueAccessor
@Component({
  selector: 'quill-editor',
  template: '<div class="mock-quill-editor"></div>',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MockQuillEditorComponent),
      multi: true
    }
  ]
})
class MockQuillEditorComponent implements ControlValueAccessor {
  @Input() modules: any;
  @Input() format: string = 'html';
  @Input() placeholder: string = '';
  @Input() styles: any;

  value: any = '';
  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}

describe('ViewRecipeComponent', () => {
  let component: ViewRecipeComponent;
  let fixture: ComponentFixture<ViewRecipeComponent>;
  let mockRecipeService: jasmine.SpyObj<RecipeService>;
  let mockRecipeBookService: jasmine.SpyObj<RecipeBookService>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockActivatedRoute: any;

  const testRecipe: Recipe = {
    recipeId: 'recipe123',
    recipeName: 'Test Recipe',
    recipeContent: '<p>Test content</p>',
    editable: true,
    image: { imageUrl: 'http://example.com/image.jpg' }
  };

  // API returns array directly, not object with recipes property
  const testRecipeBook = [{ recipeId: 'recipe123' }, { recipeId: 'recipe456' }];

  beforeEach(async () => {
    mockRecipeService = jasmine.createSpyObj('RecipeService', ['findRecipe', 'saveRecipe']);
    mockRecipeBookService = jasmine.createSpyObj('RecipeBookService', ['getRecipeBook', 'addToRecipeBook', 'removeRecipeFromBook']);
    mockUserService = jasmine.createSpyObj('UserService', ['isLoggedIn', 'getLoggedInUser']);

    mockActivatedRoute = {
      paramMap: of(convertToParamMap({ recipeId: 'recipe123' })),
      snapshot: {
        paramMap: convertToParamMap({ recipeId: 'recipe123' })
      }
    };

    await TestBed.configureTestingModule({
      declarations: [
        ViewRecipeComponent,
        MockNavbarComponent,
        MockImageUploadModalComponent,
        MockQuillEditorComponent
      ],
      imports: [FormsModule],
      providers: [
        { provide: RecipeService, useValue: mockRecipeService },
        { provide: RecipeBookService, useValue: mockRecipeBookService },
        { provide: UserService, useValue: mockUserService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ViewRecipeComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    if (fixture) {
      fixture.destroy();
    }
  });

  it('should create', async () => {
    mockRecipeService.findRecipe.and.returnValue(Promise.resolve(testRecipe));
    mockUserService.isLoggedIn.and.returnValue(true);
    mockRecipeBookService.getRecipeBook.and.returnValue(Promise.resolve(testRecipeBook));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load recipe and recipe book on init', async () => {
      mockRecipeService.findRecipe.and.returnValue(Promise.resolve(testRecipe));
      mockUserService.isLoggedIn.and.returnValue(true);
      mockRecipeBookService.getRecipeBook.and.returnValue(Promise.resolve(testRecipeBook));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockRecipeService.findRecipe).toHaveBeenCalledWith('recipe123');
      expect(mockRecipeBookService.getRecipeBook).toHaveBeenCalled();
      expect(component.recipe.recipeName).toBe('Test Recipe');
    });

    it('should not load recipe book if user is not logged in', async () => {
      mockRecipeService.findRecipe.and.returnValue(Promise.resolve(testRecipe));
      mockUserService.isLoggedIn.and.returnValue(false);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockRecipeBookService.getRecipeBook).not.toHaveBeenCalled();
    });

    it('should handle error when loading recipe', async () => {
      const consoleSpy = spyOn(console, 'error');
      mockRecipeService.findRecipe.and.returnValue(Promise.reject('Recipe not found'));
      mockUserService.isLoggedIn.and.returnValue(false);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(consoleSpy).toHaveBeenCalledWith('Error retrieving recipe:', 'Recipe not found');
    });

    it('should not load if recipeId is empty', async () => {
      // Save original paramMap
      const originalParamMap = mockActivatedRoute.paramMap;
      const originalSnapshotParamMap = mockActivatedRoute.snapshot.paramMap;

      mockActivatedRoute.paramMap = of(convertToParamMap({}));
      mockActivatedRoute.snapshot.paramMap = convertToParamMap({});
      const emptyParamFixture = TestBed.createComponent(ViewRecipeComponent);
      const emptyParamComponent = emptyParamFixture.componentInstance;

      emptyParamFixture.detectChanges();
      await emptyParamFixture.whenStable();

      expect(mockRecipeService.findRecipe).not.toHaveBeenCalled();

      // Restore original paramMap for other tests
      mockActivatedRoute.paramMap = originalParamMap;
      mockActivatedRoute.snapshot.paramMap = originalSnapshotParamMap;
    });
  });

  describe('edit mode', () => {
    beforeEach(async () => {
      mockRecipeService.findRecipe.and.returnValue(Promise.resolve(testRecipe));
      mockUserService.isLoggedIn.and.returnValue(true);
      mockRecipeBookService.getRecipeBook.and.returnValue(Promise.resolve(testRecipeBook));

      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should enter edit mode when editClicked is called', () => {
      component.editClicked();

      expect(component.inEditMode).toBe(true);
      expect(component.nameBeingEdited).toBe('Test Recipe');
      expect(component.contentBeingEdited).toBe('<p>Test content</p>');
    });

    it('should exit edit mode when cancelEdit is called', () => {
      component.editClicked();
      component.cancelEdit();

      expect(component.inEditMode).toBe(false);
    });

    it('should save recipe and exit edit mode when saveClicked is called', (done) => {
      const updatedRecipe = { ...testRecipe, recipeName: 'Updated Name' };
      mockRecipeService.saveRecipe.and.returnValue(Promise.resolve(updatedRecipe));

      component.editClicked();
      component.nameBeingEdited = 'Updated Name';
      component.saveClicked();

      setTimeout(() => {
        expect(mockRecipeService.saveRecipe).toHaveBeenCalled();
        expect(component.inEditMode).toBe(false);
        expect(component.recipe.recipeName).toBe('Updated Name');
        done();
      }, 10);
    });

    it('should handle error when saving recipe', (done) => {
      const consoleSpy = spyOn(console, 'error');
      mockRecipeService.saveRecipe.and.returnValue(Promise.reject('Save failed'));

      component.editClicked();
      component.saveClicked();

      setTimeout(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Error saving recipe:', 'Save failed');
        done();
      }, 10);
    });
  });

  describe('shouldShowEditButtons', () => {
    beforeEach(() => {
      component.recipe = testRecipe;
    });

    it('should return true when recipe is editable', () => {
      expect(component.shouldShowEditButtons()).toBe(true);
    });

    it('should return false when recipe is not editable', () => {
      component.recipe = { ...testRecipe, editable: false };
      expect(component.shouldShowEditButtons()).toBe(false);
    });
  });

  describe('imageExists', () => {
    it('should return true when image exists with URL', () => {
      component.recipe = testRecipe;
      expect(component.imageExists()).toBe(true);
    });

    it('should return false when no image', () => {
      component.recipe = { ...testRecipe, image: null };
      expect(component.imageExists()).toBe(false);
    });

    it('should return false when image has no URL', () => {
      component.recipe = { ...testRecipe, image: { imageUrl: '' } };
      expect(component.imageExists()).toBe(false);
    });
  });

  describe('imageSaved', () => {
    beforeEach(async () => {
      mockRecipeService.findRecipe.and.returnValue(Promise.resolve({ ...testRecipe, image: null }));
      mockUserService.isLoggedIn.and.returnValue(true);
      mockRecipeBookService.getRecipeBook.and.returnValue(Promise.resolve(testRecipeBook));

      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should update recipe image when imageSaved is called', () => {
      const newImage: RecipeImage = { imageUrl: 'http://example.com/new-image.jpg' };
      component.imageSaved(newImage);

      expect(component.recipe.image).toEqual(newImage);
    });
  });

  describe('recipe book operations', () => {
    beforeEach(async () => {
      mockRecipeService.findRecipe.and.returnValue(Promise.resolve(testRecipe));
      mockUserService.isLoggedIn.and.returnValue(true);
      mockRecipeBookService.getRecipeBook.and.returnValue(Promise.resolve(testRecipeBook));

      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should return true for inRecipeBook when recipe is in book', () => {
      expect(component.inRecipeBook()).toBe(true);
    });

    it('should return false for inRecipeBook when recipe is not in book', async () => {
      mockRecipeBookService.getRecipeBook.and.returnValue(Promise.resolve([]));

      fixture.detectChanges();
      await fixture.whenStable();

      // Reload to get empty recipe book
      component.ngOnInit();
      await fixture.whenStable();

      expect(component.inRecipeBook()).toBe(false);
    });

    it('should return true for canAddToRecipeBook when conditions are met', async () => {
      // Set up a recipe not in book
      mockRecipeBookService.getRecipeBook.and.returnValue(Promise.resolve([{ recipeId: 'other' }]));
      component.ngOnInit();
      await fixture.whenStable();

      expect(component.canAddToRecipeBook()).toBe(true);
    });

    it('should return false for canAddToRecipeBook when in edit mode', () => {
      component.inEditMode = true;
      expect(component.canAddToRecipeBook()).toBe(false);
    });

    it('should return false for canAddToRecipeBook when not logged in', () => {
      mockUserService.isLoggedIn.and.returnValue(false);
      expect(component.canAddToRecipeBook()).toBe(false);
    });

    it('should return true for canRemoveFromRecipeBook when in book and not editing', () => {
      expect(component.canRemoveFromRecipeBook()).toBe(true);
    });

    it('should return false for canRemoveFromRecipeBook when in edit mode', () => {
      component.inEditMode = true;
      expect(component.canRemoveFromRecipeBook()).toBe(false);
    });

    it('should add recipe to book when addToRecipeBook is called', (done) => {
      const updatedBook = [{ recipeId: 'recipe123' }, { recipeId: 'newRecipe' }];
      mockRecipeBookService.addToRecipeBook.and.returnValue(Promise.resolve(updatedBook));

      component.addToRecipeBook();

      setTimeout(() => {
        expect(mockRecipeBookService.addToRecipeBook).toHaveBeenCalledWith('recipe123');
        done();
      }, 10);
    });

    it('should remove recipe from book when removeRecipeFromBook is called', (done) => {
      const updatedBook: { recipeId: string }[] = [];
      mockRecipeBookService.removeRecipeFromBook.and.returnValue(Promise.resolve(updatedBook));

      component.removeRecipeFromBook();

      setTimeout(() => {
        expect(mockRecipeBookService.removeRecipeFromBook).toHaveBeenCalledWith('recipe123');
        done();
      }, 10);
    });
  });

  describe('copyAlternateUrlClicked', () => {
    beforeEach(async () => {
      mockRecipeService.findRecipe.and.returnValue(Promise.resolve(testRecipe));
      mockUserService.isLoggedIn.and.returnValue(true);
      mockRecipeBookService.getRecipeBook.and.returnValue(Promise.resolve(testRecipeBook));

      fixture.detectChanges();
      await fixture.whenStable();
    });

    it('should copy URL to clipboard', async () => {
      const writeTextSpy = spyOn(navigator.clipboard, 'writeText').and.returnValue(Promise.resolve());

      component.copyAlternateUrlClicked();

      expect(writeTextSpy).toHaveBeenCalled();
      const calledUrl = writeTextSpy.calls.first().args[0];
      expect(calledUrl).toContain('/recipe/recipe123');
    });
  });

  describe('template', () => {
    beforeEach(() => {
      // Set up mocks to prevent errors when ngOnInit runs
      mockRecipeService.findRecipe.and.returnValue(Promise.resolve(testRecipe));
      mockUserService.isLoggedIn.and.returnValue(false);

      // Set component state directly for template testing
      component.recipe = testRecipe;
      fixture.detectChanges();
    });

    it('should display recipe name', () => {
      const nameElement = fixture.nativeElement.querySelector('#recipe-name');
      expect(nameElement.textContent).toBe('Test Recipe');
    });

    it('should display recipe content', () => {
      const contentElement = fixture.nativeElement.querySelector('#recipe-content');
      expect(contentElement).toBeTruthy();
    });

    it('should show edit button when recipe is editable', () => {
      const editButton = fixture.nativeElement.querySelector('#edit-recipe-button');
      expect(editButton).toBeTruthy();
      expect(editButton.textContent).toBe('Edit Recipe');
    });

    it('should hide edit button when in edit mode', () => {
      component.editClicked();
      fixture.detectChanges();
      const editButton = fixture.nativeElement.querySelector('#edit-recipe-button');
      // With [hidden] attribute, button is in DOM but hidden
      expect(editButton).toBeTruthy();
      expect(editButton.hasAttribute('hidden')).toBe(true);
    });

    it('should show cancel and save buttons in edit mode', () => {
      component.editClicked();
      fixture.detectChanges();

      const cancelButton = fixture.nativeElement.querySelector('#cancel-edit-button');
      const saveButton = fixture.nativeElement.querySelector('#update-recipe-button');

      expect(cancelButton).toBeTruthy();
      expect(cancelButton.textContent).toBe('Cancel');
      expect(saveButton).toBeTruthy();
      expect(saveButton.textContent).toBe('Save Recipe');
    });

    it('should show edit page title in edit mode', () => {
      component.editClicked();
      fixture.detectChanges();

      const title = fixture.nativeElement.querySelector('#edit-recipe-page-title');
      expect(title).toBeTruthy();
      expect(title.textContent).toBe('Edit Recipe');
    });
  });
});
