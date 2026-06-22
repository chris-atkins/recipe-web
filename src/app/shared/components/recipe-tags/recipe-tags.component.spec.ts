import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeTagsComponent } from './recipe-tags.component';
import { Recipe, RecipeService } from '../../../core/services/recipe.service';
import { UserService } from '../../../core/services/user.service';

describe('RecipeTagsComponent', () => {
  let component: RecipeTagsComponent;
  let fixture: ComponentFixture<RecipeTagsComponent>;
  let recipeService: jasmine.SpyObj<RecipeService>;
  let userService: jasmine.SpyObj<UserService>;

  function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
    return {
      recipeId: 'r1',
      recipeName: 'R',
      recipeContent: 'C',
      tags: ['Spicy', 'Comfort Food'],
      ownTags: ['Spicy'],
      ...overrides
    };
  }

  beforeEach(() => {
    recipeService = jasmine.createSpyObj('RecipeService', ['addTag', 'removeTag']);
    userService = jasmine.createSpyObj('UserService', ['isLoggedIn']);
    userService.isLoggedIn.and.returnValue(true);

    TestBed.configureTestingModule({
      declarations: [RecipeTagsComponent],
      imports: [CommonModule, FormsModule],
      providers: [
        { provide: RecipeService, useValue: recipeService },
        { provide: UserService, useValue: userService }
      ]
    });
    fixture = TestBed.createComponent(RecipeTagsComponent);
    component = fixture.componentInstance;
  });

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  it('renders a pill for each tag', () => {
    component.recipe = makeRecipe();
    fixture.detectChanges();
    const pills = fixture.nativeElement.querySelectorAll('.tag-pill');
    expect(pills.length).toBe(2);
    expect(pills[0].textContent).toContain('Spicy');
    expect(pills[1].textContent).toContain('Comfort Food');
  });

  it('renders no pills when the recipe has no tags field', () => {
    component.recipe = makeRecipe({ tags: undefined });
    fixture.detectChanges();
    expect(component.tags).toEqual([]);
    expect(fixture.nativeElement.querySelectorAll('.tag-pill').length).toBe(0);
  });

  describe('logged in', () => {
    beforeEach(() => {
      userService.isLoggedIn.and.returnValue(true);
    });

    it('shows the add control and no log-in cue', () => {
      component.recipe = makeRecipe();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.tag-add-form')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.login-cue')).toBeFalsy();
    });

    it('shows a remove ✕ only on pills the user added (ownTags)', () => {
      component.recipe = makeRecipe();
      fixture.detectChanges();
      const pills = fixture.nativeElement.querySelectorAll('.tag-pill');
      // Spicy is in ownTags -> has remove; Comfort Food is not -> no remove
      expect(pills[0].querySelector('.tag-remove')).toBeTruthy();
      expect(pills[1].querySelector('.tag-remove')).toBeFalsy();
    });

    it('adds a tag (normalized) and updates pills + ownTags from the response', (done) => {
      const updated = makeRecipe({ tags: ['Spicy', 'Comfort Food', 'Vegan'], ownTags: ['Spicy', 'Vegan'] });
      recipeService.addTag.and.returnValue(Promise.resolve(updated));
      component.recipe = makeRecipe();
      fixture.detectChanges();

      component.newTag = '  vegan ';
      component.addTag();

      expect(recipeService.addTag).toHaveBeenCalledWith('r1', 'Vegan');
      setTimeout(() => {
        expect(component.recipe.tags).toEqual(['Spicy', 'Comfort Food', 'Vegan']);
        expect(component.recipe.ownTags).toEqual(['Spicy', 'Vegan']);
        expect(component.newTag).toBe('');
        done();
      }, 10);
    });

    it('removes a tag and updates pills + ownTags from the response', (done) => {
      const updated = makeRecipe({ tags: ['Comfort Food'], ownTags: [] });
      recipeService.removeTag.and.returnValue(Promise.resolve(updated));
      component.recipe = makeRecipe();
      fixture.detectChanges();

      component.removeTag('Spicy');

      expect(recipeService.removeTag).toHaveBeenCalledWith('r1', 'Spicy');
      setTimeout(() => {
        expect(component.recipe.tags).toEqual(['Comfort Food']);
        expect(component.recipe.ownTags).toEqual([]);
        done();
      }, 10);
    });

    it('defaults tags/ownTags to empty arrays when the response omits them', (done) => {
      recipeService.addTag.and.returnValue(Promise.resolve({ recipeId: 'r1', recipeName: 'R', recipeContent: 'C' } as Recipe));
      component.recipe = makeRecipe();
      component.newTag = 'Vegan';
      component.addTag();

      setTimeout(() => {
        expect(component.recipe.tags).toEqual([]);
        expect(component.recipe.ownTags).toEqual([]);
        done();
      }, 10);
    });

    it('emits recipeChange after a successful add', (done) => {
      const updated = makeRecipe({ tags: ['Spicy', 'Comfort Food', 'Vegan'], ownTags: ['Spicy', 'Vegan'] });
      recipeService.addTag.and.returnValue(Promise.resolve(updated));
      spyOn(component.recipeChange, 'emit');
      component.recipe = makeRecipe();
      component.newTag = 'Vegan';
      component.addTag();

      setTimeout(() => {
        expect(component.recipeChange.emit).toHaveBeenCalled();
        done();
      }, 10);
    });

    it('ignores a blank add without calling the service', () => {
      component.recipe = makeRecipe();
      component.newTag = '   ';
      component.addTag();
      expect(recipeService.addTag).not.toHaveBeenCalled();
      expect(component.newTag).toBe('');
    });

    it('ignores a duplicate add (case-insensitive) without calling the service', () => {
      component.recipe = makeRecipe();
      component.newTag = 'spicy';
      component.addTag();
      expect(recipeService.addTag).not.toHaveBeenCalled();
      expect(component.newTag).toBe('');
    });

    it('leaves the display unchanged and clears the field if the add fails', (done) => {
      recipeService.addTag.and.returnValue(Promise.reject('boom'));
      component.recipe = makeRecipe();
      component.newTag = 'Vegan';
      component.addTag();

      setTimeout(() => {
        expect(component.recipe.tags).toEqual(['Spicy', 'Comfort Food']);
        expect(component.recipe.ownTags).toEqual(['Spicy']);
        done();
      }, 10);
    });

    it('leaves the display unchanged if the remove fails', (done) => {
      recipeService.removeTag.and.returnValue(Promise.reject('boom'));
      component.recipe = makeRecipe();
      component.removeTag('Spicy');

      setTimeout(() => {
        expect(component.recipe.tags).toEqual(['Spicy', 'Comfort Food']);
        expect(component.recipe.ownTags).toEqual(['Spicy']);
        done();
      }, 10);
    });

    it('does not add without a recipeId', () => {
      component.recipe = makeRecipe({ recipeId: undefined });
      component.newTag = 'Vegan';
      component.addTag();
      expect(recipeService.addTag).not.toHaveBeenCalled();
    });

    it('does not remove without a recipeId', () => {
      component.recipe = makeRecipe({ recipeId: undefined });
      component.removeTag('Spicy');
      expect(recipeService.removeTag).not.toHaveBeenCalled();
    });

    it('treats a missing ownTags as no removable pills', () => {
      component.recipe = makeRecipe({ ownTags: undefined });
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('.tag-remove').length).toBe(0);
    });
  });

  describe('anonymous', () => {
    beforeEach(() => {
      userService.isLoggedIn.and.returnValue(false);
      component.recipe = makeRecipe();
      fixture.detectChanges();
    });

    it('shows the subtle log-in cue', () => {
      const cue = fixture.nativeElement.querySelector('.login-cue');
      expect(cue).toBeTruthy();
      expect(cue.textContent).toContain('Log in to add tags');
    });

    it('shows no add control', () => {
      expect(fixture.nativeElement.querySelector('.tag-add-form')).toBeFalsy();
    });

    it('shows no remove ✕ on any pill, even ones in ownTags', () => {
      expect(fixture.nativeElement.querySelectorAll('.tag-remove').length).toBe(0);
    });

    it('ignores add/remove calls', () => {
      component.newTag = 'Vegan';
      component.addTag();
      component.removeTag('Spicy');
      expect(recipeService.addTag).not.toHaveBeenCalled();
      expect(recipeService.removeTag).not.toHaveBeenCalled();
    });
  });
});
