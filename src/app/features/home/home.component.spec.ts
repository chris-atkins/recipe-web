import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HomeComponent } from './home.component';
import { UserService } from '../../core/services/user.service';
import { RouterTestingModule } from '@angular/router/testing';
import { SharedModule } from '../../shared/shared.module';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let userService: jasmine.SpyObj<UserService>;
  let router: Router;

  beforeEach(() => {
    const userServiceSpy = jasmine.createSpyObj('UserService', [
      'isLoggedIn',
      'getLoggedInUser',
      'isExternalLoginBeingAttempted',
      'performExternalLogin'
    ]);
    // Default return values needed for NavbarComponent which is in the template
    userServiceSpy.isExternalLoginBeingAttempted.and.returnValue(false);
    userServiceSpy.performExternalLogin.and.returnValue(Promise.resolve({}));

    TestBed.configureTestingModule({
      declarations: [HomeComponent],
      imports: [RouterTestingModule, SharedModule],
      providers: [
        { provide: UserService, useValue: userServiceSpy }
      ]
    });

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    userService = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('navigateToSearch', () => {
    it('should navigate to search-recipes using hash routing', () => {
      component.navigateToSearch();

      expect(window.location.hash).toBe('#/search-recipes');
    });
  });

  describe('navigateToSaveNewRecipe', () => {
    it('should navigate to new-recipe when user is logged in', () => {
      userService.isLoggedIn.and.returnValue(true);

      component.navigateToSaveNewRecipe();

      expect(window.location.hash).toBe('#/new-recipe');
    });

    it('should not navigate when user is not logged in', () => {
      userService.isLoggedIn.and.returnValue(false);
      const initialHash = window.location.hash;

      component.navigateToSaveNewRecipe();

      // Hash should remain unchanged when not logged in
      expect(window.location.hash).toBe(initialHash);
    });

    it('should show error message when user is not logged in', () => {
      userService.isLoggedIn.and.returnValue(false);

      component.navigateToSaveNewRecipe();

      expect(component.shouldShowErrorMessage).toBe(true);
    });
  });

  describe('navigateToRecipeBook', () => {
    it('should navigate to recipe book when user is logged in', () => {
      const mockUser = { userId: '123', userName: 'Test User', userEmail: 'test@test.com' };
      userService.isLoggedIn.and.returnValue(true);
      userService.getLoggedInUser.and.returnValue(mockUser);

      component.navigateToRecipeBook();

      expect(window.location.hash).toBe('#/user/123/recipe-book');
    });

    it('should not navigate when user is not logged in', () => {
      userService.isLoggedIn.and.returnValue(false);
      const initialHash = window.location.hash;

      component.navigateToRecipeBook();

      expect(window.location.hash).toBe(initialHash);
    });

    it('should show error message when user is not logged in', () => {
      userService.isLoggedIn.and.returnValue(false);

      component.navigateToRecipeBook();

      expect(component.shouldShowErrorMessage).toBe(true);
    });
  });

  describe('shouldShowErrorMessage', () => {
    it('should be false initially', () => {
      userService.isLoggedIn.and.returnValue(false);

      expect(component.shouldShowErrorMessage).toBe(false);
    });

    it('should be true after clicking login-sensitive button when not logged in', () => {
      userService.isLoggedIn.and.returnValue(false);

      component.navigateToSaveNewRecipe();

      expect(component.shouldShowErrorMessage).toBe(true);
    });

    it('should be false after hideErrorMessage is called', () => {
      userService.isLoggedIn.and.returnValue(false);
      component.navigateToSaveNewRecipe();

      component.hideErrorMessage();

      expect(component.shouldShowErrorMessage).toBe(false);
    });
  });

  describe('button rendering', () => {
    it('should display 3 navigation card buttons', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const buttons = compiled.querySelectorAll('.home-nav-button');

      expect(buttons.length).toBe(3);
    });

    it('should render Browse Recipes button with correct text', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const searchButton = compiled.querySelector('#search-button');

      expect(searchButton).toBeTruthy();
      expect(searchButton.querySelector('.card-title').textContent).toContain('Browse Recipes');
      expect(searchButton.querySelector('.card-text').textContent).toContain('Look through all the recipes');
    });

    it('should render Save New Recipe button with correct text', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const saveButton = compiled.querySelector('#save-button');

      expect(saveButton).toBeTruthy();
      expect(saveButton.querySelector('.card-title').textContent).toContain('Save New Recipe');
      expect(saveButton.querySelector('.card-text').textContent).toContain('Add your own recipe');
    });

    it('should render My Recipe Book button with correct text', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const recipeBookButton = compiled.querySelector('#recipe-book-button');

      expect(recipeBookButton).toBeTruthy();
      expect(recipeBookButton.querySelector('.card-title').textContent).toContain('My Recipe Book');
      expect(recipeBookButton.querySelector('.card-text').textContent).toContain('Browse the list of recipes');
    });
  });

  describe('image rendering', () => {
    it('should display 4 recipe images', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const images = compiled.querySelectorAll('.recipe-image-row img');

      expect(images.length).toBe(4);
    });

    it('should render images with correct src attributes', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const images = compiled.querySelectorAll('.recipe-image-row img');

      expect(images[0].getAttribute('src')).toBe('assets/images/pexels-photo-25273.jpg');
      expect(images[1].getAttribute('src')).toBe('assets/images/food-salad-healthy-lunch.jpg');
      expect(images[2].getAttribute('src')).toBe('assets/images/pexels-photo-196643.jpeg');
      expect(images[3].getAttribute('src')).toBe('assets/images/pexels-photo-64208.jpeg');
    });

    it('should render images with img-fluid class', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const images = compiled.querySelectorAll('.recipe-image-row img');

      images.forEach((img: Element) => {
        expect(img.classList.contains('img-fluid')).toBe(true);
      });
    });

    it('should render images in col-3 containers', () => {
      fixture.detectChanges();
      const compiled = fixture.nativeElement;
      const imageHolders = compiled.querySelectorAll('.recipe-image-holder');

      expect(imageHolders.length).toBe(4);
      imageHolders.forEach((holder: Element) => {
        expect(holder.classList.contains('col-3')).toBe(true);
      });
    });
  });
});
